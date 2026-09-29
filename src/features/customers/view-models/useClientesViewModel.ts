import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { createCustomer, listCustomers } from "../api";
import { Customer } from "../models";

export function useClientesViewModel() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback((query?: string) => {
    setLoading(true);
    listCustomers(query)
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(search || undefined);
    }, [load]),
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    load(text || undefined);
  };

  const openCreateModal = () => {
    setName("");
    setPhone("");
    setNotes("");
    setFormError(null);
    setModalVisible(true);
  };

  const closeCreateModal = () => {
    setModalVisible(false);
  };

  const handleSaveCustomer = async () => {
    if (!phone.trim()) {
      setFormError("El teléfono es obligatorio");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await createCustomer({
        name: name.trim() || undefined,
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      });
      setModalVisible(false);
      load(search || undefined);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const navigateToDetail = (customerId: string) => {
    router.push({
      pathname: "/clientes/[id]",
      params: { id: customerId },
    });
  };

  const navigateToCreateAppointment = (customerId: string) => {
    router.push({
      pathname: "/reservas/nueva" as any,
      params: { customerId },
    });
  };

  return {
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
  };
}
