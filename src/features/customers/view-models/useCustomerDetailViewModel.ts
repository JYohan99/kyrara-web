import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { deleteCustomer, getCustomer, updateCustomer } from "../api";
import { CustomerWithHistory } from "../models";

export function useCustomerDetailViewModel() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [customer, setCustomer] = useState<CustomerWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    getCustomer(id)
      .then(setCustomer)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openEdit = () => {
    if (!customer) return;
    setName(customer.name || "");
    setPhone(customer.phone);
    setNotes(customer.notes || "");
    setModalVisible(true);
  };

  const closeEdit = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateCustomer(id, { name, phone, notes });
      setModalVisible(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!customer || !id) return;
    Alert.alert(
      "Eliminar cliente",
      `¿Eliminar a ${customer.name || "este cliente"}? Se conserva su historial de reservas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteCustomer(id);
            router.back();
          },
        },
      ],
    );
  };

  const navigateToCreateAppointment = () => {
    if (!id) return;
    router.push({
      pathname: "/reservas/nueva" as any,
      params: { customerId: id },
    });
  };

  return {
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
  };
}
