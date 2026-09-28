export type PeriodType = "today" | "week" | "month" | "previous_month" | "custom";

export interface PeriodRange {
  startDate: string;
  endDate: string;
  label: string;
  formattedRange: string;
  comparisonSuffix: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  difference: number;
  percentage: number | null;
  direction: "up" | "down" | "equal";
  comparisonText: string;
}

export interface DailyPoint {
  date: string;
  dayLabel: string;
  fullDayName: string;
  dayNumber: number;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  isPeak: boolean;
}

export interface PopularService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  percentage: number;
}

export interface StatisticsData {
  period: PeriodType;
  currentRange: PeriodRange;
  previousRange: PeriodRange;
  metrics: {
    totalReservations: MetricComparison;
    completed: { count: number; rate: number };
    cancelled: { count: number; rate: number };
    noShow: { count: number; rate: number };
    newCustomers: MetricComparison;
    revenue: MetricComparison;
  };
  dailyReservations: DailyPoint[];
  peakDayInfo: {
    dayName: string;
    date: string;
    total: number;
    insight: string;
  } | null;
  popularServices: PopularService[];
  revenueDisclaimer: string;
}
