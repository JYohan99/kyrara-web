import { useCallback, useEffect, useState } from "react";
import { fetchStatistics } from "../api";
import { DailyPoint, PeriodType, StatisticsData } from "../models";

export function formatCurrency(amount: number): string {
  // Formatear en moneda local (ej: $ 33.050)
  const formatted = new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `$ ${formatted}`;
}

export function useEstadisticasViewModel() {
  const [period, setPeriodState] = useState<PeriodType>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomRangeInput, setShowCustomRangeInput] = useState(false);

  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<DailyPoint | null>(null);

  const loadData = useCallback(
    async (
      targetPeriod: PeriodType = period,
      tStart?: string,
      tEnd?: string,
      isRefresh = false
    ) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchStatistics({
          period: targetPeriod,
          startDate: targetPeriod === "custom" ? (tStart || customStart) : undefined,
          endDate: targetPeriod === "custom" ? (tEnd || customEnd) : undefined,
        });
        setData(result);
        if (targetPeriod === "custom") {
          setCustomStart(result.currentRange.startDate);
          setCustomEnd(result.currentRange.endDate);
        }

        // Si había un día seleccionado, actualizarlo con los nuevos datos
        if (selectedDay) {
          const match = result.dailyReservations.find((d) => d.date === selectedDay.date);
          setSelectedDay(match || null);
        } else if (result.peakDayInfo) {
          const peak = result.dailyReservations.find((d) => d.date === result.peakDayInfo?.date);
          if (peak) setSelectedDay(peak);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar las estadísticas");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, customStart, customEnd, selectedDay]
  );

  useEffect(() => {
    loadData(period);
  }, [period]);

  const selectPeriod = (newPeriod: PeriodType) => {
    if (newPeriod === "custom") {
      setShowCustomRangeInput(true);
      setPeriodState("custom");
    } else {
      setShowCustomRangeInput(false);
      setPeriodState(newPeriod);
    }
  };

  const applyCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPeriodState("custom");
    loadData("custom", start, end);
  };

  const onRefresh = () => {
    loadData(period, customStart, customEnd, true);
  };

  return {
    period,
    selectPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    showCustomRangeInput,
    setShowCustomRangeInput,
    applyCustomRange,
    data,
    loading,
    refreshing,
    error,
    onRefresh,
    selectedDay,
    setSelectedDay,
    formatCurrency,
  };
}
