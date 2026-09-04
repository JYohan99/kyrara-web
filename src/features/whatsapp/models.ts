/**
 * Modelos de datos y estados para la integración con WhatsApp (Baileys).
 */
export interface WhatsAppStatus {
  status: "open" | "connecting" | "close";
  isRegistered: boolean;
  hasQR: boolean;
  qr?: string | null;
}
