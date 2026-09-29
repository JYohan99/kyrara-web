import { fetchBusiness } from "@/features/appointments/api";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import {
  fetchWhatsAppStatus,
  getWhatsAppQRUrl,
  logoutWhatsApp,
  requestPairingCode,
} from "../api";
import { WhatsAppStatus } from "../models";

// ============================================================================
// VIEW MODEL: CONEXIÓN Y ESTADO DE WHATSAPP
// ============================================================================

function showAlert(title: string, message?: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(`${title}${message ? `\n\n${message}` : ""}`);
  } else {
    Alert.alert(title, message);
  }
}

// Cache en memoria a nivel de módulo para evitar parpadeos visuales al navegar
let cachedWhatsAppStatus: WhatsAppStatus | null = null;
let cachedPhone = "";

export function prefetchWhatsAppStatus() {
  fetchWhatsAppStatus()
    .then((s) => {
      cachedWhatsAppStatus = s;
    })
    .catch(() => {});
}

export function useWhatsAppViewModel() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(cachedWhatsAppStatus);
  const [loading, setLoading] = useState(cachedWhatsAppStatus === null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Formulario y código
  const [countryCode, setCountryCode] = useState("598");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");
  const [qrUrl, setQrUrl] = useState<string>(getWhatsAppQRUrl());

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = async () => {
    try {
      const s = await fetchWhatsAppStatus();
      cachedWhatsAppStatus = s;
      setStatus(s);
    } catch {}
  };

  // --------------------------------------------------------------------------
  // CARGA INICIAL Y DATOS DEL NEGOCIO
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Cargar estado inicial de WhatsApp
    loadStatus().finally(() => setLoading(false));

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // POLLING PERIÓDICO DEL ESTADO MIENTRAS NO ESTÉ CONECTADO
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (status?.status === "open") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(() => {
      loadStatus();
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status?.status]);

  // --------------------------------------------------------------------------
  // GENERAR CÓDIGO DE 8 DÍGITOS
  // --------------------------------------------------------------------------
  const handleGeneratePairingCode = async () => {
    let cleanLocal = phoneNumber.replace(/[^0-9]/g, "");
    let cleanCountry = countryCode.replace(/[^0-9]/g, "") || "598";

    // Si el usuario en Uruguay ingresa 09X XXX XXX (9 dígitos empezando en 0), quitamos el 0 inicial
    if (cleanLocal.startsWith("0") && cleanLocal.length === 9) {
      cleanLocal = cleanLocal.slice(1);
    }
    // Si el usuario por error volvió a incluir el código de país en el número local
    if (cleanLocal.startsWith(cleanCountry)) {
      cleanLocal = cleanLocal.slice(cleanCountry.length);
    }

    const fullNumber = `${cleanCountry}${cleanLocal}`;

    if (cleanLocal.length < 7 || fullNumber.length < 9) {
      showAlert(
        "Número incompleto",
        "Por favor ingresa tu número de celular (ej. 099 123 456)."
      );
      return;
    }

    setGeneratingCode(true);
    setPairingCode(null);

    try {
      const res = await requestPairingCode(fullNumber);
      if (res.code) {
        setPairingCode(res.code);
      }
    } catch (err: any) {
      showAlert(
        "Aviso de vinculación",
        err.message || "El servicio está reconectando con WhatsApp. Espera 3 segundos y presiona el botón nuevamente."
      );
    } finally {
      setGeneratingCode(false);
    }
  };

  // --------------------------------------------------------------------------
  // COPIAR EL CÓDIGO AL PORTAPAPELES
  // --------------------------------------------------------------------------
  const handleCopyCode = async () => {
    if (!pairingCode) return;
    try {
      await Clipboard.setStringAsync(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      if (Platform.OS === "android") {
        ToastAndroid.show("¡Código copiado al portapapeles!", ToastAndroid.SHORT);
      }
    } catch {
      // Si falla el portapapeles nativo
    }
  };

  // --------------------------------------------------------------------------
  // DESVINCULAR SESIÓN DE WHATSAPP
  // --------------------------------------------------------------------------
  const executeLogout = async () => {
    setDisconnecting(true);
    try {
      await logoutWhatsApp();
      setPairingCode(null);
      cachedWhatsAppStatus = null;
      await loadStatus();
    } catch {
      showAlert("Error", "No se pudo desconectar la sesión.");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleLogout = () => {
    const confirmMessage =
      "¿Seguro que deseas desconectar el bot de WhatsApp? Dejará de responder mensajes automáticos hasta que lo vincules de nuevo.";

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        executeLogout();
      }
      return;
    }

    Alert.alert("Desvincular WhatsApp", confirmMessage, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desconectar",
        style: "destructive",
        onPress: executeLogout,
      },
    ]);
  };

  const refreshQr = () => {
    setQrUrl(getWhatsAppQRUrl());
  };

  const isConnected = status?.status === "open";

  return {
    status,
    loading,
    generatingCode,
    disconnecting,
    countryCode,
    setCountryCode,
    phoneNumber,
    setPhoneNumber,
    phone: phoneNumber,
    setPhone: setPhoneNumber,
    pairingCode,
    copied,
    activeTab,
    setActiveTab,
    qrUrl,
    refreshQr,
    isConnected,
    handleGeneratePairingCode,
    handleCopyCode,
    handleLogout,
    refreshStatus: loadStatus,
  };
}
