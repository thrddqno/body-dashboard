import { Link } from "react-router-dom";

import type { WeeklyAnalytics } from "@/types/analytics";
import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";
import type { DashboardResponse } from "@/types/dashboard";
import { formatMetricValue, formatSleepHours } from "@/utils/formatters";

interface DashboardSidePanelsProps {
  dashboard: DashboardResponse;
  analytics: WeeklyAnalytics;
  latestAnalysis?: WeeklyAiAnalysis | null;
  hasAnalysis?: boolean;
}

const verdictStyles: Record<string, string> = {
  PROGRESS: "bg-[var(--lime)] text-[var(--ink)]",
  MAINTAIN: "bg-[#f4ead2] text-[#9b6525] border border-[#e3c894]",
  DELOAD: "bg-[#f3ded7] text-[var(--rose)] border border-[#e3b9ae]",
  INSUFFICIENT_DATA: "bg-[var(--low-bg)] text-[var(--muted)]",
};

const verdictLabels: Record<string, string> = {
  PROGRESS: "Progress",
  MAINTAIN: "Maintain",
  DELOAD: "Ease off",
  INSUFFICIENT_DATA: "Not calculated",
};

export function DashboardSidePanels({
  dashboard,
  analytics,
  latestAnalysis,
  hasAnalysis,
}: DashboardSidePanelsProps) {
  const decision = analytics.decision;
  const recommendations = latestAnalysis?.recommendations ?? [];

  return (
    <aside className="space-y-5" aria-label="Progression and targets">
      <section className="rounded-[8px] bg-[var(--green)] p-8 text-white">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase text-[var(--lime)]">
            Progression
          </p>
          <span
            className={`inline-flex rounded-[8px] px-2.5 py-1 text-[10px] font-black uppercase ${verdictStyles[decision.verdict]}`}
          >
            {verdictLabels[decision.verdict]}
          </span>
        </div>
        <h2 className="font-serif-display mt-3 text-3xl font-medium">
          Evidence check
        </h2>
        <p className="mt-4 text-[13px] leading-[1.65] text-[var(--green-copy)]">
          {decision.sufficientData
            ? "A deterministic decision based on this week's measured signals. The AI below explains what changed and what to do next."
            : "Not enough weekly data to decide. Log weight, workouts, and recovery and run the weekly AI analysis for guidance."}
        </p>
        <dl className="mt-5 divide-y divide-[var(--green-line)] border-y border-[var(--green-line)] text-xs">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[var(--green-copy)]">Adherence</dt>
            <dd className="font-bold">
              {analytics.training.adherencePercentage == null
                ? "Not enough data"
                : `${analytics.training.adherencePercentage.toFixed(1)}%`}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[var(--green-copy)]">Sleep average</dt>
            <dd className="font-bold">
              {formatSleepHours(analytics.recovery.averageSleepHours)}
            </dd>
          </div>
        </dl>
        {decision.factors.length > 0 ? (
          <ul className="mt-4 space-y-2 border-b border-[var(--green-line)] pb-4">
            {decision.factors.map((factor) => (
              <li
                key={factor}
                className="flex gap-2 text-xs leading-5 text-[var(--green-copy)]"
              >
                <span className="text-[var(--lime)]">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase text-[var(--lime)]">
            What's next
          </p>
          {recommendations.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {recommendations
                .slice(0, recommendations.length)
                .map((recommendation, index) => (
                  <li
                    key={recommendation}
                    className={`text-[13px] leading-[1.65] text-[var(--green-copy)] ${
                      index !== recommendations.length - 1
                        ? "border-b border-[var(--green-copy)]/20 pb-2"
                        : ""
                    }`}
                  >
                    {recommendation}
                  </li>
                ))}
            </ul>
          ) : hasAnalysis ? (
            <p className="mt-2 text-[13px] leading-[1.65] text-[var(--green-copy)]">
              Run the weekly analysis to get coaching on what to change.
            </p>
          ) : (
            <p className="mt-2 text-[13px] leading-[1.65] text-[var(--green-copy)]">
              Generate a weekly analysis for coaching on what to change.
            </p>
          )}
          <Link to="/analysis" className="button-secondary mt-4 inline-flex">
            Open full analysis
          </Link>
        </div>
      </section>
      <section className="rounded-[8px] bg-[var(--ink)] p-8 text-white">
        <p className="text-[10px] font-black uppercase text-[var(--lime)]">
          Target
        </p>
        <p className="font-serif-display mt-4 text-4xl">
          {dashboard.body.weightRemainingKg == null
            ? "Not available"
            : dashboard.body.weightRemainingKg === 0
              ? "Target met"
              : `${formatMetricValue(dashboard.body.weightRemainingKg, "kg")} to go.`}
        </p>
        <p className="mt-1 text-xs text-[var(--green-copy)]">
          {formatMetricValue(dashboard.body.currentWeightKg, "kg")} now, aiming
          for {formatMetricValue(dashboard.body.targetWeightKg, "kg")} while
          prioritizing freer movement and recoverable training.
        </p>
        {dashboard.body.currentWeightKg == null ? (
          <p className="mt-3 text-xs leading-5 text-[var(--green-copy)]">
            Record a current weight to calculate the remaining distance.
          </p>
        ) : null}
        <dl className="mt-5 divide-y divide-[var(--green-line)] border-t border-[var(--green-copy)]/20 text-xs">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[var(--green-copy)]">Current Gap</dt>
            <dd className="font-bold text-[var(--lime)]">
              {formatMetricValue(dashboard.body.weightRemainingKg, "kg")}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
