import { useRef, useState } from "react";
import type { PlannedWorkout } from "@/types/plannedWorkout";
import { PlannedExerciseCard } from "@/features/workouts/components/PlannedExerciseCard";
import { WorkoutPlanImage } from "@/features/workouts/components/WorkoutPlanImage";
import { WarmupSection } from "@/features/workouts/components/WarmupSection";
import { GuardrailsSection } from "@/features/workouts/components/GuardrailsSection";
import { formatPlanEyebrow } from "@/utils/formatters";
import { Link } from "react-router-dom";

interface PlannedWorkoutViewProps {
  date: string;
  today?: string;
  plan: PlannedWorkout;
  plannedWorkoutId?: number;
  canSavePng?: boolean;
}

export function PlannedWorkoutView({
  date,
  today,
  plan,
  plannedWorkoutId,
  canSavePng = false,
}: PlannedWorkoutViewProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  async function savePng() {
    if (!imageRef.current || isSaving) return;

    setIsSaving(true);
    setSaveError(undefined);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(imageRef.current, {
        backgroundColor: "#f6f7f9",
        cacheBust: true,
        height: 1920,
        pixelRatio: 1,
        width: 1080,
      });
      const download = document.createElement("a");
      download.download = `move-free-workout-${date}.png`;
      download.href = dataUrl;
      download.click();
    } catch {
      setSaveError("Unable to save the workout image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5 border-t border-[var(--ink)]/20">
      <div className="flex mt-6 items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{formatPlanEyebrow(date, today)}</p>
          <h3 className="font-serif-display mt-2 text-2xl font-medium text-[var(--ink)]">
            {plan.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{plan.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {canSavePng ? (
            <button
              type="button"
              className="button-secondary"
              disabled={isSaving}
              onClick={() => void savePng()}
            >
              {isSaving ? "Saving..." : "Save PNG"}
            </button>
          ) : null}
          <Link
            to={plannedWorkoutId == null ? "/workouts/" : `/workouts/${plannedWorkoutId}`}
            className="button-secondary"
          >
            {plannedWorkoutId == null ? "Log Workout" : "Edit Workout"}
          </Link>
        </div>
      </div>

      {saveError ? <p role="alert" className="text-sm text-[var(--danger)]">{saveError}</p> : null}

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

      {canSavePng ? (
        <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0">
          <WorkoutPlanImage ref={imageRef} date={date} plan={plan} />
        </div>
      ) : null}
    </div>
  );
}
