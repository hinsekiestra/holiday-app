import React, { createContext, useContext } from "react";
import { darkTheme, lightTheme } from "../styles/ui";
import { useSettings } from "./SettingsContext";

const ThemeContext = createContext(lightTheme);

export function ThemeProvider({ children }) {
  const { settings } = useSettings();

  const theme = settings?.darkMode ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
