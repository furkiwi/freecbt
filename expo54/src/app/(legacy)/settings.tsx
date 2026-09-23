import { Routes } from "@/src";
import * as AsyncState from "@/src/legacy/async-state";
import * as Feature from "@/src/legacy/feature";
import i18n from "@/src/legacy/i18n";
import { langProgress } from "@/src/legacy/i18n-progress";
import * as TS from "@/src/legacy/io-ts/thought/store";
import {
  authenticateWithBiometrics,
  clearPincode,
  hasPincode,
  isBiometricsAvailable,
  isBiometricsEnabled,
  setBiometricsEnabled,
} from "@/src/legacy/lockstore";
import {
  getThoughtRecordMode,
  HISTORY_BUTTON_LABEL_DEFAULT,
  HISTORY_BUTTON_LABEL_KEY,
  HistoryButtonLabelSetting,
  isHistoryButtonLabelSetting,
  LOCALE_KEY,
  NOTIFICATIONS_KEY,
  setThoughtRecordMode,
  ThoughtRecordMode,
} from "@/src/legacy/setting";
import {
  getSetting,
  getSettingOrSetDefault,
  removeSetting,
  setSetting,
} from "@/src/legacy/setting/settingstore";
import theme from "@/src/legacy/theme";
import {
  ActionButton,
  Container,
  Header,
  IconButton,
  Paragraph,
  RoundedSelectorButton,
  Row,
  SubHeader,
} from "@/src/legacy/ui";
import { Picker } from "@react-native-picker/picker";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import { Link, useRouter } from "expo-router";
import * as T from "io-ts";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

export { HistoryButtonLabelSetting };

export async function getHistoryButtonLabel(): Promise<HistoryButtonLabelSetting> {
  const value = await getSettingOrSetDefault(
    HISTORY_BUTTON_LABEL_KEY,
    HISTORY_BUTTON_LABEL_DEFAULT
  );

  if (!isHistoryButtonLabelSetting(value)) {
    console.error(
      `Something went wrong getting ${HISTORY_BUTTON_LABEL_KEY}. Got: "${value}"`
    );
    return HISTORY_BUTTON_LABEL_DEFAULT;
  }

  return value;
}

export async function getLocaleSetting(): Promise<string | null> {
  return await getSetting(LOCALE_KEY);
}

export async function setLocaleSetting(
  locale: string | null
): Promise<boolean> {
  if (locale) {
    i18n.locale = locale;
    return await setSetting(LOCALE_KEY, locale);
  } else {
    i18n.locale = Localization.getLocales()[0].languageTag;
    return await removeSetting(LOCALE_KEY);
  }
}

export async function getNotifications(): Promise<boolean> {
  try {
    const str = await getSettingOrSetDefault(NOTIFICATIONS_KEY, "false");
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
}

export async function setNotifications(
  feature: Feature.Feature,
  enabled: boolean
): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  enabled = enabled && (await registerForLocalNotificationsAsync());
  if (enabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("reminder_notification.intro.title"),
        body: i18n.t("reminder_notification.intro.body"),
        color: "#F78FB3",
      },
      trigger: null,
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("reminder_notification.1.title"),
        body: i18n.t("reminder_notification.1.body"),
        color: "#F78FB3",
      },
      trigger: feature.remindersEachMinute
        ? { channelId: "default", repeats: true, seconds: 60 }
        : { channelId: "default", repeats: true, seconds: 86400 },
    });
  }
  setSetting(NOTIFICATIONS_KEY, JSON.stringify(enabled));
  return enabled;
}

async function registerForLocalNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}

