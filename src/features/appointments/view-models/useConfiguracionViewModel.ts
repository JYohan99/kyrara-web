import { pickSquareImageAsBase64 } from "@/core/services/imagePickerService";
import {
  isCurrentDeviceSubscribed,
  registerForPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/core/services/notificationService";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  fetchBusiness,
  updateBusiness,
  updateBusinessSettings,
} from "../api";
import { Business } from "../models";

export const OPCIONES_INTERVALO = [15, 30, 45, 60];

// ============================================================================
// VIEW MODEL: CONFIGURACIÓN DEL NEGOCIO Y NOTIFICACIONES
// ============================================================================

export function useConfiguracionViewModel() {
  // --------------------------------------------------------------------------
  // ESTADOS PRINCIPALES DE CARGA Y DATOS
  // --------------------------------------------------------------------------
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del perfil de la barbería
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Estado del interruptor de notificación (5 min antes del turno)
  const [notifyUpcoming, setNotifyUpcoming] = useState(true);

  // Estado del interruptor de alertas por WhatsApp al barbero
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  // Estado de si este dispositivo específico tiene la suscripción push activa en el navegador
  const [isDeviceSubscribed, setIsDeviceSubscribed] = useState(false);

  // Estado de si las notificaciones están bloqueadas en el navegador
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // --------------------------------------------------------------------------
  // CARGA INICIAL DE DATOS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsPermissionDenied(Notification.permission === "denied");
    }

    isCurrentDeviceSubscribed().then((active) => {
      setIsDeviceSubscribed(active);
    });

    fetchBusiness()
      .then((data) => {
        setBusiness(data.business);
        setName(data.business.name);
        setPhone(data.business.phone ?? "");
        setAddress(data.business.address ?? "");
        setLogoBase64(data.business.logo_base64);

        // Si notify_upcoming_appointments es 0 o false está apagado, por defecto encendido (1)
        const isNotifyActive =
          data.business.notify_upcoming_appointments !== 0 &&
          data.business.notify_upcoming_appointments !== false;
        setNotifyUpcoming(isNotifyActive);

        // Si notify_whatsapp es 0 o false está apagado, por defecto encendido (1)
        const isWhatsAppActive =
          data.business.notify_whatsapp !== 0 &&
          data.business.notify_whatsapp !== false;
        setNotifyWhatsApp(isWhatsAppActive);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // --------------------------------------------------------------------------
  // ACCIONES: SELECCIÓN DE LOGO
  // --------------------------------------------------------------------------
  const pickLogo = async () => {
    const res = await pickSquareImageAsBase64();
    if (res.error) {
      setError(res.error);
      return;
    }
    if (!res.cancelled && res.base64) {
      setLogoBase64(res.base64);
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: GUARDAR DATOS DEL PERFIL
  // --------------------------------------------------------------------------
  const handleSaveInfo = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusiness({
        name,
        phone,
        address,
        logo_base64: logoBase64 ?? undefined,
      });
      setBusiness(updated);
      Alert.alert("Éxito", "La información de tu barbería se guardó correctamente.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: MODO DE RESERVA (AUTO O APROBACIÓN)
  // --------------------------------------------------------------------------
  const handleSelectMode = async (mode: "auto" | "approval") => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({ booking_mode: mode });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: INTERVALO DE TURNOS (15, 30, 45, 60 MIN)
  // --------------------------------------------------------------------------
  const handleSelectInterval = async (minutes: number) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings({
        slot_step_minutes: minutes,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: ACTIVAR / DESACTIVAR AVISO 5 MIN ANTES DEL TURNO
  // --------------------------------------------------------------------------
  const handleToggleNotifyUpcoming = async (value: boolean) => {
    setNotifyUpcoming(value);
    try {
      const updated = await updateBusinessSettings({
        notify_upcoming_appointments: value ? 1 : 0,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
      setNotifyUpcoming(!value); // Revertir en caso de error
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: ACTIVAR / DESACTIVAR ALERTAS POR WHATSAPP AL BARBERO
  // --------------------------------------------------------------------------
  const handleToggleNotifyWhatsApp = async (value: boolean) => {
    setNotifyWhatsApp(value);
    try {
      const updated = await updateBusinessSettings({
        notify_whatsapp: value ? 1 : 0,
      });
      setBusiness(updated);
    } catch (e: any) {
      setError(e.message);
      setNotifyWhatsApp(!value); // Revertir en caso de error
    }
  };

  // --------------------------------------------------------------------------
  // ACCIONES: NOTIFICACIONES PUSH
  // --------------------------------------------------------------------------
  const [syncingToken, setSyncingToken] = useState(false);

  const handleSyncPushToken = async () => {
    setSyncingToken(true);
    try {
      if (isDeviceSubscribed) {
        const res = await unsubscribeFromPushNotifications();
        if (res.success) {
          setIsDeviceSubscribed(false);
          try {
            const fresh = await fetchBusiness();
            setBusiness(fresh.business);
          } catch {}

          Alert.alert(
            "Notificaciones Desactivadas",
            "Este dispositivo ya no recibirá notificaciones flotantes de nuevas citas."
          );
        } else {
          Alert.alert(
            "Configuración de Notificaciones",
            res.error || "No se pudieron desactivar las notificaciones en este dispositivo."
          );
        }
      } else {
        const res = await registerForPushNotifications();
        if (res.success) {
          setIsDeviceSubscribed(true);
          try {
            const fresh = await fetchBusiness();
            setBusiness(fresh.business);
          } catch {}

          Alert.alert(
            "¡Dispositivo Vinculado!",
            "Este dispositivo (iPhone / Navegador) ha quedado registrado con éxito para recibir alertas Web Push cuando entren nuevas citas."
          );
        } else {
          Alert.alert(
            "Configuración de Notificaciones",
            res.error || "Asegúrate de permitir las notificaciones en tu navegador."
          );
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Ocurrió un error al cambiar la configuración de notificaciones.");
    } finally {
      if (typeof window !== "undefined" && "Notification" in window) {
        setIsPermissionDenied(Notification.permission === "denied");
      }
      setSyncingToken(false);
    }
  };

  return {
    business,
    isWebPushActive: !!business?.web_push_subscription,
    isDeviceSubscribed,
    isPermissionDenied,
    loading,
    saving,
    error,
    name,
    phone,
    address,
    logoBase64,
    notifyUpcoming,
    notifyWhatsApp,
    syncingToken,
    setName,
    setPhone,
    setAddress,
    pickLogo,
    handleSaveInfo,
    handleSelectMode,
    handleSelectInterval,
    handleToggleNotifyUpcoming,
    handleToggleNotifyWhatsApp,
    handleSyncPushToken,
  };
}
