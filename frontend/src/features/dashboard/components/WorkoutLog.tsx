import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/StatusBadge";
import type { Workout } from "@/types/workout";
import { formatCompactDateString, formatMetricValue, formatNullableText } from "@/utils/formatters";

interface WorkoutLogProps {
  workouts: Workout[];
}

export function WorkoutLog({ workouts }: WorkoutLogProps) {
  const newestFirst = [...workouts].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <section className="pt-11" aria-labelledby="workout-log-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workout log</p>
          <h2 id="workout-log-title" className="section-title mt-2">Recorded sessions</h2>
        </div>
        <Link to="/workouts" className="button-secondary mobile-optional">Manage workouts</Link>
      </div>
      <div className="mt-6 border-t border-[var(--ink)]">
        {newestFirst.length === 0 ? (
          <p className="border-b border-[var(--line)] py-6 text-sm text-[var(--muted)]">No workouts reported.</p>
        ) : null}
        {newestFirst.map((workout) => (
          <details key={workout.id} className="group border-b border-[var(--line)]">
            <summary className="grid cursor-pointer list-none gap-4 px-2 py-6 sm:grid-cols-[90px_1fr_auto] sm:items-center">
              <div>
                <p className="font-serif-display text-2xl leading-none text-[var(--orange)]">{formatCompactDateString(workout.date)}</p>
                <p className="mobile-optional mt-2 text-[10px] font-black uppercase text-[var(--muted)]">Duration not reported</p>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--ink)]">{workout.workoutType}</h3>
                <p className="mobile-optional mt-2 truncate text-xs text-[var(--muted)]">{formatNullableText(workout.notes)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={workout.status} />
                <span aria-hidden="true" className="text-lg text-[var(--muted)] transition-transform duration-200 group-open:rotate-90">›</span>
              </div>
            </summary>
            <div className="pb-6 pl-2 sm:pl-[106px]">
              {workout.status === "MISSED" ? (
                <p className="mb-4 rounded-[8px] bg-[var(--high-bg)] px-3 py-2 text-xs font-bold text-[var(--rose)]">
                  Missed and not completed. Do not stack or double this session.
                </p>
              ) : null}
              <p className="mb-4 text-sm leading-6 text-[var(--muted)]">{formatNullableText(workout.notes)}</p>
              {workout.exercises.length === 0 ? <p className="text-sm text-[var(--muted)]">No exercise details reported.</p> : null}
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="grid gap-2 border-t border-dashed border-[var(--line)] py-3 md:grid-cols-[1fr_2fr]">
                  <p className="font-bold text-[var(--ink)]">{exercise.exerciseName}</p>
                  <div className="space-y-2 text-xs text-[var(--muted)]">
                    {exercise.sets.length === 0 ? <p>No sets reported.</p> : null}
                    {exercise.sets.map((set) => (
                      <p key={set.id}>
                        Set {set.setNumber} · {formatMetricValue(set.weightKg, "kg")} · {set.reps} reps · {set.rir == null ? "RIR not reported" : `RIR ${set.rir}`} · {set.warmup ? "Warm-up" : "Working set"}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <Link to={`/workouts/${workout.id}`} className="button-secondary mt-4">Open workout</Link>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
