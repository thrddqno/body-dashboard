import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { Workout } from "@/types/workout";
import { parseLocalDate } from "@/utils/dates";
import { formatNullableText } from "@/utils/formatters";

interface WorkoutListProps {
  workouts: Workout[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <EmptyState
        title="No workouts recorded"
        description="Your workout history appears here after the first logged session."
      />
    );
  }

  const newestFirst = [...workouts].sort((left, right) =>
    right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt),
  );

  return (
    <div className="border-t border-[var(--ink)]/20">
      {newestFirst.map((workout) => {
        const date = parseLocalDate(workout.date);
        const exerciseCount = workout.exercises.length;
        const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
        const isRest = workout.workoutType.trim().toUpperCase() === "REST";

        return (
          <Link
              key={workout.id}
              to={`/workouts/${workout.id}`}
              className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--line)] px-2 py-5 transition-colors duration-[180ms] last:border-b-0 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--green)] sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:px-3"
            >
            <div className="border-r border-[var(--line)] pr-4 text-center">
              <p className="text-[9px] font-black uppercase text-[var(--muted)]">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="font-serif-display mt-1 text-3xl leading-none text-[var(--orange)]">
                {date.getDate()}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase text-[var(--muted)]">
                {date.toLocaleDateString(undefined, { month: "short" })}
              </p>
            </div>

            <div className="min-w-0">
              <h3 className="font-serif-display text-xl font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                {workout.workoutType}
              </h3>
              <p className="mobile-optional mt-1 truncate text-xs text-[var(--muted)]">{formatNullableText(workout.notes)}</p>
              <p className="mt-2 text-[10px] font-black uppercase text-[var(--muted)]">
                {isRest
                  ? "Recovery day · No exercises required"
                  : `${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"} · ${setCount} set${setCount === 1 ? "" : "s"} logged`}
              </p>
              {workout.status === "MISSED" ? (
                <p className="mt-2 text-xs font-bold text-[var(--rose)]">Missed, not training debt.</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <StatusBadge status={workout.status} />
              <ChevronRight aria-hidden="true" size={18} className="text-[var(--muted)] transition-transform duration-[180ms] group-hover:translate-x-1 group-hover:text-[var(--green)]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
