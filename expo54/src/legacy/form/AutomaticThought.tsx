import React from "react"
import { SubHeader } from "../ui"
import { View, TextInput } from "react-native"
import i18n from "../i18n"
import { useAppTheme } from "../theme-context"
import { textInputPlaceholderColorFor, textInputStyleFor } from "./textInputStyle"

export default ({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) => {
  const theme = useAppTheme()
  return (
  <>
    <View
      style={{
        display: "flex",
      }}
    >
      <SubHeader
        style={{
          marginBottom: 6,
        }}
      >
        {i18n.t("auto_thought")}
      </SubHeader>
      <TextInput
        style={textInputStyleFor(theme)}
        placeholderTextColor={textInputPlaceholderColorFor(theme)}
        placeholder={i18n.t("cbt_form.auto_thought_placeholder")}
        value={value}
        multiline={true}
        numberOfLines={6}
        onChangeText={onChange}
      />
    </View>
  </>
  )
}
