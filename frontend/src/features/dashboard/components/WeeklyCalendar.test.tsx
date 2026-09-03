import { fireEvent, render, screen } from "@testing-library/react";

import { WeeklyCalendar } from "@/features/dashboard/components/WeeklyCalendar";
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

describe("WeeklyCalendar", () => {
  it("exposes selection and does not classify an empty date as recovery", () => {
    const onSelectDate = vi.fn();

    render(
      <WeeklyCalendar
        dates={["2026-08-31", "2026-09-01"]}
        today="2026-08-31"
        workoutsByDate={{ "2026-08-31": [missedWorkout] }}
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
});
