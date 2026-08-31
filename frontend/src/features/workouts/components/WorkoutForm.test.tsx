import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { WorkoutForm } from "@/features/workouts/components/WorkoutForm";

describe("WorkoutForm", () => {
  it("submits nested exercises and sets with generated order indexes and set numbers", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <WorkoutForm
        initialDate="2026-09-01"
        isSubmitting={false}
        fieldErrors={{}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Workout type"), { target: { value: "UPPER" } });
    fireEvent.click(screen.getByRole("button", { name: "Add exercise" }));
    fireEvent.change(screen.getByLabelText("Exercise name"), {
      target: { value: "Bench Press" },
    });
    fireEvent.change(screen.getByLabelText("Weight (kg)"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Reps"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add set" }));

    const weightInputs = screen.getAllByLabelText("Weight (kg)");
    const repInputs = screen.getAllByLabelText("Reps");

    fireEvent.change(weightInputs[1], { target: { value: "90" } });
    fireEvent.change(repInputs[1], { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Save workout" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        date: "2026-09-01",
        workoutType: "UPPER",
        status: "PLANNED",
        notes: null,
        exercises: [
          {
            exerciseName: "Bench Press",
            orderIndex: 1,
            sets: [
              { setNumber: 1, weightKg: 100, reps: 5, rir: null, warmup: false },
              { setNumber: 2, weightKg: 90, reps: 8, rir: null, warmup: false },
            ],
          },
        ],
      });
    });
  });

  it("auto-selects the schedule by date while allowing a dropdown override", () => {
    render(<WorkoutForm initialDate="2026-08-31" isSubmitting={false} fieldErrors={{}} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Workout type")).toHaveValue("REST");
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-09-01" } });
    expect(screen.getByLabelText("Workout type")).toHaveValue("PUSH");
    fireEvent.change(screen.getByLabelText("Workout type"), { target: { value: "UPPER" } });
    expect(screen.getByLabelText("Workout type")).toHaveValue("UPPER");
  });

  it("places add exercise left and save workout right in one action row", () => {
    render(<WorkoutForm initialDate="2026-09-01" isSubmitting={false} fieldErrors={{}} onSubmit={vi.fn()} />);

    const actions = screen.getByRole("group", { name: "Workout actions" });
    expect(within(actions).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Add exercise",
      "Save workout",
    ]);
    expect(actions).toHaveClass("justify-between");
  });

  it("saves a scheduled rest day without exercises", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<WorkoutForm initialDate="2026-08-31" isSubmitting={false} fieldErrors={{}} onSubmit={onSubmit} />);

    expect(screen.queryByRole("button", { name: "Add exercise" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save rest day" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ workoutType: "REST", exercises: [] })));
  });

  it("allows an exercise to be saved without sets", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<WorkoutForm initialDate="2026-09-01" isSubmitting={false} fieldErrors={{}} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Add exercise" }));
    fireEvent.change(screen.getByLabelText("Exercise name"), { target: { value: "Squat" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove set 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Save workout" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      exercises: [{ exerciseName: "Squat", orderIndex: 1, sets: [] }],
    })));
  });

  it("copies the last set and disables copying when no sets exist", () => {
    render(<WorkoutForm initialDate="2026-09-01" isSubmitting={false} fieldErrors={{}} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Add exercise" }));
    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "80" } });
    fireEvent.change(screen.getByLabelText("Reps"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("RIR"), { target: { value: "2" } });
    fireEvent.click(screen.getByLabelText("Warm-up"));
    fireEvent.click(screen.getByRole("button", { name: "Copy last set" }));

    expect(screen.getAllByLabelText("Weight (kg)")).toHaveLength(2);
    expect(screen.getAllByLabelText("Weight (kg)")[1]).toHaveValue(80);
    expect(screen.getAllByLabelText("Reps")[1]).toHaveValue(8);
    expect(screen.getAllByLabelText("RIR")[1]).toHaveValue(2);
    expect(screen.getAllByLabelText("Warm-up")[1]).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Remove set 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove set 1" }));
    expect(screen.getByRole("button", { name: "Copy last set" })).toBeDisabled();
  });
});
