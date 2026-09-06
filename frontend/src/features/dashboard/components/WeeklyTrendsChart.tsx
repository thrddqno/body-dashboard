import type { ReactNode } from "react";

import {
  Bar,
  BarChart,
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
import type { DailyLog } from "@/types/dailyLog";
import { getWeekDates, parseLocalDate } from "@/utils/dates";
import { formatDecimal, formatFullDate, formatMetricValue, formatSteps } from "@/utils/formatters";

interface WeeklyTrendsChartProps {
  dailyLogs: DailyLog[];
  bodyMetrics: BodyMetric[];
  periodStart: string;
  periodEnd: string;
  calorieBaselineKcal: number | null;
}

type AxisBound = number | "auto";

interface TrendSeries {
  key: string;
  label: string;
  unit: string;
  color: string;
  yDomain: [AxisBound, AxisBound];
  tooltip: (value: number) => string;
  fromDailyLog: (log: DailyLog) => number | null;
}

const trendSeries: TrendSeries[] = [
  {
    key: "sleepHours",
    label: "Sleep",
    unit: "h",
    color: "var(--ink)",
    yDomain: [0, 24],
    tooltip: (value) => `${formatDecimal(value)} h`,
    fromDailyLog: (log) => (log.sleepMinutes == null ? null : Number((log.sleepMinutes / 60).toFixed(1))),
  },
  {
    key: "steps",
    label: "Steps",
    unit: "steps",
    color: "var(--orange)",
    yDomain: ["auto", "auto"],
    tooltip: (value) => formatSteps(value),
    fromDailyLog: (log) => log.steps,
  },
  {
    key: "estimatedCalories",
    label: "Calories",
    unit: "kcal",
    color: "var(--green)",
    yDomain: ["auto", "auto"],
    tooltip: (value) => formatMetricValue(value, "kcal", 0),
    fromDailyLog: (log) => log.estimatedCalories,
  },
];

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });

function formatDayTick(value: string): string {
  return weekdayFormatter.format(parseLocalDate(value));
}

interface ChartRow {
  [key: string]: string | number | null;
}

export function WeeklyTrendsChart({
  dailyLogs,
  bodyMetrics,
  periodStart,
  periodEnd,
  calorieBaselineKcal,
}: WeeklyTrendsChartProps) {
  if (dailyLogs.length === 0 && bodyMetrics.length === 0) {
    return (
      <EmptyState
        title="No weekly trends data"
        description="Trends appear once you have recorded a daily log or a body measurement for this week."
      />
    );
  }

  const weekDates = getWeekDates(periodStart, periodEnd);
  const logsByDate = new Map(dailyLogs.map((log) => [log.date, log]));
  const weightsByDate = new Map(bodyMetrics.map((metric) => [metric.date, metric.weightKg]));

  const rows: ChartRow[] = weekDates.map((date) => {
    const log = logsByDate.get(date);
    const row: ChartRow = { date };
    for (const series of trendSeries) {
      row[series.key] = log ? series.fromDailyLog(log) : null;
    }
    row.weightKg = weightsByDate.get(date) ?? null;
    return row;
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TrendPanel title="Weight" unit="kg" color="var(--green)" note="Recorded days this week">
        <WeightChart rows={rows} />
      </TrendPanel>
      {trendSeries.map((series) => {
        const baseline = series.key === "estimatedCalories" ? calorieBaselineKcal : null;

        return (
          <TrendPanel
            key={series.key}
            title={series.label}
            unit={series.unit}
            color={series.color}
            note={series.key === "sleepHours" ? "Hours of a 24h day" : undefined}
          >
            <BarChartTrend rows={rows} series={series} baseline={baseline} />
          </TrendPanel>
        );
      })}
    </div>
  );
}

interface TrendPanelProps {
  title: string;
  unit: string;
  color: string;
  note?: string;
  children: ReactNode;
}

function TrendPanel({ title, unit, color, note, children }: TrendPanelProps) {
  return (
    <section aria-labelledby={`weekly-${title}-chart-title`} className="subtle-panel p-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 id={`weekly-${title}-chart-title`} className="font-bold text-[var(--ink)]">
          {title}
        </h3>
        <span className="ml-auto text-xs font-bold uppercase text-[var(--muted)]">
          {note ? `${unit} · ${note}` : unit}
        </span>
      </div>
      <div className="mt-4 h-80 min-w-0">{children}</div>
    </section>
  );
}

function WeightChart({ rows }: { rows: ChartRow[] }) {
  const hasData = rows.some((row) => row.weightKg != null);

  if (!hasData) {
    return (
      <div className="grid h-full place-items-center rounded-[8px] border border-dashed border-[var(--panel-border)] bg-[var(--card)] px-4 text-center text-sm text-[var(--muted)]">
        No weight measurements recorded this week.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={rows}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        title="Weekly weight trend"
        desc="Body weight in kg, plotted on its recorded dates this week."
      >
        <CartesianGrid stroke="var(--grid-line)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="var(--muted)"
          tickFormatter={(value) => formatDayTick(String(value))}
          tickLine={false}
          axisLine={false}
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
          dot
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface BarChartTrendProps {
  rows: ChartRow[];
  series: TrendSeries;
  baseline?: number | null;
}

function BarChartTrend({ rows, series, baseline }: BarChartTrendProps) {
  const hasData = rows.some((row) => row[series.key] != null);

  if (!hasData) {
    return (
      <div className="grid h-full place-items-center rounded-[8px] border border-dashed border-[var(--panel-border)] bg-[var(--card)] px-4 text-center text-sm text-[var(--muted)]">
        No {series.label.toLowerCase()} recorded this week.
      </div>
    );
  }

  const chartData =
    baseline == null
      ? rows
      : rows.map((row) => {
          const value = row[series.key];
          return value == null ? { ...row, [series.key]: null } : { ...row, [series.key]: Number(value) - baseline };
        });

  const yDomain: [AxisBound, AxisBound] = baseline == null ? series.yDomain : ["auto", "auto"];
  const tickFormatter = (value: number) => formatDecimal(baseline == null ? Number(value) : baseline + Number(value));
  const desc =
    baseline == null
      ? `${series.label} in ${series.unit}, per recorded day this week.`
      : `${series.label} relative to the ${baseline} ${series.unit} baseline, per recorded day this week.`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        title={`Weekly ${series.label} trend`}
        desc={desc}
      >
        <CartesianGrid stroke="var(--grid-line)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="var(--muted)"
          tickFormatter={(value) => formatDayTick(String(value))}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={yDomain}
          stroke="var(--muted)"
          tickFormatter={tickFormatter}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => {
            const raw = baseline == null ? Number(value) : baseline + Number(value);
            const label = baseline == null ? series.label : `${series.label} vs ${baseline} ${series.unit} baseline`;
            return [series.tooltip(raw), label];
          }}
          labelFormatter={(value) => formatFullDate(parseLocalDate(String(value)))}
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--control-border)", borderRadius: "8px", color: "var(--ink)" }}
        />
        <Bar dataKey={series.key} name={series.label} fill={series.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}