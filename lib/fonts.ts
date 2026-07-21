import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";

/**
 * The three-face system. Next self-hosts each of these at build time, so
 * there is no third-party request at runtime and no layout shift — the
 * fallback metrics are computed from the real face.
 *
 * The blend is poke.com's: a high-contrast editorial serif carrying every
 * display line, a neo-grotesque doing all the reading work, and a mono for
 * anything that represents a machine talking.
 *
 * SWAP SLOTS. poke.com's own faces are Exposure (205TF) and OpenRunde (OFL).
 * Both are named first in their stack in `globals.css`, so dropping a licensed
 * kit into `public/fonts/` and declaring one @font-face takes the whole site
 * over — nothing else changes.
 *
 * On Exposure specifically: the 205TF *Trial* licence covers evaluation only
 * ("all other uses, including creating or distributing visuals — whether
 * internal, external, or public — are strictly prohibited"), separately
 * forbids generating webfonts from the OpenType files, and forbids
 * redistribution. A trial .ttf therefore cannot go in this repo or on this
 * domain. Shipping Exposure means buying the 205TF *Web* licence, which comes
 * as a ready .woff2 kit. Until then Instrument Serif carries the display role.
 * See DESIGN.md § Typography → Swap slots.
 */

/** Display. Editorial, high-contrast, 400 only. Always tightly tracked. */
export const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display-ofl",
});

/** Sans. Neo-grotesque; every line of body, label and UI copy. */
export const fontSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-ofl",
});

/** Mono. The terminal, code blocks, and numeric tabular data. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-ofl",
});

export const fontVariables = [
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
].join(" ");
