import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../theme-context";

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function IntensityPicker(props: {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
}): React.JSX.Element {
  const { value, onChange, label } = props;
  const theme = useAppTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 14,
          color: theme.veryLightText,
          marginBottom: 8,
        }}
      >
        {label}
        {value != null ? `  ${value}` : ""}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {STEPS.map((step) => {
          const selected = value === step;
          return (
            <TouchableOpacity
              key={step}
              onPress={() => onChange(selected ? null : step)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selected ? theme.blue : theme.lightGray,
                backgroundColor: selected ? theme.blue : theme.card,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: selected ? "white" : theme.darkText,
                }}
              >
                {step}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
