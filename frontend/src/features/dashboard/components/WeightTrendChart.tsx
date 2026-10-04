import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BodyMetric } from "@/types/bodyMetric";
import { parseLocalDate } from "@/utils/dates";
import {
  formatCompactDateString,
  formatDecimal,
  formatFullDate,
  formatMetricValue,
} from "@/utils/formatters";

interface WeightTrendChartProps {
  metrics: BodyMetric[];
}

export function WeightTrendChart({ metrics }: WeightTrendChartProps) {
  if (metrics.length === 0) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No weight measurements recorded.
      </p>
    );
  }

  const rows = [...metrics]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((metric) => ({ date: metric.date, weightKg: metric.weightKg }));

  if (rows.length === 1) {
    return (
      <div className="grid h-full place-items-center px-4 text-center">
        <div>
          <p className="font-serif-display text-3xl text-[var(--ink)]">
            {formatMetricValue(rows[0].weightKg, "kg")}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Recorded {formatFullDate(parseLocalDate(rows[0].date))}. Add another measurement to show a trend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
          title="Recent weight trend"
          desc="Recent body weight entries in kg, connected in chronological order."
        >
          <CartesianGrid stroke="var(--grid-line)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            tickFormatter={(value) => formatCompactDateString(String(value))}
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
            formatter={(value) => [formatMetricValue(Number(value), "kg"), "Weight"]}
            labelFormatter={(value) => formatFullDate(parseLocalDate(String(value)))}
            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--control-border)", borderRadius: "8px", color: "var(--ink)" }}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            name="Weight"
            unit="kg"
            stroke="var(--green)"
            strokeWidth={2.5}
            dot={rows.length <= 12}
          />
        </LineChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>Recent weight entries</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date}>
              <td>{formatFullDate(parseLocalDate(row.date))}</td>
              <td>{formatMetricValue(row.weightKg, "kg")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
