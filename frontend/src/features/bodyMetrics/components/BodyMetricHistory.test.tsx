import { render, screen } from "@testing-library/react";

import { BodyMetricHistory } from "@/features/bodyMetrics/components/BodyMetricHistory";

describe("BodyMetricHistory", () => {
  it("renders missing optional values as not recorded", () => {
    render(
      <BodyMetricHistory
        metrics={[
          {
            id: 1,
            date: "2026-08-31",
            weightKg: 80,
            waistCm: null,
            bodyFatPercentage: null,
            createdAt: "2026-08-31T08:00:00",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("Not recorded")).toHaveLength(2);
  });
});
