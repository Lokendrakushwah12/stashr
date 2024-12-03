"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggleTheme}
      className="rounded-full bg-transparent p-2"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-muted-foreground hover:text-secondary-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-muted-foreground hover:text-secondary-foreground" />
      )}
    </button>
  );
}
