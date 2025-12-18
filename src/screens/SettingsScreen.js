import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Location from "expo-location";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { getLayout } from "../utils/layout";

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function provinceToRegion(provinceRaw) {
  const p = (provinceRaw || "").toLowerCase().trim();

  const noord = ["groningen", "friesland", "drenthe", "flevoland", "overijssel", "noord-holland", "noord holland"];
  const midden = ["utrecht", "zuid-holland", "zuid holland", "gelderland"];
  const zuid = ["zeeland", "noord-brabant", "noord brabant", "limburg"];

  if (noord.includes(p)) return "noord";
  if (midden.includes(p)) return "midden";
  if (zuid.includes(p)) return "zuid";
  return null;
}

function Pill({ active, label, onPress }) {
  const ui = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? ui.tint : "rgba(0,0,0,0.25)",
        backgroundColor: active ? "rgba(0,122,255,0.15)" : "transparent",
      }}
    >
      <Text style={{ fontWeight: "700", color: ui.text }}>{label}</Text>
    </Pressable>
  );
}

function SheetRow({ label, active, onPress }) {
  const ui = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: ui.text }}>{label}</Text>
      <Text style={{ fontSize: 18, color: active ? ui.tint : "transparent" }}>✓</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const ui = useTheme();
  const { settings, updateSettings, validSchoolYears } = useSettings();

  const { width, height } = useWindowDimensions();
  const { isLandscape } = getLayout(width, height);

  const schoolYear = settings?.schoolYear || "2025-2026";
  const region = settings?.region || "noord";

  const [draft, setDraft] = useState({
    schoolYear: "2025-2026",
    region: "noord",
    darkMode: false,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!settings?.loaded) return;
    setDraft({
      schoolYear: settings.schoolYear,
      region: settings.region,
      darkMode: settings.darkMode,
    });
  }, [settings?.loaded]);

  const schoolYears = validSchoolYears?.length ? validSchoolYears : [draft.schoolYear];

  const screenStyle = isLandscape ? { paddingHorizontal: 28, alignItems: "center" } : null;
  const cardStyle = isLandscape ? { width: 700, alignSelf: "center", flex: 1 } : { flex: 1 };

  if (!settings?.loaded) {
    return (
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: ui.subtext }}>Instellingen laden…</Text>
      </Screen>
    );
  }

  const save = async () => {
    await updateSettings({ ...settings, ...draft });
    Alert.alert("Opgeslagen ✅", "Je instellingen zijn opgeslagen.");
  };

  const detectRegionViaGPS = async () => {
    try {
      setLocating(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Geen toegang", "Geef locatie-toegang om je regio automatisch te bepalen.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const place = places?.[0] || {};
      const province = place.region || place.subregion || "";
      const region = provinceToRegion(province);

      if (!region) {
        Alert.alert(
          "Niet gelukt",
          `Ik kon je provincie niet goed mappen (gevonden: "${province || "onbekend"}"). Kies je regio handmatig.`
        );
        return;
      }

      setDraft((d) => ({ ...d, region }));
      Alert.alert("Regio gevonden ✅", `Provincie: ${province}\nRegio: ${cap(region)}`);
    } catch (e) {
      Alert.alert("GPS error", e?.message ?? "Kon locatie niet ophalen.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <Screen style={screenStyle}>
      <Text style={{ fontSize: 34, fontWeight: "800", color: ui.text, marginTop: 6, marginBottom: 6 }}>
        Settings
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "600", color: ui.subtext, marginBottom: 14 }}>
        Regio {cap(region)} • {schoolYear}
      </Text>

      <Card style={cardStyle}>
        {/* Scrollen BINNEN card */}
        <ScrollView
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text style={{ fontWeight: "800", marginBottom: 10, color: ui.text }}>Schooljaar</Text>

          <Pressable
            onPress={() => setSheetOpen(true)}
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.25)",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              backgroundColor: settings.darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: ui.text }}>{draft.schoolYear}</Text>
            <Text style={{ fontSize: 16, color: ui.subtext }}>›</Text>
          </Pressable>

          <Text style={{ fontWeight: "800", marginBottom: 10, color: ui.text }}>Regio</Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            {["noord", "midden", "zuid"].map((r) => (
              <Pill
                key={r}
                label={cap(r)}
                active={draft.region === r}
                onPress={() => setDraft((d) => ({ ...d, region: r }))}
              />
            ))}
          </View>

          <Pressable
            onPress={detectRegionViaGPS}
            disabled={locating}
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.25)",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: locating ? 0.7 : 1,
              backgroundColor: settings.darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
            }}
          >
            {locating ? <ActivityIndicator /> : null}
            <Text style={{ fontWeight: "800", color: ui.text }}>
              {locating ? "Regio bepalen…" : "Gebruik GPS (bepaal regio automatisch)"}
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontWeight: "800", color: ui.text }}>Darkmode</Text>
            <Switch value={draft.darkMode} onValueChange={(v) => setDraft((d) => ({ ...d, darkMode: v }))} />
          </View>

          <Pressable
            onPress={save}
            style={{
              backgroundColor: ui.tint,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Opslaan</Text>
          </Pressable>
        </ScrollView>
      </Card>

      {/* Schooljaar sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }} onPress={() => setSheetOpen(false)} />

        <View style={{ backgroundColor: ui.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden" }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: ui.separator,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "900", color: ui.text }}>Kies schooljaar</Text>
            <Pressable onPress={() => setSheetOpen(false)}>
              <Text style={{ color: ui.tint, fontWeight: "900" }}>Klaar</Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 320 }}>
            {schoolYears.map((sy) => (
              <View key={sy}>
                <SheetRow
                  label={sy}
                  active={draft.schoolYear === sy}
                  onPress={() => setDraft((d) => ({ ...d, schoolYear: sy }))}
                />
                <View style={{ height: 1, backgroundColor: ui.separator, opacity: 0.35, marginLeft: 16 }} />
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 18 }} />
        </View>
      </Modal>
    </Screen>
  );
}
