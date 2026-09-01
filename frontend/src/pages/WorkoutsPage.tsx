import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createWorkout, listWorkoutPage } from "@/api/workoutsApi";
import { getTrainingPlan } from "@/api/trainingPlansApi";
import { ApiError } from "@/api/httpClient";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { WorkoutForm } from "@/features/workouts/components/WorkoutForm";
import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import { WorkoutPagination } from "@/features/workouts/components/WorkoutPagination";
import type { Workout, WorkoutRequest } from "@/types/workout";
import type { TrainingPlan } from "@/types/plannedWorkout";
import { formatDateInputValue } from "@/utils/dates";

export function WorkoutsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRequest, setPageRequest] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const planRequest = useRef(0);
  const [initialDate] = useState(() => formatDateInputValue(new Date()));

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkoutPage() {
      setIsLoading(true);
      setError(undefined);

      try {
        const loadedPage = await listWorkoutPage(page, pageSize, controller.signal);
        if (controller.signal.aborted) return;

        if (loadedPage.totalPages > 0 && page >= loadedPage.totalPages) {
          setPage(loadedPage.totalPages - 1);
          return;
        }
        if (loadedPage.totalPages === 0 && page > 0) {
          setPage(0);
          return;
        }

        setWorkouts(loadedPage.workouts);
        setTotalElements(loadedPage.totalElements);
        setTotalPages(loadedPage.totalPages);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load workouts.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadWorkoutPage();
    return () => controller.abort();
  }, [page, pageSize, pageRequest]);

  useEffect(() => {
    async function loadInitialTrainingPlan() {
      try {
        setTrainingPlan(await getTrainingPlan(initialDate));
      } catch (loadError) {
        setFormError(loadError instanceof Error ? loadError.message : "Unable to load training plan.");
      } finally {
        setIsPlanLoading(false);
      }
    }

    void loadInitialTrainingPlan();
  }, [initialDate]);

  async function loadTrainingPlan(date: string) {
    const request = ++planRequest.current;
    setIsPlanLoading(true);
    setTrainingPlan(null);
    setFormError(undefined);
    try {
      const plan = await getTrainingPlan(date);
      if (request === planRequest.current) setTrainingPlan(plan);
    } catch (loadError) {
      if (request === planRequest.current) {
        setTrainingPlan(null);
        setFormError(loadError instanceof Error ? loadError.message : "Unable to load training plan.");
      }
    } finally {
      if (request === planRequest.current) setIsPlanLoading(false);
    }
  }

  async function handleCreateWorkout(request: WorkoutRequest): Promise<boolean> {
    setIsSubmitting(true);
    setFormError(undefined);
    setFieldErrors({});

    try {
      const workout = await createWorkout(request);
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
          initialDate={initialDate}
          isSubmitting={isSubmitting}
          isScheduleLoading={isPlanLoading || trainingPlan == null}
          scheduledWorkoutType={trainingPlan?.workoutType}
          onDateChange={(date) => void loadTrainingPlan(date)}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleCreateWorkout}
        />
        <section>
          <p className="eyebrow">History</p>
          <h2 className="section-title mt-2">Recorded days</h2>
          <div className="mt-6 space-y-4">
            {isLoading ? <LoadingState label="Loading workouts" /> : null}
            {error ? (
              <ErrorState
                message={error}
                action={(
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setPageRequest((request) => request + 1)}
                  >
                    Try again
                  </button>
                )}
              />
            ) : null}
            {!isLoading && !error ? <WorkoutList workouts={workouts} /> : null}
            {!error ? (
              <WorkoutPagination
                page={page}
                pageSize={pageSize}
                totalElements={totalElements}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(0);
                }}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
