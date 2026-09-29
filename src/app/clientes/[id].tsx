import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingOverlay } from "@/components/loading-overlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import { getDisplayStatus } from "@/features/appointments/models";
import { useCustomerDetailViewModel } from "@/features/customers";

function getInitials(name?: string | null, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (phone) return phone.slice(-2);
  return "?";
}

export default function CustomerDetailScreen() {
  const {
    customer,
    loading,
    error,
    modalVisible,
    name,
    phone,
    notes,
    saving,
    setName,
    setPhone,
    setNotes,
    openEdit,
    closeEdit,
    handleSave,
    handleDelete,
    navigateToCreateAppointment,
  } = useCustomerDetailViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: customer?.name || "Detalle de Cliente",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.deleteHeaderBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={20} color={Palette.error} />
            </Pressable>
          ),
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {customer && (
          <View style={styles.headerProfileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.largeAvatar}>
                <ThemedText style={styles.largeAvatarText}>
                  {getInitials(customer.name, customer.phone)}
                </ThemedText>
              </View>

              <View style={styles.profileNameWrap}>
                <ThemedText style={styles.profileName}>
                  {customer.name || "(sin nombre)"}
                </ThemedText>
                <View style={styles.phoneChip}>
                  <Ionicons name="call-outline" size={13} color={Palette.secondary} />
                  <ThemedText style={styles.profilePhone}>
                    {customer.phone}
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={openEdit}
                style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
                hitSlop={8}
              >
                <Ionicons name="pencil" size={18} color={Palette.primaryLight} />
              </Pressable>
            </View>

            {customer.notes ? (
              <View style={styles.notesContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={15}
                  color={Palette.textMuted}
                  style={{ marginTop: 1 }}
                />
                <ThemedText style={styles.notesText}>{customer.notes}</ThemedText>
              </View>
            ) : null}

            {/* BOTÓN: CREAR CITA PARA ESTE CLIENTE */}
            <Pressable
              onPress={navigateToCreateAppointment}
              style={({ pressed }) => [
                styles.createAppointmentBtn,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="calendar" size={17} color="#ffffff" />
              <ThemedText style={styles.createAppointmentBtnText}>
                Agendar Cita
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Sección de Historial de reservas */}
        <View style={styles.sectionHeaderWrap}>
          <Ionicons name="calendar-outline" size={16} color={Palette.secondary} />
          <ThemedText style={styles.sectionTitle}>Historial de Reservas</ThemedText>
        </View>

        <FlatList
          data={customer?.appointments ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.historyListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const displayStatus = getDisplayStatus(
              item.date,
              item.start_time,
              item.start_time, // fallback end_time
              item.status,
            );

            return (
              <View style={styles.historyCard}>
                <View style={styles.historyInfo}>
                  <ThemedText style={styles.historyService}>
                    {item.service_name}
                  </ThemedText>
                  <ThemedText style={styles.historyDate}>
                    {item.date} · {item.start_time}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.historyBadge,
                    { backgroundColor: displayStatus.color },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.historyBadgeText,
                      { color: displayStatus.textColor ?? Palette.textPrimary },
                    ]}
                  >
                    {displayStatus.label}
                  </ThemedText>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            customer && !loading ? (
              <View style={styles.emptyHistoryWrap}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={32}
                  color={Palette.textMuted}
                />
                <ThemedText style={styles.emptyHistoryText}>
                  Sin reservas registradas todavía.
                </ThemedText>
              </View>
            ) : null
          }
        />

        {/* MODAL EDITAR CLIENTE */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Editar Cliente</ThemedText>
                <Pressable onPress={closeEdit} hitSlop={8}>
                  <Ionicons name="close" size={24} color={Palette.textMuted} />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.modalInputWrap}>
                  <Ionicons name="person-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Nombre"
                    placeholderTextColor={Palette.textMuted}
                    value={name}
                    onChangeText={setName}
                    style={styles.modalInput}
                  />
                </View>

                <View style={styles.modalInputWrap}>
                  <Ionicons name="call-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Teléfono"
                    placeholderTextColor={Palette.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.modalInput}
                  />
                </View>

                <View style={[styles.modalInputWrap, { alignItems: "flex-start", height: 76, paddingTop: 10 }]}>
                  <Ionicons name="document-text-outline" size={18} color={Palette.textMuted} style={{ marginTop: 2 }} />
                  <TextInput
                    placeholder="Notas"
                    placeholderTextColor={Palette.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={[styles.modalInput, { height: 56, textAlignVertical: "top" }]}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={closeEdit}
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                >
                  <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    saving && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <ThemedText style={styles.saveBtnText}>Guardar Cambios</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <LoadingOverlay visible={loading} />
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
  deleteHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.errorContainer,
    padding: Spacing.three,
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    flex: 1,
  },
  headerProfileCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    margin: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  largeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  largeAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: Palette.primaryLight,
  },
  profileNameWrap: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  phoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profilePhone: {
    fontSize: 13,
    color: Palette.secondary,
    fontWeight: "500",
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.two,
  },
  notesText: {
    fontSize: 13,
    color: Palette.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  createAppointmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.one,
  },
  createAppointmentBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeaderWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyListContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 40,
    gap: Spacing.two,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  historyInfo: {
    gap: 2,
  },
  historyService: {
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  historyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyHistoryWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: Palette.textMuted,
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
  btnDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
});
