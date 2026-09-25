import React from "react";
import { Appearance, AppState } from "react-native";
import {
  ColorSchemeSetting,
  getColorSchemeSetting,
  resolveColorScheme,
  setColorSchemeSetting,
} from "./setting/color-scheme";
import * as Style from "./style";
import { ResolvedColorScheme, ThemeColors, themes } from "./theme";

type ThemeContextValue = {
  setting: ColorSchemeSetting;
  scheme: ResolvedColorScheme;
  theme: ThemeColors;
  setSetting: (value: ColorSchemeSetting) => Promise<void>;
};

const ThemeContext = React.createContext<ThemeContextValue>({
  setting: "system",
  scheme: "light",
  theme: themes.light,
  setSetting: async () => {},
});

export function ThemeProvider(props: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [setting, setSettingState] =
    React.useState<ColorSchemeSetting>("system");
  const [scheme, setScheme] = React.useState<ResolvedColorScheme>(() =>
    resolveColorScheme("system")
  );
  const { updateStyle } = Style.useStyleContext();

  const applySetting = React.useCallback(
    (next: ColorSchemeSetting) => {
      const resolved = resolveColorScheme(next);
      setSettingState(next);
      setScheme(resolved);
      updateStyle(resolved);
    },
    [updateStyle]
  );

  React.useEffect(() => {
    let cancelled = false;
    getColorSchemeSetting().then((saved) => {
      if (!cancelled) {
        applySetting(saved);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [applySetting]);

  React.useEffect(() => {
    const appearance = Appearance.addChangeListener(() => {
      setSettingState((current) => {
        if (current === "system") {
          const resolved = resolveColorScheme("system");
          setScheme(resolved);
          updateStyle(resolved);
        }
        return current;
      });
    });
    const appState = AppState.addEventListener("change", (st) => {
      if (st === "active") {
        setSettingState((current) => {
          if (current === "system") {
            const resolved = resolveColorScheme("system");
            setScheme(resolved);
            updateStyle(resolved);
          }
          return current;
        });
      }
    });
    return () => {
      appearance.remove();
      appState.remove();
    };
  }, [updateStyle]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      setting,
      scheme,
      theme: themes[scheme],
      setSetting: async (next) => {
        applySetting(next);
        await setColorSchemeSetting(next);
      },
    }),
    [setting, scheme, applySetting]
  );

  return (
    <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeColors {
  return React.useContext(ThemeContext).theme;
}

export function useColorSchemeSetting(): ThemeContextValue {
  return React.useContext(ThemeContext);
}
