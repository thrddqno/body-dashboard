import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { Workout } from "@/types/workout";
import { formatFullDateString, formatMetricValue, formatNullableText } from "@/utils/formatters";

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
      <h2 className="font-serif-display mt-2 text-3xl font-medium text-[var(--ink)]">
        {formatFullDateString(selectedDate)}
      </h2>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          Workout records only. Daily check-ins remain separate.
        </p>
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
        {workouts.map((workout) => (
          <article key={workout.id} className="border-t border-[var(--ink)] py-5 first:mt-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-serif-display text-xl font-medium text-[var(--ink)]">{workout.workoutType}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {workout.exercises.length} exercise{workout.exercises.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={workout.status} />
                <Link
                  to={`/workouts/${workout.id}`}
                  className="text-sm font-bold text-[var(--green)] hover:underline"
                >
                  Open workout
                </Link>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{formatNullableText(workout.notes)}</p>
            {workout.status === "MISSED" ? (
              <p className="mt-3 rounded-[8px] bg-[#f3ded7] px-3 py-2 text-xs font-bold text-[var(--rose)]">
                Missed and not completed. This session is not training debt.
              </p>
            ) : null}
            <div className="mt-5 space-y-4">
              {workout.exercises.length === 0 ? <p className="text-sm text-[var(--muted)]">No exercise details reported.</p> : null}
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="border-t border-dashed border-[var(--line)] pt-4">
                  <p className="font-bold text-[var(--ink)]">{exercise.exerciseName}</p>
                  <div className="mt-3 space-y-2">
                    {exercise.sets.length === 0 ? <p className="text-sm text-[var(--muted)]">No sets reported.</p> : null}
                    {exercise.sets.map((set) => (
                      <div key={set.id} className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                        <span>Set {set.setNumber}</span>
                        <span>{formatMetricValue(set.weightKg, "kg")}</span>
                        <span>{set.reps} reps</span>
                        <span>{set.rir == null ? "RIR not recorded" : `RIR ${set.rir}`}</span>
                        <span>{set.warmup ? "Warm-up" : "Working set"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
