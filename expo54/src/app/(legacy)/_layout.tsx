import { hasPincode } from "@/src/legacy/lockstore";
import LockScreen from "@/src/legacy/screen/LockScreen";
import * as Feature from "@/src/legacy/feature";
import * as Style from "@/src/legacy/style";
import { ThemeProvider, useAppTheme } from "@/src/legacy/theme-context";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Feature.State>
        <Style.State>
          <ThemeProvider>
            <ThemedAuthState>
              <Stack screenOptions={{ headerShown: false }} />
            </ThemedAuthState>
          </ThemeProvider>
        </Style.State>
      </Feature.State>
    </GestureHandlerRootView>
  );
}

function ThemedAuthState(props: { children: React.ReactNode }): React.JSX.Element {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AuthState>{props.children}</AuthState>
    </View>
  );
}

function AuthState(props: { children: React.ReactNode }): React.JSX.Element {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    hasPincode().then((value) => {
      if (!cancelled) {
        setHasPin(value);
      }
    });

    const sub = AppState.addEventListener("change", (st) => {
      if (st !== "active") {
        // Re-lock when leaving the app, but keep the navigator mounted so
        // in-progress form state is not thrown away.
        setAuthed(false);
        hasPincode().then((value) => {
          if (!cancelled) {
            setHasPin(value);
          }
        });
      }
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  // Avoid flashing private thoughts before we know whether a pin is set.
  if (hasPin === null) {
    return <View style={{ flex: 1 }} />;
  }

  const needsLock = hasPin && !authed;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: needsLock ? 0 : 1, display: needsLock ? "none" : "flex" }}
        pointerEvents={needsLock ? "none" : "auto"}
        accessibilityElementsHidden={needsLock}
        importantForAccessibility={needsLock ? "no-hide-descendants" : "auto"}
      >
        {props.children}
      </View>
      {needsLock ? (
        <LockScreen
          isSettingCode={false}
          onCorrectEntry={() => setAuthed(true)}
        />
      ) : null}
    </View>
  );
}
