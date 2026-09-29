import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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
import { useServiciosViewModel } from "@/features/services";

export default function ServiciosScreen() {
  const {
    services,
    loading,
    error,
    modalVisible,
    editing,
    name,
    duration,
    price,
    saving,
    deleting,
    serviceToDelete,
    setName,
    setDuration,
    setPrice,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    handleToggle,
    handleDelete,
    cancelDelete,
    confirmDelete,
  } = useServiciosViewModel();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Servicios",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={Palette.error} />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <FlatList
          data={services}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                onPress={() => openEdit(item)}
                style={({ pressed }) => [styles.infoColumn, pressed && styles.pressed]}
              >
                <ThemedText
                  style={[
                    styles.serviceName,
                    !item.active && styles.inactiveText,
                  ]}
                >
                  {item.name}
                </ThemedText>

                <View style={styles.metaRow}>
                  <View style={styles.durationWrap}>
                    <Ionicons name="time-outline" size={13} color={Palette.textMuted} />
                    <ThemedText style={styles.durationText}>
                      {item.duration_minutes} min
                    </ThemedText>
                  </View>

                  {item.price !== null && (
                    <View style={styles.priceBadge}>
                      <ThemedText style={styles.priceBadgeText}>
                        ${item.price}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Pressable>

              <View style={styles.cardActions}>
                <Switch
                  value={!!item.active}
                  onValueChange={() => handleToggle(item)}
                  trackColor={{
                    false: Palette.surfaceContainerHighest,
                    true: Palette.primary,
                  }}
                  thumbColor="#ffffff"
                />
                <Pressable
                  onPress={() => handleDelete(item)}
                  style={({ pressed }) => [styles.deleteCardBtn, pressed && styles.pressed]}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={Palette.error} />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="cut-outline"
                    size={36}
                    color={Palette.textMuted}
                  />
                </View>
                <ThemedText style={styles.emptyTitle}>
                  Sin servicios todavía
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Agrega servicios que tus clientes puedan reservar tocando el botón +.
                </ThemedText>
              </View>
            ) : null
          }
        />

        {/* FAB para nuevo servicio */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={openCreate}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>

        {/* MODAL CREAR / EDITAR SERVICIO */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {editing ? "Editar Servicio" : "Nuevo Servicio"}
                </ThemedText>
                <View style={styles.modalHeaderActions}>
                  {editing && (
                    <Pressable
                      onPress={() => handleDelete(editing)}
                      style={({ pressed }) => [styles.deleteHeaderBtn, pressed && styles.pressed]}
                      hitSlop={8}
                      disabled={deleting || saving}
                    >
                      <Ionicons name="trash-outline" size={20} color={Palette.error} />
                    </Pressable>
                  )}
                  <Pressable onPress={closeModal} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Palette.textMuted} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.modalInputWrap}>
                  <Ionicons name="cut-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Nombre del servicio (ej. Corte Clásico)"
                    placeholderTextColor={Palette.textMuted}
                    value={name}
                    onChangeText={setName}
                    style={styles.modalInput}
                  />
                </View>

                <View style={styles.modalInputWrap}>
                  <Ionicons name="time-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Duración en minutos (ej. 30)"
                    placeholderTextColor={Palette.textMuted}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>

                <View style={styles.modalInputWrap}>
                  <Ionicons name="cash-outline" size={18} color={Palette.textMuted} />
                  <TextInput
                    placeholder="Precio en $ (opcional)"
                    placeholderTextColor={Palette.textMuted}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                {editing ? (
                  <Pressable
                    onPress={() => handleDelete(editing)}
                    style={({ pressed }) => [styles.deleteModalBtn, pressed && styles.pressed]}
                    disabled={deleting || saving}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={Palette.error} />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={16} color={Palette.error} />
                        <ThemedText style={styles.deleteModalBtnText}>Eliminar</ThemedText>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View />
                )}

                <View style={styles.modalRightActions}>
                  <Pressable
                    onPress={closeModal}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    style={({ pressed }) => [
                      styles.saveBtn,
                      (saving || deleting) && styles.btnDisabled,
                      pressed && styles.pressed,
                    ]}
                    disabled={saving || deleting}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <ThemedText style={styles.saveBtnText}>
                        {editing ? "Guardar Cambios" : "Crear Servicio"}
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINAR */}
        <Modal
          visible={!!serviceToDelete}
          animationType="fade"
          transparent
          onRequestClose={cancelDelete}
        >
          <View style={styles.confirmModalOverlay}>
            <View style={styles.confirmModalCard}>
              <View style={styles.confirmIconWrap}>
                <Ionicons name="trash-outline" size={28} color={Palette.error} />
              </View>

              <ThemedText style={styles.confirmModalTitle}>
                Eliminar servicio
              </ThemedText>

              <ThemedText style={styles.confirmModalDesc}>
                ¿Estás seguro de que deseas eliminar{" "}
                <ThemedText style={styles.confirmServiceName}>
                  "{serviceToDelete?.name}"
                </ThemedText>
                ? Los turnos históricos asociados a este servicio se conservarán intactos.
              </ThemedText>

              <View style={styles.confirmModalActions}>
                <Pressable
                  onPress={cancelDelete}
                  style={({ pressed }) => [
                    styles.confirmCancelBtn,
                    pressed && styles.pressed,
                  ]}
                  disabled={deleting}
                >
                  <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                </Pressable>

                <Pressable
                  onPress={confirmDelete}
                  style={({ pressed }) => [
                    styles.confirmDeleteBtn,
                    deleting && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <ThemedText style={styles.confirmDeleteBtnText}>
                      Aceptar
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* OVERLAY DE CARGA SEMI-TRANSPARENTE (SIN DESPLAZAMIENTO DE LISTA) */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBadge}>
              <ActivityIndicator size="large" color={Palette.primary} />
            </View>
          </View>
        )}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 20, 21, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  loadingBadge: {
    backgroundColor: Palette.surfaceContainer,
    padding: Spacing.four,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  listContent: {
    padding: Spacing.four,
    paddingBottom: 100,
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
  infoColumn: {
    flex: 1,
    gap: 6,
    paddingRight: Spacing.two,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  inactiveText: {
    opacity: 0.45,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  durationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  priceBadge: {
    backgroundColor: Palette.secondaryDark,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.secondary,
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  deleteCardBtn: {
    padding: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  deleteHeaderBtn: {
    padding: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  deleteModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.errorContainer,
  },
  deleteModalBtnText: {
    color: Palette.error,
    fontSize: 14,
    fontWeight: "600",
  },
  modalRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
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
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  confirmModalCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    padding: Spacing.four,
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
    gap: Spacing.three,
  },
  confirmIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
    textAlign: "center",
  },
  confirmModalDesc: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmServiceName: {
    color: Palette.textPrimary,
    fontWeight: "700",
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: Spacing.two,
    width: "100%",
    marginTop: Spacing.one,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});


