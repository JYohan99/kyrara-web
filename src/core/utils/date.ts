export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string): string {
  if (dateStr === getTodayDateString()) return "Hoy";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatFullDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const formatted = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getTimeRemainingText(
  date: string,
  startTime: string,
  endTime: string,
  status?: string,
): string {
  if (status === "COMPLETED") {
    return "Finalizado";
  }
  if (status === "CANCELLED" || status === "NO_SHOW") {
    return "";
  }

  const now = new Date();
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  if (now >= start && now < end) {
    const diffMins = Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000));
    return `Quedan ${diffMins} min`;
  }
  if (now < start) {
    const diffMins = Math.round((start.getTime() - now.getTime()) / 60000);
    if (diffMins < 60) {
      return `En ${diffMins} min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `En ${hours}h ${mins}m` : `En ${hours}h`;
  }
  return "Finalizado";
}
