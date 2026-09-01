import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { DashboardPage } from "@/pages/DashboardPage";

const mocks = vi.hoisted(() => ({
  getDashboard: vi.fn(),
  getLatestWeeklyAiAnalysis: vi.fn(),
  getTrainingPlan: vi.fn(),
  getWeeklyAnalytics: vi.fn(),
  listWorkoutPage: vi.fn(),
  listWorkoutsByDateRange: vi.fn(),
}));

vi.mock("@/api/dashboardApi", () => ({
  getDashboard: (...args: unknown[]) => mocks.getDashboard(...args),
}));

vi.mock("@/api/analyticsApi", () => ({
  getWeeklyAnalytics: (...args: unknown[]) => mocks.getWeeklyAnalytics(...args),
}));

vi.mock("@/api/aiAnalysisApi", () => ({
  getLatestWeeklyAiAnalysis: (...args: unknown[]) => mocks.getLatestWeeklyAiAnalysis(...args),
}));

vi.mock("@/api/trainingPlansApi", () => ({
  getTrainingPlan: (...args: unknown[]) => mocks.getTrainingPlan(...args),
}));

vi.mock("@/api/workoutsApi", () => ({
  listWorkoutPage: (...args: unknown[]) => mocks.listWorkoutPage(...args),
  listWorkoutsByDateRange: (...args: unknown[]) => mocks.listWorkoutsByDateRange(...args),
}));

vi.mock("@/features/dashboard/components/CoachNotes", () => ({ CoachNotes: () => null }));
vi.mock("@/features/dashboard/components/DashboardHeader", () => ({ DashboardHeader: () => null }));
vi.mock("@/features/dashboard/components/DashboardSidePanels", () => ({ DashboardSidePanels: () => null }));
vi.mock("@/features/dashboard/components/SelectedDayPanel", () => ({ SelectedDayPanel: () => null }));
vi.mock("@/features/dashboard/components/WeeklyCalendar", () => ({ WeeklyCalendar: () => null }));
vi.mock("@/features/dashboard/components/WeeklySummary", () => ({ WeeklySummary: () => null }));

function workout(id: number) {
  return {
    id,
    date: `2026-08-${String(id).padStart(2, "0")}`,
    workoutType: "PUSH",
    status: "COMPLETED" as const,
    notes: null,
    exercises: [],
    createdAt: `2026-08-${String(id).padStart(2, "0")}T08:00:00`,
    updatedAt: `2026-08-${String(id).padStart(2, "0")}T08:00:00`,
  };
}

describe("DashboardPage workout history", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.getDashboard.mockResolvedValue({
      today: { date: "2026-08-31", dailyLog: null },
      body: {},
      training: {},
    });
    mocks.getWeeklyAnalytics.mockResolvedValue({
      period: { start: "2026-08-31", end: "2026-09-06" },
    });
    mocks.getLatestWeeklyAiAnalysis.mockResolvedValue(null);
    mocks.getTrainingPlan.mockResolvedValue({
      date: "2026-08-31",
      dayOfWeek: "Monday",
      workoutType: "PUSH",
      type: "workout",
      title: "Push",
      subtitle: "",
      warmup: [],
      exercises: [],
      guardrails: [],
    });
    mocks.listWorkoutsByDateRange.mockResolvedValue([]);
    mocks.listWorkoutPage.mockImplementation(async (page: number, pageSize: number) => ({
      workouts: [workout(page + 1)],
      page,
      pageSize,
      totalElements: 18,
      totalPages: Math.ceil(18 / pageSize),
    }));
  });

  it("pages Recorded sessions independently from calendar workouts", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Page 1 of 3 · 18 workouts")).toBeInTheDocument();
    expect(mocks.listWorkoutsByDateRange).toHaveBeenCalledWith(
      "2026-08-31",
      "2026-09-06",
      expect.any(AbortSignal),
    );
    expect(mocks.listWorkoutPage).toHaveBeenCalledWith(0, 7, expect.any(AbortSignal));

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledWith(
      1,
      7,
      expect.any(AbortSignal),
    ));
    expect(await screen.findByText("Page 2 of 3 · 18 workouts")).toBeInTheDocument();
    expect(mocks.listWorkoutsByDateRange).toHaveBeenCalledTimes(1);
  });

  it("retries a failed recorded-session request", async () => {
    mocks.listWorkoutPage
      .mockRejectedValueOnce(new Error("History unavailable"))
      .mockResolvedValueOnce({ workouts: [], page: 0, pageSize: 7, totalElements: 0, totalPages: 0 });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("No workouts reported.")).toBeInTheDocument();
  });
});
