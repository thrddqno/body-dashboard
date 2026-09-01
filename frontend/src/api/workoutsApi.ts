import { requestJson, toJsonBody } from "@/api/httpClient";
import type {
  Workout,
  WorkoutPage,
  WorkoutRequest,
  WorkoutStatus,
} from "@/types/workout";

export function listWorkouts(signal?: AbortSignal): Promise<Workout[]> {
  return requestJson<Workout[]>("/workouts", { signal });
}

export function listWorkoutsByDateRange(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<Workout[]> {
  const query = new URLSearchParams({ from, to });
  return requestJson<Workout[]>(`/workouts?${query}`, { signal });
}

export function listWorkoutPage(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<WorkoutPage> {
  return requestJson<WorkoutPage>(`/workouts/page?page=${page}&size=${pageSize}`, { signal });
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

export function updateWorkout(
  id: string,
  request: WorkoutRequest,
): Promise<Workout> {
  return requestJson<Workout>(`/workouts/${id}`, {
    method: "PUT",
    body: toJsonBody(request),
  });
}
