import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { SelectedDayPanel } from "@/features/dashboard/components/SelectedDayPanel";
import type { TrainingPlan } from "@/types/plannedWorkout";
import type { Workout } from "@/types/workout";

const mocks = vi.hoisted(() => ({
  toPng: vi.fn(),
}));

vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => mocks.toPng(...args),
}));

const workoutPlan: TrainingPlan = {
  date: "2026-09-01",
  dayOfWeek: "TUESDAY",
  workoutType: "UPPER" as TrainingPlan["workoutType"],
  type: "workout",
  title: "Upper",
  subtitle: "Upper body strength",
  warmup: ["Five minutes easy cardio"],
  exercises: [{
    name: "Chest Press",
    sets: 3,
    reps: "8-12",
    rir: "2-3",
    rest: "2 min",
    notes: "Use a controlled range.",
  }],
  optional: ["Ten minutes easy cardio"],
  guardrails: ["Stop if pain appears."],
};

const plannedWorkout: Workout = {
  id: 2,
  date: "2026-09-01",
  workoutType: "UPPER",
  status: "PLANNED",
  notes: null,
  exercises: [],
  createdAt: "2026-09-01T08:00:00",
  updatedAt: "2026-09-01T08:00:00",
};

function renderPanel({
  today = "2026-09-01",
  workouts = [plannedWorkout],
  plan = workoutPlan,
}: {
  today?: string;
  workouts?: Workout[];
  plan?: TrainingPlan;
} = {}) {
  return render(
    <MemoryRouter>
      <SelectedDayPanel
        today={today}
        selectedDate="2026-09-01"
        workouts={workouts}
        plan={plan}
      />
    </MemoryRouter>,
  );
}

describe("planned workout PNG export", () => {
  beforeEach(() => {
    mocks.toPng.mockReset();
  });

  it("is offered only for today's persisted planned workout", () => {
    const { rerender } = renderPanel();
    expect(screen.getByRole("button", { name: "Save PNG" })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <SelectedDayPanel
          today="2026-09-02"
          selectedDate="2026-09-01"
          workouts={[plannedWorkout]}
          plan={workoutPlan}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: "Save PNG" })).not.toBeInTheDocument();
  });

  it("is not offered for an unsaved plan or a rest day", () => {
    const { rerender } = renderPanel({ workouts: [] });
    expect(screen.queryByRole("button", { name: "Save PNG" })).not.toBeInTheDocument();

    const restPlan: TrainingPlan = {
      ...workoutPlan,
      workoutType: "REST",
      type: "rest",
      title: "Rest",
      subtitle: "Recovery day",
      warmup: [],
      exercises: [],
      optional: [],
      guardrails: ["This is an intentional rest day."],
    };
    rerender(
      <MemoryRouter>
        <SelectedDayPanel
          today="2026-09-01"
          selectedDate="2026-09-01"
          workouts={[{ ...plannedWorkout, workoutType: "REST" }]}
          plan={restPlan}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: "Save PNG" })).not.toBeInTheDocument();
  });

  it("saves a 1080 by 1920 PNG containing the complete plan", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    mocks.toPng.mockResolvedValue("data:image/png;base64,workout");
    renderPanel();

    const artwork = screen.getByTestId("workout-plan-image");
    expect(artwork).toHaveStyle({ width: "1080px", height: "1920px" });
    expect(within(artwork).getByText("Five minutes easy cardio")).toBeInTheDocument();
    expect(within(artwork).getByText("3 x 8-12 | RIR 2-3 | Rest 2 min")).toBeInTheDocument();
    expect(within(artwork).getByText("Use a controlled range.")).toBeInTheDocument();
    expect(within(artwork).getByText("Ten minutes easy cardio")).toBeInTheDocument();
    expect(within(artwork).getByText("- Stop if pain appears.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save PNG" }));

    await waitFor(() => expect(mocks.toPng).toHaveBeenCalledWith(
      artwork,
      expect.objectContaining({ width: 1080, height: 1920, pixelRatio: 1 }),
    ));
    const clickedAnchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(clickedAnchor.download).toBe("move-free-workout-2026-09-01.png");
    expect(clickedAnchor.href).toBe("data:image/png;base64,workout");
    clickSpy.mockRestore();
  });

  it("reports PNG generation failures", async () => {
    mocks.toPng.mockRejectedValue(new Error("Canvas failed"));
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Save PNG" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save the workout image");
  });
});
