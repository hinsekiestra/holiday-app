import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from "react-native";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useTheme } from "../context/ThemeContext";
import { getLayout } from "../utils/layout";

import { useSettings } from "../context/SettingsContext";

import { fetchSchoolHolidays } from "../api/holidays";
import { parseVacations } from "../utils/parseVacations";

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatDate(d) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export default function OverviewScreen() {
  const ui = useTheme();

  const { width, height } = useWindowDimensions();
  const { isLandscape } = getLayout(width, height);

  const { settings } = useSettings();

  const screenStyle = isLandscape ? { paddingHorizontal: 28, alignItems: "center" } : null;
  const contentStyle = isLandscape ? { width: 700, alignSelf: "center" } : null;

  const schoolYear = settings?.schoolYear || "2025-2026";
  const region = settings?.region || "noord";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!settings?.loaded) return;

    let cancelled = false;

    (async () => {
      try {
        setError("");
        setLoading(true);
        const json = await fetchSchoolHolidays(schoolYear);
        const parsed = parseVacations(json);
        if (!cancelled) setItems(parsed);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [settings?.loaded, schoolYear]);

  const data = useMemo(() => items.filter((v) => v.region === region), [items, region]);

  if (!settings?.loaded) {
    return (
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: ui.subtext }}>Instellingen laden…</Text>
      </Screen>
    );
  }

  return (
    <Screen style={screenStyle}>
      <Text style={{ fontSize: 34, fontWeight: "800", color: ui.text, marginTop: 6, marginBottom: 6 }}>
        Overzicht
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "600", color: ui.subtext, marginBottom: 14 }}>
        Regio {cap(region)} • {schoolYear}
      </Text>

      <Card style={[{ flex: 1, padding: 0 }, contentStyle]}>
        {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}

        {!!error && <Text style={{ padding: ui.pad, color: ui.text }}>Error: {error}</Text>}

        {!loading && !error && (
          <FlatList
            data={data}
            keyExtractor={(item, idx) => item.name + item.start.toISOString() + idx}
            contentContainerStyle={{ paddingBottom: 10 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: ui.separator, opacity: 0.35, marginLeft: ui.pad }} />
            )}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 14, paddingHorizontal: ui.pad }}>
                <Text style={{ fontSize: 13, color: ui.subtext, marginBottom: 4 }}>
                  {formatDate(item.start)} t/m {formatDate(item.end)}
                </Text>
                <Text style={{ fontSize: 17, fontWeight: "700", color: ui.text }}>{item.name}</Text>
              </View>
            )}
          />
        )}
      </Card>
    </Screen>
  );
}
