/**
 * The Beat 2 frame table — the snap-cut style sequence.
 *
 * Six renderings of the same wordmark, progressing from raw construction to
 * photoreal. The order is not arbitrary: it retraces how an image actually
 * gets made (sketch → blocked form → stylised → resolved), which is why it
 * reads as a progression rather than a shuffle.
 *
 * HOLDS SHORTEN, THEN THE LAST ONE LANDS LONG. 140 → 120 → 110 → 100 → 100,
 * then 230ms on the letterpress. Accelerating cuts build pressure; the long
 * final hold releases it and gives the eye somewhere to settle before the page
 * arrives. Uniform holds read as a slideshow — this is the single most
 * important number in the file.
 *
 * GRAPHIC CUT. Every frame is generated to the same composition: identical
 * silhouette, baseline, cap height and optical centre, so the wordmark does
 * not move between cuts. Only the material changes. If a frame's letterforms
 * drift, the cut stops being invisible and the sequence falls apart — the
 * alignment matters more than any individual frame's beauty.
 */

export type IntroFrame = {
  /** Basename in /public/intro. Served as .avif with a .webp fallback. */
  readonly src: string;
  /** Milliseconds this frame stays on screen. */
  readonly hold: number;
  /** Style name — documentation, and the alt text if a frame ever stands alone. */
  readonly style: string;
  /**
   * Fill the viewport instead of letterboxing on the black field.
   *
   * Only the last frame uses it, and for a specific reason: it is printed on
   * pale cotton stock, so filling the screen turns the hand-off into a graphic
   * match — a cream field dissolving into the site's white canvas. Letterboxed,
   * the same frame would sit in a black surround and the transition would read
   * as a cut instead of a continuation.
   */
  readonly fill?: boolean;
};

// Annotated rather than `as const satisfies`: const-narrowing drops the
// optional `fill` from the union members that omit it, so consumers can't read
// it without a per-member check.
export const INTRO_FRAMES: readonly IntroFrame[] = [
  { src: "01-sketch", hold: 140, style: "charcoal construction sketch" },
  { src: "02-clay", hold: 120, style: "matte clay render" },
  { src: "03-riso", hold: 110, style: "two-colour risograph" },
  { src: "04-chrome", hold: 100, style: "liquid chrome" },
  { src: "05-halftone", hold: 100, style: "CMYK halftone" },
  { src: "06-letterpress", hold: 230, style: "photoreal letterpress", fill: true },
];

/** Total runtime of the cut sequence. */
export const CRASH_MS = INTRO_FRAMES.reduce((total, f) => total + f.hold, 0);

/** Cumulative offset at which each frame becomes visible. */
export const FRAME_OFFSETS = INTRO_FRAMES.reduce<number[]>((acc, frame, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + INTRO_FRAMES[i - 1].hold);
  return acc;
}, []);

/** The frame a reduced-motion visitor sees: the resolved one, held still. */
export const RESTING_FRAME = INTRO_FRAMES[INTRO_FRAMES.length - 1];

export const introFrameSrc = (src: string, ext: "avif" | "webp") =>
  `/intro/${src}.${ext}`;
