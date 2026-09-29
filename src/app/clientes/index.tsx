import { Ionicons } from "@expo/vector-icons";
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
import { useClientesViewModel } from "@/features/customers";

function getInitials(name?: string | null, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (phone) return phone.slice(-2);
  return "?";
}

export default function ClientesScreen() {
  const {
    customers,
    search,
    loading,
    error,
    modalVisible,
    name,
    phone,
    notes,
    saving,
    formError,
    setName,
    setPhone,
    setNotes,
    handleSearchChange,
    openCreateModal,
    closeCreateModal,
    handleSaveCustomer,
    navigateToDetail,
    navigateToCreateAppointment,
  } = useClientesViewModel();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Palette.textMuted} />
          <TextInput
            placeholder="Buscar por nombre o teléfono..."
            placeholderTextColor={Palette.textMuted}
            value={search}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => handleSearchChange("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Resumen */}
        {!loading && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryText}>
              {customers.length === 1
                ? "1 cliente registrado"
                : `${customers.length} clientes registrados`}
            </ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Lista de clientes */}
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigateToDetail(item.id)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>
                  {getInitials(item.name, item.phone)}
                </ThemedText>
              </View>

              <View style={styles.infoColumn}>
                <ThemedText style={styles.customerName}>
                  {item.name || "(sin nombre)"}
                </ThemedText>
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={13} color={Palette.textMuted} />
                  <ThemedText style={styles.customerPhone}>
                    {item.phone}
                  </ThemedText>
                </View>
              </View>

              {/* Botón rápido para crear cita a este cliente */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  navigateToCreateAppointment(item.id);
                }}
                style={({ pressed }) => [
                  styles.quickAppointmentBtn,
                  pressed && styles.pressed,
                ]}
                hitSlop={6}
              >
                <Ionicons name="calendar-outline" size={14} color={Palette.primaryLight} />
                <ThemedText style={styles.quickAppointmentText}>Agendar</ThemedText>
              </Pressable>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Palette.textMuted}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="people-outline"
                    size={36}
                    color={Palette.textMuted}
                  />
                </View>
                <ThemedText style={styles.emptyTitle}>
                  {search ? "No se encontraron clientes" : "Sin clientes todavía"}
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  {search
                    ? "Prueba buscando con otro término."
                    : "Agrega tu primer cliente tocando el botón +"}
                </ThemedText>
              </View>
            ) : null
          }
        />

        {/* FAB Botón nuevo cliente */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={openCreateModal}
        >
          <Ionicons name="person-add" size={24} color="#ffffff" />
        </Pressable>

        {/* MODAL NUEVO CLIENTE */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Nuevo Cliente</ThemedText>
                <Pressable onPress={closeCreateModal} hitSlop={8}>
                  <Ionicons name="close" size={24} color={Palette.textMuted} />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.modalInputWrap}>
                  <Ionicons name="person-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Nombre completo"
                    placeholderTextColor={Palette.textMuted}
                    value={name}
                    onChangeText={setName}
                    style={styles.modalInput}
                  />
                </View>

                <View style={styles.modalInputWrap}>
                  <Ionicons name="call-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Teléfono (ej. +59891234567)"
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
                    placeholder="Notas o preferencias (opcional)"
                    placeholderTextColor={Palette.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={[styles.modalInput, { height: 56, textAlignVertical: "top" }]}
                  />
                </View>
              </View>

              {formError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color={Palette.error} />
                  <ThemedText style={styles.errorText}>{formError}</ThemedText>
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  onPress={closeCreateModal}
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                >
                  <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSaveCustomer}
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
                    <ThemedText style={styles.saveBtnText}>Guardar Cliente</ThemedText>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 48,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  summaryRow: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
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
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.primaryLight,
  },
  infoColumn: {
    flex: 1,
    gap: 3,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  quickAppointmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(138, 79, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 79, 255, 0.3)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    gap: 4,
    marginRight: 4,
  },
  quickAppointmentText: {
    color: Palette.primaryLight,
    fontSize: 12,
    fontWeight: "600",
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
