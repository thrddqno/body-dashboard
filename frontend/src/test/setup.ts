import "@testing-library/jest-dom/vitest";

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => "test-uuid",
    },
    configurable: true,
  });
}
