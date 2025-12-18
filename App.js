import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { SettingsProvider } from "./src/context/SettingsContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

import OverviewScreen from "./src/screens/OverviewScreen";
import CountdownScreen from "./src/screens/CountdownScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AboutScreen from "./src/screens/AboutScreen";

const Tab = createBottomTabNavigator();

function Tabs() {
  const ui = useTheme();

  return (
    <>
      <StatusBar style={ui.bg === "#000000" ? "light" : "dark"} />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            backgroundColor: ui.card,
            borderTopColor: ui.separator,
            height: 60,
            paddingBottom: 6,
          },

          tabBarActiveTintColor: ui.tint,
          tabBarInactiveTintColor: ui.subtext,

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },

          tabBarIcon: ({ color, size, focused }) => {
            let icon;

            switch (route.name) {
              case "Overzicht":
                icon = focused ? "calendar" : "calendar-outline";
                break;
              case "Countdown":
                icon = focused ? "hourglass" : "hourglass-outline";
                break;
              case "Settings":
                icon = focused ? "settings" : "settings-outline";
                break;
              case "About":
                icon = focused ? "person" : "person-outline";
                break;
              default:
                icon = "ellipse";
            }

            return <Ionicons name={icon} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Overzicht" component={OverviewScreen} />
        <Tab.Screen name="Countdown" component={CountdownScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </ThemeProvider>
    </SettingsProvider>
  );
}