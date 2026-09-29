import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingOverlay } from "@/components/loading-overlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, MaxContentWidth, Palette, Spacing } from "@/constants/theme";
import { useReservasViewModel } from "@/features/appointments";

export default function ReservasScreen() {
  const {
    isToday,
    dateFormattedLabel,
    appointments,
    loading,
    error,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    handleCancelAppointment,
    handleBadgePress,
    getDisplayStatus,
    navigateToNuevaReserva,
  } = useReservasViewModel();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header con selector de fecha */}
        <View style={styles.header}>
          <Pressable
            onPress={goToPreviousDay}
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={Palette.textPrimary} />
          </Pressable>

          <Pressable
            onPress={goToToday}
            style={({ pressed }) => [styles.dateContainer, pressed && styles.pressed]}
          >
            <View style={styles.dateBadgeRow}>
              {isToday && <View style={styles.todayIndicator} />}
              <ThemedText style={[styles.dateTitle, isToday && styles.dateTitleToday]}>
                {dateFormattedLabel}
              </ThemedText>
            </View>
            {!isToday && (
              <ThemedText style={styles.todaySublink}>
                volver a hoy
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={goToNextDay}
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="chevron-forward" size={20} color={Palette.textPrimary} />
          </Pressable>
        </View>

        {/* Resumen de cantidad */}
        {!loading && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryText}>
              {appointments.length === 1
                ? "1 reserva programada"
                : `${appointments.length} reservas programadas`}
            </ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Lista de citas */}
        <FlatList
          data={appointments}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const displayStatus = getDisplayStatus(
              item.date,
              item.start_time,
              item.end_time,
              item.status,
            );
            const canCancel =
              item.status === "CONFIRMED" || item.status === "PENDING_APPROVAL";
            const isPending = item.status === "PENDING_APPROVAL";
            const isInteractive = isPending || item.status === "CONFIRMED";

            return (
              <View style={styles.card}>
                {/* Indicador de hora */}
                <View style={styles.timeColumn}>
                  <ThemedText style={styles.timeText}>{item.start_time}</ThemedText>
                  <ThemedText style={styles.endTimeText}>
                    {item.end_time ? `– ${item.end_time}` : ""}
                  </ThemedText>
                </View>

                {/* Línea divisoria vertical sutil */}
                <View style={styles.verticalDivider} />

                {/* Datos del cliente y servicio */}
                <View style={styles.infoColumn}>
                  <ThemedText style={styles.customerName} numberOfLines={1}>
                    {item.customer_name || item.customer_phone || "(sin nombre)"}
                  </ThemedText>
                  <View style={styles.serviceRow}>
                    <Ionicons name="cut-outline" size={13} color={Palette.textMuted} />
                    <ThemedText style={styles.serviceName} numberOfLines={1}>
                      {item.service_name}
                    </ThemedText>
                  </View>
                </View>

                {/* Badges de estado y acciones */}
                <View style={styles.actionsColumn}>
                  <Pressable
                    onPress={() => handleBadgePress(item)}
                    disabled={!isInteractive}
                    style={({ pressed }) => [
                      styles.badge,
                      { backgroundColor: displayStatus.color },
                      isInteractive && pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.badgeText,
                        { color: displayStatus.textColor ?? Palette.textPrimary },
                      ]}
                    >
                      {displayStatus.label}
                    </ThemedText>
                  </Pressable>

                  {canCancel && (
                    <Pressable
                      onPress={() => handleCancelAppointment(item)}
                      style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={Palette.error}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={36}
                    color={Palette.textMuted}
                  />
                </View>
                <ThemedText style={styles.emptyTitle}>
                  Sin reservas ese día
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Toca el botón + para registrar una reserva manual.
                </ThemedText>
              </View>
            ) : null
          }
        />

        {/* FAB Botón de Nueva Reserva */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={navigateToNuevaReserva}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>

        <LoadingOverlay visible={loading} color={Palette.secondary} />
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
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.secondary,
  },
  dateTitle: {
    textTransform: "capitalize",
    fontWeight: "700",
    fontSize: 18,
    color: Palette.textPrimary,
    letterSpacing: -0.2,
  },
  dateTitleToday: {
    color: Palette.secondary,
    fontSize: 20,
  },
  todaySublink: {
    fontSize: 12,
    color: Palette.secondary,
    fontWeight: "600",
    marginTop: 2,
  },
  summaryRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  summaryText: {
    fontSize: 12,
    color: Palette.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.two,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.card,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  timeColumn: {
    width: 64,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.secondary,
  },
  endTimeText: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: Palette.borderSubtle,
    marginRight: Spacing.two,
  },
  infoColumn: {
    flex: 1,
    gap: 3,
    paddingRight: Spacing.two,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceName: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  actionsColumn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cancelButton: {
    padding: 2,
  },
  loadingContainer: {
    paddingVertical: Spacing.six,
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.errorContainer,
    padding: Spacing.three,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  pressed: {
    opacity: 0.7,
  },
});
