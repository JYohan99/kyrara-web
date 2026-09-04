import { Palette } from "@/constants/theme";
import { Service } from "@/features/services/models";

export type { Service };

/**
 * Modelo de datos del negocio (Barbería).
 */
export type Business = {
  id: string;
  name: string;
  phone: string;
  address: string;
  booking_mode: "auto" | "approval";
  timezone: string;
  slot_step_minutes: number;
  logo_base64: string | null;
  /**
   * Indica si está activa la notificación de alerta 5 minutos antes de cada turno.
   */
  notify_upcoming_appointments?: number | boolean;
};

/**
 * Modelo de una cita / reserva.
 */
export type Appointment = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
};

export type AvailableSlotsResponse = {
  slots: string[];
  duration_minutes: number;
};

export type DisplayStatus = {
  label: string;
  color: string;
  textColor?: string;
};

export function getDisplayStatus(
  date: string,
  startTime: string,
  endTime: string,
  status: string,
): DisplayStatus {
  if (status === "CANCELLED") return { label: "Cancelada", color: Palette.errorDark, textColor: Palette.error };
  if (status === "PENDING_APPROVAL")
    return { label: "Pendiente", color: "#452600", textColor: Palette.warningLight };
  if (status === "NO_SHOW") return { label: "No asistió", color: "#2B2D31", textColor: Palette.textMuted };
  if (status === "COMPLETED")
    return { label: "Completada", color: "#003828", textColor: Palette.successLight };

  const now = new Date();
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  if (now >= start && now < end) {
    return { label: "En proceso", color: Palette.primaryDark, textColor: Palette.primaryLight };
  }
  if (now >= end) {
    return { label: "Completada", color: "#003828", textColor: Palette.successLight };
  }
  return { label: "Confirmada", color: Palette.secondaryDark, textColor: Palette.secondaryLight };
}
