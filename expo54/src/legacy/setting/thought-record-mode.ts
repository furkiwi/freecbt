import {
  getSettingOrSetDefault,
  setSetting,
} from "./settingstore";

export const THOUGHT_RECORD_MODE_KEY = "thought-record-mode";
export type ThoughtRecordMode = "simple" | "full";
export const THOUGHT_RECORD_MODE_DEFAULT: ThoughtRecordMode = "simple";

export function isThoughtRecordMode(value: string): value is ThoughtRecordMode {
  return value === "simple" || value === "full";
}

export async function getThoughtRecordMode(): Promise<ThoughtRecordMode> {
  const value = await getSettingOrSetDefault(
    THOUGHT_RECORD_MODE_KEY,
    THOUGHT_RECORD_MODE_DEFAULT
  );
  return isThoughtRecordMode(value) ? value : THOUGHT_RECORD_MODE_DEFAULT;
}

export async function setThoughtRecordMode(
  value: ThoughtRecordMode
): Promise<boolean> {
  return await setSetting(THOUGHT_RECORD_MODE_KEY, value);
}
