import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, MaxContentWidth, Palette, Spacing } from "@/constants/theme";
import {
  OPCIONES_INTERVALO,
  useConfiguracionViewModel,
} from "@/features/appointments";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// PANTALLA: CONFIGURACIÓN GENERAL DEL NEGOCIO Y NOTIFICACIONES
// ============================================================================

export default function ConfiguracionScreen() {
  const {
    business,
    loading,
    saving,
    error,
    name,
    phone,
    address,
    logoBase64,
    notifyUpcoming,
    notifyWhatsApp,
    syncingToken,
    isWebPushActive,
    isDeviceSubscribed,
    setName,
    setPhone,
    setAddress,
    pickLogo,
    handleSaveInfo,
    handleSelectMode,
    handleSelectInterval,
    handleToggleNotifyUpcoming,
    handleToggleNotifyWhatsApp,
    handleSyncPushToken,
  } = useConfiguracionViewModel();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ENCABEZADO DE LA PANTALLA */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Configuración</ThemedText>
            <ThemedText style={styles.subtitle}>
              Personaliza el perfil, los turnos y las alertas automáticas de tu barbería
            </ThemedText>
          </View>

          {/* BANNER DE ERROR (SI OCURRE) */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* INDICADOR DE CARGA INICIAL */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
            </View>
          )}

          {/* ================================================================ */}
          {/* SECCIÓN 1: PERFIL DEL NEGOCIO (LOGO, NOMBRE, TELÉFONO, DIRECCIÓN) */}
          {/* ================================================================ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="business-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>Perfil del Negocio</ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Esta información se mostrará a los clientes en WhatsApp y en tus reservas.
            </ThemedText>

            {/* SELECCIÓN Y VISTA PREVIA DEL LOGO */}
            <View style={styles.logoRow}>
              <Pressable
                onPress={pickLogo}
                style={({ pressed }) => [styles.logoAvatar, pressed && styles.pressed]}
              >
                {logoBase64 ? (
                  <Image source={{ uri: logoBase64 }} style={styles.logoImage} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="image-outline" size={28} color={Palette.textMuted} />
                  </View>
                )}
                <View style={styles.logoBadge}>
                  <Ionicons name="camera" size={12} color="#ffffff" />
                </View>
              </Pressable>

              <View style={styles.logoInfo}>
                <ThemedText style={styles.logoTitle}>Logo de la Barbería</ThemedText>
                <ThemedText style={styles.logoSubtitle}>
                  Toca para seleccionar una imagen cuadrada
                </ThemedText>
              </View>
            </View>

            {/* CAMPOS DE TEXTO */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Nombre de la Barbería</ThemedText>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Kyrara Barber Club"
                placeholderTextColor={Palette.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Teléfono de Contacto</ThemedText>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej: +598 99 123 456"
                placeholderTextColor={Palette.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Dirección</ThemedText>
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Ej: Av. 18 de Julio 1234"
                placeholderTextColor={Palette.textMuted}
              />
            </View>

            {/* BOTÓN GUARDAR PERFIL */}
            <Pressable
              onPress={handleSaveInfo}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                saving && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <ThemedText style={styles.saveButtonText}>Guardar Cambios</ThemedText>
                </>
              )}
            </Pressable>
          </View>

          {/* ================================================================ */}
          {/* SECCIÓN 2: NOTIFICACIONES Y ALERTAS (PUSH Y RECORDATORIO 5 MIN)   */}
          {/* ================================================================ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="notifications-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>Notificaciones y Alertas</ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Configura cómo y cuándo deseas recibir alertas automáticas.
            </ThemedText>

            {/* SWITCH TOGGLE: RECORDATORIO 5 MIN ANTES DEL TURNO */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <View style={styles.switchTitleRow}>
                  <Ionicons name="alarm-outline" size={16} color={Palette.secondary} />
                  <ThemedText style={styles.switchTitle}>
                    Aviso 5 min
                  </ThemedText>
                </View>
                <ThemedText style={styles.switchDescription}>
                  Recibe una alerta automática cuando falten 5 minutos para comenzar cada cita.
                </ThemedText>
              </View>

              <Switch
                value={notifyUpcoming}
                onValueChange={handleToggleNotifyUpcoming}
                trackColor={{ false: Palette.surfaceContainerHigh, true: Palette.primary }}
                thumbColor={notifyUpcoming ? Palette.secondary : "#888888"}
              />
            </View>

            {/* SWITCH TOGGLE: ALERTAS POR WHATSAPP AL BARBERO */}
            <View
              style={[
                styles.switchRow,
                { borderTopWidth: 1, borderTopColor: Palette.borderSubtle, paddingTop: 12, marginTop: 4 },
              ]}
            >
              <View style={styles.switchTextContainer}>
                <View style={styles.switchTitleRow}>
                  <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                  <ThemedText style={styles.switchTitle}>
                    Alertas por WhatsApp
                  </ThemedText>
                </View>
                <ThemedText style={styles.switchDescription}>
                  Recibe un mensaje en tu WhatsApp personal cada vez que un cliente reserve una cita.
                </ThemedText>
              </View>

              <Switch
                value={notifyWhatsApp}
                onValueChange={handleToggleNotifyWhatsApp}
                trackColor={{ false: Palette.surfaceContainerHigh, true: "#25D366" }}
                thumbColor={notifyWhatsApp ? "#ffffff" : "#888888"}
              />
            </View>

            {/* ESTADO DE VINCULACIÓN DE NOTIFICACIONES */}
            <View
              style={{
                backgroundColor: isDeviceSubscribed
                  ? "rgba(0, 209, 157, 0.08)"
                  : "rgba(255, 179, 0, 0.08)",
                borderColor: isDeviceSubscribed ? Palette.secondary : "#ffb300",
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons
                name={isDeviceSubscribed ? "checkmark-circle" : "alert-circle-outline"}
                size={22}
                color={isDeviceSubscribed ? Palette.secondary : "#ffb300"}
              />
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: isDeviceSubscribed ? Palette.secondary : "#ffb300",
                  }}
                >
                  {isDeviceSubscribed
                    ? "Este Dispositivo: ✅ Vinculado"
                    : "Este Dispositivo: ⚠️ No Vinculado"}
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: Palette.textMuted, marginTop: 2 }}>
                  {isDeviceSubscribed
                    ? "Este navegador / iPhone está activo para recibir alertas flotantes al instante."
                    : isWebPushActive
                      ? "Hay dispositivos en el negocio, pero este teléfono/navegador aún no está registrado. Toca el botón verde abajo para recibir alertas aquí."
                      : "Presiona 'Activar Notificaciones Push en este Dispositivo' para comenzar a recibir las alertas aquí."}
                </ThemedText>
              </View>
            </View>

            {/* BOTÓN DE VINCULACIÓN */}
            <View style={styles.notifBtnGroup}>
              <Pressable
                onPress={handleSyncPushToken}
                disabled={syncingToken}
                style={({ pressed }) => [
                  styles.notifBtnPrimary,
                  syncingToken && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {syncingToken ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="notifications-outline" size={18} color="#ffffff" />
                    <ThemedText style={styles.notifBtnPrimaryText}>
                      Activar Notificaciones
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* ================================================================ */}
          {/* SECCIÓN 3: MODO DE RESERVA (AUTOMÁTICO O APROBACIÓN MANUAL)       */}
          {/* ================================================================ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="options-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>Modo de Reserva</ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Elige si las reservas confirmadas por WhatsApp se agendan automáticamente o requieren tu aprobación.
            </ThemedText>

            {business && (
              <View style={styles.modeOptionsContainer}>
                {/* OPCIÓN: APROBACIÓN MANUAL */}
                <Pressable
                  onPress={() => handleSelectMode("approval")}
                  style={[
                    styles.modeOptionCard,
                    business.booking_mode === "approval" && styles.modeOptionCardActive,
                  ]}
                >
                  <View style={styles.modeRadioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        business.booking_mode === "approval" && styles.radioCircleActive,
                      ]}
                    >
                      {business.booking_mode === "approval" && (
                        <View style={styles.radioInnerCircle} />
                      )}
                    </View>
                    <ThemedText style={styles.modeOptionTitle}>
                      Manual
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.modeOptionSubtitle}>
                    Las solicitudes entran en estado pendiente hasta que tú las aceptes o rechaces.
                  </ThemedText>
                </Pressable>

                {/* OPCIÓN: CONFIRMACIÓN AUTOMÁTICA */}
                <Pressable
                  onPress={() => handleSelectMode("auto")}
                  style={[
                    styles.modeOptionCard,
                    business.booking_mode === "auto" && styles.modeOptionCardActive,
                  ]}
                >
                  <View style={styles.modeRadioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        business.booking_mode === "auto" && styles.radioCircleActive,
                      ]}
                    >
                      {business.booking_mode === "auto" && (
                        <View style={styles.radioInnerCircle} />
                      )}
                    </View>
                    <ThemedText style={styles.modeOptionTitle}>
                      Automática
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.modeOptionSubtitle}>
                    La reserva queda confirmada al instante en tu agenda en cuanto el cliente elige el horario.
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>

          {/* ================================================================ */}
          {/* SECCIÓN 4: INTERVALO DE TURNOS (DURACIÓN DE SLOTS)               */}
          {/* ================================================================ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={18} color={Palette.primaryLight} />
              <ThemedText style={styles.sectionTitle}>Intervalo de Turnos</ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Frecuencia con la que se generarán los bloques horarios para citas.
            </ThemedText>

            {business && (
              <View style={styles.intervalGrid}>
                {OPCIONES_INTERVALO.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => handleSelectInterval(m)}
                    style={[
                      styles.intervalChip,
                      business.slot_step_minutes === m && styles.intervalChipActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.intervalChipText,
                        business.slot_step_minutes === m && styles.intervalChipTextActive,
                      ]}
                    >
                      {m} min
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ============================================================================
// ESTILOS DE LA PANTALLA
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
    gap: Spacing.four,
    paddingBottom: 60,
  },
  header: {
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    marginTop: Spacing.one,
  },
  loadingContainer: {
    paddingVertical: Spacing.six,
    alignItems: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.errorContainer,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  sectionDescription: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    marginVertical: Spacing.two,
  },
  logoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  logoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Palette.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Palette.surfaceContainer,
  },
  logoInfo: {
    flex: 1,
    gap: 2,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  logoSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  textInput: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.surfaceContainerHigh,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: Spacing.three,
  },
  switchTextContainer: {
    flex: 1,
    gap: 4,
  },
  switchTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  switchDescription: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  notifBtnGroup: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  notifBtnPrimary: {
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  notifBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  modeOptionsContainer: {
    gap: Spacing.two,
  },
  modeOptionCard: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  modeOptionCardActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.surfaceContainerHighest,
  },
  modeRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Palette.textMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleActive: {
    borderColor: Palette.primary,
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
  },
  modeOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  modeOptionSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
    paddingLeft: 26,
  },
  intervalGrid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  intervalChip: {
    flex: 1,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  intervalChipActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryDark,
  },
  intervalChipText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  intervalChipTextActive: {
    color: Palette.primaryLight,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
