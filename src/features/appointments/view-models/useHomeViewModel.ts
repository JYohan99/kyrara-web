import {
  formatFullDateLabel,
  getTodayDateString,
  getTimeRemainingText,
} from "@/core/utils/date";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { completeAppointment, fetchBusiness, listAppointments } from "../api";
import { Appointment, Business, getDisplayStatus, Service } from "../models";

export function useHomeViewModel() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const todayStr = getTodayDateString();
  const todayDateLabel = formatFullDateLabel(todayStr);

  const load = useCallback(() => {
    const today = getTodayDateString();
    Promise.all([
      fetchBusiness(),
      listAppointments(today).catch(() => [] as Appointment[]),
    ])
      .then(([businessData, appointments]) => {
        setBusiness(businessData.business);
        setServices(businessData.services);
        setTodayAppointments(appointments);

        // Citas no canceladas ni ausentes
        const validAppointments = appointments.filter(
          (a) => a.status !== "CANCELLED" && a.status !== "NO_SHOW",
        );

        // Citas pendientes que aún no han sido completadas
        const pendingAppointments = validAppointments.filter(
          (a) => a.status !== "COMPLETED",
        );

        const now = new Date();

        // 1. Buscar si hay una cita en el rango de hora actual (incluso si está completada)
        const currentSlotApp = validAppointments.find((a) => {
          const start = new Date(`${a.date}T${a.start_time}:00`);
          const end = new Date(`${a.date}T${a.end_time}:00`);
          return now >= start && now < end;
        });

        if (currentSlotApp) {
          setActiveAppointment(currentSlotApp);
          setUpcomingAppointments(
            pendingAppointments.filter(
              (a) => a.id !== currentSlotApp.id && a.start_time >= currentSlotApp.start_time,
            ),
          );
        } else {
          // 2. Si no hay cita en curso en este momento exacto, tomar la próxima cita pendiente
          const nextUpcoming =
            pendingAppointments.find((a) => {
              const end = new Date(`${a.date}T${a.end_time}:00`);
              return now < end;
            }) || pendingAppointments[0];

          if (nextUpcoming) {
            setActiveAppointment(nextUpcoming);
            setUpcomingAppointments(
              pendingAppointments.filter(
                (a) => a.id !== nextUpcoming.id && a.start_time >= nextUpcoming.start_time,
              ),
            );
          } else {
            // 3. Si no hay citas pendientes, mantener la última completada si existe
            const lastCompleted = validAppointments
              .filter((a) => a.status === "COMPLETED")
              .pop();

            setActiveAppointment(lastCompleted ?? null);
            setUpcomingAppointments([]);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteAppointment = useCallback(
    async (appointment: Appointment) => {
      Alert.alert(
        "Finalizar Servicio",
        `¿Deseas marcar como completado el servicio de ${appointment.customer_name || "este cliente"}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Finalizar",
            style: "default",
            onPress: async () => {
              try {
                setCompleting(true);
                await completeAppointment(appointment.id);
                // Actualizar inmediatamente estado local para reflejar "Completada" en el acto
                setActiveAppointment((prev) =>
                  prev && prev.id === appointment.id
                    ? { ...prev, status: "COMPLETED" }
                    : prev,
                );
                setTodayAppointments((prev) =>
                  prev.map((a) =>
                    a.id === appointment.id ? { ...a, status: "COMPLETED" } : a,
                  ),
                );
                load();
              } catch (e: any) {
                Alert.alert("Error", e.message || "No se pudo finalizar el servicio");
              } finally {
                setCompleting(false);
              }
            },
          },
        ],
      );
    },
    [load],
  );

  const handleAdvanceToNextAppointment = useCallback(() => {
    if (upcomingAppointments.length > 0) {
      const next = upcomingAppointments[0];
      setActiveAppointment(next);
      setUpcomingAppointments((prev) => prev.filter((a) => a.id !== next.id));
    } else {
      setActiveAppointment(null);
    }
  }, [upcomingAppointments]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return {
    business,
    services,
    todayAppointments,
    activeAppointment,
    upcomingAppointments,
    todayDateLabel,
    todayCount: todayAppointments.filter((a) => a.status !== "CANCELLED").length,
    error,
    loading,
    completing,
    refresh: load,
    handleCompleteAppointment,
    handleAdvanceToNextAppointment,
    getDisplayStatus,
    getTimeRemainingText,
  };
}
