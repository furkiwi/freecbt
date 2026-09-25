import { Routes } from "@/src";
import Constants from "expo-constants";
import * as Haptic from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { AppState, StatusBar, View } from "react-native";
import * as AsyncState from "../async-state";
import haptic from "../haptic";
import i18n from "../i18n";
import {
  authenticateWithBiometrics,
  cancelBiometricPrompt,
  isBiometricsEnabled,
  isCorrectPincode,
  setPincode,
} from "../lockstore";
import { useAppTheme } from "../theme-context";
import {
  ActionButton,
  Container,
  GhostButton,
  Header,
  IconButton,
  Row,
} from "../ui";

type Props = {
  isSettingCode: boolean;
  onCorrectEntry?: () => void;
};

const KeypadButton = ({
  title,
  onPress,
  style = {},
}: {
  title: string;
  onPress: () => void;
  style?: { [s: string]: string };
}) => {
  const theme = useAppTheme();
  return (
  <GhostButton
    title={title}
    borderColor={theme.gray}
    textColor={theme.darkText}
    width={BUTTON_SIZE}
    height={BUTTON_SIZE}
    fontSize={18}
    style={{
      backgroundColor: theme.card,
      ...style,
    }}
    onPress={onPress}
  />
  );
};

const KeypadSideButton = ({
  icon,
  accessibilityLabel,
  onPress,
  style = {},
}: {
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
  style?: { [s: string]: string };
}) => {
  const theme = useAppTheme();
  return (
  <IconButton
    accessibilityLabel={accessibilityLabel}
    featherIconName={icon}
    style={{
      backgroundColor: theme.card,
      width: BUTTON_SIZE,
      ...style,
    }}
    onPress={onPress}
  />
  );
};

const Notifier = ({ isActive }: { isActive: boolean }) => {
  const theme = useAppTheme();
  return (
  <View>
    style={{
      width: 16,
      height: 16,
      borderRadius: 16,
      marginHorizontal: 10,
      backgroundColor: isActive ? theme.pink : "transparent",
      borderColor: theme.darkPink,
      borderWidth: 2,
    }}
  />
  );
};

const BUTTON_SIZE = 96;

