import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { WorkoutDetail } from "@/features/workouts/components/WorkoutDetail";
import { getWorkout, updateWorkoutStatus } from "@/api/workoutsApi";
import type { Workout, WorkoutStatus } from "@/types/workout";

export function WorkoutDetailPage() {
  const { id = "" } = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [statusError, setStatusError] = useState<string>();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  return (
    <main className="space-y-6">
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--green)] hover:underline">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} />
        Back to workouts
      </Link>
      {isLoading ? <LoadingState label="Loading workout" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && workout ? (
        <WorkoutDetail
          workout={workout}
          isUpdatingStatus={isUpdatingStatus}
          statusError={statusError}
          onStatusChange={handleStatusChange}
        />
      ) : null}
    </main>
  );
}
