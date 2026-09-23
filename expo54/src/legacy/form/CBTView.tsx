import React from "react";
import { Alert, ScrollView, Share } from "react-native";
import Feedback from "../feedback";
import i18n from "../i18n";
import { BubbleThought } from "../imgs/Bubbles";
import * as Distortion from "../io-ts/distortion";
import * as Thought from "../io-ts/thought";
import theme from "../theme";
import {
  ActionButton,
  FormContainer,
  GhostButtonWithGuts,
  Paragraph,
  Row,
  SubHeader,
} from "../ui";
import { Slides } from "./FormView";

function scoreLine(label: string, value?: number | null): string[] {
  return value == null ? [] : [`${label}: ${value}`];
}

function thoughtToShareText(thought: Thought.Thought): string {
  const empty = i18n.t("thought_share.empty");
  const distortions = Array.from(thought.cognitiveDistortions)
    .map((d) => `- ${d.emoji()} ${d.label()}`)
    .sort()
    .join("\n");
  const full = Thought.hasFullRecordFields(thought);
  return [
    i18n.t("thought_share.intro"),
    "",
    `${i18n.t("thought_share.created")}: ${thought.createdAt.toLocaleString()}`,
    `${i18n.t("thought_share.updated")}: ${thought.updatedAt.toLocaleString()}`,
    "",
    ...(full
      ? [
          `## ${i18n.t("cbt_form.situation")}`,
          thought.situation || empty,
          "",
          `## ${i18n.t("cbt_form.emotion")}`,
          [thought.emotion || empty, ...scoreLine(i18n.t("cbt_form.emotion_intensity"), thought.emotionIntensity)].join(
            "\n"
          ),
          "",
        ]
      : []),
    `## ${i18n.t("auto_thought")}`,
    [
      thought.automaticThought || empty,
      ...scoreLine(i18n.t("cbt_form.belief"), thought.automaticBelief),
    ].join("\n"),
    "",
    `## ${i18n.t("cbt_form.cog_distortion")}`,
    distortions || empty,
    "",
    ...(full
      ? [
          `## ${i18n.t("cbt_form.evidence_for")}`,
          thought.evidenceFor || empty,
          "",
          `## ${i18n.t("cbt_form.evidence_against")}`,
          thought.challenge || empty,
          "",
        ]
      : [
          `## ${i18n.t("challenge")}`,
          thought.challenge || empty,
          "",
        ]),
    `## ${i18n.t("alt_thought")}`,
    [
      thought.alternativeThought || empty,
      ...scoreLine(i18n.t("cbt_form.belief_after"), thought.alternativeBelief),
      ...scoreLine(i18n.t("cbt_form.emotion_after"), thought.emotionIntensityAfter),
    ].join("\n"),
  ].join("\n");
}

async function shareThought(thought: Thought.Thought): Promise<void> {
  try {
    await Share.share({ message: thoughtToShareText(thought) });
  } catch {
    Alert.alert(i18n.t("thought_share.error"));
  }
}

const cognitiveDistortionsToText = (
  cognitiveDistortions: Set<Distortion.Distortion>
) => {
  const paragraphs = Array.from(cognitiveDistortions).map((d) => (
    <Paragraph
      key={d.slug}
      style={{
        marginBottom: 8,
      }}
    >
      {d.emoji()} {d.label()}
    </Paragraph>
  ));

  if (paragraphs.length === 0) {
    return <Paragraph>🤷‍</Paragraph>;
  }

  return paragraphs;
};

function Score({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}): React.JSX.Element | null {
  if (value == null) return null;
  return (
    <Paragraph style={{ marginTop: 8 }}>
      {label}: {value}
    </Paragraph>
  );
}

