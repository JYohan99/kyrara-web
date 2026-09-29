import { API_BASE_URL } from "@/config/api";
import { Service } from "./models";

export type { Service };

export async function listServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE_URL}/services`);
  if (!res.ok) throw new Error("No se pudieron cargar los servicios");
  return res.json();
}

export async function createService(data: {
  name: string;
  duration_minutes: number;
  price?: number;
}): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear el servicio");
  return res.json();
}

export async function updateService(
  id: string,
  data: { name?: string; duration_minutes?: number; price?: number },
): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo editar el servicio");
  return res.json();
}

export async function toggleServiceActive(id: string): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services/${id}/toggle-active`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("No se pudo cambiar el estado del servicio");
  return res.json();
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("No se pudo eliminar el servicio");
  }
}

