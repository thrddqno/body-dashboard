import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { SelectedDayPanel } from "@/features/dashboard/components/SelectedDayPanel";
import { getPlannedWorkout } from "@/utils/workoutPlanResolver";
import type { Workout } from "@/types/workout";

const completedWorkout: Workout = {
  id: 1,
  date: "2026-09-01",
  workoutType: "Push",
  status: "COMPLETED",
  notes: "Felt strong today",
  exercises: [
    {
      id: 1,
      exerciseName: "Bench Press",
      orderIndex: 1,
      sets: [
        { id: 1, setNumber: 1, weightKg: 80, reps: 8, rir: 2, warmup: false },
      ],
    },
  ],
  createdAt: "2026-09-01T08:00:00",
  updatedAt: "2026-09-01T08:00:00",
};

function renderPanel(date: string, workouts: Workout[] = []) {
  return render(
    <MemoryRouter>
      <SelectedDayPanel selectedDate={date} workouts={workouts} />
    </MemoryRouter>,
  );
}

describe("Planned workout fallback", () => {
  describe("weekday resolution", () => {
    it("resolves Tuesday to Push plan", () => {
      const plan = getPlannedWorkout("2026-09-01");
      expect(plan.title).toBe("Push");
      expect(plan.type).toBe("workout");
      expect(plan.subtitle).toBe("Chest, shoulders, triceps");
    });

    it("resolves Wednesday to Pull plan", () => {
      const plan = getPlannedWorkout("2026-09-02");
      expect(plan.title).toBe("Pull");
      expect(plan.type).toBe("workout");
      expect(plan.subtitle).toBe("Back, rear delts, biceps");
    });

    it("resolves Thursday to Legs + Core plan", () => {
      const plan = getPlannedWorkout("2026-09-03");
      expect(plan.title).toBe("Legs + Core");
      expect(plan.type).toBe("workout");
      expect(plan.subtitle).toBe("Stable lower body and core");
    });

    it("resolves Friday to Rest", () => {
      const plan = getPlannedWorkout("2026-09-04");
      expect(plan.title).toBe("Rest");
      expect(plan.type).toBe("rest");
      expect(plan.subtitle).toBe("Recovery / sleep protection");
    });

    it("resolves Saturday to Upper plan", () => {
      const plan = getPlannedWorkout("2026-09-05");
      expect(plan.title).toBe("Upper");
      expect(plan.type).toBe("workout");
      expect(plan.subtitle).toBe("Upper body plus skill practice");
    });

    it("resolves Sunday to Lower plan", () => {
      const plan = getPlannedWorkout("2026-09-06");
      expect(plan.title).toBe("Lower");
      expect(plan.type).toBe("workout");
      expect(plan.subtitle).toBe("Lower body strength and controlled movement");
    });

    it("resolves Monday to Rest", () => {
      const plan = getPlannedWorkout("2026-09-07");
      expect(plan.title).toBe("Rest");
      expect(plan.type).toBe("rest");
      expect(plan.subtitle).toBe("Recovery day");
    });
  });

  describe("logged workout overrides plan", () => {
    it("shows logged workout instead of planned workout", () => {
      renderPanel("2026-09-01", [completedWorkout]);

      expect(screen.getByText("Push")).toBeInTheDocument();
      expect(screen.getByText("Felt strong today")).toBeInTheDocument();
      expect(screen.queryByText("Today's Plan")).not.toBeInTheDocument();
      expect(screen.queryByText("PLANNED WORKOUT")).not.toBeInTheDocument();
    });
  });

  describe("planned workout display", () => {
    it("renders Push plan when no workout logged on Tuesday", () => {
      renderPanel("2026-09-01");

      expect(screen.getByText("Today's Plan")).toBeInTheDocument();
      expect(screen.getByText(/Tue, Sep 1 · Push/)).toBeInTheDocument();
      expect(screen.getByText("Chest, shoulders, triceps")).toBeInTheDocument();
    });

    it("renders Pull plan when no workout logged on Wednesday", () => {
      renderPanel("2026-09-02");

      expect(screen.getByText(/Wed, Sep 2 · Pull/)).toBeInTheDocument();
      expect(screen.getByText("Back, rear delts, biceps")).toBeInTheDocument();
    });

    it("renders Legs + Core plan when no workout logged on Thursday", () => {
      renderPanel("2026-09-03");

      expect(screen.getByText(/Thu, Sep 3 · Legs \+ Core/)).toBeInTheDocument();
      expect(screen.getByText("Stable lower body and core")).toBeInTheDocument();
    });

    it("renders Upper plan when no workout logged on Saturday", () => {
      renderPanel("2026-09-05");

      expect(screen.getByText(/Sat, Sep 5 · Upper/)).toBeInTheDocument();
      expect(screen.getByText("Upper body plus skill practice")).toBeInTheDocument();
    });

    it("renders Lower plan when no workout logged on Sunday", () => {
      renderPanel("2026-09-06");

      expect(screen.getByText(/Sun, Sep 6 · Lower/)).toBeInTheDocument();
      expect(screen.getByText("Lower body strength and controlled movement")).toBeInTheDocument();
    });
  });

  describe("rest day display", () => {
    it("renders rest day for Friday with recovery messaging", () => {
      renderPanel("2026-09-04");

      expect(screen.getByText(/Fri, Sep 4 · Rest/)).toBeInTheDocument();
      expect(screen.getByText("Recovery / sleep protection")).toBeInTheDocument();
      expect(screen.getByText("This is a recovery day, not a missed lifting slot.")).toBeInTheDocument();
      expect(screen.getByText("Optional")).toBeInTheDocument();
      expect(screen.getByText("Easy walk after work")).toBeInTheDocument();
    });

    it("renders rest day for Monday with recovery messaging", () => {
      renderPanel("2026-09-07");

      expect(screen.getByText(/Mon, Sep 7 · Rest/)).toBeInTheDocument();
      expect(screen.getByText("Recovery day")).toBeInTheDocument();
      expect(screen.getByText("This is an intentional rest day.")).toBeInTheDocument();
    });

    it("does not label rest day as missed", () => {
      renderPanel("2026-09-04");

      expect(screen.queryByText("Missed")).not.toBeInTheDocument();
      expect(screen.queryByText("This is a missed session")).not.toBeInTheDocument();
    });
  });

  describe("exercise cards", () => {
    it("renders each exercise as an individual card", () => {
      renderPanel("2026-09-01");

      expect(screen.getByText("Machine Chest Press")).toBeInTheDocument();
      expect(screen.getByText("Incline Dumbbell Press")).toBeInTheDocument();
      expect(screen.getByText("Seated Machine Shoulder Press")).toBeInTheDocument();
      expect(screen.getByText("Cable or Machine Lateral Raise")).toBeInTheDocument();
      expect(screen.getByText("Rope Pressdown")).toBeInTheDocument();
    });

    it("displays sets, reps, RIR, and rest for each exercise", () => {
      renderPanel("2026-09-01");

      expect(screen.getByText("2 × 6–10")).toBeInTheDocument();
      expect(screen.getAllByText("RIR 3–4").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Rest: 2 min").length).toBeGreaterThanOrEqual(1);
    });

    it("displays exercise notes when available", () => {
      renderPanel("2026-09-02");

      expect(screen.getByText("Lat Pulldown")).toBeInTheDocument();
      expect(screen.getByText("Pause near chest. Avoid turning it into a lean-back pull.")).toBeInTheDocument();
    });
  });

  describe("warm-up and guardrails", () => {
    it("displays warm-up section", () => {
      renderPanel("2026-09-01");

      expect(screen.getByText("Warm-up")).toBeInTheDocument();
      expect(screen.getByText("5 min easy treadmill or bike")).toBeInTheDocument();
    });

    it("displays guardrails section", () => {
      renderPanel("2026-09-01");

      expect(screen.getByText("Guardrails")).toBeInTheDocument();
      expect(screen.getByText("First ramp week stays at 2 work sets.")).toBeInTheDocument();
    });
  });

  describe("no persistence side effects", () => {
    it("does not create workout records when displaying plan", () => {
      const { container } = renderPanel("2026-09-01");

      expect(screen.getByText("Today's Plan")).toBeInTheDocument();
      expect(container.querySelector("[data-workout-id]")).not.toBeInTheDocument();
    });
  });

  describe("UTC/timezone safety", () => {
    it("does not shift weekday due to UTC conversion", () => {
      // 2026-09-01 is a Tuesday in local time
      // Using parseLocalDate ensures no timezone shift
      const plan = getPlannedWorkout("2026-09-01");
      expect(plan.title).toBe("Push");

      // 2026-09-07 is a Monday in local time
      const mondayPlan = getPlannedWorkout("2026-09-07");
      expect(mondayPlan.title).toBe("Rest");
      expect(mondayPlan.type).toBe("rest");
    });
  });
});
