function parseFiniteNumber(value: string): number {
  if (!value.trim()) {
    throw new Error("A numeric value is required.");
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Enter a valid numeric value.");
  }

  return parsed;
}

export function parseOptionalInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return parseRequiredInteger(value);
}

export function parseOptionalDecimal(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return parseFiniteNumber(value);
}

export function parseRequiredDecimal(value: string): number {
  return parseFiniteNumber(value);
}

export function parseRequiredInteger(value: string): number {
  const parsed = parseFiniteNumber(value);
  if (!Number.isInteger(parsed)) {
    throw new Error("Enter a whole number.");
  }

  return parsed;
}

export function trimmedStringOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}
