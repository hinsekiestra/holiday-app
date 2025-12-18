import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

import { fetchSchoolHolidays } from "../api/holidays";
import { parseVacations } from "../utils/parseVacations";
import { getLayout } from "../utils/layout";

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatDate(d) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function daysUntil(date) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function nextVacation(items, region) {
  const today = startOfDay(new Date()).getTime();
  const list = items
    .filter((v) => v.region === region)
    .filter((v) => startOfDay(v.start).getTime() >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return list[0] ?? null;
}

function pluralizeDays(n) {
  return n === 1 ? "dag" : "dagen";
}

const seasonImages = {
  zomer: require("../../assets/zomer.jpg"),
  herfst: require("../../assets/herfst.jpg"),
  winter: require("../../assets/winter.jpg"),
  voorjaar: require("../../assets/voorjaar.jpg"),
};

function getSeasonKeyFromVacationName(vacationName) {
  const t = (vacationName || "").toLowerCase();
  if (t.includes("zomer")) return "zomer";
  if (t.includes("herfst")) return "herfst";
  if (t.includes("kerst")) return "winter";
  if (t.includes("voorjaar")) return "winter";
  if (t.includes("mei")) return "voorjaar";
  return "voorjaar";
}

export default function CountdownScreen() {
  const ui = useTheme();
  const { settings } = useSettings();

  const { width, height } = useWindowDimensions();
  const { isLandscape } = getLayout(width, height);

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
        if (!cancelled) setError(e?.message ?? "API fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [settings?.loaded, schoolYear]);

  const next = useMemo(() => nextVacation(items, region), [items, region]);
  const remainingDays = next ? daysUntil(next.start) : null;

  const seasonKey = next ? getSeasonKeyFromVacationName(next.name) : "voorjaar";
  const imageSrc = seasonImages[seasonKey];

  const screenStyle = isLandscape ? { paddingHorizontal: 28, alignItems: "center" } : null;

  const cardStyle = isLandscape ? { width: 700, alignSelf: "center", flex: 1 } : { flex: 1 };

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
        Countdown
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "600", color: ui.subtext, marginBottom: 14 }}>
        Regio {cap(region)} • {schoolYear}
      </Text>

      <Card style={cardStyle}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} />}

          {!!error && !loading && <Text style={{ color: ui.text }}>Error: {error}</Text>}

          {!loading && !error && !next && (
            <Text style={{ color: ui.text }}>
              Geen komende vakantie gevonden.
            </Text>
          )}

          {!loading && !error && next && (
            <>
              {isLandscape ? (
                <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
                  {/* Links */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: ui.text }}>
                      {next.name}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
                      <Text style={{ fontSize: 64, fontWeight: "900", color: ui.text, lineHeight: 70 }}>
                        {remainingDays}
                      </Text>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: ui.text, paddingBottom: 10 }}>
                        {pluralizeDays(remainingDays)}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 15, fontWeight: "600", color: ui.subtext, marginTop: 6 }}>
                      {formatDate(next.start)} t/m {formatDate(next.end)}
                    </Text>
                  </View>

                  <View style={{ width: 260, alignItems: "center" }}>
                    <Image
                      source={imageSrc}
                      style={{
                        width: 240,
                        height: 140,
                        borderRadius: 12,
                        resizeMode: "cover",
                      }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: ui.subtext, marginTop: 8 }}>
                      Seizoen: {cap(seasonKey)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 12, alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: ui.text, textAlign: "center" }}>
                    {next.name}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, justifyContent: "center" }}>
                    <Text style={{ fontSize: 64, fontWeight: "900", color: ui.text, lineHeight: 70 }}>
                      {remainingDays}
                    </Text>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: ui.text, paddingBottom: 10 }}>
                      {pluralizeDays(remainingDays)}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 15, fontWeight: "600", color: ui.subtext, textAlign: "center" }}>
                    {formatDate(next.start)} t/m {formatDate(next.end)}
                  </Text>

                  <Image
                    source={imageSrc}
                    style={{ width: 230, height: 230, borderRadius: 14, resizeMode: "cover", marginTop: 6 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: ui.subtext }}>
                    Seizoen: {cap(seasonKey)}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Card>
    </Screen>
  );
}
