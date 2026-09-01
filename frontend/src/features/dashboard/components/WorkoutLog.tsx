import { Link } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import { WorkoutPagination } from "@/features/workouts/components/WorkoutPagination";
import type { Workout } from "@/types/workout";

interface WorkoutLogProps {
  workouts: Workout[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
}

export function WorkoutLog({
  workouts,
  page,
  pageSize,
  totalElements,
  totalPages,
  isLoading,
  error,
  onPageChange,
  onPageSizeChange,
  onRetry,
}: WorkoutLogProps) {
  return (
    <section className="pt-11" aria-labelledby="workout-log-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workout log</p>
          <h2 id="workout-log-title" className="section-title mt-2">Recorded sessions</h2>
        </div>
        <Link to="/workouts" className="button-secondary mobile-optional">Manage workouts</Link>
      </div>
      <div className="mt-6 space-y-4">
        {isLoading ? <LoadingState label="Loading recorded sessions" /> : null}
        {error ? (
          <ErrorState
            message={error}
            action={(
              <button type="button" className="button-secondary" onClick={onRetry}>
                Try again
              </button>
            )}
          />
        ) : null}
        {!isLoading && !error && workouts.length === 0 ? (
          <p className="border-b border-[var(--line)] py-6 text-sm text-[var(--muted)]">No workouts reported.</p>
        ) : null}
        {!isLoading && !error && workouts.length > 0 ? (
          <WorkoutList workouts={workouts} />
        ) : null}
        {!error ? (
          <WorkoutPagination
            page={page}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        ) : null}
      </div>
    </section>
  );
}
