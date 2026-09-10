import { API_BASE_URL } from "@/config/api";
import { Platform } from "react-native";

export type PushRegistrationResult = {
  success: boolean;
  token?: string;
  error?: string;
  isIosInstructionNeeded?: boolean;
};

/**
 * Convierte una clave VAPID pública en base64 a BufferSource requerido por el navegador.
 */
function urlB64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as unknown as BufferSource;
}

/**
 * Detecta si el dispositivo actual es un iPhone / iPad.
 */
export function isIos(): boolean {
  if (typeof window === "undefined" || !navigator) return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detecta si la web se está ejecutando instalada como PWA (pantalla completa).
 */
export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

/**
 * Registra silenciosamente el Service Worker de Kyrara en segundo plano.
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("/sw.js");
    console.log("[ServiceWorker] /sw.js registrado exitosamente.");
  } catch (err) {
    console.warn("[ServiceWorker] No se pudo registrar /sw.js:", err);
  }
}

/**
 * Solicita permisos de notificación al usuario y suscribe el dispositivo a Web Push (VAPID).
 */
export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Entorno no compatible con navegador." };
  }

  // 1. Verificación para iPhone (iOS)
  if (isIos() && !isPwaInstalled()) {
    return {
      success: false,
      isIosInstructionNeeded: true,
      error:
        "Para recibir alertas en tu iPhone:\n\n1. Toca el botón Compartir de Safari (ícono con flecha arriba).\n2. Selecciona 'Agregar a pantalla de inicio'.\n3. Abre la app desde tu pantalla de inicio y activa las alertas.",
    };
  }

  // 2. Verificar soporte de Service Worker y Push
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return {
      success: false,
      error:
        "Tu navegador no tiene habilitadas las notificaciones Web Push. Asegúrate de usar Safari, Chrome o Edge actualizado.",
    };
  }

  // 3. Solicitar permiso explícito al usuario
  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return {
      success: false,
      error: "Permiso de notificaciones denegado en el navegador.",
    };
  }

  try {
    // 4. Asegurar que el Service Worker esté registrado y listo
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }
    await navigator.serviceWorker.ready;

    // 5. Obtener la clave pública VAPID del backend
    const vapidRes = await fetch(`${API_BASE_URL}/appointments/business/vapid-public-key`);
    if (!vapidRes.ok) {
      throw new Error("No se pudo obtener la clave VAPID pública del servidor.");
    }
    const { publicKey } = await vapidRes.json();
    if (!publicKey) {
      throw new Error("El servidor no tiene configurada una clave VAPID pública.");
    }

    // 6. Suscribir el navegador al Push Service de Apple / Google
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey),
      });
    }

    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;

    // 7. Enviar la suscripción al backend de Kyrara
    const saveRes = await fetch(`${API_BASE_URL}/appointments/business/web-push-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subJson }),
    });

    if (!saveRes.ok) {
      throw new Error(`El servidor respondió con código ${saveRes.status} al guardar suscripción.`);
    }

    console.log("[WebPush] Suscripción registrada y guardada exitosamente en el backend.");
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("[WebPush] Error al registrar notificaciones:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Comprueba si este dispositivo o navegador específico ya tiene una suscripción activa local.
 */
export async function isCurrentDeviceSubscribed(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub && Notification.permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Dispara una alerta de prueba dual desde el servidor (Web Push + WhatsApp).
 */
export async function sendTestLocalNotification(title: string, body: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Disparar endpoint de prueba del servidor (Web Push a la pantalla + WhatsApp al teléfono)
    const res = await fetch(`${API_BASE_URL}/appointments/business/test-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Error del servidor HTTP ${res.status}`);
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    console.error("[TestPush] Error enviando prueba:", err);
    throw err;
  }
}
