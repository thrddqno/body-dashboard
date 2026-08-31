import { requestJson, toJsonBody } from "@/api/httpClient";
import type {
  Workout,
  WorkoutRequest,
  WorkoutStatus,
} from "@/types/workout";

export function listWorkouts(signal?: AbortSignal): Promise<Workout[]> {
  return requestJson<Workout[]>("/workouts", { signal });
}

export function getWorkout(id: string, signal?: AbortSignal): Promise<Workout> {
  return requestJson<Workout>(`/workouts/${id}`, { signal });
}

export function createWorkout(request: WorkoutRequest): Promise<Workout> {
  return requestJson<Workout>("/workouts", {
    method: "POST",
    body: toJsonBody(request),
  });
}

export function updateWorkoutStatus(
  id: string,
  status: WorkoutStatus,
): Promise<Workout> {
  return requestJson<Workout>(`/workouts/${id}/status`, {
    method: "PATCH",
    body: toJsonBody({ status }),
  });
}
