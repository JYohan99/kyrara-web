import { Platform } from "react-native";

// URL de producción — el backend corriendo en Render, disponible siempre,
// sin depender de que tu PC esté prendida.
const PRODUCTION_URL = "https://kyrara-backend.onrender.com";

// Si en algún momento querés volver a apuntar al backend local para
// desarrollar sin gastar el pool de conexiones de producción, cambiá esto a true.
const USE_LOCAL = false;

const LAN_IP = "192.168.1.13"; // tu IP local, para pruebas en iPhone físico si USE_LOCAL = true

function resolveLocalUrl(): string {
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  if (Platform.OS === "web") return "http://localhost:3000";
  return `http://${LAN_IP}:3000`;
}

export const API_BASE_URL = USE_LOCAL ? resolveLocalUrl() : PRODUCTION_URL;
