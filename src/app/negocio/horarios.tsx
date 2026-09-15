import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  DIAS_SEMANA,
  useHorariosViewModel,
} from "@/features/availability";

export default function HorariosScreen() {
  const {
    blocks,
    exceptions,
    loading,
    error,
    blockModal,
    dayOfWeek,
    startTime,
    endTime,
    excModal,
    excDate,
    excReason,
    excClosedAllDay,
    excStartTime,
    excEndTime,
    setDayOfWeek,
    setStartTime,
    setEndTime,
    setExcDate,
    setExcReason,
    setExcClosedAllDay,
    setExcStartTime,
    setExcEndTime,
    openBlockModal,
    closeBlockModal,
    handleCreateBlock,
    handleToggleBlock,
    handleDeleteBlock,
    openExcModal,
    closeExcModal,
    handleCreateException,
    handleDeleteException,
  } = useHorariosViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Horarios y Disponibilidad",
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
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.secondary} />
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* SECCIÓN 1: HORARIO SEMANAL */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="calendar-outline" size={18} color={Palette.primaryLight} />
                <ThemedText style={styles.sectionTitle}>Horario Semanal</ThemedText>
              </View>
              <Pressable
                onPress={openBlockModal}
                style={({ pressed }) => [styles.addSectionBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <Ionicons name="add" size={20} color={Palette.primaryLight} />
                <ThemedText style={styles.addBtnText}>Agregar</ThemedText>
              </Pressable>
            </View>

            <View style={styles.cardsList}>
              {blocks.map((b) => (
                <View key={b.id} style={styles.card}>
                  <View style={styles.blockInfo}>
                    <ThemedText
                      style={[
                        styles.dayText,
                        !b.active && styles.inactiveText,
                      ]}
                    >
                      {DIAS_SEMANA[b.day_of_week]}
                    </ThemedText>
                    <ThemedText style={styles.timeRangeText}>
                      {b.start_time} – {b.end_time}
                    </ThemedText>
                  </View>

                  <View style={styles.cardActions}>
                    <Switch
                      value={!!b.active}
                      onValueChange={() => handleToggleBlock(b)}
                      trackColor={{
                        false: Palette.surfaceContainerHighest,
                        true: Palette.primary,
                      }}
                      thumbColor="#ffffff"
                    />
                    <Pressable
                      onPress={() => handleDeleteBlock(b)}
                      style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={Palette.error} />
                    </Pressable>
                  </View>
                </View>
              ))}

              {blocks.length === 0 && !loading && (
                <View style={styles.emptyCard}>
                  <ThemedText style={styles.emptyCardText}>
                    No hay bloques horarios configurados. Toca "+ Agregar" para añadir el primero.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* SECCIÓN 2: EXCEPCIONES Y FERIADOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="pause-circle-outline" size={18} color={Palette.secondary} />
                <ThemedText style={styles.sectionTitle}>
                  Feriados / Cierres
                </ThemedText>
              </View>
              <Pressable
                onPress={openExcModal}
                style={({ pressed }) => [styles.addSectionBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <Ionicons name="add" size={20} color={Palette.secondary} />
                <ThemedText style={[styles.addBtnText, { color: Palette.secondary }]}>
                  Agregar
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.cardsList}>
              {exceptions.map((e) => {
                const isClosedAllDay = e.closed_all_day === 1 || (e.closed_all_day as any) === true;
                return (
                  <View key={e.id} style={styles.card}>
                    <View style={styles.blockInfo}>
                      <ThemedText style={styles.dayText}>{e.date}</ThemedText>
                      <View style={styles.excBadgeRow}>
                        <View
                          style={[
                            styles.excBadge,
                            isClosedAllDay ? styles.excBadgeFull : styles.excBadgePartial,
                          ]}
                        >
                          <Ionicons
                            name={isClosedAllDay ? "calendar-outline" : "time-outline"}
                            size={13}
                            color={isClosedAllDay ? Palette.error : Palette.secondary}
                          />
                          <ThemedText
                            style={[
                              styles.excBadgeText,
                              isClosedAllDay ? styles.excBadgeTextFull : styles.excBadgeTextPartial,
                            ]}
                          >
                            {isClosedAllDay
                              ? "Cerrado todo el día"
                              : `Cerrado de ${e.start_time ?? "--:--"} a ${e.end_time ?? "--:--"}`}
                          </ThemedText>
                        </View>
                      </View>
                      {e.reason ? (
                        <ThemedText style={styles.excReasonText}>
                          {e.reason}
                        </ThemedText>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => handleDeleteException(e)}
                      style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={Palette.error} />
                    </Pressable>
                  </View>
                );
              })}

              {exceptions.length === 0 && !loading && (
                <View style={styles.emptyCard}>
                  <ThemedText style={styles.emptyCardText}>
                    Sin excepciones de cierre configuradas.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* MODAL NUEVO BLOQUE HORARIO */}
          <Modal visible={blockModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Nuevo Bloque Horario</ThemedText>
                  <Pressable onPress={closeBlockModal} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Palette.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.inputLabel}>Día de la semana</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayChipsWrap}
                  >
                    {DIAS_SEMANA.map((d, i) => (
                      <Pressable
                        key={i}
                        onPress={() => setDayOfWeek(i)}
                        style={[
                          styles.dayChip,
                          dayOfWeek === i && styles.dayChipSelected,
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dayChipText,
                            dayOfWeek === i && styles.dayChipTextSelected,
                          ]}
                        >
                          {d}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.modalInputWrap}>
                    <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Hora inicio (ej. 09:00)"
                      placeholderTextColor={Palette.textMuted}
                      value={startTime}
                      onChangeText={setStartTime}
                      style={styles.modalInput}
                    />
                  </View>

                  <View style={styles.modalInputWrap}>
                    <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Hora fin (ej. 18:00)"
                      placeholderTextColor={Palette.textMuted}
                      value={endTime}
                      onChangeText={setEndTime}
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeBlockModal}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateBlock}
                    style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.saveBtnText}>Guardar Horario</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* MODAL NUEVA EXCEPCIÓN */}
          <Modal visible={excModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Nueva Excepción de Cierre</ThemedText>
                  <Pressable onPress={closeExcModal} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Palette.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.inputLabel}>Fecha de la excepción</ThemedText>
                  <View style={styles.modalInputWrap}>
                    <Ionicons name="calendar-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Fecha (YYYY-MM-DD, ej. 2026-12-25)"
                      placeholderTextColor={Palette.textMuted}
                      value={excDate}
                      onChangeText={setExcDate}
                      style={styles.modalInput}
                    />
                  </View>

                  <ThemedText style={styles.inputLabel}>Tipo de cierre</ThemedText>
                  <View style={styles.closureTypeToggleRow}>
                    <Pressable
                      onPress={() => setExcClosedAllDay(true)}
                      style={[
                        styles.closureTypeChip,
                        excClosedAllDay && styles.closureTypeChipActive,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={excClosedAllDay ? "#ffffff" : Palette.textMuted}
                      />
                      <ThemedText
                        style={[
                          styles.closureTypeChipText,
                          excClosedAllDay && styles.closureTypeChipTextActive,
                        ]}
                      >
                        Día Completo
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      onPress={() => setExcClosedAllDay(false)}
                      style={[
                        styles.closureTypeChip,
                        !excClosedAllDay && styles.closureTypeChipActive,
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={!excClosedAllDay ? "#ffffff" : Palette.textMuted}
                      />
                      <ThemedText
                        style={[
                          styles.closureTypeChipText,
                          !excClosedAllDay && styles.closureTypeChipTextActive,
                        ]}
                      >
                        Por Horario
                      </ThemedText>
                    </Pressable>
                  </View>

                  {!excClosedAllDay && (
                    <View style={styles.timeInputsRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText style={styles.inputLabel}>Desde</ThemedText>
                        <View style={styles.modalInputWrap}>
                          <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                          <TextInput
                            placeholder="Ej. 13:00"
                            placeholderTextColor={Palette.textMuted}
                            value={excStartTime}
                            onChangeText={setExcStartTime}
                            style={styles.modalInput}
                          />
                        </View>
                      </View>

                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText style={styles.inputLabel}>Hasta</ThemedText>
                        <View style={styles.modalInputWrap}>
                          <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                          <TextInput
                            placeholder="Ej. 15:00"
                            placeholderTextColor={Palette.textMuted}
                            value={excEndTime}
                            onChangeText={setExcEndTime}
                            style={styles.modalInput}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  <ThemedText style={styles.inputLabel}>Motivo (opcional)</ThemedText>
                  <View style={styles.modalInputWrap}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={Palette.textMuted} />
                    <TextInput
                      placeholder="Motivo (ej. Almuerzo / Mantenimiento)"
                      placeholderTextColor={Palette.textMuted}
                      value={excReason}
                      onChangeText={setExcReason}
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeExcModal}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateException}
                    style={({ pressed }) => [
                      styles.saveBtn,
                      { backgroundColor: Palette.secondary },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText style={[styles.saveBtnText, { color: Palette.surfaceContainerLowest }]}>
                      Guardar Excepción
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
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
    gap: Spacing.five,
    paddingBottom: 60,
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
  section: {
    gap: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addSectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.primaryLight,
  },
  cardsList: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  blockInfo: {
    flex: 1,
    gap: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  timeRangeText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  inactiveText: {
    opacity: 0.45,
    textDecorationLine: "line-through",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyCard: {
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: BorderRadius.card,
    padding: Spacing.four,
    alignItems: "center",
  },
  emptyCardText: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000088",
  },
  modalCard: {
    backgroundColor: Palette.surfaceContainer,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.one,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  formGroup: {
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayChipsWrap: {
    gap: 8,
    paddingVertical: 4,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  dayChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Palette.textPrimary,
  },
  dayChipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    height: 48,
    gap: Spacing.two,
  },
  modalInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  cancelBtnText: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.primary,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  closureTypeToggleRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  closureTypeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  closureTypeChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  closureTypeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  closureTypeChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  timeInputsRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  excBadgeRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  excBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  excBadgeFull: {
    backgroundColor: "rgba(255, 82, 82, 0.08)",
    borderColor: "rgba(255, 82, 82, 0.3)",
  },
  excBadgePartial: {
    backgroundColor: "rgba(0, 209, 157, 0.08)",
    borderColor: "rgba(0, 209, 157, 0.3)",
  },
  excBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  excBadgeTextFull: {
    color: Palette.error,
  },
  excBadgeTextPartial: {
    color: Palette.secondary,
  },
  excReasonText: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.75,
  },
});
