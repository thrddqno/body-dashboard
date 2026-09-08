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
  calorieBaselineKcal: number;
  error?: string;
}

type AxisBound = number | "auto";

interface TrendSeries {
  key: string;
  label: string;
  unit: string;
  color: string;
  yDomain?: [AxisBound, AxisBound];
  tooltip: (value: number) => string;
  fromDailyLog: (log: DailyLog) => number | null;
}

const trendSeries: TrendSeries[] = [
  {
    key: "sleepHours",
    label: "Sleep",
    unit: "h",
    color: "var(--ink)",
    yDomain: [0, 12],
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
  error,
}: WeeklyTrendsChartProps) {
  if (error) {
    return (
      <div className="subtle-panel p-6 text-center">
        <p className="text-sm font-bold text-[var(--ink)]">Weekly trends are temporarily unavailable</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{error}</p>
      </div>
    );
  }

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
    const calories = log?.estimatedCalories ?? null;
    if (calories != null) {
      const surplus = Math.max(0, calories - calorieBaselineKcal);
      const visualSurplus = Math.min(surplus, calorieBaselineKcal);
      row.caloriesTotal = calories;
      row.caloriesSurplus = surplus;
      row.caloriesBase = calories <= calorieBaselineKcal ? calories : calorieBaselineKcal - visualSurplus;
      row.caloriesOverlay = visualSurplus;
    } else {
      row.caloriesTotal = null;
      row.caloriesSurplus = null;
      row.caloriesBase = null;
      row.caloriesOverlay = null;
    }
    row.weightKg = weightsByDate.get(date) ?? null;
    return row;
  });

  return (
    <div className="grid gap-6 [@media(min-width:900px)]:grid-cols-2">
      <TrendPanel title="Weight" unit="kg" color="var(--green)" note="Recorded days this week">
        <WeightChart rows={rows} />
      </TrendPanel>
      {trendSeries.map((series) => {
        const yDomain =
          series.key === "estimatedCalories"
            ? ([0, calorieBaselineKcal] as [AxisBound, AxisBound])
            : (series.yDomain ?? (["auto", "auto"] as const));

        return (
          <TrendPanel
            key={series.key}
            title={series.label}
            unit={series.unit}
            color={series.key === "estimatedCalories" ? "var(--green)" : series.color}
            note={series.key === "sleepHours" ? "Scale intended for typical sleep (up to 12 h)" : undefined}
          >
            {series.key === "estimatedCalories" ? (
              <CalorieBarChartTrend
                rows={rows}
                yDomain={yDomain}
                baseline={calorieBaselineKcal}
                unit={series.unit}
                label={series.label}
              />
            ) : (
              <BarChartTrend rows={rows} series={series} yDomain={yDomain} />
            )}
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
        <h3 id={`weekly-${title}-chart-title`} className="font-serif-display text-[22px] font-medium leading-none text-[var(--ink)]">
          {title}
        </h3>
        <span className="ml-auto text-xs font-bold uppercase text-[var(--muted)]">
          {note ? `${unit} · ${note}` : unit}
        </span>
      </div>
      <div className="mt-4 h-64 min-w-0 sm:h-80">{children}</div>
    </section>
  );
}

function WeightChart({ rows }: { rows: ChartRow[] }) {
  const hasData = rows.some((row) => row.weightKg != null);

  if (!hasData) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No weight measurements recorded this week.
      </p>
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
  yDomain: [AxisBound, AxisBound];
}

function BarChartTrend({ rows, series, yDomain }: BarChartTrendProps) {
  const hasData = rows.some((row) => row[series.key] != null);

  if (!hasData) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No {series.label.toLowerCase()} recorded this week.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rows}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        title={`Weekly ${series.label} trend`}
        desc={`${series.label} in ${series.unit}, per recorded day this week.`}
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
          tickFormatter={(value) => formatDecimal(Number(value))}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => [series.tooltip(Number(value)), series.label]}
          labelFormatter={(value) => formatFullDate(parseLocalDate(String(value)))}
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--control-border)", borderRadius: "8px", color: "var(--ink)" }}
        />
        <Bar dataKey={series.key} name={series.label} fill={series.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface CalorieBarChartTrendProps {
  rows: ChartRow[];
  yDomain: [AxisBound, AxisBound];
  baseline: number;
  unit: string;
  label: string;
}

function CalorieBarChartTrend({ rows, yDomain, baseline, unit, label }: CalorieBarChartTrendProps) {
  const hasData = rows.some((row) => row.caloriesTotal != null);

  if (!hasData) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No {label.toLowerCase()} recorded this week.
      </p>
    );
  }

  const recorded = rows.filter((row) => row.caloriesTotal != null);
  const maxSurplus = Math.max(0, ...recorded.map((row) => Number(row.caloriesSurplus)));

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            title={`Weekly ${label} trend`}
            desc={`Calories in ${unit}, against a fixed ${baseline} ${unit} target, per recorded day this week. Days over target are drawn to the target size with an orange surplus segment.`}
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
              tickFormatter={(value) => formatDecimal(Number(value))}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }
                const row = payload[0].payload as ChartRow;
                return (
                  <div
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--control-border)",
                      borderRadius: "8px",
                      color: "var(--ink)",
                      padding: "8px 12px",
                      fontSize: "13px",
                    }}
                  >
                    <p className="font-bold">{formatFullDate(parseLocalDate(String(row.date)))}</p>
                    <p>{formatCalorieRow(row, baseline, unit)}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="caloriesBase"
              name="In-target intake"
              fill="var(--green)"
              stackId="calories"
              shape={(props) => <CalorieBaseBarShape {...props} />}
            />
            <Bar
              dataKey="caloriesOverlay"
              name="Surplus"
              fill="var(--orange)"
              stackId="calories"
              radius={[4, 4, 0, 0]}
              shape={(props) => <CalorieSurplusBarShape {...props} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
          In-target intake
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--orange)]" />
          Surplus
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        Bars use the fixed {formatMetricValue(baseline, unit, 0)} target scale. Days over target are drawn as a
        target-sized bar whose green part shows the in-target intake and orange part the surplus.
        {maxSurplus > 0
          ? ` The largest surplus is ${formatMetricValue(maxSurplus, unit, 0)}.`
          : ""}
      </p>
    </div>
  );
}

