import {
  isLegacyPlainPin,
  parsePinRecord,
  timingSafeEqual,
} from "./lockstore";

test("isLegacyPlainPin accepts only 4-digit codes", () => {
  expect(isLegacyPlainPin("1234")).toBe(true);
  expect(isLegacyPlainPin("0000")).toBe(true);
  expect(isLegacyPlainPin("123")).toBe(false);
  expect(isLegacyPlainPin("12345")).toBe(false);
  expect(isLegacyPlainPin("abcd")).toBe(false);
});

test("parsePinRecord reads v1 hash records and rejects plaintext", () => {
  expect(parsePinRecord("1234")).toBe(null);
  expect(parsePinRecord(null)).toBe(null);
  expect(parsePinRecord("{not json")).toBe(null);
  expect(
    parsePinRecord(JSON.stringify({ v: 1, salt: "ab", hash: "cd" }))
  ).toEqual({ v: 1, salt: "ab", hash: "cd" });
  expect(parsePinRecord(JSON.stringify({ v: 2, salt: "ab", hash: "cd" }))).toBe(
    null
  );
});

test("timingSafeEqual compares strings", () => {
  expect(timingSafeEqual("aaaa", "aaaa")).toBe(true);
  expect(timingSafeEqual("aaaa", "aaab")).toBe(false);
  expect(timingSafeEqual("aa", "aaaa")).toBe(false);
});
