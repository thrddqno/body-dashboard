import { formatDateInputValue, parseLocalDate } from "@/utils/dates";

describe("date utilities", () => {
  it("parses local iso dates without shifting the day", () => {
    const date = parseLocalDate("2026-08-31");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(31);
    expect(formatDateInputValue(date)).toBe("2026-08-31");
  });
});
