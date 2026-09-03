import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const title = isDark ? "Use light mode" : "Use dark mode";

  return (
    <button
      type="button"
      className="button-secondary h-9 w-9 shrink-0 p-0"
      aria-label="Dark mode"
      aria-pressed={isDark}
      title={title}
      onClick={toggleTheme}
    >
      {isDark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
    </button>
  );
}
