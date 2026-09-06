"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const sync = () => {
      const current =
        document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current);
    };
    const id = setTimeout(sync, 0);
    return () => clearTimeout(id);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing / storage disabled — theme just won't persist.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="text-muted hover:text-ink"
    >
      {theme === "dark" ? "☾" : "☀"}
    </button>
  );
}
