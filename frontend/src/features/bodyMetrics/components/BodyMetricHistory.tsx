import { EmptyState } from "@/components/EmptyState";
import type { BodyMetric } from "@/types/bodyMetric";
import { formatFullDateString, formatMetricValue } from "@/utils/formatters";

interface BodyMetricHistoryProps {
  metrics: BodyMetric[];
}

export function BodyMetricHistory({ metrics }: BodyMetricHistoryProps) {
  if (metrics.length === 0) {
    return (
      <EmptyState
        title="No measurements yet"
        description="Your measurement history appears here after the first recorded entry."
      />
    );
  }

  return (
    <div className="panel p-6">
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Measurement history</h2>
      <div className="mt-6 overflow-x-auto">
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
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-t border-slate-800 align-top">
                <td className="py-3">{formatFullDateString(metric.date)}</td>
                <td className="py-3">{formatMetricValue(metric.weightKg, "kg")}</td>
                <td className="py-3">{formatMetricValue(metric.waistCm, "cm")}</td>
                <td className="py-3">{formatMetricValue(metric.bodyFatPercentage, "%")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
