import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "holiday_settings_v1";

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
