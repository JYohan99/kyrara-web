import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  createService,
  deleteService,
  listServices,
  toggleServiceActive,
  updateService,
} from "../api";
import { Service } from "../models";

export function useServiciosViewModel() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listServices()
      .then(setServices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDuration("");
    setPrice("");
    setModalVisible(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setName(service.name);
    setDuration(String(service.duration_minutes));
    setPrice(service.price ? String(service.price) : "");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !duration.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        duration_minutes: Number(duration),
        price: price.trim() ? Number(price) : undefined,
      };
      if (editing) {
        await updateService(editing.id, payload);
      } else {
        await createService(payload);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (service: Service) => {
    try {
      await toggleServiceActive(service.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const requestDelete = (service: Service) => {
    setModalVisible(false);
    setServiceToDelete(service);
  };

  const cancelDelete = () => {
    setServiceToDelete(null);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await deleteService(serviceToDelete.id);
      setServiceToDelete(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = (service: Service) => {
    requestDelete(service);
  };

  return {
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
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
