import {
  parseOptionalDecimal,
  parseOptionalInteger,
  parseRequiredDecimal,
  parseRequiredInteger,
  trimmedStringOrNull,
} from "@/utils/forms";

describe("form value helpers", () => {
  it("maps blank optional numbers to null", () => {
    expect(parseOptionalDecimal("  ")).toBeNull();
    expect(parseOptionalInteger("")).toBeNull();
  });

  it("parses decimal and integer values", () => {
    expect(parseRequiredDecimal("82.75")).toBe(82.75);
    expect(parseRequiredInteger("9000")).toBe(9000);
  });

  it("rejects missing, invalid, and fractional integer values", () => {
    expect(() => parseRequiredDecimal("")).toThrow("A numeric value is required.");
    expect(() => parseRequiredDecimal("unknown")).toThrow("Enter a valid numeric value.");
    expect(() => parseRequiredInteger("2.5")).toThrow("Enter a whole number.");
  });

  it("trims optional text and maps blank text to null", () => {
    expect(trimmedStringOrNull("  Felt good  ")).toBe("Felt good");
    expect(trimmedStringOrNull("   ")).toBeNull();
  });
});
