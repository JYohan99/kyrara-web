import {
  addDaysToDateString,
  formatDateLabel,
  getTodayDateString,
} from "@/core/utils/date";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  cancelAppointment,
  completeAppointment,
  listAppointments,
  markAppointmentNoShow,
  respondAppointment,
} from "../api";
import { Appointment, getDisplayStatus } from "../models";

export function useReservasViewModel() {
  const router = useRouter();
  const [date, setDate] = useState(getTodayDateString());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listAppointments(date)
      .then(setAppointments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const goToPreviousDay = () => {
    setDate((d) => addDaysToDateString(d, -1));
  };

  const goToNextDay = () => {
    setDate((d) => addDaysToDateString(d, 1));
  };

  const goToToday = () => {
    setDate(getTodayDateString());
  };

  const isToday = date === getTodayDateString();
  const dateFormattedLabel = formatDateLabel(date);

  const handleCancelAppointment = (a: Appointment) => {
    Alert.alert(
      "Cancelar reserva",
      `¿Cancelar la reserva de ${a.customer_name}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            await cancelAppointment(a.id);
            load();
          },
        },
      ],
    );
  };

  const handleBadgePress = (item: Appointment) => {
    if (item.status === "PENDING_APPROVAL") {
      Alert.alert(
        "Reserva pendiente",
        `${item.customer_name || "Cliente"} — ${item.service_name} a las ${item.start_time}`,
        [
          { text: "Cerrar", style: "cancel" },
          {
            text: "Rechazar",
            style: "destructive",
            onPress: async () => {
              await respondAppointment(item.id, "reject");
              load();
            },
          },
          {
            text: "Aceptar",
            onPress: async () => {
              await respondAppointment(item.id, "accept");
              load();
            },
          },
        ],
      );
      return;
    }

    if (item.status === "CONFIRMED") {
      Alert.alert(
        "Gestionar turno",
        `${item.customer_name || "Cliente"} — ${item.service_name} (${item.start_time})`,
        [
          { text: "Volver", style: "cancel" },
          {
            text: "✅ Finalizar Servicio",
            onPress: async () => {
              await completeAppointment(item.id);
              load();
            },
          },
          {
            text: "🚫 Marcar No Presentado",
            style: "destructive",
            onPress: async () => {
              await markAppointmentNoShow(item.id);
              load();
            },
          },
        ],
      );
    }
  };

  const navigateToNuevaReserva = () => {
    router.push("/reservas/nueva");
  };

  return {
    date,
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
  };
}
