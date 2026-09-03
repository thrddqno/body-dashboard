import { useState } from "react";

import { FieldError } from "@/components/FieldError";
import { ExerciseEditor } from "@/features/workouts/components/ExerciseEditor";
import type { ExerciseFormValue, SetFormValue } from "@/features/workouts/workoutFormTypes";
import type { WorkoutRequest, WorkoutStatus } from "@/types/workout";
import {
  parseOptionalInteger,
  parseRequiredDecimal,
  parseRequiredInteger,
  trimmedStringOrNull,
} from "@/utils/forms";

interface WorkoutFormProps {
  initialDate: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  formError?: string;
  onSubmit: (request: WorkoutRequest) => Promise<boolean>;
  initialWorkoutType?: string;
  initialStatus?: WorkoutStatus;
  initialNotes?: string;
  initialExercises?: ExerciseFormValue[];
  scheduledWorkoutType?: ScheduledWorkoutType;
  isScheduleLoading?: boolean;
  onDateChange?: (date: string) => void;
}

const workoutTypes = ["PUSH", "PULL", "LEGS", "REST", "UPPER", "LOWER"] as const;
type ScheduledWorkoutType = (typeof workoutTypes)[number];

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

function toFormExercises(exercises?: ExerciseFormValue[]): ExerciseFormValue[] {
  if (!exercises) return [];
  return exercises.map((exercise) => ({
    ...exercise,
    key: crypto.randomUUID(),
    sets: exercise.sets.map((set) => ({
      ...set,
      key: crypto.randomUUID(),
    })),
  }));
}

export function WorkoutForm({
  initialDate,
  isSubmitting,
  fieldErrors,
  formError,
  onSubmit,
  initialWorkoutType,
  initialStatus,
  initialNotes,
  initialExercises,
  scheduledWorkoutType,
  isScheduleLoading = false,
  onDateChange,
}: WorkoutFormProps) {
  const isEditing = initialWorkoutType != null;

  const [date, setDate] = useState(initialDate);
  const [workoutTypeOverride, setWorkoutTypeOverride] = useState<ScheduledWorkoutType | null>(null);
  const workoutType = workoutTypeOverride
    ?? (initialWorkoutType as ScheduledWorkoutType | undefined)
    ?? scheduledWorkoutType
    ?? "PUSH";
  const [status, setStatus] = useState<WorkoutStatus>(initialStatus ?? "PLANNED");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [exercises, setExercises] = useState<ExerciseFormValue[]>(() => toFormExercises(initialExercises));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saved = await onSubmit({
      date,
      workoutType,
      status,
      notes: trimmedStringOrNull(notes),
      exercises: workoutType === "REST" ? [] : exercises.map((exercise, exerciseIndex) => ({
        exerciseName: exercise.exerciseName.trim(),
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

    if (saved && !isEditing) {
      setWorkoutTypeOverride(null);
      setStatus("PLANNED");
      setNotes("");
      setExercises([]);
    }
  }

  return (
    <form className="panel overflow-hidden" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="p-4 pb-2 sm:p-6 sm:pb-2">
        <p className="eyebrow">{isEditing ? "Edit record" : "New record"}</p>
        <h2 className="font-serif-display mt-2 text-2xl font-medium text-[var(--ink)]">
          {isEditing ? "Edit workout" : "Create workout"}
        </h2>
        <p className="form-help mt-2 max-w-xl">
          {isEditing
            ? "Update workout details. Exercise content will be fully replaced."
            : "Log the day first, then add exercise details only when they apply. REST days never require exercises."}
        </p>
      </div>

      <fieldset disabled={isSubmitting || isScheduleLoading} className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="workout-date" className="form-label">
              <span className="form-label-text">Date</span>
              <input id="workout-date" type="date" value={date} onChange={(event) => {
                const nextDate = event.target.value;
                setDate(nextDate);
                if (nextDate && !isEditing) {
                  setWorkoutTypeOverride(null);
                  onDateChange?.(nextDate);
                }
              }} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.date)} aria-describedby={fieldErrors.date ? "workout-date-error" : undefined} required />
            </label>
            <FieldError id="workout-date-error" message={fieldErrors.date} />
          </div>
          <div>
            <label htmlFor="workout-type" className="form-label">
              <span className="form-label-text">Workout type</span>
              <select id="workout-type" value={workoutType} onChange={(event) => {
                const nextType = event.target.value as ScheduledWorkoutType;
                setWorkoutTypeOverride(nextType);
                if (nextType === "REST") setExercises([]);
              }} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.workoutType)} aria-describedby={fieldErrors.workoutType ? "workout-type-error" : undefined}>
                {workoutTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <FieldError id="workout-type-error" message={fieldErrors.workoutType} />
          </div>
          <div>
            <label htmlFor="workout-status" className="form-label">
              <span className="form-label-text">Status</span>
              <select id="workout-status" value={status} onChange={(event) => setStatus(event.target.value as WorkoutStatus)} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? "workout-status-error" : undefined}>
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
                <option value="MISSED">Missed</option>
              </select>
            </label>
            <FieldError id="workout-status-error" message={fieldErrors.status} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="workout-notes" className="form-label">
              <span className="form-label-text">Notes</span>
              <textarea id="workout-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="form-control mt-2 resize-y font-normal" placeholder="Optional session notes" aria-invalid={Boolean(fieldErrors.notes)} aria-describedby={fieldErrors.notes ? "workout-notes-error" : undefined} />
            </label>
            <FieldError id="workout-notes-error" message={fieldErrors.notes} />
          </div>
        </div>
      </fieldset>

      <fieldset disabled={isSubmitting || isScheduleLoading} className="border-t border-[var(--line)] p-4 sm:p-6">
        <legend className="sr-only">Exercise details</legend>
        <div>
          <p className="text-sm font-black uppercase text-[var(--ink)]">Exercise details</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Optional. Add only the work you want to record.</p>
        </div>

        {workoutType === "REST" ? (
          <div className="mt-5 rounded-[8px] border border-[var(--panel-border)] bg-[var(--paper)] p-4">
            <p className="font-bold text-[var(--green)]">Scheduled recovery day</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">This record will be saved without exercises and excluded from workout totals and adherence.</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="mt-5 rounded-[8px] border border-dashed border-[var(--panel-border)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
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
        <FieldError id="workout-exercises-error" message={fieldErrors.exercises} />
      </fieldset>

      <div className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-4 sm:px-6 sm:py-5">
        {formError ? <p role="alert" className="form-error mb-4 mt-0">{formError}</p> : null}
        <div role="group" aria-label="Workout actions" className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          {workoutType !== "REST" ? (
            <button type="button" disabled={isSubmitting || isScheduleLoading} onClick={() => setExercises((current) => [...current, createExercise()])} className="button-secondary w-full sm:w-auto">
              Add exercise
            </button>
          ) : null}
          <button type="submit" disabled={isSubmitting || isScheduleLoading} className="button-primary w-full sm:ml-auto sm:w-auto">
            {isSubmitting ? "Saving..." : isEditing ? "Update workout" : workoutType === "REST" ? "Save rest day" : "Save workout"}
          </button>
        </div>
      </div>
    </form>
  );
}
