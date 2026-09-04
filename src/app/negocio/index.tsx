import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";

export default function NegocioScreen() {
  const menuItems = [
    {
      href: "/negocio/servicios" as const,
      title: "Servicios",
      subtitle: "Catálogo de cortes, precios y duraciones",
      icon: "cut-outline" as const,
      iconColor: Palette.secondary,
      iconBg: Palette.secondaryDark,
      tag: "Catálogo",
    },
    {
      href: "/negocio/horarios" as const,
      title: "Horarios y Disponibilidad",
      subtitle: "Bloques de atención semanal y días de cierre o feriados",
      icon: "time-outline" as const,
      iconColor: Palette.primaryLight,
      iconBg: Palette.primaryDark,
      tag: "Agenda",
    },
    {
      href: "/negocio/configuracion" as const,
      title: "Configuración General",
      subtitle: "Nombre comercial, logo, teléfono e intervalo de turnos",
      icon: "settings-outline" as const,
      iconColor: Palette.secondaryLight,
      iconBg: Palette.surfaceContainerHigh,
      tag: "Ajustes",
    },
    {
      href: "/negocio/whatsapp" as any,
      title: "Conexión de WhatsApp",
      subtitle: "Estado del bot, vincular con código de 8 dígitos o QR",
      icon: "logo-whatsapp" as const,
      iconColor: "#25D366",
      iconBg: "rgba(37, 211, 102, 0.15)",
      tag: "Bot",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Negocio",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerTitleWrap}>
            <ThemedText style={styles.headerTitle}>
              Configuración
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Selecciona una opción para gestionar tu negocio:
            </ThemedText>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.menuCard,
                    pressed && styles.pressed,
                  ]}
                >
                  {/* Fila superior: Icono al lado del Nombre de la opción */}
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>

                    <ThemedText style={styles.cardTitle}>
                      {item.title}
                    </ThemedText>

                    <View style={styles.tagBadge}>
                      <ThemedText style={styles.tagText}>{item.tag}</ThemedText>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Palette.textMuted}
                      style={styles.chevron}
                    />
                  </View>

                  {/* Fila inferior: Descripción detallada */}
                  <ThemedText style={styles.cardSubtitle}>
                    {item.subtitle}
                  </ThemedText>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  headerTitleWrap: {
    gap: 4,
    paddingTop: Spacing.one,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 20,
  },
  menuList: {
    gap: Spacing.three,
  },
  menuCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
    flex: 1,
  },
  tagBadge: {
    backgroundColor: Palette.surfaceContainerHigh,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  chevron: {
    marginLeft: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    lineHeight: 18,
    paddingLeft: 46, // Alineado visualmente con el texto del título debajo del icono
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
