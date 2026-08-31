import type { WeeklyAnalytics } from "@/types/analytics";
import type { DashboardResponse } from "@/types/dashboard";
import { formatMetricValue, formatSleepHours } from "@/utils/formatters";

interface DashboardSidePanelsProps {
  dashboard: DashboardResponse;
  analytics: WeeklyAnalytics;
}

export function DashboardSidePanels({ dashboard, analytics }: DashboardSidePanelsProps) {
  return (
    <aside className="space-y-5" aria-label="Progression and targets">
      <section className="rounded-[8px] bg-[var(--green)] p-8 text-white">
        <p className="text-[10px] font-black uppercase text-[var(--lime)]">Progression</p>
        <h2 className="font-serif-display mt-3 text-3xl font-medium">Evidence check</h2>
        <p className="mt-4 text-[13px] leading-[1.65] text-[var(--green-copy)]">
          No readiness decision is calculated yet. These weekly signals provide context, but do not independently justify progressing training.
        </p>
        <dl className="mt-5 divide-y divide-[var(--green-line)] border-y border-[var(--green-line)] text-xs">
          <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--green-copy)]">Adherence</dt><dd className="font-bold">{analytics.training.adherencePercentage == null ? "Not enough data" : `${analytics.training.adherencePercentage.toFixed(1)}%`}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--green-copy)]">Sleep average</dt><dd className="font-bold">{formatSleepHours(analytics.recovery.averageSleepHours)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--green-copy)]">Decision</dt><dd className="font-bold text-[var(--lime)]">Not calculated</dd></div>
        </dl>
      </section>
      <section className="rounded-[8px] bg-[var(--ink)] p-8 text-white">
        <p className="text-[10px] font-black uppercase text-[var(--lime)]">Target</p>
        <p className="font-serif-display mt-4 text-4xl">
          {dashboard.body.weightRemainingKg == null
            ? "Not available"
            : dashboard.body.weightRemainingKg === 0
              ? "Target met"
              : `${formatMetricValue(dashboard.body.weightRemainingKg, "kg")} to go.`}
        </p>
        <p className="mt-1 text-xs text-[var(--green-copy)]">{formatMetricValue(dashboard.body.currentWeightKg, "kg")} now, aiming for {formatMetricValue(dashboard.body.targetWeightKg, "kg")} while prioritizing freer movement and recoverable training.</p>
        {dashboard.body.currentWeightKg == null ? (
          <p className="mt-3 text-xs leading-5 text-[var(--green-copy)]">Record a current weight to calculate the remaining distance.</p>
        ) : null}
        <dl className="mt-5 divide-y divide-[var(--green-line)] border-t border-[var(--green-copy)]/20 text-xs">
          <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--green-copy)]">Current Gap</dt><dd className="font-bold text-[var(--lime)]">{formatMetricValue(dashboard.body.weightRemainingKg, "kg")}</dd></div>
        </dl>
      </section>
    </aside>
  );
}
