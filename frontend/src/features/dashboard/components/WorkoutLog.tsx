import { Link } from "react-router-dom";

import { WorkoutList } from "@/features/workouts/components/WorkoutList";
import type { Workout } from "@/types/workout";

interface WorkoutLogProps {
  workouts: Workout[];
}

export function WorkoutLog({ workouts }: WorkoutLogProps) {
  return (
    <section className="pt-11" aria-labelledby="workout-log-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workout log</p>
          <h2 id="workout-log-title" className="section-title mt-2">Recorded sessions</h2>
        </div>
        <Link to="/workouts" className="button-secondary mobile-optional">Manage workouts</Link>
      </div>
      <div className="mt-6">
        {workouts.length === 0 ? (
          <p className="border-b border-[var(--line)] py-6 text-sm text-[var(--muted)]">No workouts reported.</p>
        ) : (
          <WorkoutList workouts={workouts} />
        )}
      </div>
    </section>
  );
}
