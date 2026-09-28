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
  // 1. Detección en navegador según el dominio actual (prioridad en frontend)
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname.toLowerCase();

    // Si estamos en localhost o IP local
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
      return DEV_BACKEND_URL;
    }

    // Indicadores explícitos de entorno de desarrollo / preview / git branch
    const isExplicitPreview =
      host.includes("develop") ||
      host.includes("-dev") ||
      host.includes("preview") ||
      host.includes("staging") ||
      host.includes("-git-");

    if (isExplicitPreview) {
      return DEV_BACKEND_URL;
    }

    // Dominios oficiales de PRODUCCIÓN (donde opera el barbero con datos reales)
    const isOfficialProductionDomain =
      host === "kyrara-app.vercel.app" ||
      host === "kyrara-web.vercel.app" ||
      host === "kyrara.vercel.app";

    // En Vercel: si es cualquier otro subdominio *.vercel.app (por ejemplo un hash de despliegue como kyrara-app-8x...vercel.app),
    // es un preview deployment y debe usar el backend de DEV para no afectar al barbero.
    if (!isOfficialProductionDomain && host.endsWith(".vercel.app")) {
      return DEV_BACKEND_URL;
    }

    if (isOfficialProductionDomain) {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // 2. Variable de entorno explícita (si se configuró para un build específico en Vercel)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 3. Producción por defecto (para compilación de producción del barbero)
  return PRODUCTION_BACKEND_URL;
}

export const API_BASE_URL = USE_LOCAL ? resolveLocalUrl() : resolveCloudUrl();

export const IS_DEV_MODE = API_BASE_URL === DEV_BACKEND_URL;

if (typeof window !== "undefined") {
  console.log(
    `[Kyrara] Backend: ${API_BASE_URL} | Modo: ${
      IS_DEV_MODE ? "DESARROLLO / PRUEBAS" : "PRODUCCIÓN"
    }`
  );
}

