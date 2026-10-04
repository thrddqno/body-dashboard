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
const calorieBaselineKcal = 2500;

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
          dailyLog({ date: "2026-08-31", sleepMinutes: 480, estimatedCalories: 2450 }),
          dailyLog({ date: "2026-09-02", sleepMinutes: 360, steps: 6400, estimatedCalories: 2700 }),
        ]}
        bodyMetrics={[
          bodyMetric({ id: 1, date: "2026-08-24", weightKg: 79.8 }),
          bodyMetric({ id: 2, date: "2026-09-01", weightKg: 79.2 }),
        ]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    const charts = screen.getAllByRole("img");
    const names = charts.map((chart) => chart.getAttribute("aria-label"));

    expect(names).toEqual([
      "Recent weight trend",
      "Weekly Sleep trend",
      "Weekly Steps trend",
      "Weekly Calories trend",
    ]);

    const expectedDates = "2026-08-31,2026-09-01,2026-09-02,2026-09-03,2026-09-04,2026-09-05,2026-09-06";
    for (const chart of charts.filter((chart) => chart.getAttribute("aria-label") !== "Recent weight trend")) {
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

    const weightChart = screen.getByRole("img", { name: "Recent weight trend" });
    const weightRows = JSON.parse(weightChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      weightKg: number | null;
    }>;
    expect(weightRows).toEqual([
      { date: "2026-08-24", weightKg: 79.8 },
      { date: "2026-09-01", weightKg: 79.2 },
    ]);
    expect(screen.getByRole("table", { name: "Recent weight entries" })).toBeInTheDocument();

    const caloriesChart = screen.getByRole("img", { name: "Weekly Calories trend" });
    const caloriesRows = JSON.parse(caloriesChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      caloriesTotal: number | null;
      caloriesSurplus: number | null;
      caloriesBase: number | null;
      caloriesOverlay: number | null;
    }>;
    expect(caloriesRows.find((row) => row.date === "2026-08-31")).toMatchObject({
      caloriesTotal: 2450,
      caloriesSurplus: 0,
      caloriesBase: 2450,
      caloriesOverlay: 0,
    });
    expect(caloriesRows.find((row) => row.date === "2026-09-02")).toMatchObject({
      caloriesTotal: 2700,
      caloriesSurplus: 200,
      caloriesBase: 2300,
      caloriesOverlay: 200,
    });

    expect(screen.getAllByTestId("trend-bar").map((bar) => bar.textContent)).toEqual([
      "Sleep (sleepHours)",
      "Steps (steps)",
      "Target-scale base (caloriesBase)",
      "Surplus (caloriesOverlay)",
    ]);
    expect(screen.getAllByTestId("trend-line").map((line) => line.textContent)).toEqual(["Weight (weightKg)"]);
  });

  it("keeps calories on a fixed target scale and stacks surplus as a target-sized bar", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[
          dailyLog({ date: "2026-08-31", estimatedCalories: 2450 }),
          dailyLog({ date: "2026-09-02", estimatedCalories: 2700 }),
          dailyLog({ date: "2026-09-03", estimatedCalories: 2500 }),
        ]}
        bodyMetrics={[bodyMetric({ date: "2026-09-01" })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(
      within(screen.getByRole("img", { name: "Weekly Sleep trend" })).getByTestId("y-axis"),
    ).toHaveAttribute("data-domain", "0,12");

    const stepsAxis = within(screen.getByRole("img", { name: "Weekly Steps trend" })).getByTestId("y-axis");
    expect(stepsAxis).toHaveAttribute("data-domain", "auto,auto");

    const caloriesChart = screen.getByRole("img", { name: "Weekly Calories trend" });
    expect(within(caloriesChart).getByTestId("y-axis")).toHaveAttribute("data-domain", "0,2500");
    const calorieDesc = caloriesChart.getAttribute("data-description") ?? "";
    expect(calorieDesc).toContain("fixed 2500 kcal target");

    const caloriesRows = JSON.parse(caloriesChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      caloriesTotal: number | null;
      caloriesSurplus: number | null;
      caloriesBase: number | null;
      caloriesOverlay: number | null;
    }>;
    expect(caloriesRows.find((row) => row.date === "2026-08-31")).toMatchObject({
      caloriesTotal: 2450,
      caloriesSurplus: 0,
      caloriesBase: 2450,
      caloriesOverlay: 0,
    });
    expect(caloriesRows.find((row) => row.date === "2026-09-02")).toMatchObject({
      caloriesTotal: 2700,
      caloriesSurplus: 200,
      caloriesBase: 2300,
      caloriesOverlay: 200,
    });
    expect(caloriesRows.find((row) => row.date === "2026-09-03")).toMatchObject({
      caloriesTotal: 2500,
      caloriesSurplus: 0,
      caloriesBase: 2500,
      caloriesOverlay: 0,
    });

    expect(screen.getByText(/fixed 2,500 kcal target scale/)).toBeInTheDocument();
    expect(screen.getByText(/Above target, orange is the surplus and green fills the remaining target-scale height/)).toBeInTheDocument();
    expect(screen.getByText(/The largest surplus is 200 kcal\./)).toBeInTheDocument();
    expect(screen.getByText("Target-scale base")).toBeInTheDocument();
    expect(screen.getAllByText("Surplus")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Recorded calorie totals and surplus by day" })).toBeInTheDocument();
  });

  it("clamps an unusually large surplus so the stacked bar never exceeds the target", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[dailyLog({ date: "2026-09-02", estimatedCalories: 5500 })]}
        bodyMetrics={[bodyMetric({ date: "2026-09-01" })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    const caloriesChart = screen.getByRole("img", { name: "Weekly Calories trend" });
    expect(within(caloriesChart).getByTestId("y-axis")).toHaveAttribute("data-domain", "0,2500");
    const caloriesRows = JSON.parse(caloriesChart.getAttribute("data-values") ?? "") as Array<{
      date: string;
      caloriesTotal: number | null;
      caloriesSurplus: number | null;
      caloriesBase: number | null;
      caloriesOverlay: number | null;
    }>;
    expect(caloriesRows.find((row) => row.date === "2026-09-02")).toMatchObject({
      caloriesTotal: 5500,
      caloriesSurplus: 3000,
      caloriesBase: 0,
      caloriesOverlay: 2500,
    });
  });

  it("extends the sleep scale when a recorded entry exceeds 12 hours", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[dailyLog({ sleepMinutes: 780 })]}
        bodyMetrics={[]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(
      within(screen.getByRole("img", { name: "Weekly Sleep trend" })).getByTestId("y-axis"),
    ).toHaveAttribute("data-domain", "0,13");
  });

  it("shows a recorded value instead of a floating point when only one weight entry exists", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[]}
        bodyMetrics={[bodyMetric({ date: "2026-09-01", weightKg: 79.2 })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
      />,
    );

    expect(screen.getByText("79.2 kg")).toBeInTheDocument();
    expect(screen.getByText(/Add another measurement to show a trend/)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Recent weight trend" })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("img", { name: "Recent weight trend" })).not.toBeInTheDocument();
    expect(screen.getByText("No weight measurements recorded.")).toBeInTheDocument();
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

  it("keeps weight visible when daily trend data failed to load", () => {
    render(
      <WeeklyTrendsChart
        dailyLogs={[]}
        bodyMetrics={[bodyMetric({ date: "2026-08-24" }), bodyMetric({ id: 2, date: "2026-09-01" })]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        calorieBaselineKcal={calorieBaselineKcal}
        error="Sleep, steps, and calorie data could not be loaded."
      />,
    );

    expect(screen.getByText("Daily trends are temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByText("Sleep, steps, and calorie data could not be loaded.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Recent weight trend" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Weekly Calories trend" })).not.toBeInTheDocument();
  });
});
