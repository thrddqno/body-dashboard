import type { PlannedWorkout } from "@/types/plannedWorkout";
import { weeklyPlans } from "@/features/workouts/weeklyPlans";
import { parseLocalDate } from "@/utils/dates";

export function getPlannedWorkout(date: string): PlannedWorkout {
  const localDate = parseLocalDate(date);
  const dayOfWeek = localDate.getDay();
  return weeklyPlans[dayOfWeek];
}
