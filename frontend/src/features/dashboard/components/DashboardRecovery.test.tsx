import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { CoachNotes } from "@/features/dashboard/components/CoachNotes";
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
        <WorkoutLog workouts={[missedWorkout]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("missed")).toBeInTheDocument();
    expect(screen.getByText(/do not stack or double/i)).toBeInTheDocument();
    expect(screen.getByText("No exercise details reported.")).toBeInTheDocument();
    expect(screen.getAllByText("Not recorded")).toHaveLength(2);
  });
});
