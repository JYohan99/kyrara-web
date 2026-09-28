import { Palette } from "@/constants/theme";
import { Stack } from "expo-router";

export default function NegocioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Palette.background },
        headerTintColor: Palette.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Negocio" }} />
      <Stack.Screen name="estadisticas" options={{ title: "Estadísticas" }} />
      <Stack.Screen name="servicios" options={{ title: "Servicios" }} />
      <Stack.Screen name="horarios" options={{ title: "Horarios" }} />
      <Stack.Screen name="configuracion" options={{ title: "Configuración" }} />
    </Stack>
  );
}
