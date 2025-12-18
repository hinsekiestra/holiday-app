import React from "react";
import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Card({ children, style }) {
  const ui = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: ui.card,
          borderRadius: 16,
          padding: ui.pad,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
