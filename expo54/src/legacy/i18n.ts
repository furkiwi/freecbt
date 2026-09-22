import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import locals from "../locals";
import { LOCALE_KEY } from "./setting";
import { getSetting } from "./setting/settingstore";

function walkReverse(obj: object): object | string {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "string"
        ? val.split("").reverse().join("")
        : walkReverse(val),
    ])
  );
}

const i18n = new I18n({
  ...locals,
  // testing with an obviously-transformed language makes it easy to find and
  // remove hardcoded strings. Hidden behind `feature.testLocalesVisible`.
  _test: walkReverse(locals.en),
});

i18n.enableFallback = true;

function pickDeviceLocale(): string {
  const available = new Set(Object.keys(locals));
  for (const loc of Localization.getLocales()) {
    const tag = loc.languageTag;
    if (available.has(tag)) return tag;
    const lower = tag.toLowerCase();
    if (
      lower.startsWith("zh-hant") ||
      lower.startsWith("zh-tw") ||
      lower.startsWith("zh-hk") ||
      lower.startsWith("zh-mo")
    ) {
      if (available.has("zh-Hant")) return "zh-Hant";
    }
    if (
      lower.startsWith("zh-hans") ||
      lower.startsWith("zh-cn") ||
      lower.startsWith("zh-sg")
    ) {
      if (available.has("zh-Hans")) return "zh-Hans";
    }
    const parts = tag.split("-");
    if (parts.length >= 2 && available.has(`${parts[0]}-${parts[1]}`)) {
      return `${parts[0]}-${parts[1]}`;
    }
    if (available.has(parts[0])) return parts[0];
  }
  return Localization.getLocales()[0]?.languageTag ?? "en";
}

i18n.locale = pickDeviceLocale();

async function loadLocaleSetting() {
  // const locale = isPlatformSupported() ? await getSetting(LOCALE_KEY) : null;
  const locale =
    typeof window !== "undefined" ? await getSetting(LOCALE_KEY) : null;
  if (locale) {
    i18n.locale = locale;
  }
}
loadLocaleSetting();

export default i18n;
