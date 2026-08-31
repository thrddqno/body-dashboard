import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AiAnalysisPage } from "@/pages/AiAnalysisPage";
import { ApiError } from "@/api/httpClient";

const generateWeeklyAiAnalysisMock = vi.fn();
const getLatestWeeklyAiAnalysisMock = vi.fn();

vi.mock("@/api/aiAnalysisApi", () => ({
  generateWeeklyAiAnalysis: (...args: unknown[]) =>
    generateWeeklyAiAnalysisMock(...args),
  getLatestWeeklyAiAnalysis: (...args: unknown[]) =>
    getLatestWeeklyAiAnalysisMock(...args),
}));

describe("AiAnalysisPage", () => {
  beforeEach(() => {
    generateWeeklyAiAnalysisMock.mockReset();
    getLatestWeeklyAiAnalysisMock.mockReset();
    getLatestWeeklyAiAnalysisMock.mockRejectedValue(new ApiError("Not found", 404));
  });

  it("renders insufficient-data analysis responses returned with 200", async () => {
    generateWeeklyAiAnalysisMock.mockResolvedValue({
      summary: "Not enough data to produce a strong analysis yet.",
      knownFacts: [],
      interpretation: ["More training and recovery data is needed."],
      strengths: [],
      concerns: [],
      recommendations: ["Log more data this week."],
      dataGaps: ["No recent workouts"],
      generatedAt: "2026-08-31T12:00:00Z",
    });

    render(<AiAnalysisPage />);

    const generateButton = screen.getByRole("button", { name: "Generate weekly analysis" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    expect(await screen.findByText("Not enough data to produce a strong analysis yet.")).toBeInTheDocument();
    expect(screen.getByText("No recent workouts")).toBeInTheDocument();
  });

  it("restores the latest persisted analysis", async () => {
    getLatestWeeklyAiAnalysisMock.mockResolvedValue({
      summary: "Saved **weekly** interpretation.",
      knownFacts: ["2 completed workouts"],
      interpretation: [],
      strengths: [],
      concerns: [],
      recommendations: [],
      dataGaps: [],
      generatedAt: "2026-08-31T12:00:00Z",
    });

    render(<AiAnalysisPage />);

    expect(await screen.findByText("weekly")).toHaveTextContent("weekly");
    expect(screen.getByText("2 completed workouts")).toBeInTheDocument();
  });

  it("shows retry guidance for 503 provider errors", async () => {
    generateWeeklyAiAnalysisMock.mockRejectedValue(
      new ApiError("AI analysis provider failed", 503),
    );

    render(<AiAnalysisPage />);

    const generateButton = screen.getByRole("button", { name: "Generate weekly analysis" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/The AI provider failed to respond/)).toBeInTheDocument();
    });
  });

  it("shows the backend rate-limit guidance for 429 responses", async () => {
    generateWeeklyAiAnalysisMock.mockRejectedValue(
      new ApiError("AI provider rate limit exceeded. Try again later.", 429),
    );

    render(<AiAnalysisPage />);

    const generateButton = screen.getByRole("button", { name: "Generate weekly analysis" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    expect(
      await screen.findByText("AI provider rate limit exceeded. Try again later."),
    ).toBeInTheDocument();
  });
});
