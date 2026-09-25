import { Appearance } from "react-native";
import { getSettingOrSetDefault, setSetting } from "./settingstore";

export const COLOR_SCHEME_KEY = "color-scheme";
export type ColorSchemeSetting = "system" | "light" | "dark";
export const COLOR_SCHEME_DEFAULT: ColorSchemeSetting = "system";

export function isColorSchemeSetting(
  value: string
): value is ColorSchemeSetting {
  return value === "system" || value === "light" || value === "dark";
}

export async function getColorSchemeSetting(): Promise<ColorSchemeSetting> {
  const value = await getSettingOrSetDefault(
    COLOR_SCHEME_KEY,
    COLOR_SCHEME_DEFAULT
  );
  return isColorSchemeSetting(value) ? value : COLOR_SCHEME_DEFAULT;
}

export async function setColorSchemeSetting(
  value: ColorSchemeSetting
): Promise<boolean> {
  return await setSetting(COLOR_SCHEME_KEY, value);
}

export function resolveColorScheme(
  setting: ColorSchemeSetting
): "light" | "dark" {
  if (setting === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return setting;
}
