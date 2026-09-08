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
    yDomain: [0, 0],
    tooltip: (value) => formatMetricValue(value, "kcal", 0),
    fromDailyLog: (log) => log.estimatedCalories,
  },
];

const CALORIE_CAP_HEIGHT = 8;

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
      row.caloriesWithinTarget = Math.min(calories, calorieBaselineKcal);
      row.caloriesSurplus = Math.max(0, calories - calorieBaselineKcal);
    } else {
      row.caloriesWithinTarget = null;
      row.caloriesSurplus = null;
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
            : series.yDomain;

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
  const hasData = rows.some((row) => row.caloriesWithinTarget != null);

  if (!hasData) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No {label.toLowerCase()} recorded this week.
      </p>
    );
  }

  const recorded = rows.filter((row) => row.caloriesWithinTarget != null);
  const maxSurplus = Math.max(0, ...recorded.map((row) => Number(row.caloriesSurplus)));

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: CALORIE_CAP_HEIGHT + 2, right: 8, bottom: 8, left: 0 }}
            title={`Weekly ${label} trend`}
            desc={`Calories in ${unit}, against a fixed ${baseline} ${unit} target, per recorded day this week. Days over target show a surplus cap.`}
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
              formatter={(_value, name, item) => {
                const payload = item?.payload as ChartRow | undefined;
                return [formatCalorieRow(payload, baseline, unit), String(name)];
              }}
              labelFormatter={(value) => formatFullDate(parseLocalDate(String(value)))}
              contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--control-border)", borderRadius: "8px", color: "var(--ink)" }}
            />
            <Bar
              dataKey="caloriesWithinTarget"
              name={`Calories vs ${baseline} ${unit} target`}
              fill="var(--green)"
              shape={(props) => <CalorieBarShape {...props} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        Green bars are capped at the {formatMetricValue(baseline, unit, 0)} target.
        {maxSurplus > 0
          ? ` Days over target carry an orange cap (not to scale); the largest surplus is ${formatMetricValue(maxSurplus, unit, 0)}.`
          : ""}
      </p>
    </div>
  );
}

function formatCalorieRow(payload: ChartRow | undefined, baseline: number, unit: string): string {
  const within = payload?.caloriesWithinTarget as number | null | undefined;
  const surplus = payload?.caloriesSurplus as number | null | undefined;
  if (within == null) {
    return "Not recorded";
  }
  const total = within + (surplus ?? 0);
  if ((surplus ?? 0) > 0) {
    return `${formatMetricValue(total, unit, 0)} total · ${formatMetricValue(surplus ?? 0, unit, 0)} over the ${formatMetricValue(baseline, unit, 0)} target`;
  }
  return `${formatMetricValue(total, unit, 0)} within the ${formatMetricValue(baseline, unit, 0)} target`;
}

interface CalorieBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartRow;
}

function CalorieBarShape({ x, y, width, height, payload }: CalorieBarShapeProps) {
  const surplus = (payload?.caloriesSurplus as number | null) ?? 0;
  const barWidth = typeof width === "number" ? width : 0;

  return (
    <g>
      <rect
        x={typeof x === "number" ? x : 0}
        y={typeof y === "number" ? y : 0}
        width={barWidth}
        height={typeof height === "number" ? height : 0}
        fill="var(--green)"
        rx={surplus > 0 ? 0 : 4}
      />
      {surplus > 0 && typeof y === "number" ? (
        <rect
          x={typeof x === "number" ? x : 0}
          y={y - CALORIE_CAP_HEIGHT}
          width={barWidth}
          height={CALORIE_CAP_HEIGHT}
          fill="var(--orange)"
          rx={2}
        />
      ) : null}
    </g>
  );
}