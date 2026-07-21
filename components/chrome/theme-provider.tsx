"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * Class-based theming so `.dark` in globals.css is the single switch, and
 * `disableTransitionOnChange` so flipping themes doesn't animate every
 * colour token at once (which reads as a glitch, not a transition).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
