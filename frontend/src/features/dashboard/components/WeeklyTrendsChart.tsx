import type { ReactNode } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/EmptyState";
import type { BodyMetric } from "@/types/bodyMetric";
import type { DailyLog } from "@/types/dailyLog";
import { getWeekDates, parseLocalDate } from "@/utils/dates";
import { CalorieTrendChart, type CalorieTrendRow } from "@/features/dashboard/components/CalorieTrendChart";
import { WeightTrendChart } from "@/features/dashboard/components/WeightTrendChart";
import { formatDecimal, formatFullDate, formatSteps } from "@/utils/formatters";

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
  key: "sleepHours" | "steps";
  label: string;
  unit: string;
  color: string;
  yDomain: [AxisBound, AxisBound];
  tooltip: (value: number) => string;
}

const trendSeries: TrendSeries[] = [
  {
    key: "sleepHours",
    label: "Sleep",
    unit: "h",
    color: "var(--ink)",
    yDomain: [0, 12],
    tooltip: (value) => `${formatDecimal(value)} h`,
  },
  {
    key: "steps",
    label: "Steps",
    unit: "steps",
    color: "var(--orange)",
    yDomain: ["auto", "auto"],
    tooltip: (value) => formatSteps(value),
  },
];

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });

function formatDayTick(value: string): string {
  return weekdayFormatter.format(parseLocalDate(value));
}

interface DailyTrendRow extends CalorieTrendRow {
  sleepHours: number | null;
  steps: number | null;
}

function buildDailyTrendRows(
  dates: string[],
  dailyLogs: DailyLog[],
  calorieTarget: number,
): DailyTrendRow[] {
  const logsByDate = new Map(dailyLogs.map((log) => [log.date, log]));

  return dates.map((date) => {
    const log = logsByDate.get(date);
    const calories = log?.estimatedCalories ?? null;
    const surplus = calories == null ? null : Math.max(0, calories - calorieTarget);
    const visualSurplus = surplus == null ? null : Math.min(surplus, calorieTarget);

    return {
      date,
      sleepHours:
        log?.sleepMinutes == null ? null : Number((log.sleepMinutes / 60).toFixed(1)),
      steps: log?.steps ?? null,
      caloriesTotal: calories,
      caloriesSurplus: surplus,
      caloriesBase:
        calories == null
          ? null
          : calories <= calorieTarget
            ? calories
            : calorieTarget - (visualSurplus ?? 0),
      caloriesOverlay: visualSurplus,
    };
  });
}

function resolveYDomain(series: TrendSeries, rows: DailyTrendRow[]): [AxisBound, AxisBound] {
  if (series.key !== "sleepHours") return series.yDomain;

  const sleepHours = rows
    .map((row) => row.sleepHours)
    .filter((value): value is number => value != null);
  return [0, Math.max(12, ...sleepHours)];
}

export function WeeklyTrendsChart({
  dailyLogs,
  bodyMetrics,
  periodStart,
  periodEnd,
  calorieBaselineKcal,
  error,
}: WeeklyTrendsChartProps) {
  if (!error && dailyLogs.length === 0 && bodyMetrics.length === 0) {
    return (
      <EmptyState
        title="No weekly trends data"
        description="Trends appear once you have recorded a daily log or a body measurement for this week."
      />
    );
  }

  const rows = buildDailyTrendRows(
    getWeekDates(periodStart, periodEnd),
    dailyLogs,
    calorieBaselineKcal,
  );
  const dailyTrendPanels = trendSeries.map((series) => {
    const yDomain = resolveYDomain(series, rows);

    return (
      <TrendPanel
        key={series.key}
        title={series.label}
        unit={series.unit}
        color={series.color}
      >
        <BarChartTrend rows={rows} series={series} yDomain={yDomain} />
      </TrendPanel>
    );
  });

  return (
    <div className="grid gap-6 [@media(min-width:900px)]:grid-cols-2">
      <TrendPanel title="Weight" unit="kg" color="var(--green)" note="Recent entries">
        <WeightTrendChart metrics={bodyMetrics} />
      </TrendPanel>
      {error ? (
        <section className="subtle-panel grid min-h-64 place-items-center p-6 text-center [@media(min-width:900px)]:col-span-1">
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">Daily trends are temporarily unavailable</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{error}</p>
          </div>
        </section>
      ) : (
        <>
          {dailyTrendPanels}
          <TrendPanel title="Calories" unit="kcal" color="var(--green)">
            <CalorieTrendChart rows={rows} target={calorieBaselineKcal} />
          </TrendPanel>
        </>
      )}
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
        <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
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

interface BarChartTrendProps {
  rows: DailyTrendRow[];
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
