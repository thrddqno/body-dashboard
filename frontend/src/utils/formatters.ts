import type { EnergyLevel } from "@/types/dailyLog";
import type { WorkoutStatus } from "@/types/workout";

import { parseLocalDate } from "@/utils/dates";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const compactDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

export function formatFullDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatFullDateString(date: string): string {
  return formatFullDate(parseLocalDate(date));
}

export function formatCompactDate(date: Date): string {
  return compactDateFormatter.format(date);
}

export function formatCompactDateString(date: string): string {
  return formatCompactDate(parseLocalDate(date));
}

export function formatDateTimeString(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDecimal(value: number): string {
  return numberFormatter.format(value);
}

export function formatMetricValue(
  value: number | null | undefined,
  unit: string,
  digits = 1,
): string {
  if (value == null) {
    return "Not recorded";
  }

  return `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)} ${unit}`;
}

export function formatSleepHours(value: number | null): string {
  if (value == null) {
    return "Not recorded";
  }

  return `${formatDecimal(value)} h`;
}

export function sleepMinutesToHoursInput(value: number | null): string {
  if (value == null) {
    return "";
  }

  return String(Number((value / 60).toFixed(1)));
}

export function sleepHoursInputToMinutes(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return Math.round(Number(value) * 60);
}

export function formatSteps(value: number | null): string {
  if (value == null) {
    return "Not recorded";
  }

  return `${integerFormatter.format(value)} steps`;
}

export function formatInteger(value: number | null): string {
  if (value == null) {
    return "Not recorded";
  }

  return integerFormatter.format(value);
}

export function formatNullableText(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "Not recorded";
}

export function formatEnergy(value: EnergyLevel | null): string {
  if (value == null) {
    return "Not recorded";
  }

  return value.toLowerCase().replaceAll("_", " ");
}

export function formatWorkoutStatus(value: WorkoutStatus): string {
  return value.toLowerCase();
}

export function formatSignedWeightChange(value: number | null): string {
  if (value == null) {
    return "Not enough data";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatDecimal(value)} kg`;
}
