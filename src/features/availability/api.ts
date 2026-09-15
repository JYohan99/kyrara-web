import { API_BASE_URL } from "@/config/api";
import { AvailabilityBlock, AvailabilityException } from "./models";

export type { AvailabilityBlock, AvailabilityException };

export async function listAvailability(): Promise<AvailabilityBlock[]> {
  const res = await fetch(`${API_BASE_URL}/availability`);
  if (!res.ok) throw new Error("No se pudieron cargar los horarios");
  return res.json();
}

export async function createAvailability(data: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}): Promise<AvailabilityBlock> {
  const res = await fetch(`${API_BASE_URL}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear el horario");
  return res.json();
}

export async function toggleAvailabilityActive(
  id: string,
): Promise<AvailabilityBlock> {
  const res = await fetch(`${API_BASE_URL}/availability/${id}/toggle-active`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("No se pudo cambiar el estado");
  return res.json();
}

export async function deleteAvailability(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/availability/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204)
    throw new Error("No se pudo eliminar el horario");
}

export async function listExceptions(): Promise<AvailabilityException[]> {
  const res = await fetch(`${API_BASE_URL}/availability/exceptions`);
  if (!res.ok) throw new Error("No se pudieron cargar las excepciones");
  return res.json();
}

export async function createException(data: {
  date: string;
  closed_all_day: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string;
}): Promise<AvailabilityException> {
  const res = await fetch(`${API_BASE_URL}/availability/exceptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear la excepción");
  return res.json();
}

export async function deleteException(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/availability/exceptions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204)
    throw new Error("No se pudo eliminar la excepción");
}
