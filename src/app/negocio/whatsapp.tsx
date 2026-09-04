import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import { useWhatsAppViewModel } from "@/features/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// PANTALLA: CONEXIÓN Y ESTADO DE WHATSAPP
// ============================================================================

export default function WhatsAppConnectionScreen() {
  const {
    status,
    loading,
    generatingCode,
    disconnecting,
    phone,
    setPhone,
    pairingCode,
    copied,
    activeTab,
    setActiveTab,
    qrUrl,
    refreshQr,
    isConnected,
    handleGeneratePairingCode,
    handleCopyCode,
    handleLogout,
  } = useWhatsAppViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Conexión de WhatsApp",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ================================================================ */}
          {/* TARJETA 1: ESTADO DEL SERVICIO                                   */}
          {/* ================================================================ */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isConnected
                      ? "rgba(37, 211, 102, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  },
                ]}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={24}
                  color={isConnected ? "#25D366" : Palette.warning}
                />
              </View>

              <View style={styles.cardTitleWrap}>
                <ThemedText style={styles.cardTitle}>Bot de WhatsApp</ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  {isConnected
                    ? "Conectado y listo para recibir reservas"
                    : "Desconectado — requiere vinculación"}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isConnected
                    ? styles.badgeConnected
                    : styles.badgeDisconnected,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isConnected
                        ? "#25D366"
                        : Palette.warning,
                    },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    {
                      color: isConnected ? "#25D366" : Palette.warningLight,
                    },
                  ]}
                >
                  {loading
                    ? "Cargando..."
                    : isConnected
                    ? "Conectado"
                    : "Pendiente"}
                </ThemedText>
              </View>
            </View>

            {/* BOTÓN DE DESCONEXIÓN SI YA ESTÁ VINCULADO */}
            {isConnected && (
              <View style={styles.connectedActionWrap}>
                <Pressable
                  onPress={handleLogout}
                  disabled={disconnecting}
                  style={({ pressed }) => [
                    styles.btnDanger,
                    pressed && styles.pressed,
                  ]}
                >
                  {disconnecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="power-outline"
                        size={16}
                        color={Palette.error}
                      />
                      <ThemedText style={styles.btnDangerText}>
                        Desvincular WhatsApp
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* ================================================================ */}
          {/* SI ESTÁ DESCONECTADO: SECCIÓN DE VINCULACIÓN                      */}
          {/* ================================================================ */}
          {!isConnected && (
            <>
              {/* SELECTOR DE PESTAÑAS: CÓDIGO VS QR */}
              <View style={styles.tabContainer}>
                <Pressable
                  onPress={() => setActiveTab("code")}
                  style={[
                    styles.tabButton,
                    activeTab === "code" && styles.tabButtonActive,
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={16}
                    color={
                      activeTab === "code"
                        ? Palette.textPrimary
                        : Palette.textMuted
                    }
                  />
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "code" && styles.tabTextActive,
                    ]}
                  >
                    Código de 8 Dígitos
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setActiveTab("qr");
                    refreshQr();
                  }}
                  style={[
                    styles.tabButton,
                    activeTab === "qr" && styles.tabButtonActive,
                  ]}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={16}
                    color={
                      activeTab === "qr"
                        ? Palette.textPrimary
                        : Palette.textMuted
                    }
                  />
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "qr" && styles.tabTextActive,
                    ]}
                  >
                    Código QR
                  </ThemedText>
                </Pressable>
              </View>

              {/* CONTENIDO 1: CÓDIGO DE 8 DÍGITOS (PAIRING CODE) */}
              {activeTab === "code" && (
                <View style={styles.card}>
                  <ThemedText style={styles.sectionHeading}>
                    Vincular sin cámara
                  </ThemedText>
                  <ThemedText style={styles.sectionDesc}>
                    Ingresa el número de teléfono con código de país para
                    generar un código e ingresarlo en tu app de WhatsApp.
                  </ThemedText>

                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={Palette.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Ej: 59899123456"
                      placeholderTextColor={Palette.textMuted}
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>

                  <Pressable
                    onPress={handleGeneratePairingCode}
                    disabled={generatingCode}
                    style={({ pressed }) => [
                      styles.btnPrimary,
                      pressed && styles.pressed,
                    ]}
                  >
                    {generatingCode ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="flash-outline"
                          size={18}
                          color="#fff"
                        />
                        <ThemedText style={styles.btnPrimaryText}>
                          Generar Código de Vinculación
                        </ThemedText>
                      </>
                    )}
                  </Pressable>

                  {/* VISOR DEL CÓDIGO GENERADO */}
                  {pairingCode && (
                    <View style={styles.codeContainer}>
                      <ThemedText style={styles.codeLabel}>
                        TU CÓDIGO DE VINCULACIÓN:
                      </ThemedText>
                      <ThemedText selectable style={styles.codeValue}>
                        {pairingCode}
                      </ThemedText>
                      <ThemedText style={styles.codeHint}>
                        Mantén presionado sobre el código para copiarlo.
                      </ThemedText>

                      {/* BOTÓN PARA COPIAR EL CÓDIGO */}
                      <Pressable
                        onPress={handleCopyCode}
                        style={({ pressed }) => [
                          styles.btnCopy,
                          copied && styles.btnCopySuccess,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={copied ? "checkmark-circle" : "copy-outline"}
                          size={18}
                          color="#fff"
                        />
                        <ThemedText style={styles.btnCopyText}>
                          {copied ? "¡Código copiado!" : "Copiar código"}
                        </ThemedText>
                      </Pressable>

                      {/* GUÍA DE PASOS */}
                      <View style={styles.stepsGuide}>
                        <ThemedText style={styles.stepsTitle}>
                          Pasos a seguir en WhatsApp:
                        </ThemedText>
                        <ThemedText style={styles.stepItem}>
                          1. En WhatsApp, toca los 3 puntos (Ajustes) y selecciona{" "}
                          <ThemedText style={styles.stepBold}>
                            Dispositivos vinculados
                          </ThemedText>
                          .
                        </ThemedText>
                        <ThemedText style={styles.stepItem}>
                          2. Toca en{" "}
                          <ThemedText style={styles.stepBold}>
                            Vincular un dispositivo
                          </ThemedText>
                          .
                        </ThemedText>
                        <ThemedText style={styles.stepItem}>
                          3. Abajo en letras pequeñas toca{" "}
                          <ThemedText style={styles.stepBold}>
                            "Vincular con el número de teléfono"
                          </ThemedText>
                          .
                        </ThemedText>
                        <ThemedText style={styles.stepItem}>
                          4. Pega o escribe el código de arriba (
                          <ThemedText style={styles.stepBold}>
                            {pairingCode}
                          </ThemedText>
                          ).
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* CONTENIDO 2: CÓDIGO QR NÍTIDO */}
              {activeTab === "qr" && (
                <View style={[styles.card, { alignItems: "center" }]}>
                  <ThemedText style={styles.sectionHeading}>
                    Escanear Código QR
                  </ThemedText>
                  <ThemedText
                    style={[styles.sectionDesc, { textAlign: "center" }]}
                  >
                    Escanea este código con la cámara de WhatsApp desde otro
                    dispositivo:
                  </ThemedText>

                  <View style={styles.qrImageWrapper}>
                    <Image
                      source={{ uri: qrUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Pressable
                    onPress={refreshQr}
                    style={({ pressed }) => [
                      styles.btnSecondary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color={Palette.textPrimary}
                    />
                    <ThemedText style={styles.btnSecondaryText}>
                      Actualizar Código QR
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ============================================================================
// ESTILOS VISUALES (PALETA OBSIDIAN / DARK STUDIO)
// ============================================================================

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
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  badgeConnected: {
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    borderColor: "#25D366",
  },
  badgeDisconnected: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: Palette.warning,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  connectedActionWrap: {
    marginTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingTop: Spacing.three,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Palette.surfaceContainerLow,
    borderRadius: BorderRadius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
  },
  tabButtonActive: {
    backgroundColor: Palette.surfaceContainerHigh,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  tabTextActive: {
    color: Palette.textPrimary,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: Palette.textMuted,
    lineHeight: 19,
    marginBottom: Spacing.three,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.three,
  },
  btnSecondaryText: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 180, 171, 0.08)",
    borderWidth: 1,
    borderColor: Palette.errorDark,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  btnDangerText: {
    color: Palette.error,
    fontSize: 13,
    fontWeight: "700",
  },
  codeContainer: {
    marginTop: Spacing.four,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: "#25D366",
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: Palette.textMuted,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 6,
    fontFamily: "monospace",
    color: "#25D366",
    marginVertical: 6,
  },
  codeHint: {
    fontSize: 11,
    color: Palette.textMuted,
    marginBottom: Spacing.three,
  },
  btnCopy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    width: "100%",
    marginBottom: Spacing.three,
  },
  btnCopySuccess: {
    backgroundColor: Palette.success,
  },
  btnCopyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepsGuide: {
    width: "100%",
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    gap: 6,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  stepItem: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 18,
  },
  stepBold: {
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  qrImageWrapper: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginVertical: Spacing.two,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
