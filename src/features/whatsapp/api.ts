import { API_BASE_URL } from "@/config/api";
import { WhatsAppStatus } from "./models";

export type { WhatsAppStatus };

/**
 * Consulta el estado de conexión actual del socket de WhatsApp en el backend.
 */
export async function fetchWhatsAppStatus(): Promise<WhatsAppStatus> {
  const res = await fetch(`${API_BASE_URL}/whatsapp/status`);
  if (!res.ok) {
    throw new Error(`Error consultando estado de WhatsApp (${res.status})`);
  }
  return res.json();
}

/**
 * Solicita al backend un código de vinculación de 8 dígitos para un número de teléfono.
 */
export async function requestPairingCode(phone: string): Promise<{ success: boolean; code: string; phone: string }> {
  const res = await fetch(`${API_BASE_URL}/whatsapp/pairing-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "No se pudo generar el código de vinculación.");
  }
  return data;
}

/**
 * Cierra la sesión activa de WhatsApp y borra las credenciales de la base de datos.
 */
export async function logoutWhatsApp(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/whatsapp/logout`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("No se pudo cerrar la sesión de WhatsApp.");
  }
}

/**
 * Genera la URL para obtener la imagen PNG nítida del código QR.
 */
export function getWhatsAppQRUrl(): string {
  return `${API_BASE_URL}/whatsapp/qr?t=${Date.now()}`;
}
