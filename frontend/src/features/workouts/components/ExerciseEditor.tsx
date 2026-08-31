import { SetEditor } from "@/features/workouts/components/SetEditor";

interface SetFormValue {
  key: string;
  weightKg: string;
  reps: string;
  rir: string;
  warmup: boolean;
}

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
  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <label className="flex-1 text-sm text-[var(--ink)]">
          <span className="font-bold">Exercise name</span>
          <input
            type="text"
            value={value.exerciseName}
            onChange={(event) => onExerciseNameChange(event.target.value)}
            className="form-control mt-2 w-full font-normal"
            required
          />
          {fieldErrors[`exercises[${exerciseIndex}].exerciseName`] ? (
            <p className="mt-1 text-sm text-[var(--rose)]">
              {fieldErrors[`exercises[${exerciseIndex}].exerciseName`]}
            </p>
          ) : null}
        </label>
        <button
          type="button"
          onClick={onRemoveExercise}
          aria-label="Remove exercise"
          title="Remove exercise"
          className="mt-7 inline-grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-[#e3b9ae] bg-white text-xl font-bold leading-none text-[var(--rose)] transition hover:bg-[var(--high-bg)]"
        >
          ×
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {value.sets.map((set, setIndex) => (
          <SetEditor
            key={set.key}
            exerciseIndex={exerciseIndex}
            setIndex={setIndex}
            value={set}
            fieldErrors={fieldErrors}
            onChange={(field, nextValue) => onChangeSet(set.key, field, nextValue)}
            onRemove={() => onRemoveSet(set.key)}
          />
        ))}
      </div>
      {value.sets.length === 0 ? (
        <p className="mt-4 rounded-[8px] border border-dashed border-[var(--line)] bg-white px-4 py-3 text-xs text-[var(--muted)]">
          No sets added. This exercise can still be saved without set details.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={onAddSet} className="button-secondary">
          Add set
        </button>
        <button
          type="button"
          onClick={onCopyLastSet}
          disabled={value.sets.length === 0}
          className="button-secondary"
        >
          Copy last set
        </button>
      </div>
    </div>
  );
}
