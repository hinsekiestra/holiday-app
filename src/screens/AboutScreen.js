import React from "react";
import { Image, ScrollView, Text, useWindowDimensions, View } from "react-native";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useTheme } from "../context/ThemeContext";
import { getLayout } from "../utils/layout";

export default function AboutScreen() {
  const ui = useTheme();

  const { width, height } = useWindowDimensions();
  const { isLandscape } = getLayout(width, height);

  const screenStyle = isLandscape ? { paddingHorizontal: 28, alignItems: "center" } : null;
  const cardStyle = isLandscape ? { width: 700, alignSelf: "center", flex: 1 } : { flex: 1 };

  return (
    <Screen style={screenStyle}>
      <Text style={{ fontSize: 34, fontWeight: "800", color: ui.text, marginTop: 6, marginBottom: 6 }}>
        About
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "600", color: ui.subtext, marginBottom: 14 }}>
        Over deze app
      </Text>

      <Card style={cardStyle}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {isLandscape ? (
            <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, lineHeight: 22, color: ui.text }}>
                  “Ik ben Hinse, student aan het Deltion College te Zwolle.{"\n"}
                  Voor een keuzedeel op school heb ik deze handige app ontwikkeld voor het inzien van schoolvakanties.”
                </Text>
                <Text style={{ marginTop: 10, color: ui.subtext, fontWeight: "700" }}>Holiday App</Text>
              </View>

              <View style={{ width: 220, alignItems: "center" }}>
                <Image source={require("../../assets/me.jpg")} style={{ width: 200, height: 200, borderRadius: 18 }} />
                <Text style={{ marginTop: 8, color: ui.subtext, fontWeight: "700" }}>Hinse</Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 16, lineHeight: 22, color: ui.text, textAlign: "center" }}>
                “Ik ben Hinse, student aan het Deltion College te Zwolle.{"\n"}
                Voor een keuzedeel op school heb ik deze handige app ontwikkeld voor het inzien van schoolvakanties.”
              </Text>

              <Image source={require("../../assets/me.jpg")} style={{ width: 220, height: 220, borderRadius: 18 }} />
              <Text style={{ color: ui.subtext, fontWeight: "700" }}>Hinse</Text>
            </View>
          )}
        </ScrollView>
      </Card>
    </Screen>
  );
}
