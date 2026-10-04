import { Link } from "react-router-dom";

import { PlannedWorkoutView } from "@/features/workouts/components/PlannedWorkoutView";
import { RestDayView } from "@/features/workouts/components/RestDayView";
import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import type { TrainingPlan } from "@/types/plannedWorkout";
import type { Workout } from "@/types/workout";
import { formatFullDateString } from "@/utils/formatters";

interface SelectedDayPanelProps {
  today?: string;
  selectedDate: string;
  workouts: Workout[];
  plan?: TrainingPlan | null;
  planError?: string;
}

export function SelectedDayPanel({
  today,
  selectedDate,
  workouts,
  plan,
  planError,
}: SelectedDayPanelProps) {
  const hasWorkouts = workouts.length > 0;
  const plannedWorkout = workouts
    .filter((workout) => workout.status === "PLANNED")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  return (
    <section className="panel p-6">
      <p className="eyebrow">Selected Day</p>
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
        {planError ? <p className="text-sm text-[var(--danger)]">{planError}</p> : null}
        {!plan && !planError ? <p className="text-sm text-[var(--muted)]">Loading training plan...</p> : null}
        {hasWorkouts ? (
          <>
            <WorkoutList workouts={workouts} />

            {plan && plannedWorkout && plan.type !== "rest" && (
              <PlannedWorkoutView
                date={selectedDate}
                plan={plan}
                plannedWorkoutId={plannedWorkout.id}
                canSavePng={selectedDate === today}
              />
            )}

            {plan?.type === "rest" && plannedWorkout && (
              <RestDayView date={selectedDate} plan={plan} />
            )}

          </>
        ) : plan?.type === "rest" ? (
          <RestDayView date={selectedDate} plan={plan} />
        ) : plan ? (
          <PlannedWorkoutView date={selectedDate} plan={plan} />
        ) : null}
      </div>
    </section>
  );
}
