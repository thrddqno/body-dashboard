import type { WeeklyAnalytics } from "@/types/analytics";
import { formatMetricValue, formatSignedWeightChange, formatSleepHours, formatSteps } from "@/utils/formatters";

interface WeeklySummaryProps {
  analytics: WeeklyAnalytics;
}

export function WeeklySummary({ analytics }: WeeklySummaryProps) {
  const adherence = analytics.training.adherencePercentage;
  const metrics = [
    {
      label: "Average sleep",
      value: formatSleepHours(analytics.recovery.averageSleepHours),
      detail: "Recorded check-ins only",
    },
    {
      label: "Adherence",
      value: adherence == null ? "Not available" : `${adherence.toFixed(1)}%`,
      detail: "Completed and missed only",
    },
    {
      label: "Average steps",
      value: formatSteps(analytics.recovery.averageSteps),
      detail: "Recorded check-ins only",
    },
    {
      label: "Latest weight",
      value: formatMetricValue(analytics.body.latestWeightKg, "kg"),
      detail: "Latest record this week",
    },
    {
      label: "Weight change",
      value: formatSignedWeightChange(analytics.body.weightChangeKg),
      detail: "First to latest weekly record",
    },
  ];

  return (
    <section aria-label="Weekly metrics" className="overflow-hidden rounded-[8px] bg-[var(--ink)] text-white">
      <div className="border-b border-[var(--dark-line)] px-7 py-5">
        <p className="text-[10px] font-black uppercase text-[var(--lime)]">Deterministic analytics</p>
        <h2 className="font-serif-display mt-2 text-2xl font-medium">Weekly recorded signals</h2>
      </div>
      <div className="dashboard-metrics grid grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="analytics-metric min-w-0 border-b border-r border-[var(--dark-line)] px-7 py-7">
            <p className="text-[10px] font-black uppercase text-[var(--lime)]">{metric.label}</p>
            <p className="font-serif-display mt-3 break-words text-[29px] leading-none">{metric.value}</p>
            <p className="mt-3 text-xs leading-5 text-[var(--dark-muted)]">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
