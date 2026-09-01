export interface PlannedExercise {
  name: string;
  sets?: number;
  reps?: string;
  rir?: string;
  rest?: string;
  notes?: string;
}

export interface PlannedWorkout {
  type: "workout" | "rest";
  title: string;
  subtitle: string;
  warmup: string[];
  exercises: PlannedExercise[];
  guardrails: string[];
  optional?: string[];
}

export interface TrainingPlan extends PlannedWorkout {
  date: string;
  dayOfWeek: string;
  workoutType: "PUSH" | "PULL" | "LEGS" | "REST" | "UPPER" | "LOWER";
}
