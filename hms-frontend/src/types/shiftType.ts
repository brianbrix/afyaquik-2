export interface ShiftType {
  id: number;
  name: string;
  description?: string | null;
  startTime: string; // ISO time string, e.g. '08:00:00'
  endTime: string;   // ISO time string, e.g. '16:00:00'
}
