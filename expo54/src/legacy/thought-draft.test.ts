import { distortionsFromSlugs, isEmptyDraft } from "./thought-draft";

test("isEmptyDraft is true only when every field is blank", () => {
  expect(
    isEmptyDraft({
      automaticThought: " ",
      alternativeThought: "",
      challenge: "",
      distortionSlugs: [],
    })
  ).toBe(true);
  expect(
    isEmptyDraft({
      automaticThought: "I will fail",
      alternativeThought: "",
      challenge: "",
      distortionSlugs: [],
    })
  ).toBe(false);
});

test("distortionsFromSlugs ignores unknown slugs", () => {
  const set = distortionsFromSlugs(["all-or-nothing", "not-a-real-slug"]);
  expect(set.size).toBe(1);
});
