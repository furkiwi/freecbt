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
};

export function isEmptyDraft(
  draft: Pick<
    ThoughtDraft,
    "automaticThought" | "alternativeThought" | "challenge" | "distortionSlugs"
  >
): boolean {
  return (
    draft.automaticThought.trim() === "" &&
    draft.alternativeThought.trim() === "" &&
    draft.challenge.trim() === "" &&
    draft.distortionSlugs.length === 0
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
      thoughtID:
        typeof parsed.thoughtID === "string" ? parsed.thoughtID : null,
      automaticThought:
        typeof parsed.automaticThought === "string"
          ? parsed.automaticThought
          : "",
      alternativeThought:
        typeof parsed.alternativeThought === "string"
          ? parsed.alternativeThought
          : "",
      challenge: typeof parsed.challenge === "string" ? parsed.challenge : "",
      distortionSlugs: Array.isArray(parsed.distortionSlugs)
        ? parsed.distortionSlugs.filter((s) => typeof s === "string")
        : [],
      slide:
        parsed.slide === "distortions" ||
        parsed.slide === "challenge" ||
        parsed.slide === "alternative"
          ? parsed.slide
          : "automatic",
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
