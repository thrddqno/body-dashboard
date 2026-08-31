export interface WeeklyAnalytics {
  period: {
    start: string;
    end: string;
  };
  body: {
    latestWeightKg: number | null;
    weightChangeKg: number | null;
  };
  recovery: {
    averageSleepHours: number | null;
    averageSteps: number | null;
  };
  training: {
    completedWorkouts: number;
    missedWorkouts: number;
    adherencePercentage: number | null;
  };
}
