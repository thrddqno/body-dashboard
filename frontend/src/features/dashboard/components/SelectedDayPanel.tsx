import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import type { Workout } from "@/types/workout";
import { formatFullDateString } from "@/utils/formatters";

interface SelectedDayPanelProps {
  selectedDate: string;
  workouts: Workout[];
}

export function SelectedDayPanel({ selectedDate, workouts }: SelectedDayPanelProps) {
  return (
    <section className="panel p-6">
      <p className="eyebrow">
        Selected Day
      </p>
            <div className="flex items-center justify-between gap-4">
      <h2 className="font-serif-display mt-2 text-3xl font-medium text-[var(--ink)]">
        {formatFullDateString(selectedDate)}
      </h2>
      <Link
        to={`/daily-log/${selectedDate}`}
        className="button-secondary shrink-0"
      >
          View daily log
      </Link>
      </div>

 
      <div className="mt-6 space-y-4">
        {workouts.length === 0 ? (
          <EmptyState
            title="No workout logged"
            description="No completed, planned, or missed workout was reported for this date. This does not imply a rest or recovery day."
            action={
              <Link
                to="/workouts"
                className="button-primary"
              >
                Log a workout
              </Link>
            }
          />
        ) : null}
        {workouts.length > 0 ? <WorkoutList workouts={workouts} /> : null}
      </div>
    </section>
  );
}
