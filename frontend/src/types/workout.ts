export type WorkoutStatus = "PLANNED" | "COMPLETED" | "MISSED";

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number | null;
  warmup: boolean;
}

export interface WorkoutExercise {
  id: number;
  exerciseName: string;
  orderIndex: number;
  sets: ExerciseSet[];
}

export interface Workout {
  id: number;
  date: string;
  workoutType: string;
  status: WorkoutStatus;
  notes: string | null;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummary {
  id: number;
  date: string;
  workoutType: string;
  status: WorkoutStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSetRequest {
  setNumber: number;
  weightKg: number;
  reps: number;
  rir?: number | null;
  warmup?: boolean | null;
}

export interface WorkoutExerciseRequest {
  exerciseName: string;
  orderIndex: number;
  sets?: ExerciseSetRequest[] | null;
}

export interface WorkoutRequest {
  date: string;
  workoutType: string;
  status: WorkoutStatus;
  notes?: string | null;
  exercises?: WorkoutExerciseRequest[] | null;
}

export interface WorkoutStatusUpdateRequest {
  status: WorkoutStatus;
}
