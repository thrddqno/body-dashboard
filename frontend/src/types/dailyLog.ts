export type EnergyLevel =
  | "VERY_LOW"
  | "LOW"
  | "AVERAGE"
  | "HIGH"
  | "VERY_HIGH";

export interface DailyLog {
  id: number;
  date: string;
  sleepMinutes: number | null;
  steps: number | null;
  energy: EnergyLevel | null;
  painNotes: string | null;
  recoveryNotes: string | null;
  estimatedCalories: number | null;
  estimatedProteinGrams: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLogRequest {
  sleepMinutes?: number | null;
  steps?: number | null;
  energy?: EnergyLevel | null;
  painNotes?: string | null;
  recoveryNotes?: string | null;
  estimatedCalories?: number | null;
  estimatedProteinGrams?: number | null;
}
