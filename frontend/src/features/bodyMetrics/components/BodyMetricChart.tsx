import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/EmptyState";
import type { BodyMetric } from "@/types/bodyMetric";
import { parseLocalDate } from "@/utils/dates";
import { formatCompactDate, formatDecimal, formatFullDate, formatMetricValue } from "@/utils/formatters";

interface BodyMetricChartProps {
  metrics: BodyMetric[];
}

type MetricKey = "weightKg" | "waistCm" | "bodyFatPercentage";

interface MetricSeries {
  key: MetricKey;
  label: string;
  unit: string;
  stroke: string;
}

const metricSeries: MetricSeries[] = [
  { key: "weightKg", label: "Weight", unit: "kg", stroke: "var(--green)" },
  { key: "waistCm", label: "Waist", unit: "cm", stroke: "var(--orange)" },
  { key: "bodyFatPercentage", label: "Body fat", unit: "%", stroke: "var(--ink)" },
];

function formatChartTick(value: number, includeYear: boolean): string {
  const date = new Date(Number(value));
  const formatted = formatCompactDate(date);
  return includeYear ? `${formatted} '${String(date.getFullYear()).slice(-2)}` : formatted;
}

export function BodyMetricChart({ metrics }: BodyMetricChartProps) {
  if (metrics.length === 0) {
    return (
      <EmptyState
        title="No measurement data"
        description="Charts appear once you have recorded at least one measurement."
      />
    );
  }

  const chartData = [...metrics]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((metric) => ({
      ...metric,
      timestamp: parseLocalDate(metric.date).getTime(),
    }));
  const spansYears = chartData[0].date.slice(0, 4) !== chartData[chartData.length - 1].date.slice(0, 4);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {metricSeries.map((series) => {
        const hasData = chartData.some((metric) => metric[series.key] != null);

        return (
          <section key={series.key} aria-labelledby={`${series.key}-chart-title`} className="subtle-panel p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id={`${series.key}-chart-title`} className="font-bold text-[var(--ink)]">
                {series.label}
              </h3>
              <span className="text-xs font-bold uppercase text-[var(--muted)]">{series.unit}</span>
            </div>
            {hasData ? (
              <div className="mt-4 h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                    title={`${series.label} trend`}
                    desc={`${series.label} measurements in ${series.unit}, plotted on their recorded dates. Use arrow keys to inspect data points.`}
                  >
                    <CartesianGrid stroke="var(--grid-line)" vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      scale="time"
                      domain={["dataMin", "dataMax"]}
                      stroke="var(--muted)"
                      tickFormatter={(value) => formatChartTick(Number(value), spansYears)}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="var(--muted)"
                      tickFormatter={(value) => formatDecimal(Number(value))}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value) => [formatMetricValue(Number(value), series.unit), series.label]}
                      labelFormatter={(value) => formatFullDate(new Date(Number(value)))}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--control-border)",
                        borderRadius: "8px",
                        color: "var(--ink)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={series.key}
                      name={series.label}
                      unit={series.unit}
                      stroke={series.stroke}
                      strokeWidth={2.5}
                      dot
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 grid h-64 place-items-center rounded-[8px] border border-dashed border-[var(--panel-border)] bg-[var(--card)] px-4 text-center text-sm text-[var(--muted)]">
                No {series.label.toLowerCase()} measurements recorded.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
