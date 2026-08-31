import type { BodyMetric } from "@/types/bodyMetric";
import type { DailyLog } from "@/types/dailyLog";
import type { Workout, WorkoutSummary } from "@/types/workout";

export interface DashboardResponse {
  today: {
    date: string;
    dailyLog: DailyLog | null;
  };
  body: {
    currentWeightKg: number | null;
    targetWeightKg: number;
    weightRemainingKg: number | null;
    recentMetrics: BodyMetric[];
  };
  training: {
    latestWorkout: WorkoutSummary | null;
    completedThisWeek: number;
    missedThisWeek: number;
  };
}

export interface CalendarWorkoutGroup {
  date: string;
  workouts: Workout[];
}
