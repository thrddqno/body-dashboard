export interface SetFormValue {
  key: string;
  weightKg: string;
  reps: string;
  rir: string;
  warmup: boolean;
}

export interface ExerciseFormValue {
  key: string;
  exerciseName: string;
  sets: SetFormValue[];
}
