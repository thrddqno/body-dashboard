import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";

import { BodyMetricChart } from "@/features/bodyMetrics/components/BodyMetricChart";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
  LineChart: ({
    children,
    data,
    desc,
    title,
  }: {
    children: ReactNode;
    data: Array<{ date: string }>;
    desc: string;
    title: string;
  }) => (
    <div role="img" aria-label={title} data-description={desc} data-dates={data.map((item) => item.date).join(",")}>
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  XAxis: ({ domain, scale, type }: { domain: string[]; scale: string; type: string }) => (
    <span data-testid="x-axis" data-domain={domain.join(",")} data-scale={scale} data-type={type} />
  ),
  YAxis: ({ domain }: { domain: string[] }) => (
    <span data-testid="y-axis" data-domain={domain.join(",")} />
  ),
  Tooltip: () => null,
  Line: ({ name, unit }: { name: string; unit: string }) => (
    <span data-testid="metric-line">{name} ({unit})</span>
  ),
}));

const metrics = [
  {
    id: 2,
    date: "2026-09-01",
    weightKg: 79.5,
    waistCm: 81,
    bodyFatPercentage: 16,
    createdAt: "2026-09-01T08:00:00",
  },
  {
    id: 1,
    date: "2026-08-01",
    weightKg: 121,
    waistCm: 83,
    bodyFatPercentage: 17,
    createdAt: "2026-08-01T08:00:00",
  },
];

describe("BodyMetricChart", () => {
  it("renders each metric with an independent automatic scale and real date axis", () => {
    render(<BodyMetricChart metrics={metrics} />);

    expect(screen.getByRole("img", { name: "Weight trend" })).toHaveAttribute(
      "data-dates",
      "2026-08-01,2026-09-01",
    );
    expect(screen.getAllByTestId("x-axis")[0]).toHaveAttribute("data-type", "number");
    expect(screen.getAllByTestId("x-axis")[0]).toHaveAttribute("data-scale", "time");
    expect(screen.getAllByTestId("x-axis")[0]).toHaveAttribute("data-domain", "dataMin,dataMax");
    expect(screen.getAllByTestId("y-axis")[0]).toHaveAttribute("data-domain", "auto,auto");
    expect(screen.getAllByTestId("metric-line").map((line) => line.textContent)).toEqual([
      "Weight (kg)",
      "Waist (cm)",
      "Body fat (%)",
    ]);
  });

  it("shows a clear fallback when an optional metric has no values", () => {
    render(<BodyMetricChart metrics={[{ ...metrics[0], waistCm: null, bodyFatPercentage: null }]} />);

    expect(screen.getByRole("img", { name: "Weight trend" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Waist trend" })).not.toBeInTheDocument();
    expect(screen.getByText("No waist measurements recorded.")).toBeInTheDocument();
    expect(screen.getByText("No body fat measurements recorded.")).toBeInTheDocument();
  });
});
