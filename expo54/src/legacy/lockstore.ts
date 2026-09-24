import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

/** Legacy plaintext PIN, still read for one-time migration. */
const KEY_PINCODE_LEGACY = `@Quirk:pincode`;
/** Hashed PIN record in AsyncStorage (web + fallback). */
const KEY_PINCODE_HASH = `@Quirk:pincode-hash`;
/** SecureStore only allows [A-Za-z0-9._-]. */
const SECURE_PIN_KEY = `quirk_pincode_hash`;
const KEY_BIOMETRICS = `@Quirk:biometrics`;

export type PinRecord = {
  v: 1;
  salt: string;
  hash: string;
};

export function isLegacyPlainPin(value: string): boolean {
  return /^[0-9]{4}$/.test(value);
}

export function parsePinRecord(raw: string | null): PinRecord | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PinRecord>;
    if (
      parsed &&
      parsed.v === 1 &&
      typeof parsed.salt === "string" &&
      parsed.salt.length > 0 &&
      typeof parsed.hash === "string" &&
      parsed.hash.length > 0
    ) {
      return { v: 1, salt: parsed.salt, hash: parsed.hash };
    }
  } catch {
    // not JSON — might be a legacy plaintext pin
  }
  return null;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function hashPin(code: string, salt: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${code}`
  );
}

async function createPinRecord(code: string): Promise<PinRecord> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hash = await hashPin(code, salt);
  return { v: 1, salt, hash };
}

async function secureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readHashRecord(): Promise<PinRecord | null> {
  try {
    if (await secureStoreAvailable()) {
      const secure = await SecureStore.getItemAsync(SECURE_PIN_KEY);
      const fromSecure = parsePinRecord(secure);
      if (fromSecure) {
        return fromSecure;
      }
    }
    return parsePinRecord(await AsyncStorage.getItem(KEY_PINCODE_HASH));
  } catch (err) {
    console.error(err);
    return parsePinRecord(await AsyncStorage.getItem(KEY_PINCODE_HASH));
  }
}

async function writeHashRecord(record: PinRecord): Promise<void> {
  const raw = JSON.stringify(record);
  await AsyncStorage.setItem(KEY_PINCODE_HASH, raw);
  if (await secureStoreAvailable()) {
    try {
      await SecureStore.setItemAsync(SECURE_PIN_KEY, raw);
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteHashRecord(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PINCODE_HASH);
  if (await secureStoreAvailable()) {
    try {
      await SecureStore.deleteItemAsync(SECURE_PIN_KEY);
    } catch (err) {
      console.error(err);
    }
  }
}

async function readLegacyPlainPin(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(KEY_PINCODE_LEGACY);
    return value && isLegacyPlainPin(value) ? value : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function migratePlainPin(code: string): Promise<void> {
  const record = await createPinRecord(code);
  await writeHashRecord(record);
  try {
    await AsyncStorage.removeItem(KEY_PINCODE_LEGACY);
  } catch (err) {
    console.error(err);
  }
}

export async function setPincode(code: string): Promise<boolean> {
  if (!isLegacyPlainPin(code)) {
    throw new Error("Pincodes must be 4 characters");
  }

  try {
    const record = await createPinRecord(code);
    await writeHashRecord(record);
    await AsyncStorage.removeItem(KEY_PINCODE_LEGACY);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function isCorrectPincode(code: string): Promise<boolean> {
  if (!isLegacyPlainPin(code)) {
    return false;
  }

  try {
    const record = await readHashRecord();
    if (record) {
      const actual = await hashPin(code, record.salt);
      return timingSafeEqual(actual, record.hash);
    }

    const legacy = await readLegacyPlainPin();
    if (legacy && code === legacy) {
      await migratePlainPin(code);
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function hasPincode(): Promise<boolean> {
  try {
    if (await readHashRecord()) {
      return true;
    }
    return !!(await readLegacyPlainPin());
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function clearPincode(): Promise<void> {
  try {
    await deleteHashRecord();
    await AsyncStorage.removeItem(KEY_PINCODE_LEGACY);
    await setBiometricsEnabled(false);
  } catch (err) {
    console.error(err);
  }
}

export async function isBiometricsAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    return hasHardware && enrolled && types.length > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function isBiometricsEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY_BIOMETRICS);
    return value === "1";
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(KEY_BIOMETRICS, "1");
    } else {
      await AsyncStorage.removeItem(KEY_BIOMETRICS);
    }
  } catch (err) {
    console.error(err);
  }
}

let biometricAuthInFlight: Promise<boolean> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function cancelBiometricPrompt(): Promise<void> {
  try {
    await LocalAuthentication.cancelAuthenticate();
  } catch {
    // iOS and some Android versions do not implement cancel.
  }
}

export async function authenticateWithBiometrics(
  promptMessage: string
): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  // Biometric prompts started while backgrounded fail or hang; the lock
  // screen must wait until the app is active again.
  if (AppState.currentState !== "active") {
    return false;
  }

  if (biometricAuthInFlight) {
    await cancelBiometricPrompt();
    try {
      await biometricAuthInFlight;
    } catch {
      // previous attempt settled
    }
  }

  const run = (async () => {
    try {
      let available = await isBiometricsAvailable();
      if (!available) {
        await delay(300);
        if (AppState.currentState !== "active") {
          return false;
        }
        available = await isBiometricsAvailable();
      }
      if (!available) {
        return false;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: "PIN",
        disableDeviceFallback: true,
        requireConfirmation: false,
      });
      return result.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  })();

  biometricAuthInFlight = run.finally(() => {
    if (biometricAuthInFlight === run) {
      biometricAuthInFlight = null;
    }
  });
  return biometricAuthInFlight;
}
