import {
  defaultSlideForMode,
  slideAfterModeChange,
} from "./record-slides";

test("full records start on situation/emotion, simple on automatic thought", () => {
  expect(defaultSlideForMode("full")).toBe("situation");
  expect(defaultSlideForMode("simple")).toBe("automatic");
});

test("switching to full from the simple start page opens situation/emotion", () => {
  expect(slideAfterModeChange("full", "automatic")).toBe("situation");
});

test("switching to full keeps later equivalent pages", () => {
  expect(slideAfterModeChange("full", "distortions")).toBe("distortions");
  expect(slideAfterModeChange("full", "challenge")).toBe("evidence");
  expect(slideAfterModeChange("full", "alternative")).toBe("alternative");
});

test("switching back to simple maps full-only pages", () => {
  expect(slideAfterModeChange("simple", "situation")).toBe("automatic");
  expect(slideAfterModeChange("simple", "evidence")).toBe("challenge");
  expect(slideAfterModeChange("simple", "automatic")).toBe("automatic");
  expect(slideAfterModeChange("simple", "distortions")).toBe("distortions");
});
