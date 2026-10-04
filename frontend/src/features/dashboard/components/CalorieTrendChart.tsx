import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { parseLocalDate } from "@/utils/dates";
import { formatDecimal, formatFullDate, formatMetricValue } from "@/utils/formatters";

export interface CalorieTrendRow {
  date: string;
  caloriesTotal: number | null;
  caloriesSurplus: number | null;
  caloriesBase: number | null;
  caloriesOverlay: number | null;
}

interface CalorieTrendChartProps {
  rows: CalorieTrendRow[];
  target: number;
}

export function CalorieTrendChart({ rows, target }: CalorieTrendChartProps) {
  const recorded = rows.filter((row) => row.caloriesTotal != null);
  if (recorded.length === 0) {
    return (
      <p className="mt-4 grid h-64 place-items-center px-4 text-center text-sm text-[var(--muted)]">
        No calories recorded this week.
      </p>
    );
  }

  const maxSurplus = Math.max(0, ...recorded.map((row) => row.caloriesSurplus ?? 0));

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            title="Weekly Calories trend"
            desc={`Calories in kcal, against a fixed ${target} kcal target, per recorded day this week. Days over target are drawn to the target size with an orange surplus segment.`}
          >
            <CartesianGrid stroke="var(--grid-line)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--muted)"
              tickFormatter={(value) => formatWeekday(String(value))}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, target]}
              stroke="var(--muted)"
              tickFormatter={(value) => formatDecimal(Number(value))}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={(props) => <CalorieTooltip {...props} target={target} />} />
            <Bar
              dataKey="caloriesBase"
              name="Target-scale base"
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
          Target-scale base
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--orange)]" />
          Surplus
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        Bars use the fixed {formatMetricValue(target, "kcal", 0)} target scale. At or under target, green is the
        recorded intake. Above target, orange is the surplus and green fills the remaining target-scale height.
        {maxSurplus > 0 ? ` The largest surplus is ${formatMetricValue(maxSurplus, "kcal", 0)}.` : ""}
      </p>
      <table className="sr-only">
        <caption>Recorded calorie totals and surplus by day</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total</th>
            <th>Target</th>
            <th>Surplus</th>
          </tr>
        </thead>
        <tbody>
          {recorded.map((row) => (
            <tr key={row.date}>
              <td>{formatFullDate(parseLocalDate(row.date))}</td>
              <td>{formatMetricValue(row.caloriesTotal, "kcal", 0)}</td>
              <td>{formatMetricValue(target, "kcal", 0)}</td>
              <td>{formatMetricValue(row.caloriesSurplus, "kcal", 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });

function formatWeekday(date: string): string {
  return weekdayFormatter.format(parseLocalDate(date));
}

function CalorieTooltip({
  active,
  payload,
  target,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CalorieTrendRow }>;
  target: number;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row || row.caloriesTotal == null) return null;

  const surplus = row.caloriesSurplus ?? 0;
  const detail = surplus > 0
    ? `${formatMetricValue(row.caloriesTotal, "kcal", 0)} total · ${formatMetricValue(surplus, "kcal", 0)} over the ${formatMetricValue(target, "kcal", 0)} target`
    : `${formatMetricValue(row.caloriesTotal, "kcal", 0)} within the ${formatMetricValue(target, "kcal", 0)} target`;

  return (
    <div className="rounded-[8px] border border-[var(--control-border)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--ink)]">
      <p className="font-bold">{formatFullDate(parseLocalDate(row.date))}</p>
      <p>{detail}</p>
    </div>
  );
}

function CalorieBaseBarShape({
  x,
  y,
  width,
  height,
  payload,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: CalorieTrendRow;
}) {
  return (
    <rect
      x={x ?? 0}
      y={y ?? 0}
      width={width ?? 0}
      height={height ?? 0}
      fill="var(--green)"
      rx={(payload?.caloriesOverlay ?? 0) > 0 ? 0 : 4}
    />
  );
}
