import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Slides } from "./form/FormView";
import * as Distortion from "./io-ts/distortion";

const KEY_DRAFT = `@Quirk:thought-draft`;

export type ThoughtDraft = {
  thoughtID: string | null;
  automaticThought: string;
  alternativeThought: string;
  challenge: string;
  distortionSlugs: string[];
  slide: Slides;
  situation: string;
  emotion: string;
  emotionIntensity: number | null;
  automaticBelief: number | null;
  evidenceFor: string;
  alternativeBelief: number | null;
  emotionIntensityAfter: number | null;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asScore(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function isEmptyDraft(
  draft: Pick<
    ThoughtDraft,
    "automaticThought" | "alternativeThought" | "challenge" | "distortionSlugs"
  > &
    Partial<
      Pick<
        ThoughtDraft,
        | "situation"
        | "emotion"
        | "emotionIntensity"
        | "automaticBelief"
        | "evidenceFor"
        | "alternativeBelief"
        | "emotionIntensityAfter"
      >
    >
): boolean {
  return (
    draft.automaticThought.trim() === "" &&
    draft.alternativeThought.trim() === "" &&
    draft.challenge.trim() === "" &&
    draft.distortionSlugs.length === 0 &&
    (draft.situation ?? "").trim() === "" &&
    (draft.emotion ?? "").trim() === "" &&
    draft.emotionIntensity == null &&
    draft.automaticBelief == null &&
    (draft.evidenceFor ?? "").trim() === "" &&
    draft.alternativeBelief == null &&
    draft.emotionIntensityAfter == null
  );
}

export function distortionsFromSlugs(
  slugs: readonly string[]
): Set<Distortion.Distortion> {
  const next = new Set<Distortion.Distortion>();
  for (const slug of slugs) {
    const d = Distortion.bySlug[slug];
    if (d) {
      next.add(d);
    }
  }
  return next;
}

const SLIDES: Slides[] = [
  "automatic",
  "distortions",
  "challenge",
  "alternative",
  "situation",
  "evidence",
];

export async function readDraft(): Promise<ThoughtDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_DRAFT);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ThoughtDraft>;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    return {
      thoughtID: typeof parsed.thoughtID === "string" ? parsed.thoughtID : null,
      automaticThought: asString(parsed.automaticThought),
      alternativeThought: asString(parsed.alternativeThought),
      challenge: asString(parsed.challenge),
      distortionSlugs: Array.isArray(parsed.distortionSlugs)
        ? parsed.distortionSlugs.filter((s) => typeof s === "string")
        : [],
      slide: SLIDES.includes(parsed.slide as Slides)
        ? (parsed.slide as Slides)
        : "automatic",
      situation: asString(parsed.situation),
      emotion: asString(parsed.emotion),
      emotionIntensity: asScore(parsed.emotionIntensity),
      automaticBelief: asScore(parsed.automaticBelief),
      evidenceFor: asString(parsed.evidenceFor),
      alternativeBelief: asScore(parsed.alternativeBelief),
      emotionIntensityAfter: asScore(parsed.emotionIntensityAfter),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function writeDraft(draft: ThoughtDraft): Promise<void> {
  try {
    if (isEmptyDraft(draft)) {
      await AsyncStorage.removeItem(KEY_DRAFT);
      return;
    }
    await AsyncStorage.setItem(KEY_DRAFT, JSON.stringify(draft));
  } catch (err) {
    console.error(err);
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_DRAFT);
  } catch (err) {
    console.error(err);
  }
}
