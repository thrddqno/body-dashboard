import { fireEvent, render, screen, within } from "@testing-library/react";

import { WeeklyCalendar } from "@/features/dashboard/components/WeeklyCalendar";
import type { TrainingPlan } from "@/types/plannedWorkout";
import type { Workout } from "@/types/workout";

const missedWorkout: Workout = {
  id: 1,
  date: "2026-08-31",
  workoutType: "Upper",
  status: "MISSED",
  notes: null,
  exercises: [],
  createdAt: "2026-08-31T08:00:00",
  updatedAt: "2026-08-31T08:00:00",
};

function plan(date: string, dayOfWeek: string, workoutType: TrainingPlan["workoutType"], title: string): TrainingPlan {
  return {
    date,
    dayOfWeek,
    workoutType,
    type: workoutType === "REST" ? "rest" : "workout",
    title,
    subtitle: "",
    warmup: [],
    exercises: [],
    guardrails: [],
  };
}

describe("WeeklyCalendar", () => {
  it("exposes selection and does not classify an empty date as recovery", () => {
    const onSelectDate = vi.fn();

    render(
      <WeeklyCalendar
        dates={["2026-08-31", "2026-09-01"]}
        today="2026-08-31"
        workoutsByDate={{ "2026-08-31": [missedWorkout] }}
        plansByDate={{}}
        selectedDate="2026-08-31"
        onSelectDate={onSelectDate}
      />,
    );

    const selectedDay = screen.getByRole("button", { name: /mon.*aug 31/i });
    const emptyDay = screen.getByRole("button", { name: /tue.*sep 1/i });

    expect(selectedDay).toHaveAttribute("aria-pressed", "true");
    expect(selectedDay).not.toHaveClass("-translate-y-1");
    expect(screen.getByText("Today · Mon")).toBeInTheDocument();
    expect(screen.getByText("No workout reported")).toBeInTheDocument();
    expect(screen.queryByText(/recovery day/i)).not.toBeInTheDocument();

    fireEvent.click(emptyDay);
    expect(onSelectDate).toHaveBeenCalledWith("2026-09-01");
  });

  it("orders the training week from Monday through Sunday", () => {
    render(
      <WeeklyCalendar
        dates={["2026-09-06", "2026-08-31", "2026-09-01"]}
        today="2026-08-31"
        workoutsByDate={{}}
        plansByDate={{}}
        selectedDate="2026-08-31"
        onSelectDate={vi.fn()}
      />,
    );

    const dayButtons = screen.getAllByRole("button");
    expect(dayButtons[0]).toHaveAccessibleName(/mon.*aug 31/i);
    expect(dayButtons[1]).toHaveAccessibleName(/tue.*sep 1/i);
    expect(dayButtons[2]).toHaveAccessibleName(/sun.*sep 6/i);
  });

  it("shows the recurring plan for every weekday instead of replacing it with logged workout types", () => {
    const dates = [
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ];
    const plansByDate = {
      "2026-08-31": plan("2026-08-31", "MONDAY", "UPPER_A", "Upper A"),
      "2026-09-01": plan("2026-09-01", "TUESDAY", "LOWER_A", "Lower A"),
      "2026-09-02": plan("2026-09-02", "WEDNESDAY", "REST", "Rest"),
      "2026-09-03": plan("2026-09-03", "THURSDAY", "REST", "Rest"),
      "2026-09-04": plan("2026-09-04", "FRIDAY", "REST", "Rest"),
      "2026-09-05": plan("2026-09-05", "SATURDAY", "UPPER_B", "Upper B"),
      "2026-09-06": plan("2026-09-06", "SUNDAY", "LOWER_B", "Lower B"),
    };

    render(
      <WeeklyCalendar
        dates={dates}
        today="2026-08-31"
        workoutsByDate={{
          "2026-08-31": [{ ...missedWorkout, workoutType: "LOWER_B" }],
        }}
        plansByDate={plansByDate}
        selectedDate="2026-08-31"
        onSelectDate={vi.fn()}
      />,
    );

    const dayButtons = screen.getAllByRole("button");
    const expectedTitles = ["Upper A", "Lower A", "Rest", "Rest", "Rest", "Upper B", "Lower B"];
    dayButtons.forEach((button, index) => {
      expect(within(button).getByText(expectedTitles[index])).toBeInTheDocument();
    });
    expect(within(dayButtons[0]).queryByText("Lower B")).not.toBeInTheDocument();
  });
});
