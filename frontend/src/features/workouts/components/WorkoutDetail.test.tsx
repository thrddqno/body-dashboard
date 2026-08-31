import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { WorkoutDetail } from "@/features/workouts/components/WorkoutDetail";

describe("WorkoutDetail", () => {
  it("allows status updates through the provided handler", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <WorkoutDetail
        workout={{
          id: 1,
          date: "2026-08-31",
          workoutType: "Lower",
          status: "PLANNED",
          notes: null,
          createdAt: "2026-08-31T08:00:00",
          updatedAt: "2026-08-31T08:00:00",
          exercises: [],
        }}
        isUpdatingStatus={false}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "COMPLETED" },
    });

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith("COMPLETED");
    });
  });
});
