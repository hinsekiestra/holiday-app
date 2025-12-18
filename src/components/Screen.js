import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function Screen({ children, style }) {
  const ui = useTheme();

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: ui.bg,
          paddingHorizontal: ui.pad,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
