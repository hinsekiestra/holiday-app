import React, { createContext, useContext, useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../utils/storage";
import { getValidSchoolYears } from "../utils/schoolYears";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    schoolYear: "2025-2026",
    region: "noord",
    darkMode: false,
    loaded: false,
  });

  const [validSchoolYears, setValidSchoolYears] = useState([]);

  useEffect(() => {
    (async () => {
      const stored = await loadSettings();
      if (stored) setSettings({ ...stored, loaded: true });
      else setSettings((s) => ({ ...s, loaded: true }));

      const years = await getValidSchoolYears();
      setValidSchoolYears(years);

      setSettings((s) => {
        if (!years.includes(s.schoolYear)) {
          const next = { ...s, schoolYear: years[0] };
          saveSettings(next);
          return next;
        }
        return s;
      });
    })();
  }, []);

  const updateSettings = async (next) => {
    setSettings(next);
    await saveSettings(next);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, validSchoolYears }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
