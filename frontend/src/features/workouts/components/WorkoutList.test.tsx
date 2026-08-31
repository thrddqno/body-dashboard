import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { WorkoutList } from "@/features/workouts/components/WorkoutList";

describe("WorkoutList", () => {
  it("makes the workout card the detail link", () => {
    render(
      <MemoryRouter>
        <WorkoutList workouts={[{
          id: 42,
          date: "2026-09-01",
          workoutType: "PUSH",
          status: "COMPLETED",
          notes: null,
          exercises: [],
          createdAt: "2026-09-01T08:00:00Z",
          updatedAt: "2026-09-01T08:00:00Z",
        }]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /PUSH/i })).toHaveAttribute("href", "/workouts/42");
    expect(screen.queryByText("Open detail")).not.toBeInTheDocument();
  });

  it("sorts newest first and presents rest days without exercise debt", () => {
    render(
      <MemoryRouter>
        <WorkoutList workouts={[
          {
            id: 1,
            date: "2026-09-01",
            workoutType: "PUSH",
            status: "COMPLETED",
            notes: "Good session",
            exercises: [{
              id: 1,
              exerciseName: "Bench Press",
              orderIndex: 1,
              sets: [{ id: 1, setNumber: 1, weightKg: 80, reps: 8, rir: 2, warmup: false }],
            }],
            createdAt: "2026-09-01T08:00:00Z",
            updatedAt: "2026-09-01T08:00:00Z",
          },
          {
            id: 2,
            date: "2026-09-04",
            workoutType: "REST",
            status: "COMPLETED",
            notes: null,
            exercises: [],
            createdAt: "2026-09-04T08:00:00Z",
            updatedAt: "2026-09-04T08:00:00Z",
          },
        ]} />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/workouts/2");
    expect(screen.getByText("Recovery day · No exercises required")).toBeInTheDocument();
    expect(screen.getByText("1 exercise · 1 set logged")).toBeInTheDocument();
  });
});
