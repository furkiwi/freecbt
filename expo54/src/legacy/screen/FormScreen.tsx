import { Routes } from "@/src";
import Constants from "expo-constants";
import * as Haptic from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StatusBar, Text } from "react-native";
import * as AsyncState from "../async-state";
import * as flagstore from "../flagstore";
import FormView, {
  FormRecord,
  Slides,
  defaultSlideForMode,
  slideAfterModeChange,
} from "../form/FormView";
import haptic from "../haptic";
import i18n from "../i18n";
import * as Distortion from "../io-ts/distortion";
import * as Thought from "../io-ts/thought";
import * as ThoughtStore from "../io-ts/thought/store";
import { getIsExistingUser, setIsExistingUser } from "../io-ts/thought/store";
import {
  getThoughtRecordMode,
  setThoughtRecordMode,
  ThoughtRecordMode,
} from "../setting/thought-record-mode";
import { useAppTheme } from "../theme-context";
import {
  clearDraft,
  distortionsFromSlugs,
  readDraft,
  writeDraft,
} from "../thought-draft";
import { Container, Header, IconButton, Row } from "../ui";

interface Props {
  thoughtID?: string;
  fromIntro?: boolean;
  initDistortions?: readonly string[];
  initSlide?: string;
}

const emptyRecord = (): Omit<FormRecord, "distortions"> => ({
  situation: "",
  emotion: "",
  emotionIntensity: null,
  automatic: "",
  automaticBelief: null,
  alternative: "",
  alternativeBelief: null,
  challenge: "",
  evidenceFor: "",
  emotionIntensityAfter: null,
});

