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
    activeTargetKg: number;
    weightRemainingKg: number | null;
    goal: {
      baselineDate: string;
      baselineWeightKg: number;
      stage1TargetKg: number;
      stage2MinKg: number;
      stage2MaxKg: number;
      calorieTargetKcal: number;
      estimatedMaintenanceMinKcal: number;
      estimatedMaintenanceMaxKcal: number;
      minWeightLossKgPerWeek: number;
      maxWeightLossKgPerWeek: number;
    };
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
