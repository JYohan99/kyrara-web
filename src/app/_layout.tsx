import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppTabs from "@/components/app-tabs";
import { registerServiceWorker } from "@/core/services/notificationService";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
    registerServiceWorker();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
