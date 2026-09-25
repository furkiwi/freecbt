import { ThemeColors } from "../theme"

export function textInputStyleFor(theme: ThemeColors) {
  return {
    height: 156,
    backgroundColor: theme.inputBackground,
    padding: 12,
    paddingTop: 14,
    borderRadius: 8,
    fontSize: 16,
    borderColor: theme.lightGray,
    borderWidth: 1,
    color: theme.darkText,
  }
}

export function textInputPlaceholderColorFor(theme: ThemeColors) {
  return theme.veryLightText
}

/** @deprecated Use textInputStyleFor(useAppTheme()) */
export const textInputStyle = {
  height: 156,
  backgroundColor: "white",
  padding: 12,
  paddingTop: 14,
  borderRadius: 8,
  fontSize: 16,
  borderColor: "#EAEDF8",
  borderWidth: 1,
  color: "#303952",
}
export const textInputPlaceholderColor = "#a7b0c4"
