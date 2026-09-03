import { formatPlanEyebrow } from "@/utils/formatters";
import type { PlannedWorkout } from "@/types/plannedWorkout";
import { GuardrailsSection } from "@/features/workouts/components/GuardrailsSection";

interface RestDayViewProps {
  date: string;
  plan: PlannedWorkout;
}

export function RestDayView({ date, plan }: RestDayViewProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">{formatPlanEyebrow(date)}</p>
        <h3 className="font-serif-display mt-2 text-2xl font-medium text-[var(--ink)]">
          {plan.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {plan.subtitle}
        </p>
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
