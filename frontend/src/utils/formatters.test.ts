import { formatFullDateString, sleepHoursInputToMinutes, sleepMinutesToHoursInput } from "@/utils/formatters";

describe("formatters", () => {
  it("formats date-only values with the weekday without shifting the date", () => {
    expect(formatFullDateString("2026-09-28")).toBe("Monday, Sep 28, 2026");
  });

  it("converts sleep between decimal hours and persisted minutes", () => {
    expect(sleepMinutesToHoursInput(522)).toBe("8.7");
    expect(sleepHoursInputToMinutes("8.7")).toBe(522);
    expect(sleepHoursInputToMinutes("")).toBeNull();
  });
});
