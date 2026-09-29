export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  active: number;
  is_deleted?: number;
};
