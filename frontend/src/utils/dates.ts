export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidLocalDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = parseLocalDate(value);
  return !Number.isNaN(parsed.getTime()) && formatDateInputValue(parsed) === value;
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameLocalDate(left: string, right: string): boolean {
  return left === right;
}

export function getWeekDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = parseLocalDate(start);
  const last = parseLocalDate(end);

  while (cursor <= last) {
    dates.push(formatDateInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function sortIsoDatesAscending(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}
