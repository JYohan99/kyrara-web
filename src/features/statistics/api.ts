import { API_BASE_URL } from "@/config/api";
import { PeriodType, StatisticsData } from "./models";

/**
 * Consulta las métricas comerciales, comparaciones y gráficos del negocio.
 */
export async function fetchStatistics(params: {
  period: PeriodType;
  startDate?: string;
  endDate?: string;
}): Promise<StatisticsData> {
  const query = new URLSearchParams();
  query.append("period", params.period);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  const res = await fetch(`${API_BASE_URL}/appointments/statistics?${query.toString()}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error cargando estadísticas (${res.status}): ${errorText}`);
  }

  return res.json();
}
