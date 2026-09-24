import { ThoughtRecordMode } from "../setting/thought-record-mode";

export const simpleSlides = [
  "automatic",
  "distortions",
  "challenge",
  "alternative",
] as const;
export const fullSlides = [
  "situation",
  "automatic",
  "distortions",
  "evidence",
  "alternative",
] as const;

export type Slides =
  | (typeof simpleSlides)[number]
  | (typeof fullSlides)[number];

export function slidesForMode(mode: ThoughtRecordMode): readonly Slides[] {
  return mode === "full" ? fullSlides : simpleSlides;
}

export function defaultSlideForMode(mode: ThoughtRecordMode): Slides {
  return mode === "full" ? "situation" : "automatic";
}

/** Map the current page onto the equivalent page after a simple/full switch. */
export function slideAfterModeChange(
  next: ThoughtRecordMode,
  slide: Slides
): Slides {
  const allowed = slidesForMode(next);
  if (next === "full") {
    if (slide === "challenge") {
      return "evidence";
    }
    // Simple mode starts on automatic thoughts; full mode starts on situation/emotion.
    if (slide === "automatic") {
      return "situation";
    }
    return allowed.includes(slide) ? slide : "situation";
  }
  if (slide === "situation") {
    return "automatic";
  }
  if (slide === "evidence") {
    return "challenge";
  }
  return allowed.includes(slide) ? slide : "automatic";
}
