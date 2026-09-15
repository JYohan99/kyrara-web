import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  createAvailability,
  createException,
  deleteAvailability,
  deleteException,
  listAvailability,
  listExceptions,
  toggleAvailabilityActive,
} from "../api";
import { AvailabilityBlock, AvailabilityException } from "../models";

export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function useHorariosViewModel() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blockModal, setBlockModal] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const [excModal, setExcModal] = useState(false);
  const [excDate, setExcDate] = useState("");
  const [excReason, setExcReason] = useState("");
  const [excClosedAllDay, setExcClosedAllDay] = useState(true);
  const [excStartTime, setExcStartTime] = useState("13:00");
  const [excEndTime, setExcEndTime] = useState("15:00");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([listAvailability(), listExceptions()])
      .then(([b, e]) => {
        setBlocks(b);
        setExceptions(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openBlockModal = () => {
    setDayOfWeek(1);
    setStartTime("09:00");
    setEndTime("18:00");
    setBlockModal(true);
  };

  const closeBlockModal = () => {
    setBlockModal(false);
  };

  const handleCreateBlock = async () => {
    try {
      await createAvailability({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });
      setBlockModal(false);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleToggleBlock = async (b: AvailabilityBlock) => {
    try {
      await toggleAvailabilityActive(b.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteBlock = async (b: AvailabilityBlock) => {
    try {
      await deleteAvailability(b.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const openExcModal = () => {
    setExcDate("");
    setExcReason("");
    setExcClosedAllDay(true);
    setExcStartTime("13:00");
    setExcEndTime("15:00");
    setExcModal(true);
  };

  const closeExcModal = () => {
    setExcModal(false);
  };

  const handleCreateException = async () => {
    const trimmedDate = excDate.trim();
    if (!trimmedDate) {
      setError("La fecha es obligatoria");
      return;
    }

    if (!excClosedAllDay) {
      const trimmedStart = excStartTime.trim();
      const trimmedEnd = excEndTime.trim();
      if (!trimmedStart || !trimmedEnd) {
        setError("Las horas de inicio y fin son obligatorias para cierres parciales");
        return;
      }
      if (trimmedStart >= trimmedEnd) {
        setError("La hora de inicio debe ser anterior a la hora de fin");
        return;
      }
    }

    try {
      await createException({
        date: trimmedDate,
        closed_all_day: excClosedAllDay,
        start_time: excClosedAllDay ? null : excStartTime.trim(),
        end_time: excClosedAllDay ? null : excEndTime.trim(),
        reason: excReason.trim() || undefined,
      });
      setExcModal(false);
      setExcDate("");
      setExcReason("");
      setExcClosedAllDay(true);
      setExcStartTime("13:00");
      setExcEndTime("15:00");
      setError(null);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteException = async (exc: AvailabilityException) => {
    try {
      await deleteException(exc.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return {
    blocks,
    exceptions,
    loading,
    error,
    blockModal,
    dayOfWeek,
    startTime,
    endTime,
    excModal,
    excDate,
    excReason,
    excClosedAllDay,
    excStartTime,
    excEndTime,
    setDayOfWeek,
    setStartTime,
    setEndTime,
    setExcDate,
    setExcReason,
    setExcClosedAllDay,
    setExcStartTime,
    setExcEndTime,
    openBlockModal,
    closeBlockModal,
    handleCreateBlock,
    handleToggleBlock,
    handleDeleteBlock,
    openExcModal,
    closeExcModal,
    handleCreateException,
    handleDeleteException,
  };
}
