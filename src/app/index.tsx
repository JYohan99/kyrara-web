import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import { useHomeViewModel } from "@/features/appointments";

export default function HomeScreen() {
  const router = useRouter();
  const {
    business,
    activeAppointment,
    upcomingAppointments,
    todayDateLabel,
    todayCount,
    error,
    loading,
    completing,
    handleCompleteAppointment,
    handleAdvanceToNextAppointment,
    getDisplayStatus,
    getTimeRemainingText,
  } = useHomeViewModel();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.secondary} />
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>
                No se pudo conectar con el backend: {error}
              </ThemedText>
            </View>
          )}

          {business && (
            <>
              {/* 1. CABECERA: LOGO CENTRADO + NOMBRE DEL NEGOCIO + FECHA + CITAS HOY */}
              <View style={styles.headerCentered}>
                {business.logo_base64 ? (
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${business.logo_base64}`,
                    }}
                    style={styles.logoCentered}
                  />
                ) : (
                  <View style={styles.logoPlaceholderCentered}>
                    <Ionicons name="storefront-outline" size={36} color={Palette.primaryLight} />
                  </View>
                )}

                <ThemedText style={styles.businessNameCentered}>
                  {business.name}
                </ThemedText>

                <ThemedText style={styles.todayDateText}>
                  {todayDateLabel}
                </ThemedText>

                {/* Badge translúcido con cantidad de citas hoy */}
                <View style={styles.todayBadge}>
                  <Ionicons name="calendar-outline" size={15} color={Palette.secondary} />
                  <ThemedText style={styles.todayBadgeText}>
                    {todayCount === 1 ? "1 cita hoy" : `${todayCount} citas hoy`}
                  </ThemedText>
                </View>
              </View>

              {/* 2. SECCIÓN "AHORA" (BENTO GLOW CARD) */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.sectionUpperTitle}>Ahora</ThemedText>
                </View>

                {activeAppointment ? (
                  <View style={styles.activeBentoCard}>
                    {/* Resplandor decorativo de fondo */}
                    <View style={styles.bentoGlowCircle} />

                    {/* Fila superior: Horario y tiempo restante */}
                    <View style={styles.bentoTopRow}>
                      <ThemedText style={styles.bentoTimeText}>
                        {activeAppointment.start_time}
                        {activeAppointment.end_time ? ` – ${activeAppointment.end_time}` : ""}
                      </ThemedText>

                      {(() => {
                        const timeRemaining = getTimeRemainingText(
                          activeAppointment.date,
                          activeAppointment.start_time,
                          activeAppointment.end_time,
                          activeAppointment.status,
                        );

                        return timeRemaining ? (
                          <View style={styles.timeRemainingBadge}>
                            <Ionicons name="time-outline" size={12} color={Palette.secondary} />
                            <ThemedText style={styles.timeRemainingText}>
                              {timeRemaining}
                            </ThemedText>
                          </View>
                        ) : null;
                      })()}
                    </View>

                    {/* Fila principal: Nombre del cliente y Badge de estado a la misma altura */}
                    <View style={styles.bentoCustomerRow}>
                      <ThemedText style={styles.bentoCustomerName} numberOfLines={1}>
                        {activeAppointment.customer_name || activeAppointment.customer_phone || "(Sin nombre)"}
                      </ThemedText>

                      {(() => {
                        const status = getDisplayStatus(
                          activeAppointment.date,
                          activeAppointment.start_time,
                          activeAppointment.end_time,
                          activeAppointment.status,
                        );
                        return (
                          <View style={[styles.bentoStatusBadge, { backgroundColor: status.color }]}>
                            <ThemedText
                              style={[
                                styles.bentoStatusText,
                                { color: status.textColor ?? Palette.textPrimary },
                              ]}
                            >
                              {status.label}
                            </ThemedText>
                          </View>
                        );
                      })()}
                    </View>

                    {/* Servicio solicitado */}
                    <ThemedText style={styles.bentoServiceName}>
                      {activeAppointment.service_name}
                    </ThemedText>

                    {/* Fila de acción: Botón Finalizar Servicio o Indicador de Completado */}
                    <View style={styles.bentoActionsRow}>
                      {(() => {
                        const displayStatus = getDisplayStatus(
                          activeAppointment.date,
                          activeAppointment.start_time,
                          activeAppointment.end_time,
                          activeAppointment.status,
                        );
                        const isCompleted =
                          activeAppointment.status === "COMPLETED" ||
                          displayStatus.label === "Completada";

                        if (isCompleted) {
                          return (
                            <View style={styles.completedStatusWrap}>
                              <View style={styles.completedBadgeRow}>
                                <Ionicons name="checkmark-circle" size={18} color={Palette.success} />
                                <ThemedText style={styles.completedBadgeText}>
                                  Servicio completado
                                </ThemedText>
                              </View>

                              {upcomingAppointments.length > 0 && (
                                <Pressable
                                  onPress={handleAdvanceToNextAppointment}
                                  style={({ pressed }) => [
                                    styles.nextAppointmentBtn,
                                    pressed && styles.pressed,
                                  ]}
                                >
                                  <ThemedText style={styles.nextAppointmentBtnText}>
                                    Siguiente turno
                                  </ThemedText>
                                  <Ionicons name="arrow-forward" size={14} color={Palette.textPrimary} />
                                </Pressable>
                              )}
                            </View>
                          );
                        }

                        return (
                          <Pressable
                            onPress={() => handleCompleteAppointment(activeAppointment)}
                            disabled={completing}
                            style={({ pressed }) => [
                              styles.bentoActionBtn,
                              completing && styles.btnDisabled,
                              pressed && styles.pressed,
                            ]}
                          >
                            {completing ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <>
                                <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                                <ThemedText style={styles.bentoActionBtnText}>
                                  Finalizar Servicio
                                </ThemedText>
                              </>
                            )}
                          </Pressable>
                        );
                      })()}
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyNowCard}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={Palette.success} />
                    <View style={styles.emptyNowTextWrap}>
                      <ThemedText style={styles.emptyNowTitle}>
                        Sin citas pendientes en este momento
                      </ThemedText>
                      <ThemedText style={styles.emptyNowSubtitle}>
                        Todos los servicios en curso han sido completados.
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>

              {/* 3. SECCIÓN "SIGUIENTES" */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <ThemedText style={styles.sectionUpperTitle}>Siguientes</ThemedText>
                </View>

                <View style={styles.upcomingList}>
                  {upcomingAppointments.map((item) => {
                    const status = getDisplayStatus(
                      item.date,
                      item.start_time,
                      item.end_time,
                      item.status,
                    );

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => router.push("/reservas")}
                        style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]}
                      >
                        <View style={styles.upcomingTimeCol}>
                          <ThemedText style={styles.upcomingTimeText}>
                            {item.start_time}
                          </ThemedText>
                          <ThemedText style={styles.upcomingEndTimeText}>
                            {item.end_time ? `– ${item.end_time}` : ""}
                          </ThemedText>
                        </View>

                        <View style={styles.upcomingDivider} />

                        <View style={styles.upcomingInfoCol}>
                          <ThemedText style={styles.upcomingCustomerName} numberOfLines={1}>
                            {item.customer_name || item.customer_phone || "(Sin nombre)"}
                          </ThemedText>
                          <ThemedText style={styles.upcomingServiceName} numberOfLines={1}>
                            {item.service_name}
                          </ThemedText>
                        </View>

                        <View style={[styles.upcomingBadge, { backgroundColor: status.color }]}>
                          <ThemedText
                            style={[
                              styles.upcomingBadgeText,
                              { color: status.textColor ?? Palette.textPrimary },
                            ]}
                          >
                            {status.label}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}

                  {/* Espacio Libre / Botón Crear Reserva */}
                  <Pressable
                    onPress={() => router.push("/reservas/nueva")}
                    style={({ pressed }) => [styles.freeSlotCard, pressed && styles.pressed]}
                  >
                    <Ionicons name="add-circle-outline" size={22} color={Palette.primaryLight} />
                    <ThemedText style={styles.freeSlotText}>
                      + Registrar Nueva Cita / Turno
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
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
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 80,
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
  headerCentered: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: 6,
  },
  logoCentered: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 4,
  },
  logoPlaceholderCentered: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  businessNameCentered: {
    fontSize: 24,
    fontWeight: "800",
    color: Palette.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  todayDateText: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: "center",
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 210, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.25)",
    gap: 6,
    marginTop: 4,
  },
  todayBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.secondary,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
  },
  sectionUpperTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  activeBentoCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(138, 79, 255, 0.4)",
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: "hidden",
    position: "relative",
  },
  bentoGlowCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(138, 79, 255, 0.12)",
  },
  bentoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bentoTimeText: {
    fontSize: 17,
    fontWeight: "700",
    color: Palette.primaryLight,
  },
  timeRemainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerHighest,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  timeRemainingText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.secondary,
  },
  bentoCustomerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  bentoCustomerName: {
    fontSize: 22,
    fontWeight: "700",
    color: Palette.textPrimary,
    flex: 1,
  },
  bentoStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  bentoStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bentoServiceName: {
    fontSize: 15,
    fontWeight: "500",
    color: Palette.secondary,
  },
  bentoActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  bentoActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  bentoActionBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  completedStatusWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: Spacing.two,
  },
  completedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 56, 40, 0.4)",
    borderColor: "rgba(52, 211, 153, 0.3)",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  completedBadgeText: {
    color: Palette.successLight,
    fontSize: 13,
    fontWeight: "700",
  },
  nextAppointmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerHigh,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: 6,
  },
  nextAppointmentBtnText: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyNowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    borderRadius: BorderRadius.card,
    gap: Spacing.three,
  },
  emptyNowTextWrap: {
    flex: 1,
    gap: 2,
  },
  emptyNowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  emptyNowSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  upcomingList: {
    gap: Spacing.two,
  },
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  upcomingTimeCol: {
    width: 64,
    alignItems: "flex-start",
  },
  upcomingTimeText: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  upcomingEndTimeText: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  upcomingDivider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.borderSubtle,
    marginRight: Spacing.two,
  },
  upcomingInfoCol: {
    flex: 1,
    gap: 2,
    paddingRight: Spacing.two,
  },
  upcomingCustomerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  upcomingServiceName: {
    fontSize: 13,
    color: Palette.secondary,
  },
  upcomingBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  freeSlotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Palette.border,
    backgroundColor: "rgba(39, 43, 44, 0.25)",
    paddingVertical: 14,
    borderRadius: BorderRadius.card,
    gap: 8,
  },
  freeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.primaryLight,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
