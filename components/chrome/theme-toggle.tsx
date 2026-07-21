"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle.
 *
 * Renders a fixed-size placeholder until mounted. The server cannot know the
 * resolved theme, so rendering the real icon immediately would either mismatch
 * on hydration or flash the wrong glyph — and rendering nothing at all would
 * shift the nav sideways when it appears. A same-sized empty box costs neither.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"}
      className="text-ink-muted hover:text-ink ml-2 grid size-8 place-items-center rounded-full transition-colors duration-150"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" aria-hidden />
        ) : (
          <Moon className="size-4" aria-hidden />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}
