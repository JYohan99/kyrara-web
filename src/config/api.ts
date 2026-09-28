import { Platform } from "react-native";

// Backend de producción — utilizado por el barbero en la barbería real
const PRODUCTION_BACKEND_URL = "https://kyrara-backend.onrender.com";

// Backend de desarrollo y pruebas — corre en Render conectado a la BD de pruebas
const DEV_BACKEND_URL = "https://kyrara-backend-dev.onrender.com";

// Si deseas apuntar al backend ejecutándose en tu propia PC, cambia esto a true.
const USE_LOCAL = false;

const LAN_IP = "192.168.1.13"; // IP local para pruebas en iPhone físico si USE_LOCAL = true

function resolveLocalUrl(): string {
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  if (Platform.OS === "web") return "http://localhost:3000";
  return `http://${LAN_IP}:3000`;
}

function resolveCloudUrl(): string {
  // 1. Variable de entorno explícita (si se configura en Vercel)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Detección automática en navegador según el dominio
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname.toLowerCase();
    // Si la web está en una preview de Vercel (rama develop), o dominio dev/staging
    if (
      host.includes("develop") ||
      host.includes("-dev") ||
      host.includes("preview") ||
      host.includes("staging")
    ) {
      return DEV_BACKEND_URL;
    }
  }

  // 3. Producción por defecto (la web oficial del barbero)
  return PRODUCTION_BACKEND_URL;
}

export const API_BASE_URL = USE_LOCAL ? resolveLocalUrl() : resolveCloudUrl();