function formatCalorieRow(payload: ChartRow | undefined, baseline: number, unit: string): string {
  const total = payload?.caloriesTotal as number | null | undefined;
  const surplus = payload?.caloriesSurplus as number | null | undefined;
  if (total == null) {
    return "Not recorded";
  }
  if (surplus && surplus > 0) {
    return `${formatMetricValue(total, unit, 0)} total · ${formatMetricValue(surplus, unit, 0)} over the ${formatMetricValue(baseline, unit, 0)} target`;
  }
  return `${formatMetricValue(total, unit, 0)} within the ${formatMetricValue(baseline, unit, 0)} target`;
}

interface CalorieBaseBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartRow;
}

function CalorieBaseBarShape({ x, y, width, height, payload }: CalorieBaseBarShapeProps) {
  const overlay = (payload?.caloriesOverlay as number | null) ?? 0;
  return (
    <rect
      x={typeof x === "number" ? x : 0}
      y={typeof y === "number" ? y : 0}
      width={typeof width === "number" ? width : 0}
      height={typeof height === "number" ? height : 0}
      fill="var(--green)"
      rx={overlay > 0 ? 0 : 4}
    />
  );
}

interface CalorieSurplusBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartRow;
}

function CalorieSurplusBarShape({ x, y, width, height, payload }: CalorieSurplusBarShapeProps) {
  const overlay = (payload?.caloriesOverlay as number | null) ?? 0;
  if (overlay <= 0) {
    return null;
  }
  return (
    <rect
      x={typeof x === "number" ? x : 0}
      y={typeof y === "number" ? y : 0}
      width={typeof width === "number" ? width : 0}
      height={typeof height === "number" ? height : 0}
      fill="var(--orange)"
      rx={4}
    />
  );
}