export default function SettingScreen(): React.JSX.Element {
  const router = useRouter();
  const [refresh, setRefresh] = React.useState(0);
  const historyButtonLabel =
    AsyncState.useAsyncState<HistoryButtonLabelSetting>(getHistoryButtonLabel, [
      refresh,
    ]);
  const areNotificationsOn =
    AsyncState.useAsyncState<boolean>(getNotifications);
  const hasPincode_ = AsyncState.useAsyncState<boolean>(hasPincode, [refresh]);
  const biometricsAvailable = AsyncState.useAsyncState<boolean>(
    isBiometricsAvailable,
    [refresh]
  );
  const biometricsEnabled = AsyncState.useAsyncState<boolean>(
    isBiometricsEnabled,
    [refresh]
  );
  const localeSetting = AsyncState.useAsyncState<string | null>(
    getLocaleSetting,
    [refresh]
  );
  const thoughtRecordMode = AsyncState.useAsyncState<ThoughtRecordMode>(
    getThoughtRecordMode,
    [refresh]
  );

  const percentFormat = new Intl.NumberFormat(i18n.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "percent",
  });

  async function toggleHistoryButtonLabels() {
    if (AsyncState.isSuccess(historyButtonLabel)) {
      await setSetting<HistoryButtonLabelSetting>(
        HISTORY_BUTTON_LABEL_KEY,
        historyButtonLabel.value === "alternative-thought"
          ? "automatic-thought"
          : "alternative-thought"
      );
      setRefresh(refresh + 1);
    }
  }

  const archive = AsyncState.useAsyncState<string>(TS.readArchiveString);
  const [archiveWrite, setArchiveWrite] = React.useState<
    AsyncState.RemoteData<null, T.Errors>
  >({
    status: "init",
  });

  async function onImport(value: string = ""): Promise<void> {
    const promise = TS.writeArchiveString(value ?? "");
    setArchiveWrite({
      status: "pending",
      promise: promise.then(() => {}),
    });
    const result = await promise;
    setArchiveWrite(
      result === null
        ? { status: "success", value: null }
        : { status: "failure", error: result }
    );
  }

  const { feature } = Feature.useFeatureContext();

  return (
    <ScrollView
      style={{
        backgroundColor: theme.lightOffwhite,
        marginTop: Constants.statusBarHeight,
        paddingTop: 24,
        height: "100%",
      }}
    >
      <Container style={{ paddingBottom: 128 }}>
        <StatusBar barStyle="dark-content" />
        <Row style={{ marginBottom: 18 }}>
          <Header>{i18n.t("settings.header")}</Header>
          <IconButton
            featherIconName={"list"}
            accessibilityLabel={i18n.t("accessibility.list_button")}
            onPress={() => {
              router.navigate(Routes.thoughtList());
            }}
          />
        </Row>

        {feature.reminders &&
          AsyncState.fold(
            areNotificationsOn,
            () => null,
            () => null,
            (error) => <Text>{error}</Text>,
            (notify) => (
              <Row
                style={{
                  marginBottom: 18,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SubHeader>{i18n.t("settings.reminders.header")}</SubHeader>
                <Paragraph style={{ marginBottom: 9 }}>
                  {i18n.t("settings.reminders.description")}
                </Paragraph>
                <RoundedSelectorButton
                  title={i18n.t("settings.reminders.button.yes")}
                  selected={notify}
                  onPress={async () => {
                    await setNotifications(feature, true);
                    setRefresh(refresh + 1);
                  }}
                />
                <RoundedSelectorButton
                  title={i18n.t("settings.reminders.button.no")}
                  selected={!notify}
                  onPress={async () => {
                    await setNotifications(feature, false);
                    setRefresh(refresh + 1);
                  }}
                />
              </Row>
            )
          )}

        {/* PIN Code & 生物辨識區塊 */}
        <Row
          style={{
            marginBottom: 18,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SubHeader>{i18n.t("settings.pincode.header")}</SubHeader>
          <Paragraph style={{ marginBottom: 9 }}>
            {i18n.t("settings.pincode.description")}
          </Paragraph>
          {AsyncState.fold(
            hasPincode_,
            () => null,
            () => null,
            (error) => <Text>{error}</Text>,
            (show) =>
              show ? (
                <>
                  <ActionButton
                    flex={1}
                    title={i18n.t("settings.pincode.button.update")}
                    width={"100%"}
                    fillColor="#EDF0FC"
                    textColor={theme.darkBlue}
                    onPress={() => {
                      router.navigate(Routes.lockUpdate());
                    }}
                  />
                  <ActionButton
                    flex={1}
                    title={i18n.t("settings.pincode.button.clear")}
                    width={"100%"}
                    fillColor="#EDF0FC"
                    textColor={theme.darkBlue}
                    onPress={async () => {
                      await clearPincode();
                      setRefresh(refresh + 1);
                    }}
                  />
                  {AsyncState.fold(
                    biometricsAvailable,
                    () => null,
                    () => null,
                    () => null,
                    (available) =>
                      available
                        ? AsyncState.fold(
                            biometricsEnabled,
                            () => null,
                            () => null,
                            () => null,
                            (enabled) => (
                              <ActionButton
                                flex={1}
                                title={
                                  enabled
                                    ? i18n.t(
                                        "settings.pincode.biometrics.disable"
                                      )
                                    : i18n.t(
                                        "settings.pincode.biometrics.enable"
                                      )
                                }
                                width={"100%"}
                                fillColor="#EDF0FC"
                                textColor={theme.darkBlue}
                                onPress={async () => {
                                  if (!enabled) {
                                    const ok =
                                      await authenticateWithBiometrics(
                                        i18n.t("lock_screen.biometrics_prompt")
                                      );
                                    if (!ok) {
                                      return;
                                    }
                                  }
                                  await setBiometricsEnabled(!enabled);
                                  setRefresh(refresh + 1);
                                }}
                              />
                            )
                          )
                        : null
                  )}
                </>
              ) : (
                <ActionButton
                  flex={1}
                  title={i18n.t("settings.pincode.button.set")}
                  width={"100%"}
                  fillColor="#EDF0FC"
                  textColor={theme.darkBlue}
                  onPress={() => {
                    router.navigate(Routes.lockUpdate());
                  }}
                />
              )
          )}
        </Row>

        {/* 紀錄模式選單區塊 */}
        {AsyncState.fold(
          thoughtRecordMode,
          () => null,
          () => null,
          (error) => <Text>{error}</Text>,
          (mode) => (
            <Row
              style={{
                marginBottom: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SubHeader>{i18n.t("settings.record_mode.header")}</SubHeader>
              <Paragraph style={{ marginBottom: 9 }}>
                {i18n.t("settings.record_mode.description")}
              </Paragraph>
              <RoundedSelectorButton
                title={i18n.t("settings.record_mode.simple")}
                selected={mode === "simple"}
                onPress={async () => {
                  await setThoughtRecordMode("simple");
                  setRefresh(refresh + 1);
                }}
              />
              <RoundedSelectorButton
                title={i18n.t("settings.record_mode.full")}
                selected={mode === "full"}
                onPress={async () => {
                  await setThoughtRecordMode("full");
                  setRefresh(refresh + 1);
                }}
              />
            </Row>
          )
        )}

        {/* 歷史按鈕標籤區塊 */}
        {AsyncState.fold(
          historyButtonLabel,
          () => null,
          () => null,
          (error) => <Text>{error}</Text>,
          (label) => (
            <Row
              style={{
                marginBottom: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SubHeader>{i18n.t("settings.history.header")}</SubHeader>
              <Paragraph style={{ marginBottom: 9 }}>
                {i18n.t("settings.history.description")}
              </Paragraph>
              <RoundedSelectorButton
                title={i18n.t("settings.history.button.alternative")}
                selected={label === "alternative-thought"}
                onPress={toggleHistoryButtonLabels}
              />
              <RoundedSelectorButton
                title={i18n.t("settings.history.button.automatic")}
                selected={label === "automatic-thought"}
                onPress={toggleHistoryButtonLabels}
              />
            </Row>
          )
        )}

        {/* 備份與匯出 */}
        <SubHeader>{i18n.t("settings.backup.header")}</SubHeader>
        <Row style={{ marginBottom: 9 }}>
          <ActionButton
            flex={1}
            title={i18n.t("settings.backup.button")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={() => {
              router.navigate(Routes.backup());
            }}
          />
        </Row>
        <Row style={{ marginBottom: 9 }}>
          <ActionButton
            flex={1}
            title={i18n.t("settings.backup.export-button")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={() => {
              router.navigate(Routes.export_());
            }}
          />
        </Row>

        {/* 語系設定 */}
        {feature.localeSetting &&
          AsyncState.fold(
            localeSetting,
            () => null,
            () => null,
            (error) => <Text>{error}</Text>,
            (locale) => (
              <Row
                style={{
                  marginBottom: 18,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SubHeader>{i18n.t("settings.locale.header")}</SubHeader>
                <Picker
                  itemStyle={{ color: "black" }}
                  style={{ color: "black" }}
                  selectedValue={locale}
                  onValueChange={async (val) => {
                    await setLocaleSetting(val);
                    setRefresh(refresh + 1);
                  }}
                >
                  <Picker.Item
                    label={i18n.t("settings.locale.default")}
                    value={""}
                  />
                  {Object.entries(i18n.translations)
                    .map(([locale, translation]) => ({
                      locale,
                      translation,
                      progress: langProgress(locale, translation),
                    }))
                    .filter(
                      ({ locale }) =>
                        !locale.startsWith("_") || feature.testLocalesVisible
                    )
                    .map(({ locale, progress }) => {
                      const suffix =
                        progress.percent >= 1
                          ? ""
                          : ` (${percentFormat.format(progress.percent)})`;
                      return (
                        <Picker.Item
                          key={locale}
                          label={
                            i18n.t("settings.locale.list." + locale) + suffix
                          }
                          value={locale}
                        />
                      );
                    })}
                </Picker>
              </Row>
            )
          )}

        {/* 頁尾連結 */}
        {feature.localeSetting && (
          <Row style={{ marginBottom: 9 }}>
            <ActionButton
              flex={1}
              title={i18n.t("settings.locale.contribute")}
              fillColor="#EDF0FC"
              textColor={theme.darkBlue}
              onPress={() => {
                const url =
                  "https://github.com/erosson/freecbt/blob/master/TRANSLATIONS.md";
                Linking.canOpenURL(url).then(() => Linking.openURL(url));
              }}
            />
          </Row>
        )}
        <Row style={{ marginBottom: 9 }}>
          <ActionButton
            flex={1}
            title={i18n.t("settings.privacy")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={() => {
              const url =
                "https://github.com/erosson/freecbt/blob/master/PRIVACY.md";
              Linking.canOpenURL(url).then(() => Linking.openURL(url));
            }}
          />
        </Row>
        <Row>
          <ActionButton
            flex={1}
            title={i18n.t("settings.terms")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={() => {
              const url =
                "https://github.com/erosson/freecbt/blob/master/TOS.md";
              Linking.canOpenURL(url).then(() => Linking.openURL(url));
            }}
          />
        </Row>
        <Row>
          <DebugLink />
        </Row>
      </Container>
    </ScrollView>
  );
}

function DebugLink() {
  const v = Constants.expoConfig?.version;
  const [presses, setPresses] = React.useState(0);
  const isVisible = presses > 0 && presses % 5 === 0;
  return (
    <View style={{ display: "flex" }}>
      <Pressable
        style={{
          marginVertical: 16,
          display: "flex",
          cursor: "auto",
          userSelect: "none",
        }}
        onPress={() => setPresses(presses + 1)}
      >
        <Paragraph>
          {v
            ? `${i18n.t("cbt_form.header")} v${v}`
            : "(unknown FreeCBT version)"}
        </Paragraph>
      </Pressable>
      {isVisible ? (
        <Link href={Routes.debugV2()}>
          <Paragraph style={{ textDecorationLine: "underline" }}>
            developer debug page
          </Paragraph>
        </Link>
      ) : null}
    </View>
  );
}