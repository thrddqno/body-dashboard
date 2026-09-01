import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BodyMetricForm } from "@/features/bodyMetrics/components/BodyMetricForm";

describe("BodyMetricForm", () => {
  it("maps values to a request and clears measurements after a successful save", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <BodyMetricForm
        initialDate="2026-09-01"
        isSubmitting={false}
        fieldErrors={{}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "82.75" } });
    fireEvent.change(screen.getByLabelText("Waist (cm)"), { target: { value: "80.5" } });
    fireEvent.change(screen.getByLabelText("Body fat (%)"), { target: { value: "15.2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save measurement" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      date: "2026-09-01",
      weightKg: 82.75,
      waistCm: 80.5,
      bodyFatPercentage: 15.2,
    }));

    await waitFor(() => expect(screen.getByLabelText("Weight (kg)")).toHaveValue(null));
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-01");
  });

  it("associates backend errors with their controls", () => {
    render(
      <BodyMetricForm
        initialDate="2026-09-01"
        isSubmitting={false}
        fieldErrors={{ weightKg: "Weight is required." }}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Weight (kg)");
    const error = screen.getByText("Weight is required.");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });
});
