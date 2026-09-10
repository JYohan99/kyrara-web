import { API_BASE_URL } from "@/config/api";
import { Service } from "@/features/services/models";
import {
  Appointment,
  AvailableSlotsResponse,
  Business,
} from "./models";

export type { Appointment, AvailableSlotsResponse, Business, Service };

/**
 * Consulta la información del negocio y sus servicios asociados.
 */
export async function fetchBusiness(): Promise<{
  business: Business;
  services: Service[];
}> {
  const url = `${API_BASE_URL}/appointments/business`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`Status ${res.status}: ${text}`);
  return JSON.parse(text);
}

/**
 * Consulta la lista de citas agendadas para una fecha específica.
 */
export async function listAppointments(date: string): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE_URL}/appointments?date=${date}`);
  if (!res.ok) throw new Error("No se pudo cargar la agenda");
  return res.json();
}

/**
 * Obtiene los horarios libres disponibles para un servicio y fecha.
 */
export async function getAvailableSlots(
  date: string,
  serviceId: string,
): Promise<AvailableSlotsResponse> {
  const res = await fetch(
    `${API_BASE_URL}/appointments/available-slots?date=${date}&service_id=${serviceId}`,
  );
  if (!res.ok)
    throw new Error("No se pudieron cargar los horarios disponibles");
  return res.json();
}

/**
 * Crea manualmente una cita desde la aplicación.
 */
export async function createAppointment(data: {
  customer_id: string;
  service_id: string;
  date: string;
  start_time: string;
}): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, created_via: "manual" }),
  });
  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.error || "Ese horario ya no está disponible");
  }
  if (!res.ok) throw new Error("No se pudo crear la reserva");
  return res.json();
}

/**
 * Cancela una reserva existente.
 */
export async function cancelAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("No se pudo cancelar la reserva");
}

/**
 * Marca una reserva como completada.
 */
export async function completeAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/complete`, {
    method: "PATCH",
  });
  if (res.ok) return;

  const fallback = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  if (!fallback.ok) {
    throw new Error("No se pudo marcar la cita como completada en el servidor");
  }
}

/**
 * Actualiza la configuración operativa del negocio (intervalos, modo de reserva y recordatorios).
 */
export async function updateBusinessSettings(data: {
  slot_step_minutes?: number;
  booking_mode?: "auto" | "approval";
  notify_upcoming_appointments?: number | boolean;
  notify_whatsapp?: number | boolean;
}): Promise<Business> {
  const res = await fetch(`${API_BASE_URL}/appointments/business/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la configuración");
  return res.json();
}

/**
 * Actualiza los datos de perfil del negocio (nombre, teléfono, dirección y logo).
 */
export async function updateBusiness(data: {
  name?: string;
  phone?: string;
  address?: string;
  logo_base64?: string;
}): Promise<Business> {
  const res = await fetch(`${API_BASE_URL}/appointments/business`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el negocio");
  return res.json();
}

/**
 * Acepta o rechaza una solicitud de cita en modo aprobación.
 */
export async function respondAppointment(
  id: string,
  decision: "accept" | "reject",
) {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) throw new Error("No se pudo responder la reserva");
  return res.json();
}
