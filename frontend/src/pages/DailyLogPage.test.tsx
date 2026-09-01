import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { DailyLogPage } from "@/pages/DailyLogPage";
import { ApiError } from "@/api/httpClient";

const getDailyLogMock = vi.fn();
const saveDailyLogMock = vi.fn();

vi.mock("@/api/dailyLogsApi", () => ({
  getDailyLog: (...args: unknown[]) => getDailyLogMock(...args),
  saveDailyLog: (...args: unknown[]) => saveDailyLogMock(...args),
}));

function renderPage(initialPath = "/daily-log/2026-08-31") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/daily-log/:date" element={<DailyLogPage />} />
        <Route path="/daily-log" element={<DailyLogPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DailyLogPage", () => {
  beforeEach(() => {
    getDailyLogMock.mockReset();
    saveDailyLogMock.mockReset();
  });

  it("treats a 404 daily log response as an empty form", async () => {
    getDailyLogMock.mockRejectedValue(new ApiError("Daily log not found", 404));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Daily recovery and nutrition log")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Monday, Aug 31, 2026" })).toBeInTheDocument();
    expect(screen.getByLabelText("Sleep (hours)")).toHaveValue(null);
    expect(screen.getByLabelText("Steps")).toHaveValue(null);
  });

  it("rejects invalid route dates without requesting a log", async () => {
    renderPage("/daily-log/not-a-date");

    expect(await screen.findByRole("heading", { name: "Invalid date" })).toBeInTheDocument();
    expect(screen.getByText("Choose a valid date in YYYY-MM-DD format.")).toBeInTheDocument();
    expect(getDailyLogMock).not.toHaveBeenCalled();
  });

  it("submits the full daily log record state", async () => {
    getDailyLogMock.mockRejectedValue(new ApiError("Daily log not found", 404));
    saveDailyLogMock.mockResolvedValue({
      id: 1,
      date: "2026-08-31",
      sleepMinutes: 522,
      steps: 9000,
      energy: "HIGH",
      painNotes: null,
      recoveryNotes: "Felt good",
      estimatedCalories: 2400,
      estimatedProteinGrams: 190,
      createdAt: "2026-08-31T08:00:00",
      updatedAt: "2026-08-31T09:00:00",
    });

    renderPage();

    await screen.findByText("Daily recovery and nutrition log");

    fireEvent.change(screen.getByLabelText("Sleep (hours)"), { target: { value: "8.7" } });
    fireEvent.change(screen.getByLabelText("Steps"), { target: { value: "9000" } });
    fireEvent.change(screen.getByLabelText("Energy"), { target: { value: "HIGH" } });
    fireEvent.change(screen.getByLabelText("Calories"), { target: { value: "2400" } });
    fireEvent.change(screen.getByLabelText("Protein (g)"), { target: { value: "190" } });
    fireEvent.change(screen.getByLabelText("Recovery notes"), { target: { value: "Felt good" } });
    fireEvent.click(screen.getByRole("button", { name: "Save daily log" }));

    await waitFor(() => {
      expect(saveDailyLogMock).toHaveBeenCalledWith("2026-08-31", {
        sleepMinutes: 522,
        steps: 9000,
        energy: "HIGH",
        painNotes: null,
        recoveryNotes: "Felt good",
        estimatedCalories: 2400,
        estimatedProteinGrams: 190,
      });
    });
  });

  it("displays backend field errors beside the matching input", async () => {
    getDailyLogMock.mockRejectedValue(new ApiError("Daily log not found", 404));
    saveDailyLogMock.mockRejectedValue(new ApiError(
      "Validation failed",
      400,
      { sleepMinutes: "Sleep must be between 0 and 24 hours." },
    ));

    renderPage();
    await screen.findByText("Daily recovery and nutrition log");

    fireEvent.change(screen.getByLabelText("Sleep (hours)"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Save daily log" }));

    const error = await screen.findByText("Sleep must be between 0 and 24 hours.");
    expect(screen.getByLabelText("Sleep (hours)")).toHaveAttribute("aria-describedby", error.id);
    expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
  });
});
