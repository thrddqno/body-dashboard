import { requestJson } from "@/api/httpClient";
import type { TrainingPlan } from "@/types/plannedWorkout";

export function getTrainingPlan(
  date: string,
  signal?: AbortSignal,
  workoutType?: string,
): Promise<TrainingPlan> {
  const query = workoutType ? `?workoutType=${encodeURIComponent(workoutType)}` : "";
  return requestJson<TrainingPlan>(`/training-plans/${date}${query}`, { signal });
}
