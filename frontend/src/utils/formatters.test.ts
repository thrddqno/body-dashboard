import {
  formatFullDateString,
  formatPlanEyebrow,
  sleepHoursInputToMinutes,
  sleepMinutesToHoursInput,
} from "@/utils/formatters";

describe("formatters", () => {
  it("formats date-only values with the weekday without shifting the date", () => {
    expect(formatFullDateString("2026-09-28")).toBe("Monday, Sep 28, 2026");
  });

  it("formats plan eyebrows relative to the current local date", () => {
    const today = new Date(2026, 8, 2, 12);

    expect(formatPlanEyebrow("2026-09-01", today)).toBe("Yesterday's Plan");
    expect(formatPlanEyebrow("2026-09-02", today)).toBe("Today's Plan");
    expect(formatPlanEyebrow("2026-09-03", today)).toBe("Tomorrow's Plan");
    expect(formatPlanEyebrow("2026-09-04", today)).toBe("Friday's Plan");
  });

  it("converts sleep between decimal hours and persisted minutes", () => {
    expect(sleepMinutesToHoursInput(522)).toBe("8.7");
    expect(sleepHoursInputToMinutes("8.7")).toBe(522);
    expect(sleepHoursInputToMinutes("")).toBeNull();
  });
});
