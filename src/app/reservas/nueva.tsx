import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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
import {
  addDaysToDateString,
  getTodayDateString,
} from "@/core/utils/date";
import { useNuevaReservaViewModel } from "@/features/appointments";

function getInitials(name?: string | null, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (phone) return phone.slice(-2);
  return "?";
}

function getUpcomingDays(count = 21) {
  const todayStr = getTodayDateString();
  const days: { dateStr: string; dayOfWeek: string; dayNum: string; isToday: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const dateStr = addDaysToDateString(todayStr, i);
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek =
      i === 0
        ? "HOY"
        : dateObj
            .toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" })
            .toUpperCase()
            .replace(".", "");
    const dayNum = String(d);
    days.push({
      dateStr,
      dayOfWeek,
      dayNum,
      isToday: i === 0,
    });
  }
  return days;
}

function getMonthYearLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const monthName = dateObj.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  return monthName.charAt(0).toUpperCase() + monthName.slice(1) + " " + y;
}

function formatSummaryDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const weekday = dateObj.toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" });
  const month = dateObj.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" });
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(".", "");
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1).replace(".", "");
  return `${weekdayCap} ${d} ${monthCap}`;
}

export default function NuevaReservaScreen() {
  const router = useRouter();
  const {
    customers,
    services,
    selectedCustomer,
    selectedService,
    date,
    slots,
    selectedSlot,
    loadingSlots,
    saving,
    error,
    isConfirmDisabled,
    handleSelectCustomer,
    handleSelectService,
    handleDateChange,
    handleSelectSlot,
    handleConfirm,
  } = useNuevaReservaViewModel();

  const [customerSearch, setCustomerSearch] = useState("");

  const upcomingDays = useMemo(() => getUpcomingDays(21), []);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const list = !q
      ? customers
      : customers.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            c.phone.toLowerCase().includes(q),
        );

    // Si hay un cliente seleccionado, asegurar que esté al frente
    if (selectedCustomer) {
      return [
        selectedCustomer,
        ...list.filter((c) => c.id !== selectedCustomer.id),
      ];
    }
    return list;
  }, [customers, customerSearch, selectedCustomer]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Nueva Reserva",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ============================================================== */}
          {/* 1. SELECCIONAR CLIENTE (Estilo Stitch)                          */}
          {/* ============================================================== */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Cliente</ThemedText>
              <Pressable
                onPress={() => router.push("/clientes")}
                style={({ pressed }) => [styles.newClientBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color={Palette.secondary} />
                <ThemedText style={styles.newClientBtnText}>Nuevo Cliente</ThemedText>
              </Pressable>
            </View>

            {/* Input de Búsqueda */}
            <View style={styles.searchWrap}>
              <Ionicons
                name="search-outline"
                size={18}
                color={Palette.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                value={customerSearch}
                onChangeText={setCustomerSearch}
                placeholder="Buscar cliente por nombre o teléfono..."
                placeholderTextColor={Palette.textMuted}
                style={styles.searchInput}
              />
              {customerSearch.length > 0 && (
                <Pressable onPress={() => setCustomerSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={Palette.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Chips Horizontales de Selección Rápida */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
            >
              {filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCustomer(c)}
                    style={({ pressed }) => [
                      styles.customerChip,
                      isSelected && styles.customerChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        isSelected && styles.avatarCircleSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.avatarText,
                          isSelected && styles.avatarTextSelected,
                        ]}
                      >
                        {getInitials(c.name, c.phone)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.customerChipText,
                        isSelected && styles.customerChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {c.name || c.phone}
                    </ThemedText>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Palette.primary}
                        style={{ marginLeft: 2 }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ============================================================== */}
          {/* 2. SELECCIONAR SERVICIO (Estilo Stitch)                         */}
          {/* ============================================================== */}
          <View style={styles.cardSection}>
            <ThemedText style={styles.sectionTitle}>Servicios</ThemedText>

            <View style={styles.servicesGrid}>
              {services
                .filter((s) => s.active)
                .map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => handleSelectService(s)}
                      style={({ pressed }) => [
                        styles.serviceCard,
                        isSelected && styles.serviceCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      {/* Barra de acento vertical izquierda */}
                      <View
                        style={[
                          styles.serviceAccentBar,
                          isSelected && styles.serviceAccentBarSelected,
                        ]}
                      />

                      <View style={styles.serviceContentWrap}>
                        <View style={styles.serviceTopRow}>
                          <ThemedText
                            style={[
                              styles.serviceTitle,
                              isSelected && styles.serviceTitleSelected,
                            ]}
                          >
                            {s.name}
                          </ThemedText>
                          <Ionicons
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                            size={20}
                            color={isSelected ? Palette.primary : Palette.outline}
                          />
                        </View>

                        <View style={styles.serviceBottomRow}>
                          <View style={styles.serviceDurationBadge}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={Palette.textMuted}
                            />
                            <ThemedText style={styles.serviceDurationText}>
                              {s.duration_minutes} min
                            </ThemedText>
                          </View>

                          {s.price !== null && (
                            <ThemedText style={styles.servicePrice}>
                              $ {s.price}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
            </View>
          </View>

          {/* ============================================================== */}
          {/* 3. FECHA Y HORA (Estilo Stitch)                                 */}
          {/* ============================================================== */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Fecha y Hora</ThemedText>
              <ThemedText style={styles.monthHeaderLabel}>
                {getMonthYearLabel(date)}
              </ThemedText>
            </View>

            {/* Carrusel de Días (Date Strip) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStripContent}
            >
              {upcomingDays.map((d) => {
                const isSelected = date === d.dateStr;
                return (
                  <Pressable
                    key={d.dateStr}
                    onPress={() => handleDateChange(d.dateStr)}
                    style={({ pressed }) => [
                      styles.dayCard,
                      isSelected && styles.dayCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dayOfWeekText,
                        isSelected && styles.dayOfWeekTextSelected,
                      ]}
                    >
                      {d.dayOfWeek}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dayNumberText,
                        isSelected && styles.dayNumberTextSelected,
                      ]}
                    >
                      {d.dayNum}
                    </ThemedText>
                    {isSelected && <View style={styles.selectedDayDot} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.sectionDivider} />

            {/* Grilla de Horarios */}
            <View style={styles.slotsSectionWrap}>
              <ThemedText style={styles.slotsSubtitle}>
                HORARIOS DISPONIBLES
              </ThemedText>

              {loadingSlots && (
                <View style={styles.slotsLoadingWrap}>
                  <ActivityIndicator size="small" color={Palette.secondary} />
                  <ThemedText style={styles.slotsLoadingText}>
                    Consultando disponibilidad en tiempo real...
                  </ThemedText>
                </View>
              )}

              {!loadingSlots && selectedService && slots.length === 0 && (
                <View style={styles.noSlotsCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={Palette.warning}
                  />
                  <ThemedText style={styles.noSlotsText}>
                    No hay horarios disponibles para esta fecha. Selecciona otro día o servicio.
                  </ThemedText>
                </View>
              )}

              {!loadingSlots && !selectedService && (
                <View style={styles.noServiceCard}>
                  <Ionicons
                    name="cut-outline"
                    size={20}
                    color={Palette.textMuted}
                  />
                  <ThemedText style={styles.noServiceText}>
                    Elige un servicio arriba para ver los horarios disponibles.
                  </ThemedText>
                </View>
              )}

              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => handleSelectSlot(slot)}
                      style={({ pressed }) => [
                        styles.slotCard,
                        isSelected && styles.slotCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                        ]}
                      >
                        {slot}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Banner de error */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
        </ScrollView>

        {/* ============================================================== */}
        {/* BARRA INFERIOR FLOTANTE DE CONFIRMACIÓN (Estilo Stitch)         */}
        {/* ============================================================== */}
        <View style={styles.bottomDockedBar}>
          <View style={styles.bottomSummaryRow}>
            <View style={styles.bottomSummaryLeft}>
              <View style={styles.bottomDateTimeRow}>
                <Ionicons name="calendar-outline" size={13} color={Palette.textMuted} />
                <ThemedText style={styles.bottomDateTimeText}>
                  {formatSummaryDate(date)} • {selectedSlot || "--:--"}
                  {selectedService ? ` (${selectedService.duration_minutes}m)` : ""}
                </ThemedText>
              </View>
              <ThemedText style={styles.bottomServiceText} numberOfLines={1}>
                {selectedService?.name || "Selecciona un servicio"} •{" "}
                {selectedCustomer?.name || selectedCustomer?.phone || "Sin cliente"}
              </ThemedText>
            </View>

            <View style={styles.bottomSummaryRight}>
              <ThemedText style={styles.bottomTotalLabel}>TOTAL</ThemedText>
              <ThemedText style={styles.bottomPriceText}>
                {selectedService?.price !== null && selectedService?.price !== undefined
                  ? `$ ${selectedService.price}`
                  : "--"}
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              isConfirmDisabled && styles.confirmButtonDisabled,
              pressed && !isConfirmDisabled && styles.pressed,
            ]}
            disabled={isConfirmDisabled}
            onPress={handleConfirm}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.confirmContent}>
                <ThemedText
                  style={[
                    styles.confirmButtonText,
                    isConfirmDisabled && styles.confirmButtonTextDisabled,
                  ]}
                >
                  Confirmar Reserva
                </ThemedText>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isConfirmDisabled ? Palette.textMuted : "#ffffff"}
                />
              </View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// ============================================================================
// ESTILOS VISUALES (PALETA OBSIDIAN / STITCH DESIGN SYSTEM)
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
    paddingBottom: 130, // Espacio para que el dock inferior no tape contenido
  },
  cardSection: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Palette.primaryLight,
  },
  newClientBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  newClientBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.secondary,
    letterSpacing: 0.2,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    height: 44,
    gap: Spacing.two,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  chipsScrollContent: {
    gap: Spacing.two,
    paddingVertical: 4,
  },
  customerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: 8,
  },
  customerChipSelected: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircleSelected: {
    backgroundColor: Palette.primary,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  avatarTextSelected: {
    color: "#ffffff",
  },
  customerChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Palette.textMuted,
  },
  customerChipTextSelected: {
    color: Palette.textPrimary,
    fontWeight: "700",
  },
  servicesGrid: {
    gap: Spacing.two,
  },
  serviceCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    overflow: "hidden",
    position: "relative",
  },
  serviceCardSelected: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  serviceAccentBar: {
    width: 4,
    backgroundColor: Palette.surfaceContainerHighest,
  },
  serviceAccentBarSelected: {
    backgroundColor: Palette.primary,
  },
  serviceContentWrap: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  serviceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
    flex: 1,
  },
  serviceTitleSelected: {
    color: Palette.textPrimary,
    fontWeight: "700",
  },
  serviceBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.surfaceContainerHigh,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
  },
  serviceDurationText: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.secondary,
  },
  monthHeaderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  dateStripContent: {
    gap: 8,
    paddingVertical: 2,
  },
  dayCard: {
    width: 62,
    height: 76,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dayCardSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryLight,
    borderWidth: 1.5,
  },
  dayOfWeekText: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textMuted,
    letterSpacing: 0.5,
  },
  dayOfWeekTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  dayNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  dayNumberTextSelected: {
    color: "#ffffff",
    fontWeight: "900",
  },
  selectedDayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.secondary,
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 2,
  },
  slotsSectionWrap: {
    gap: Spacing.two,
  },
  slotsSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.textMuted,
    letterSpacing: 0.6,
  },
  slotsLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  slotsLoadingText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  noSlotsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  noSlotsText: {
    fontSize: 13,
    color: Palette.textSecondary,
    flex: 1,
  },
  noServiceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  noServiceText: {
    fontSize: 13,
    color: Palette.textMuted,
    flex: 1,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotCard: {
    width: "23%", // 4 columnas uniformes
    minWidth: 70,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  slotCardSelected: {
    backgroundColor: "rgba(138, 79, 255, 0.2)",
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  slotText: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  slotTextSelected: {
    color: Palette.primaryLight,
    fontWeight: "700",
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
  bottomDockedBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(28, 32, 33, 0.96)",
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  bottomSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomSummaryLeft: {
    flex: 1,
    gap: 2,
    paddingRight: Spacing.two,
  },
  bottomDateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bottomDateTimeText: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  bottomServiceText: {
    fontSize: 13,
    color: Palette.textPrimary,
    fontWeight: "600",
  },
  bottomSummaryRight: {
    alignItems: "flex-end",
  },
  bottomTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textMuted,
    letterSpacing: 0.5,
  },
  bottomPriceText: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.secondary,
  },
  confirmButton: {
    backgroundColor: Palette.primary,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Palette.surfaceContainerHighest,
  },
  confirmContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButtonTextDisabled: {
    color: Palette.textMuted,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
