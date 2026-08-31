export interface BodyMetric {
  id: number;
  date: string;
  weightKg: number;
  waistCm: number | null;
  bodyFatPercentage: number | null;
  createdAt: string;
}

export interface BodyMetricRequest {
  date: string;
  weightKg: number;
  waistCm?: number | null;
  bodyFatPercentage?: number | null;
}