export default function LockScreen(props: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const { isSettingCode } = props;
  const onCorrectEntry =
    props.onCorrectEntry ?? (() => router.navigate(Routes.thoughtCreate()));
  const onCorrectEntryRef = React.useRef(onCorrectEntry);
  onCorrectEntryRef.current = onCorrectEntry;

  const [code, setCode] = React.useState<string>("");
  const [pendingCode, setPendingCode] = React.useState<string>("");
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [showBiometrics, setShowBiometrics] = React.useState(false);
  const [bioBusy, setBioBusy] = React.useState(false);
  const bioBusyRef = React.useRef(false);
  const isComplete = code.length >= 4;

  React.useEffect(() => {
    if (isSettingCode) {
      return;
    }
    let cancelled = false;

    async function tryUnlock() {
      const enabled = await isBiometricsEnabled();
      if (cancelled || !enabled) {
        return;
      }
      setShowBiometrics(true);
      if (AppState.currentState !== "active" || bioBusyRef.current) {
        return;
      }
      bioBusyRef.current = true;
      setBioBusy(true);
      try {
        const ok = await authenticateWithBiometrics(
          i18n.t("lock_screen.biometrics_prompt")
        );
        if (!cancelled && ok) {
          haptic.notification(Haptic.NotificationFeedbackType.Success);
          onCorrectEntryRef.current();
        }
      } finally {
        bioBusyRef.current = false;
        if (!cancelled) {
          setBioBusy(false);
        }
      }
    }

    if (AppState.currentState === "active") {
      tryUnlock();
    }

    const sub = AppState.addEventListener("change", (st) => {
      if (st !== "active") {
        cancelBiometricPrompt();
        return;
      }
      tryUnlock();
    });

    return () => {
      cancelled = true;
      sub.remove();
      cancelBiometricPrompt();
    };
  }, [isSettingCode]);

  async function onEnterCode(key: string) {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light);
    if (!isComplete) {
      setCode(code + key);
    }
  }

  async function onBackspace() {
    haptic.impact(Haptic.ImpactFeedbackStyle.Medium);
    setCode(code.substring(0, code.length - 1));
  }

  async function onBiometricsPress() {
    if (bioBusyRef.current) {
      await cancelBiometricPrompt();
    }
    if (AppState.currentState !== "active") {
      return;
    }
    bioBusyRef.current = true;
    setBioBusy(true);
    try {
      const ok = await authenticateWithBiometrics(
        i18n.t("lock_screen.biometrics_prompt")
      );
      if (ok) {
        haptic.notification(Haptic.NotificationFeedbackType.Success);
        onCorrectEntry();
      }
    } finally {
      bioBusyRef.current = false;
      setBioBusy(false);
    }
  }

  // run when a code is complete
  AsyncState.useAsyncEffect(async () => {
    if (!isComplete) {
      return;
    }
    // settings: set a new code, then confirm it
    if (isSettingCode) {
      if (!isConfirming) {
        setPendingCode(code);
        setCode("");
        setIsConfirming(true);
        return;
      }
      if (code !== pendingCode) {
        setCode("");
        setPendingCode("");
        setIsConfirming(false);
        haptic.notification(Haptic.NotificationFeedbackType.Error);
        return;
      }
      await setPincode(code);
      haptic.notification(Haptic.NotificationFeedbackType.Success);
      router.navigate(Routes.thoughtCreate());
    }
    // try unlocking the screen
    else {
      const isGood = await isCorrectPincode(code);
      if (isGood) {
        haptic.notification(Haptic.NotificationFeedbackType.Success);
        onCorrectEntry();
      } else {
        setCode("");
        haptic.notification(Haptic.NotificationFeedbackType.Error);
      }
    }
  }, [isComplete]);

  const header = isSettingCode
    ? isConfirming
      ? i18n.t("lock_screen.confirm")
      : i18n.t("lock_screen.update")
    : i18n.t("lock_screen.auth");

  return (
    <>
      <StatusBar barStyle={theme.statusBar} />
      <Container
        style={{
          flex: 1,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 24,
          marginTop: Constants.statusBarHeight,
          backgroundColor: theme.pink,
          justifyContent: "center",
        }}
      >
        <Row
          style={{
            alignSelf: "center",
          }}
        >
          <Header
            style={{
              fontSize: 32,
              color: "white",
              marginHorizontal: 24,
              textAlign: "center",
            }}
          >
            {header}
          </Header>
        </Row>
      </Container>

      <Container
        style={{
          flex: 2,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 24,
          backgroundColor: theme.card,
          borderTopWidth: 2,
          borderColor: theme.darkPink,
        }}
      >
        <Row
          style={{
            marginTop: 32,
            marginLeft: 48,
            marginRight: 48,
            marginBottom: 32,
          }}
        >
          <Notifier isActive={code.length >= 1} />
          <Notifier isActive={code.length >= 2} />
          <Notifier isActive={code.length >= 3} />
          <Notifier isActive={code.length >= 4} />
        </Row>
        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="1" onPress={() => onEnterCode("1")} />
          <KeypadButton title="2" onPress={() => onEnterCode("2")} />
          <KeypadButton title="3" onPress={() => onEnterCode("3")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="4" onPress={() => onEnterCode("4")} />
          <KeypadButton title="5" onPress={() => onEnterCode("5")} />
          <KeypadButton title="6" onPress={() => onEnterCode("6")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="7" onPress={() => onEnterCode("7")} />
          <KeypadButton title="8" onPress={() => onEnterCode("8")} />
          <KeypadButton title="9" onPress={() => onEnterCode("9")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
          }}
        >
          <KeypadButton title="" onPress={() => null} />
          <KeypadButton title="0" onPress={() => onEnterCode("0")} />
          <KeypadSideButton
            icon="delete"
            accessibilityLabel="back"
            onPress={onBackspace}
          />
        </Row>
        {showBiometrics ? (
          <Row style={{ marginTop: 24, justifyContent: "center" }}>
            <ActionButton
              title={i18n.t("lock_screen.biometrics_button")}
              fillColor="#EDF0FC"
              textColor={theme.darkBlue}
              width="100%"
              opacity={bioBusy ? 0.6 : 1}
              onPress={onBiometricsPress}
            />
          </Row>
        ) : null}
      </Container>
    </>
  );
}
