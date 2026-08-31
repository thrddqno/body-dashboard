import { useState } from "react";

import { FieldError } from "@/components/FieldError";
import { ExerciseEditor } from "@/features/workouts/components/ExerciseEditor";
import type { WorkoutRequest, WorkoutStatus } from "@/types/workout";
import { parseLocalDate } from "@/utils/dates";
import {
  parseOptionalInteger,
  parseRequiredDecimal,
  parseRequiredInteger,
} from "@/utils/forms";

interface SetFormValue {
  key: string;
  weightKg: string;
  reps: string;
  rir: string;
  warmup: boolean;
}

interface ExerciseFormValue {
  key: string;
  exerciseName: string;
  sets: SetFormValue[];
}

interface WorkoutFormProps {
  initialDate: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  formError?: string;
  onSubmit: (request: WorkoutRequest) => Promise<boolean>;
}

const workoutTypes = ["PUSH", "PULL", "LEGS", "REST", "UPPER", "LOWER"] as const;
type ScheduledWorkoutType = (typeof workoutTypes)[number];

const workoutTypeByDay: Record<number, ScheduledWorkoutType> = {
  0: "LOWER",
  1: "REST",
  2: "PUSH",
  3: "PULL",
  4: "LEGS",
  5: "REST",
  6: "UPPER",
};

function scheduledWorkoutType(date: string): ScheduledWorkoutType {
  return workoutTypeByDay[parseLocalDate(date).getDay()];
}

function createSet(): SetFormValue {
  return {
    key: crypto.randomUUID(),
    weightKg: "",
    reps: "",
    rir: "",
    warmup: false,
  };
}

function createExercise(): ExerciseFormValue {
  return {
    key: crypto.randomUUID(),
    exerciseName: "",
    sets: [createSet()],
  };
}

export function WorkoutForm({
  initialDate,
  isSubmitting,
  fieldErrors,
  formError,
  onSubmit,
}: WorkoutFormProps) {
  const [date, setDate] = useState(initialDate);
  const [workoutType, setWorkoutType] = useState<ScheduledWorkoutType>(() => scheduledWorkoutType(initialDate));
  const [status, setStatus] = useState<WorkoutStatus>("PLANNED");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseFormValue[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saved = await onSubmit({
      date,
      workoutType,
      status,
      notes: notes.trim() ? notes : null,
      exercises: workoutType === "REST" ? [] : exercises.map((exercise, exerciseIndex) => ({
        exerciseName: exercise.exerciseName,
        orderIndex: exerciseIndex + 1,
        sets: exercise.sets.map((set, setIndex) => ({
          setNumber: setIndex + 1,
          weightKg: parseRequiredDecimal(set.weightKg),
          reps: parseRequiredInteger(set.reps),
          rir: parseOptionalInteger(set.rir),
          warmup: set.warmup,
        })),
      })),
    });

    if (saved) {
      setWorkoutType(scheduledWorkoutType(date));
      setStatus("PLANNED");
      setNotes("");
      setExercises([]);
    }
  }

  return (
    <form className="panel overflow-hidden" onSubmit={handleSubmit}>
      <div className="p-6 pb-2">
        <p className="eyebrow">New record</p>
        <h2 className="font-serif-display mt-2 text-3xl font-medium text-[var(--ink)]">Create workout</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
          Log the day first, then add exercise details only when they apply. REST days never require exercises.
        </p>
      </div>

      <fieldset className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Date</span>
          <input type="date" value={date} onChange={(event) => {
            const nextDate = event.target.value;
            setDate(nextDate);
            if (nextDate) setWorkoutType(scheduledWorkoutType(nextDate));
          }} className="form-control mt-2 w-full font-normal" required />
          <FieldError message={fieldErrors.date} />
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Workout type</span>
          <select value={workoutType} onChange={(event) => {
            const nextType = event.target.value as ScheduledWorkoutType;
            setWorkoutType(nextType);
            if (nextType === "REST") setExercises([]);
          }} className="form-control mt-2 w-full font-normal">
            {workoutTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <FieldError message={fieldErrors.workoutType} />
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as WorkoutStatus)} className="form-control mt-2 w-full font-normal">
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
            <option value="MISSED">Missed</option>
          </select>
          <FieldError message={fieldErrors.status} />
        </label>
        <label className="text-sm text-[var(--ink)] md:col-span-2">
        <span className="font-bold">Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="form-control mt-2 w-full resize-y font-normal" placeholder="Optional session notes" />
        </label>
        </div>
      </fieldset>

      <fieldset className="border-t border-[var(--line)] p-6">
        <legend className="sr-only">Exercise details</legend>
        <div>
          <p className="text-sm font-black uppercase text-[var(--ink)]">Exercise details</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Optional. Add only the work you want to record.</p>
        </div>

        {workoutType === "REST" ? (
          <div className="mt-5 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4">
            <p className="font-bold text-[var(--green)]">Scheduled recovery day</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">This record will be saved without exercises and excluded from workout totals and adherence.</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="mt-5 rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
            No exercises added. You can save this workout as-is.
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <ExerciseEditor
            key={exercise.key}
            exerciseIndex={exerciseIndex}
            value={exercise}
            fieldErrors={fieldErrors}
            onExerciseNameChange={(nextValue) =>
              setExercises((current) =>
                current.map((item) =>
                  item.key === exercise.key ? { ...item, exerciseName: nextValue } : item,
                ),
              )
            }
            onAddSet={() =>
              setExercises((current) =>
                current.map((item) =>
                  item.key === exercise.key
                    ? { ...item, sets: [...item.sets, createSet()] }
                    : item,
                ),
              )
            }
            onCopyLastSet={() =>
              setExercises((current) =>
                current.map((item) => {
                  if (item.key !== exercise.key || item.sets.length === 0) return item;

                  const lastSet = item.sets[item.sets.length - 1];
                  return {
                    ...item,
                    sets: [...item.sets, { ...lastSet, key: crypto.randomUUID() }],
                  };
                }),
              )
            }
            onChangeSet={(setKey, field, nextValue) =>
              setExercises((current) =>
                current.map((item) =>
                  item.key === exercise.key
                    ? {
                        ...item,
                        sets: item.sets.map((set) =>
                          set.key === setKey ? { ...set, [field]: nextValue } : set,
                        ),
                      }
                    : item,
                ),
              )
            }
            onRemoveSet={(setKey) =>
              setExercises((current) =>
                current.map((item) =>
                  item.key === exercise.key
                    ? {
                        ...item,
                        sets: item.sets.filter((set) => set.key !== setKey),
                      }
                    : item,
                ),
              )
            }
            onRemoveExercise={() =>
              setExercises((current) => current.filter((item) => item.key !== exercise.key))
            }
          />
        ))}
        </div>
      </fieldset>

      <div className="border-t border-[var(--line)] bg-[var(--paper)] px-6 py-5">
        {formError ? <p className="mb-4 text-sm font-bold text-[var(--rose)]">{formError}</p> : null}
        <div role="group" aria-label="Workout actions" className="flex items-center justify-between gap-4">
          {workoutType !== "REST" ? (
            <button type="button" onClick={() => setExercises((current) => [...current, createExercise()])} className="button-secondary">
              Add exercise
            </button>
          ) : <span />}
          <button type="submit" disabled={isSubmitting} className="button-primary">
            {isSubmitting ? "Saving..." : workoutType === "REST" ? "Save rest day" : "Save workout"}
          </button>
        </div>
      </div>
    </form>
  );
}
