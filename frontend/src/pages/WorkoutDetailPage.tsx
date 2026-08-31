import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { WorkoutDetail } from "@/features/workouts/components/WorkoutDetail";
import { WorkoutForm } from "@/features/workouts/components/WorkoutForm";
import { getWorkout, updateWorkoutStatus, updateWorkout } from "@/api/workoutsApi";
import type { Workout, WorkoutStatus, WorkoutRequest } from "@/types/workout";

export function WorkoutDetailPage() {
  const { id = "" } = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [statusError, setStatusError] = useState<string>();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkout() {
      setIsLoading(true);
      setError(undefined);

      try {
        setWorkout(await getWorkout(id, controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load workout.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadWorkout();

    return () => controller.abort();
  }, [id]);

  async function handleStatusChange(status: WorkoutStatus) {
    setIsUpdatingStatus(true);
    setStatusError(undefined);

    try {
      setWorkout(await updateWorkoutStatus(id, status));
    } catch (updateError) {
      setStatusError(updateError instanceof Error ? updateError.message : "Unable to update workout status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function startEdit() {
    setIsEditing(true);
    setFormError(undefined);
    setFieldErrors({});
  }

  function cancelEdit() {
    setIsEditing(false);
    setFormError(undefined);
    setFieldErrors({});
  }

  async function handleFormSubmit(request: WorkoutRequest) {
    setIsSubmitting(true);
    setFormError(undefined);
    setFieldErrors({});

    try {
      const updated = await updateWorkout(id, request);
      setWorkout(updated);
      setIsEditing(false);
      return true;
    } catch (updateError) {
      if (updateError instanceof Error && "fieldErrors" in updateError) {
        const apiError = updateError as Error & { fieldErrors: Record<string, string> };
        setFormError(apiError.message);
        setFieldErrors(apiError.fieldErrors);
        return false;
      }

      setFormError(updateError instanceof Error ? updateError.message : "Unable to update workout.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const canEdit = workout != null && workout.status !== "COMPLETED";

  return (
    <main className="space-y-6">
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--green)] hover:underline">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} />
        Back to workouts
      </Link>
      {isLoading ? <LoadingState label="Loading workout" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && workout ? (
        isEditing ? (
          <div className="space-y-4">
            <button type="button" onClick={cancelEdit} className="button-secondary">
              Cancel edit
            </button>
            <WorkoutForm
              initialDate={workout.date}
              isSubmitting={isSubmitting}
              fieldErrors={fieldErrors}
              formError={formError}
              onSubmit={handleFormSubmit}
              initialWorkoutType={workout.workoutType}
              initialStatus={workout.status}
              initialNotes={workout.notes ?? undefined}
              initialExercises={workout.exercises.map((exercise) => ({
                key: String(exercise.id),
                exerciseName: exercise.exerciseName,
                sets: exercise.sets.map((set) => ({
                  key: String(set.id),
                  weightKg: String(set.weightKg),
                  reps: String(set.reps),
                  rir: set.rir != null ? String(set.rir) : "",
                  warmup: set.warmup,
                })),
              }))}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {canEdit ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={startEdit}
                  className="button-secondary"
                >
                  Edit workout
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Completed workouts cannot be edited.
              </p>
            )}
            <WorkoutDetail
              workout={workout}
              isUpdatingStatus={isUpdatingStatus}
              statusError={statusError}
              onStatusChange={handleStatusChange}
            />
          </div>
        )
      ) : null}
    </main>
  );
}
