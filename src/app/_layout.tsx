import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppTabs from "@/components/app-tabs";
import { IS_DEV_MODE } from "@/config/api";
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
        {IS_DEV_MODE && (
          <View style={styles.devBanner}>
            <Text style={styles.devBannerText}>
              🧪 ENTORNO DE PRUEBAS (DEVELOP) — DATOS AISLADOS
            </Text>
          </View>
        )}
        <AppTabs />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  devBanner: {
    backgroundColor: "#ca8a04",
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  devBannerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
