import { getTodayDateString } from "@/core/utils/date";
import { Customer, listCustomers } from "@/features/customers";
import { Service, listServices } from "@/features/services";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { createAppointment, getAvailableSlots } from "../api";

export function useNuevaReservaViewModel() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCustomers()
      .then((data) => {
        if (customerId) {
          const match = data.find((c) => c.id === customerId);
          if (match) {
            setSelectedCustomer(match);
            const reordered = [match, ...data.filter((c) => c.id !== customerId)];
            setCustomers(reordered);
            return;
          }
        }
        setCustomers(data);
      })
      .catch((e) => setError(e.message));
    listServices()
      .then(setServices)
      .catch((e) => setError(e.message));
  }, [customerId]);

  useEffect(() => {
    if (!selectedService || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlots(date, selectedService.id)
      .then((res) => setSlots(res.slots))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, date]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedCustomer || !selectedService || !selectedSlot) return;
    setSaving(true);
    setError(null);
    try {
      await createAppointment({
        customer_id: selectedCustomer.id,
        service_id: selectedService.id,
        date,
        start_time: selectedSlot,
      });
      router.back();
    } catch (e: any) {
      setError(e.message);
      // El horario seleccionado puede haber sido tomado por otra reserva (concurrencia)
      // Refrescamos automáticamente los slots disponibles
      if (selectedService) {
        getAvailableSlots(date, selectedService.id)
          .then((res) => setSlots(res.slots))
          .catch(() => {});
      }
    } finally {
      setSaving(false);
    }
  };

  const isConfirmDisabled =
    !selectedCustomer || !selectedService || !selectedSlot || saving;

  return {
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
  };
}
