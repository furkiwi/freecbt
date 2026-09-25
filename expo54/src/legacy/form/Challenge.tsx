import React from "react"
import { SubHeader } from "../ui"
import { View, TextInput } from "react-native"
import i18n from "../i18n"
import { useAppTheme } from "../theme-context"
import { textInputPlaceholderColorFor, textInputStyleFor } from "./textInputStyle"

const CHALLENGE = `George might be busy. I can't expect to have immediate access to his time.`

export default function Challenge(props: {
  value: string
  onChange: (v: string) => void
}) {
  const { value, onChange } = props
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
          {i18n.t("challenge")}
        </SubHeader>
        <TextInput
          style={textInputStyleFor(theme)}
          placeholderTextColor={textInputPlaceholderColorFor(theme)}
          placeholder={i18n.t("cbt_form.changed_placeholder")}
          value={value}
          multiline={true}
          numberOfLines={6}
          onChangeText={onChange}
        />
      </View>
    </>
  )
}
