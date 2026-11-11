"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);
    root.style.colorScheme = nextIsDark ? "dark" : "light";

    try {
      window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // Storage can be unavailable in private browsing; the class still works.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className="grid size-10 place-items-center rounded-xl border border-zinc-200/80 bg-white/80 text-zinc-600 shadow-sm transition-colors hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f8f7] dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-offset-[#070b09]"
    >
      <Sun className="hidden size-[18px] dark:block" strokeWidth={1.8} />
      <Moon className="size-[18px] dark:hidden" strokeWidth={1.8} />
    </button>
  );
}
