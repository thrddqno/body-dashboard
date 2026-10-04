export interface PlannedExercise {
  name: string;
  sets?: number;
  setPrescription?: string;
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
  workoutType:
    | "UPPER_A"
    | "LOWER_A"
    | "REST"
    | "UPPER_B"
    | "LOWER_B"
    | "FULLBODY"
    | "PUSH"
    | "PULL"
    | "LEGS"
    | "UPPER"
    | "LOWER";
}
