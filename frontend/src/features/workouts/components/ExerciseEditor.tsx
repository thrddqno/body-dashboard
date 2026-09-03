import { FieldError } from "@/components/FieldError";
import { SetEditor } from "@/features/workouts/components/SetEditor";
import type { SetFormValue } from "@/features/workouts/workoutFormTypes";

interface ExerciseEditorProps {
  exerciseIndex: number;
  value: {
    exerciseName: string;
    sets: SetFormValue[];
  };
  fieldErrors: Record<string, string>;
  onExerciseNameChange: (value: string) => void;
  onAddSet: () => void;
  onCopyLastSet: () => void;
  onChangeSet: (
    setKey: string,
    field: "weightKg" | "reps" | "rir" | "warmup",
    value: string | boolean,
  ) => void;
  onRemoveSet: (setKey: string) => void;
  onRemoveExercise: () => void;
}

export function ExerciseEditor({
  exerciseIndex,
  value,
  fieldErrors,
  onExerciseNameChange,
  onAddSet,
  onCopyLastSet,
  onChangeSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseEditorProps) {
  const inputId = `workout-exercise-${exerciseIndex}-name`;
  const errorId = `${inputId}-error`;
  const error = fieldErrors[`exercises[${exerciseIndex}].exerciseName`];

  const setCount = value.sets.length;
  const hasSets = setCount > 0;

  return (
    <section className="rounded-[8px] border border-[var(--panel-border)] bg-[var(--card)] p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
            <label htmlFor={inputId} className="form-label">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Exercise name
              </span>

              <input
                id={inputId}
                type="text"
                value={value.exerciseName}
                onChange={(event) => onExerciseNameChange(event.target.value)}
                placeholder="Incline Dumbbell Press"
                className="form-control mt-2 font-normal"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                required
              />
            </label>

            <FieldError id={errorId} message={error} />
        </div>

        <button
          type="button"
          onClick={onRemoveExercise}
          aria-label="Remove exercise"
          title="Remove exercise"
          className="
            mb-1
            shrink-0
            rounded-[6px]
            px-2
            py-1
            text-xs
            font-medium
            text-[var(--rose)]
            transition
            hover:bg-[var(--high-bg)]
        ">
          ×
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          Sets
        </span>

        <span className="text-xs text-[var(--muted)]">
          {setCount} {setCount === 1 ? "set" : "sets"}
        </span>
      </div>

      <div className="mt-2">
        {hasSets ? (
          <div className="rounded-[8px] border border-[var(--line)]">
            {value.sets.map((set, setIndex) => (
              <div
                key={set.key}
                className="
                  border-b
                  border-[var(--line)]
                  last:border-b-0
                "
              >
                <SetEditor
                  exerciseIndex={exerciseIndex}
                  setIndex={setIndex}
                  value={set}
                  fieldErrors={fieldErrors}
                  onChange={(field, nextValue) =>
                    onChangeSet(set.key, field, nextValue)
                  }
                  onRemove={() => onRemoveSet(set.key)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--line)] px-4 py-4 text-sm text-[var(--muted)]">
            No sets added.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAddSet}
          className="button-secondary gap-1.5"
        >
          <span aria-hidden="true">+</span>
          Add set
        </button>

        <button
          type="button"
          onClick={onCopyLastSet}
          disabled={!hasSets}
          className="button-secondary"
        >
          Copy last set
        </button>
      </div>
    </section>
  );
}
