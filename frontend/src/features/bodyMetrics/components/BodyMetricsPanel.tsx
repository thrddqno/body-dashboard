import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import type { BodyMetric } from "@/types/bodyMetric";
import { formatCompactDateString, formatMetricValue } from "@/utils/formatters";

interface BodyMetricsPanelProps {
  metrics: BodyMetric[];
  currentWeightKg: number | null;
}

export function BodyMetricsPanel({ metrics, currentWeightKg }: BodyMetricsPanelProps) {
  const recentMetrics = metrics.slice(0, 5);

  return (
    <section className="panel p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">
            Body Metrics
          </p>
          <h2 className="font-serif-display mt-2 text-3xl font-medium text-[var(--ink)]">
            Recent measurements
          </h2>
        </div>
        <Link
          to="/measurements"
          className="button-secondary"
        >
          Open measurements
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Current weight"
          value={formatMetricValue(currentWeightKg, "kg")}
          helperText="Latest recorded body weight"
        />
        <div className="subtle-panel p-5 md:col-span-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Recent measurements
          </p>
          {recentMetrics.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No body metrics recorded"
                description="Add a measurement to start tracking body-weight and optional waist or body-fat history."
                action={
                  <Link
                    to="/measurements"
                    className="button-primary"
                  >
                    Add measurement
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Weight</th>
                    <th className="pb-3 font-medium">Waist</th>
                    <th className="pb-3 font-medium">Body fat</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMetrics.map((metric) => (
                    <tr key={metric.id} className="border-t border-slate-800">
                      <td className="py-3">{formatCompactDateString(metric.date)}</td>
                      <td className="py-3">{formatMetricValue(metric.weightKg, "kg")}</td>
                      <td className="py-3">{formatMetricValue(metric.waistCm, "cm")}</td>
                      <td className="py-3">{formatMetricValue(metric.bodyFatPercentage, "%")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
