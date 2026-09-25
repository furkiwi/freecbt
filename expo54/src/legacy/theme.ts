export type StatusBarStyle = "dark-content" | "light-content";

export type ThemeColors = {
  lightOffwhite: string;
  offwhite: string;
  lightGray: string;
  gray: string;
  veryLightText: string;
  lightText: string;
  darkText: string;
  pink: string;
  darkPink: string;
  red: string;
  blue: string;
  darkBlue: string;
  purple: string;
  yellow: string;
  background: string;
  card: string;
  inputBackground: string;
  statusBar: StatusBarStyle;
};

export const lightTheme: ThemeColors = {
  lightOffwhite: "#fbfcfe",
  offwhite: "#f2f5fa",
  lightGray: "#EAEDF8",
  gray: "#dadfeb",
  veryLightText: "#a7b0c4",
  lightText: "#596275",
  darkText: "#303952",
  pink: "#f8a5c2",
  darkPink: "#F78FB3",
  red: "#c44569",
  blue: "#778beb",
  darkBlue: "#546de5",
  purple: "#8B77AA",
  yellow: "#F7D795",
  background: "#fbfcfe",
  card: "#ffffff",
  inputBackground: "#ffffff",
  statusBar: "dark-content",
};

export const darkTheme: ThemeColors = {
  lightOffwhite: "#12141a",
  offwhite: "#1a1d26",
  lightGray: "#2a3040",
  gray: "#3a4154",
  veryLightText: "#8b93a7",
  lightText: "#c5cad6",
  darkText: "#eef1f6",
  pink: "#f8a5c2",
  darkPink: "#F78FB3",
  red: "#e06b8a",
  blue: "#8ea0f4",
  darkBlue: "#6d82ee",
  purple: "#b39bc9",
  yellow: "#F7D795",
  background: "#12141a",
  card: "#1e2230",
  inputBackground: "#1e2230",
  statusBar: "light-content",
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ResolvedColorScheme = keyof typeof themes;

/** Static light palette for non-React callers. Screens should use useAppTheme(). */
export default lightTheme;
