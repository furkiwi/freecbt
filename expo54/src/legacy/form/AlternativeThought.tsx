import React from "react"
import { SubHeader, Paragraph } from "../ui"
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
        {i18n.t("alt_thought")}
      </SubHeader>
      <Paragraph
        style={{
          marginBottom: 12,
        }}
      >
        {i18n.t("alt_thought_description")}
      </Paragraph>
      <TextInput
        style={textInputStyleFor(theme)}
        placeholderTextColor={textInputPlaceholderColorFor(theme)}
        placeholder={i18n.t("cbt_form.alt_thought_placeholder")}
        value={value}
        multiline={true}
        numberOfLines={6}
        onChangeText={onChange}
      />
    </View>
  </>
  )
}
