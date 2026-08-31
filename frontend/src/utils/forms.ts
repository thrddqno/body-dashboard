export function parseOptionalInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

export function parseOptionalDecimal(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

export function parseRequiredDecimal(value: string): number {
  return Number(value);
}

export function parseRequiredInteger(value: string): number {
  return Number(value);
}
