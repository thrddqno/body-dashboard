import type { PlannedExercise } from "@/types/plannedWorkout";

interface PlannedExerciseCardProps {
  exercise: PlannedExercise;
}

export function PlannedExerciseCard({ exercise }: PlannedExerciseCardProps) {
  const details: string[] = [];

  if (exercise.sets != null && exercise.reps) {
    details.push(`${exercise.sets} × ${exercise.reps}`);
  }

  if (exercise.rir) {
    details.push(`RIR ${exercise.rir}`);
  }

  if (exercise.rest) {
    details.push(`Rest: ${exercise.rest}`);
  }

  return (
    <div className="rounded-[8px] border border-[var(--panel-border)] bg-[var(--card)] p-5">
      <h4 className="font-serif-display text-lg font-medium text-[var(--ink)]">
        {exercise.name}
      </h4>
      <div className="mt-3 space-y-1">
        {details.map((detail) => (
          <p key={detail} className="text-sm font-bold text-[var(--ink)]">
            {detail}
          </p>
        ))}
      </div>
      {exercise.notes ? (
        <p className="mt-3 text-sm leading-5 text-[var(--muted)]">
          {exercise.notes}
        </p>
      ) : null}
    </div>
  );
}
