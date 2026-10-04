import type { PlannedWorkout } from "@/types/plannedWorkout";
import { PlannedExerciseCard } from "@/features/workouts/components/PlannedExerciseCard";
import { WarmupSection } from "@/features/workouts/components/WarmupSection";
import { GuardrailsSection } from "@/features/workouts/components/GuardrailsSection";
import { formatPlanEyebrow } from "@/utils/formatters";
import { Link } from "react-router-dom";

interface PlannedWorkoutViewProps {
  date: string;
  plan: PlannedWorkout;
}

export function PlannedWorkoutView({ date, plan }: PlannedWorkoutViewProps) {
  return (
    <div className="space-y-5 border-t border-[var(--ink)]/20">
      <div className="flex mt-6 items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{formatPlanEyebrow(date)}</p>
          <h3 className="font-serif-display mt-2 text-2xl font-medium text-[var(--ink)]">
            {plan.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{plan.subtitle}</p>
        </div>
        <Link
          to={`/workouts/`}
          className="button-secondary shrink-0"
        >Log Workout</Link>
      </div>

      <WarmupSection items={plan.warmup} />

      <div>
        <p className="eyebrow mb-3">Main Plan</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {plan.exercises.map((exercise) => (
            <PlannedExerciseCard key={exercise.name} exercise={exercise} />
          ))}
        </div>
      </div>

      {plan.optional && plan.optional.length > 0 ? (
        <div className="rounded-[8px] border border-dashed border-[var(--panel-border)] bg-[var(--paper)] p-5">
          <p className="eyebrow">Optional</p>
          <ul className="mt-3 space-y-1">
            {plan.optional.map((item) => (
              <li key={item} className="text-sm leading-5 text-[var(--ink)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <GuardrailsSection items={plan.guardrails} />
    </div>
  );
}
