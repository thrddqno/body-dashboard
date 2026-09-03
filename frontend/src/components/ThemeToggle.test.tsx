import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/hooks/useTheme";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reflects the theme initialized on the document", () => {
    document.documentElement.dataset.theme = "dark";

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTitle("Use light mode")).toBeInTheDocument();
  });

  it("applies and persists the selected theme", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("still changes the in-session theme when storage is unavailable", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("Storage unavailable");
      });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

  });
});
