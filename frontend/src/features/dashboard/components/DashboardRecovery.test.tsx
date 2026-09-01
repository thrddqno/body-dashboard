import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { CoachNotes } from "@/features/dashboard/components/CoachNotes";
import { SelectedDayPanel } from "@/features/dashboard/components/SelectedDayPanel";
import { WorkoutLog } from "@/features/dashboard/components/WorkoutLog";
import type { Workout } from "@/types/workout";

const missedWorkout: Workout = {
  id: 1,
  date: "2026-08-31",
  workoutType: "Lower",
  status: "MISSED",
  notes: null,
  exercises: [],
  createdAt: "2026-08-31T08:00:00",
  updatedAt: "2026-08-31T08:00:00",
};

describe("dashboard recovery states", () => {
  it("displays only the latest persisted analysis summary", () => {
    render(
      <MemoryRouter>
        <CoachNotes
          analysis={{
            summary: "Prioritize **recovery** before adding work.",
            knownFacts: [],
            interpretation: [],
            strengths: [],
            concerns: [],
            recommendations: [],
            dataGaps: [],
            generatedAt: "2026-08-31T08:00:00Z",
          }}
          isLoading={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("recovery")).toBeInTheDocument();
    expect(screen.queryByText(/check-in/i)).not.toBeInTheDocument();
  });

  it("marks missed workouts as incomplete without creating training debt", () => {
    render(
      <MemoryRouter>
        <WorkoutLog
          workouts={[missedWorkout]}
          page={0}
          pageSize={7}
          totalElements={1}
          totalPages={1}
          isLoading={false}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          onRetry={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("missed")).toBeInTheDocument();
    expect(screen.getByText("Missed, not training debt.")).toBeInTheDocument();
    expect(screen.getByText("0 exercises · 0 sets logged")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lower/i })).toHaveAttribute("href", "/workouts/1");
  });

  it("uses workout list cards for the selected day", () => {
    render(
      <MemoryRouter>
        <SelectedDayPanel selectedDate="2026-08-31" workouts={[missedWorkout]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Monday, Aug 31, 2026" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lower/i })).toHaveAttribute("href", "/workouts/1");
    expect(screen.getByRole("link", { name: "View daily log" })).toHaveAttribute("href", "/daily-log/2026-08-31");
  });
});