export default function FormScreen(props: Props = {}): React.JSX.Element {
  const router = useRouter();
  const theme = useAppTheme();
  const { thoughtID, initDistortions, initSlide } = props;
  const initDistortionKey = (initDistortions ?? []).join(",");
  const fromIntro = props.fromIntro ?? false;
  const showHelpBadge = AsyncState.useAsyncState(() =>
    flagstore.get("start-help-badge", "true")
  );

  const [mode, setMode] = React.useState<ThoughtRecordMode>("simple");
  const [fields, setFields] = React.useState(emptyRecord);
  const [distortions, setDistortions] = React.useState(
    new Set<Distortion.Distortion>([])
  );
  const [draftHydrated, setDraftHydrated] = React.useState(false);
  const persistDraftRef = React.useRef(true);
  const [slide, setSlide] = React.useState<Slides>(
    (initSlide as Slides) ?? "automatic"
  );
  const thought0 =
    AsyncState.useAsyncState<Thought.Thought | null>(async () => {
      if (thoughtID) {
        return await ThoughtStore.read(thoughtID);
      }
      return null;
    }, [thoughtID]);

  React.useEffect(() => {
    let cancelled = false;
    persistDraftRef.current = true;
    setDraftHydrated(false);
    (async () => {
      const savedMode = await getThoughtRecordMode();
      if (thoughtID) {
        try {
          const thought = await ThoughtStore.read(thoughtID);
          if (cancelled) {
            return;
          }
          setFields({
            situation: thought.situation ?? "",
            emotion: thought.emotion ?? "",
            emotionIntensity: thought.emotionIntensity ?? null,
            automatic: thought.automaticThought,
            automaticBelief: thought.automaticBelief ?? null,
            alternative: thought.alternativeThought,
            alternativeBelief: thought.alternativeBelief ?? null,
            challenge: thought.challenge,
            evidenceFor: thought.evidenceFor ?? "",
            emotionIntensityAfter: thought.emotionIntensityAfter ?? null,
          });
          setDistortions(thought.cognitiveDistortions);
          if (Thought.hasFullRecordFields(thought)) {
            setMode("full");
          } else {
            setMode(savedMode);
          }
        } catch (err) {
          console.error(err);
          setMode(savedMode);
        }
      } else {
        setMode(savedMode);
        if (savedMode === "full" && !initSlide) {
          setSlide(defaultSlideForMode("full"));
        }
        if (initDistortions) {
          setDistortions(
            new Set(initDistortions.map((d) => Distortion.bySlug[d]))
          );
        }
      }
      const draft = await readDraft();
      if (cancelled) {
        return;
      }
      if (draft && (draft.thoughtID ?? null) === (thoughtID ?? null)) {
        setFields({
          situation: draft.situation,
          emotion: draft.emotion,
          emotionIntensity: draft.emotionIntensity,
          automatic: draft.automaticThought,
          automaticBelief: draft.automaticBelief,
          alternative: draft.alternativeThought,
          alternativeBelief: draft.alternativeBelief,
          challenge: draft.challenge,
          evidenceFor: draft.evidenceFor,
          emotionIntensityAfter: draft.emotionIntensityAfter,
        });
        setDistortions(distortionsFromSlugs(draft.distortionSlugs));
        setSlide(draft.slide);
      }
      if (
        initSlide === "situation" ||
        initSlide === "evidence" ||
        draft?.slide === "situation" ||
        draft?.slide === "evidence"
      ) {
        setMode("full");
      }
      if (
        savedMode === "full" &&
        (initSlide === "challenge" || draft?.slide === "challenge")
      ) {
        setMode("full");
        setSlide("evidence");
      }
      setDraftHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [thoughtID, initDistortionKey]);

  React.useEffect(() => {
    if (initSlide) {
      setSlide(initSlide as Slides);
    }
  }, [initSlide]);

  React.useEffect(() => {
    if (!draftHydrated || !persistDraftRef.current) {
      return;
    }
    const handle = setTimeout(() => {
      if (!persistDraftRef.current) {
        return;
      }
      writeDraft({
        thoughtID: thoughtID ?? null,
        automaticThought: fields.automatic,
        alternativeThought: fields.alternative,
        challenge: fields.challenge,
        distortionSlugs: Array.from(distortions).map((d) => d.slug),
        slide,
        situation: fields.situation,
        emotion: fields.emotion,
        emotionIntensity: fields.emotionIntensity,
        automaticBelief: fields.automaticBelief,
        evidenceFor: fields.evidenceFor,
        alternativeBelief: fields.alternativeBelief,
        emotionIntensityAfter: fields.emotionIntensityAfter,
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [draftHydrated, thoughtID, fields, distortions, slide]);

  AsyncState.useAsyncEffect(async () => {
    if (!(await getIsExistingUser())) {
      await setIsExistingUser();
      router.replace(Routes.intro());
    }
  });

  async function onSave() {
    const args = {
      automaticThought: fields.automatic,
      alternativeThought: fields.alternative,
      challenge: fields.challenge,
      cognitiveDistortions: distortions,
      situation: fields.situation,
      emotion: fields.emotion,
      emotionIntensity: fields.emotionIntensity,
      automaticBelief: fields.automaticBelief,
      evidenceFor: fields.evidenceFor,
      alternativeBelief: fields.alternativeBelief,
      emotionIntensityAfter: fields.emotionIntensityAfter,
    };
    const thought0_: Thought.Thought | null = AsyncState.withDefault(
      thought0,
      null
    );
    const thought: Thought.Thought = thought0_
      ? { ...thought0_, ...args, updatedAt: new Date() }
      : Thought.create(args);
    persistDraftRef.current = false;
    await ThoughtStore.write(thought);
    await clearDraft();
    setFields(emptyRecord());
    setDistortions(new Set());
    setSlide(defaultSlideForMode(mode));
    haptic.notification(Haptic.NotificationFeedbackType.Success);
    router.navigate(Routes.thoughtView(Thought.key(thought)));
  }

  function onChangeDistortion(selected: string) {
    haptic.selection();
    const d = Distortion.bySlug[selected];
    const ds = new Set(distortions);
    ds.has(d) ? ds.delete(d) : ds.add(d);
    setDistortions(ds);
  }

  async function toggleMode() {
    const next: ThoughtRecordMode = mode === "simple" ? "full" : "simple";
    const nextSlide = slideAfterModeChange(next, slide);
    setMode(next);
    setSlide(nextSlide);
    await setThoughtRecordMode(next);
  }

  return (
    <>
      <StatusBar barStyle={theme.statusBar} />
      <Container
        style={{
          height: "100%",
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: Constants.statusBarHeight,
          paddingTop: 12,
          paddingBottom: 0,
          backgroundColor: theme.background,
        }}
      >
        <Row
          style={{
            marginBottom: 8,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <IconButton
            featherIconName={"help-circle"}
            accessibilityLabel={i18n.t("accessibility.help_button")}
            onPress={async () => {
              await flagstore.setFalse("start-help-badge");
              router.navigate(
                Routes.help({
                  distortions: Array.from(distortions).map((d) => d.slug),
                })
              );
            }}
            hasBadge={AsyncState.withDefault(showHelpBadge, false)}
          />
          <Header allowFontScaling={false}>{i18n.t("cbt_form.header")}</Header>
          <IconButton
            accessibilityLabel={i18n.t("accessibility.list_button")}
            featherIconName={"list"}
            onPress={() => {
              router.navigate(Routes.thoughtList());
            }}
          />
        </Row>
        <Pressable
          onPress={toggleMode}
          style={{ paddingHorizontal: 24, marginBottom: 12 }}
        >
          <Text style={{ color: theme.blue, fontSize: 14 }}>
            {mode === "simple"
              ? i18n.t("cbt_form.mode.switch_to_full")
              : i18n.t("cbt_form.mode.switch_to_simple")}
          </Text>
        </Pressable>
        <FormView
          mode={mode}
          onSave={onSave}
          record={{ ...fields, distortions }}
          slideToShow={slide}
          shouldShowInFlowOnboarding={fromIntro}
          onChange={(patch) => setFields((prev) => ({ ...prev, ...patch }))}
          onChangeDistortion={onChangeDistortion}
        />
      </Container>
    </>
  );
}
