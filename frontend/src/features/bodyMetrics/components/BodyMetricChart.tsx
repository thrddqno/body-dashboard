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
import { sortIsoDatesAscending } from "@/utils/dates";
import { formatCompactDateString } from "@/utils/formatters";

interface BodyMetricChartProps {
  metrics: BodyMetric[];
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

  const chartData = sortIsoDatesAscending(metrics.map((metric) => metric.date)).map(
    (date) => {
      const metric = metrics.find((entry) => entry.date === date)!;
      return {
        date,
        label: formatCompactDateString(date),
        weightKg: metric.weightKg,
        waistCm: metric.waistCm,
        bodyFatPercentage: metric.bodyFatPercentage,
      };
    },
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#d8dde5" vertical={false} />
        <XAxis dataKey="label" stroke="#5b6472" tickLine={false} axisLine={false} />
        <YAxis stroke="#5b6472" tickLine={false} axisLine={false} width={42} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #d8dde5",
            borderRadius: "8px",
            color: "#111827",
          }}
        />
        <Line type="monotone" dataKey="weightKg" stroke="#0f5132" strokeWidth={2.5} dot />
        <Line type="monotone" dataKey="waistCm" stroke="#b45309" strokeWidth={2} dot connectNulls={false} />
        <Line type="monotone" dataKey="bodyFatPercentage" stroke="#111827" strokeWidth={2} dot connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