const CBTView = ({
  thought,
  onEdit,
}: {
  thought: Thought.Thought;
  onEdit: (uuid: string, slide: Slides) => void;
}) => (
  <>
    {Thought.hasFullRecordFields(thought) ? (
      <>
        <FormContainer>
          <SubHeader>{i18n.t("cbt_form.situation")}</SubHeader>
          <GhostButtonWithGuts
            borderColor={theme.lightGray}
            style={{ backgroundColor: "white" }}
            onPress={() => onEdit(Thought.key(thought), "situation")}
          >
            <Paragraph>{thought.situation || "🤷‍"}</Paragraph>
          </GhostButtonWithGuts>
        </FormContainer>
        <FormContainer>
          <SubHeader>{i18n.t("cbt_form.emotion")}</SubHeader>
          <GhostButtonWithGuts
            borderColor={theme.lightGray}
            style={{ backgroundColor: "white" }}
            onPress={() => onEdit(Thought.key(thought), "situation")}
          >
            <Paragraph>{thought.emotion || "🤷‍"}</Paragraph>
            <Score
              label={i18n.t("cbt_form.emotion_intensity")}
              value={thought.emotionIntensity}
            />
          </GhostButtonWithGuts>
        </FormContainer>
      </>
    ) : null}
    <FormContainer>
      <SubHeader>{i18n.t("auto_thought")}</SubHeader>

      <GhostButtonWithGuts
        borderColor={theme.lightGray}
        style={{
          backgroundColor: "white",
        }}
        onPress={() => onEdit(Thought.key(thought), "automatic")}
      >
        {thought.automaticThought ? (
          <BubbleThought
            style={{
              marginTop: 0,
            }}
          >
            {thought.automaticThought}
          </BubbleThought>
        ) : (
          <Paragraph>🤷‍</Paragraph>
        )}
        <Score
          label={i18n.t("cbt_form.belief")}
          value={thought.automaticBelief}
        />
      </GhostButtonWithGuts>
    </FormContainer>

    <FormContainer>
      <SubHeader>{i18n.t("cog_distortion")}</SubHeader>
      <GhostButtonWithGuts
        borderColor={theme.lightGray}
        style={{
          backgroundColor: "white",
        }}
        onPress={() => onEdit(Thought.key(thought), "distortions")}
      >
        {cognitiveDistortionsToText(thought.cognitiveDistortions)}
      </GhostButtonWithGuts>
    </FormContainer>

    {Thought.hasFullRecordFields(thought) ? (
      <>
        <FormContainer>
          <SubHeader>{i18n.t("cbt_form.evidence_for")}</SubHeader>
          <GhostButtonWithGuts
            borderColor={theme.lightGray}
            style={{ backgroundColor: "white" }}
            onPress={() => onEdit(Thought.key(thought), "evidence")}
          >
            <Paragraph>{thought.evidenceFor || "🤷‍"}</Paragraph>
          </GhostButtonWithGuts>
        </FormContainer>
        <FormContainer>
          <SubHeader>{i18n.t("cbt_form.evidence_against")}</SubHeader>
          <GhostButtonWithGuts
            borderColor={theme.lightGray}
            style={{ backgroundColor: "white" }}
            onPress={() => onEdit(Thought.key(thought), "evidence")}
          >
            <Paragraph>{thought.challenge || "🤷‍"}</Paragraph>
          </GhostButtonWithGuts>
        </FormContainer>
      </>
    ) : (
      <FormContainer>
        <SubHeader>{i18n.t("challenge")}</SubHeader>
        <GhostButtonWithGuts
          borderColor={theme.lightGray}
          style={{
            backgroundColor: "white",
          }}
          onPress={() => onEdit(Thought.key(thought), "challenge")}
        >
          <Paragraph>{thought.challenge || "🤷‍"}</Paragraph>
        </GhostButtonWithGuts>
      </FormContainer>
    )}

    <FormContainer>
      <SubHeader>{i18n.t("alt_thought")}</SubHeader>
      <GhostButtonWithGuts
        borderColor={theme.lightGray}
        style={{
          backgroundColor: "white",
        }}
        onPress={() => onEdit(Thought.key(thought), "alternative")}
      >
        {thought.alternativeThought ? (
          <BubbleThought
            style={{
              marginTop: 0,
            }}
            color="pink"
          >
            {thought.alternativeThought}
          </BubbleThought>
        ) : (
          <Paragraph>🤷‍</Paragraph>
        )}
        <Score
          label={i18n.t("cbt_form.belief_after")}
          value={thought.alternativeBelief}
        />
        <Score
          label={i18n.t("cbt_form.emotion_after")}
          value={thought.emotionIntensityAfter}
        />
      </GhostButtonWithGuts>
    </FormContainer>
  </>
);

export default ({
  thought,
  onEdit,
  onNew,
}: {
  thought: Thought.Thought;
  onEdit: (uuid: string, slide: Slides) => void;
  onNew: () => void;
}) => {
  if (!thought.uuid) {
    console.error("Viewing something that's not saved");
  }

  return (
    <ScrollView
      style={{
        paddingHorizontal: 24,
        paddingVertical: 18,
      }}
    >
      {/* <Row
        style={{
          marginBottom: 18,
        }}
      >
        <ActionButton title="New Thought" width={"100%"} onPress={onNew} />
      </Row> */}

      <CBTView thought={thought} onEdit={onEdit} />
      <Row style={{ marginBottom: 18 }}>
        <ActionButton
          title={i18n.t("thought_share.button")}
          width={"100%"}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={() => {
            void shareThought(thought);
          }}
        />
      </Row>
      <Feedback />

      {/*<Row style={{ marginBottom: 9 }}>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          // @ts-expect-error not sure why this isn't typed, but it makes this fill the width
          flex={1}
          value={Thought.toMarkdown(thought)}
          multiline={true}
          numberOfLines={3}
          editable={true}
          selectTextOnFocus={true}
        />
        </Row>*/}
    </ScrollView>
  );
};
