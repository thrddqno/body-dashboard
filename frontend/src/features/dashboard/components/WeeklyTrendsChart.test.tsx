import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";

import { WeeklyTrendsChart } from "@/features/dashboard/components/WeeklyTrendsChart";
import type { BodyMetric } from "@/types/bodyMetric";
import type { DailyLog } from "@/types/dailyLog";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
  BarChart: ({
    children,
    data,
    desc,
    title,
  }: {
    children: ReactNode;
    data: Array<Record<string, unknown>>;
    desc: string;
    title: string;
  }) => (
    <div
      role="img"
      aria-label={title}
      data-description={desc}
      data-dates={data.map((item) => item.date).join(",")}
      data-values={JSON.stringify(data)}
    >
      {children}
    </div>
  ),
  LineChart: ({
    children,
    data,
    desc,
    title,
  }: {
    children: ReactNode;
    data: Array<Record<string, unknown>>;
    desc: string;
    title: string;
  }) => (
    <div
      role="img"
      aria-label={title}
      data-description={desc}
      data-dates={data.map((item) => item.date).join(",")}
      data-values={JSON.stringify(data)}
    >
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: ({ domain }: { domain: Array<number | string> }) => (
    <span data-testid="y-axis" data-domain={domain.join(",")} />
  ),
  Tooltip: () => null,
  Bar: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <span data-testid="trend-bar">
      {name} ({dataKey})
    </span>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <span data-testid="trend-line">{name} ({dataKey})</span>
  ),
}));

const periodStart = "2026-08-31";
const periodEnd = "2026-09-06";
const calorieBaselineKcal = 2000;

function dailyLog(overrides: Partial<DailyLog>): DailyLog {
  return {
    id: 1,
    date: "2026-08-31",
    sleepMinutes: 480,
    steps: 7200,
    energy: "AVERAGE",
    painNotes: null,
    recoveryNotes: null,
    estimatedCalories: 2100,
    estimatedProteinGrams: 140,
    createdAt: "2026-08-31T08:00:00",
    updatedAt: "2026-08-31T08:00:00",
    ...overrides,
  };
}

function bodyMetric(overrides: Partial<BodyMetric>): BodyMetric {
  return {
    id: 1,
    date: "2026-08-31",
    weightKg: 79.5,
    waistCm: null,
    bodyFatPercentage: null,
    createdAt: "2026-08-31T08:00:00",
    ...overrides,
  };
}

describe("WeeklyTrendsChart", () => {
  it("renders weight, sleep, steps, and calories for every day of the week", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[
          dailyLog({ date: "2026-08-31", sleepMinutes: 480 }),
          dailyLog({ date: "2026-09-02", sleepMinutes: 360, steps: 6400 }),
        ]}
        bodyMetrics={[bodyMetric({ date: "2026-09-01", weightKg: 79.2 })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    const charts = screen.getAllByRole("img");
    const names = charts.map((chart) => chart.getAttribute("aria-label"));

    expect(names).toEqual([
      "Weekly weight trend",
      "Weekly Sleep trend",
      "Weekly Steps trend",
      "Weekly Calories trend",
    ]);

    const expectedDates = "2026-08-31,2026-09-01,2026-09-02,2026-09-03,2026-09-04,2026-09-05,2026-09-06";
    for (const chart of charts) {
      expect(chart).toHaveAttribute("data-dates", expectedDates);
    }

    const sleepChart = screen.getByRole("img", { name: "Weekly Sleep trend" });
    const sleepRows = JSON.parse(sleepChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      sleepHours: number | null;
      steps: number | null;
      estimatedCalories: number | null;
    }>;
    expect(sleepRows.find((row) => row.date === "2026-08-31")?.sleepHours).toBe(8);
    expect(sleepRows.find((row) => row.date === "2026-09-02")?.sleepHours).toBe(6);
    expect(sleepRows.find((row) => row.date === "2026-09-03")?.sleepHours).toBeNull();

    const weightChart = screen.getByRole("img", { name: "Weekly weight trend" });
    const weightRows = JSON.parse(weightChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      weightKg: number | null;
    }>;
    expect(weightRows.find((row) => row.date === "2026-09-01")?.weightKg).toBe(79.2);
    expect(weightRows.find((row) => row.date === "2026-08-31")?.weightKg).toBeNull();

    expect(screen.getAllByTestId("trend-bar").map((bar) => bar.textContent)).toEqual([
      "Sleep (sleepHours)",
      "Steps (steps)",
      "Calories (estimatedCalories)",
    ]);
    expect(screen.getAllByTestId("trend-line").map((line) => line.textContent)).toEqual(["Weight (weightKg)"]);
  });

  it("uses a 0-24 scale for sleep and anchors calories to the baseline", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[dailyLog({ date: "2026-08-31", estimatedCalories: 2450 })]}
        bodyMetrics={[bodyMetric({ date: "2026-09-01" })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(
      within(screen.getByRole("img", { name: "Weekly Sleep trend" })).getByTestId("y-axis"),
    ).toHaveAttribute("data-domain", "0,24");

    const stepsAxis = within(screen.getByRole("img", { name: "Weekly Steps trend" })).getByTestId("y-axis");
    expect(stepsAxis).toHaveAttribute("data-domain", "auto,auto");

    const caloriesChart = screen.getByRole("img", { name: "Weekly Calories trend" });
    const caloriesRows = JSON.parse(caloriesChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      estimatedCalories: number | null;
    }>;
    expect(caloriesRows.find((row) => row.date === "2026-08-31")?.estimatedCalories).toBe(450);
    expect(caloriesRows.find((row) => row.date === "2026-09-01")?.estimatedCalories).toBeNull();
    expect(caloriesChart).toHaveAttribute(
      "data-description",
      "Calories relative to the 2000 kcal baseline, per recorded day this week.",
    );
  });

  it("shows a fallback panel when a metric has no values for the week", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[dailyLog({ date: "2026-08-31", steps: null, estimatedCalories: null })]}
        bodyMetrics={[]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(screen.getByRole("img", { name: "Weekly Sleep trend" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Weekly weight trend" })).not.toBeInTheDocument();
    expect(screen.getByText("No weight measurements recorded this week.")).toBeInTheDocument();
    expect(screen.getByText("No calories recorded this week.")).toBeInTheDocument();
    expect(screen.getByText("No steps recorded this week.")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is recorded this week", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[]}
        bodyMetrics={[]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(screen.getByText("No weekly trends data")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});