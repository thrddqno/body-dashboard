import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createWorkout, listWorkouts } from "@/api/workoutsApi";
import { ApiError } from "@/api/httpClient";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { WorkoutForm } from "@/features/workouts/components/WorkoutForm";
import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import type { Workout, WorkoutRequest } from "@/types/workout";
import { formatDateInputValue } from "@/utils/dates";

export function WorkoutsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function loadWorkouts() {
    setIsLoading(true);
    setError(undefined);

    try {
      setWorkouts(await listWorkouts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load workouts.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialWorkouts() {
      try {
        setWorkouts(await listWorkouts());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load workouts.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialWorkouts();
  }, []);

  async function handleCreateWorkout(request: WorkoutRequest): Promise<boolean> {
    setIsSubmitting(true);
    setFormError(undefined);
    setFieldErrors({});

    try {
      const workout = await createWorkout(request);
      await loadWorkouts();
      navigate(`/workouts/${workout.id}`);
      return true;
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFormError(submitError.message);
        setFieldErrors(submitError.fieldErrors);
        return false;
      }

      setFormError(submitError instanceof Error ? submitError.message : "Unable to save workout.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Workouts"
        title="Workout log"
        description="Record the scheduled day, then add exercise details only when they apply. Existing records are read-only except for status."
      />
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-8">
        <WorkoutForm
          initialDate={formatDateInputValue(new Date())}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleCreateWorkout}
        />
        <section>
          <p className="eyebrow">History</p>
          <h2 className="section-title mt-2">Recorded days</h2>
          <div className="mt-6 space-y-4">
            {isLoading ? <LoadingState label="Loading workouts" /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!isLoading && !error ? <WorkoutList workouts={workouts} /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
