import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette } from "@/constants/theme";

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.secondary,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarStyle: {
          backgroundColor: Palette.background,
          borderTopColor: Palette.borderSubtle,
          borderTopWidth: 1,
          height: isWeb ? 70 : 62 + bottomInset,
          paddingTop: 6,
          paddingBottom: isWeb ? 8 : Math.max(bottomInset, 6),
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 1,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="negocio"
        options={{
          title: "Negocio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="storefront-outline" color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
