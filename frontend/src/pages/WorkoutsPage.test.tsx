import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { WorkoutsPage } from "@/pages/WorkoutsPage";

const mocks = vi.hoisted(() => ({
  createWorkout: vi.fn(),
  getTrainingPlan: vi.fn(),
  listWorkoutPage: vi.fn(),
}));

vi.mock("@/api/workoutsApi", () => ({
  createWorkout: (...args: unknown[]) => mocks.createWorkout(...args),
  listWorkoutPage: (...args: unknown[]) => mocks.listWorkoutPage(...args),
}));

vi.mock("@/api/trainingPlansApi", () => ({
  getTrainingPlan: (...args: unknown[]) => mocks.getTrainingPlan(...args),
}));

vi.mock("@/features/workouts/components/WorkoutForm", () => ({
  WorkoutForm: () => <div>Workout form</div>,
}));

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

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkoutsPage />
    </MemoryRouter>,
  );
}

describe("WorkoutsPage pagination", () => {
  beforeEach(() => {
    mocks.createWorkout.mockReset();
    mocks.getTrainingPlan.mockReset();
    mocks.listWorkoutPage.mockReset();
    mocks.getTrainingPlan.mockResolvedValue({ workoutType: "PUSH" });
    mocks.listWorkoutPage.mockImplementation(async (page: number, pageSize: number) => ({
      workouts: [workout(page + 1)],
      page,
      pageSize,
      totalElements: 40,
      totalPages: Math.ceil(40 / pageSize),
    }));
  });

  it("loads seven items by default and supports paging", async () => {
    renderPage();

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledWith(
      0,
      7,
      expect.any(AbortSignal),
    ));
    expect(await screen.findByText("Page 1 of 6 · 40 workouts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledWith(
      1,
      7,
      expect.any(AbortSignal),
    ));
    expect(await screen.findByText("Page 2 of 6 · 40 workouts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("offers only the supported sizes and resets to page one when changed", async () => {
    renderPage();
    await screen.findByText("Page 1 of 6 · 40 workouts");

    const selector = screen.getByLabelText("Items per page");
    expect(within(selector).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "7",
      "15",
      "30",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Page 2 of 6 · 40 workouts");
    fireEvent.change(selector, { target: { value: "15" } });

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledWith(
      0,
      15,
      expect.any(AbortSignal),
    ));
    expect(await screen.findByText("Page 1 of 3 · 40 workouts")).toBeInTheDocument();
  });

  it("keeps pagination controls hidden for an empty history", async () => {
    mocks.listWorkoutPage.mockResolvedValue({
      workouts: [],
      page: 0,
      pageSize: 7,
      totalElements: 0,
      totalPages: 0,
    });

    renderPage();

    expect(await screen.findByText("No workouts recorded")).toBeInTheDocument();
    expect(screen.queryByLabelText("Items per page")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Workout history pages" })).not.toBeInTheDocument();
  });

  it("retries the current page after a request fails", async () => {
    mocks.listWorkoutPage
      .mockRejectedValueOnce(new Error("History unavailable"))
      .mockResolvedValueOnce({ workouts: [], page: 0, pageSize: 7, totalElements: 0, totalPages: 0 });

    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    await waitFor(() => expect(mocks.listWorkoutPage).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("No workouts recorded")).toBeInTheDocument();
  });
});
