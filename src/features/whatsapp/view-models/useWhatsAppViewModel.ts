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

export function useWhatsAppViewModel() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Formulario y código
  const [phone, setPhone] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");
  const [qrUrl, setQrUrl] = useState<string>(getWhatsAppQRUrl());

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = async () => {
    try {
      const s = await fetchWhatsAppStatus();
      setStatus(s);
    } catch {}
  };

  // --------------------------------------------------------------------------
  // CARGA INICIAL Y DATOS DEL NEGOCIO
  // --------------------------------------------------------------------------
  useEffect(() => {
    // 1. Cargar número guardado del negocio si existe
    fetchBusiness()
      .then((data) => {
        if (data.business.phone) {
          const clean = data.business.phone.replace(/[^0-9]/g, "");
          setPhone(clean);
        }
      })
      .catch(() => {});

    // 2. Cargar estado inicial de WhatsApp
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
    let cleanNumber = phone.replace(/[^0-9]/g, "");

    // Auto-formateo inteligente para números de Uruguay:
    // 09X XXX XXX (9 dígitos) -> 5989X XXX XXX
    if (cleanNumber.startsWith("09") && cleanNumber.length === 9) {
      cleanNumber = "598" + cleanNumber.slice(1);
    } else if (cleanNumber.startsWith("9") && cleanNumber.length === 8) {
      // 9X XXX XXX (8 dígitos) -> 5989X XXX XXX
      cleanNumber = "598" + cleanNumber;
    }

    if (cleanNumber.length < 10) {
      Alert.alert(
        "Número incompleto",
        "Por favor ingresa tu número con código de país (ej. 59893927667 o 093927667)."
      );
      return;
    }

    setPhone(cleanNumber);
    setGeneratingCode(true);
    setPairingCode(null);

    try {
      const res = await requestPairingCode(cleanNumber);
      if (res.code) {
        setPairingCode(res.code);
      }
    } catch (err: any) {
      Alert.alert(
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
  const handleLogout = () => {
    Alert.alert(
      "Desvincular WhatsApp",
      "¿Seguro que deseas desconectar el bot de WhatsApp? Dejará de responder mensajes automáticos hasta que lo vincules de nuevo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: async () => {
            setDisconnecting(true);
            try {
              await logoutWhatsApp();
              setPairingCode(null);
              await loadStatus();
            } catch {
              Alert.alert("Error", "No se pudo desconectar la sesión.");
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ]
    );
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
    phone,
    setPhone,
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
