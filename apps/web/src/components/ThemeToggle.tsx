"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_META: Record<Theme, { icon: string; label: string; next: Theme }> = {
  light: { icon: "☀️", label: "Hell", next: "dark" },
  dark: { icon: "🌙", label: "Dunkel", next: "light" },
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark");
  if (theme === "dark") document.documentElement.classList.add(theme);
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  function toggle() {
    const next = THEME_META[theme].next;
    setTheme(next);
    applyTheme(next);
  }

  const meta = THEME_META[theme];

  return (
    <button
      onClick={toggle}
      aria-label="Theme wechseln"
      className="flex w-28 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-primary hover:text-primary"
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </button>
  );
}
