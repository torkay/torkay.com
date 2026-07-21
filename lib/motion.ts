/**
 * The motion vocabulary for torkay.com — one source, every component.
 *
 * Every value here is transcribed from the forensic teardowns in
 * `docs/references/`: animate-ui.com's landing timeline (splash + hero
 * stagger, measured off `getAnimations()`) and poke.com's transition
 * histogram. Nothing is invented. If a component needs a duration or an
 * easing, it imports it from here rather than inlining a number — that is
 * what keeps thirty animations reading as one system.
 *
 * Three buckets, and only three:
 *
 *   MICRO    150ms  · hover, colour, border. You should not consciously see it.
 *   ENTRANCE 400ms text / 600ms blocks · the reveal choreography.
 *   OVERLAY  130–300ms · dialogs, popovers, menus.
 *
 * @see docs/references/animate-ui.md §3.c for the complete measured enumeration
 */

// ─────────────────────────────────────────────────────────────────────────────
// Easings
// ─────────────────────────────────────────────────────────────────────────────

/** Tailwind's default ease-in-out. Every hover and colour transition. */
export const EASE_MICRO = [0.4, 0, 0.2, 1] as const;

/** easeOut. Text sharpening, opacity fades — decelerates, never overshoots. */
export const EASE_OUT = [0, 0, 0.2, 1] as const;

/** easeOutQuint. A container resizing around fixed content. */
export const EASE_NARROW = [0.22, 1, 0.36, 1] as const;

/** easeOutExpo. Long travel that has to arrive without drama. Also the
 *  overlay easing (animate-ui's dialogs run this at 300ms). */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** easeInOutCubic. Symmetric sweeps — an SVG stroke drawing itself on. */
export const EASE_DRAW = [0.65, 0, 0.35, 1] as const;

/** CSS-string forms, for the WAAPI paths where Motion no-ops (SVG
 *  presentation attributes like strokeDashoffset / fillOpacity). */
export const CSS_EASE = {
  micro: "cubic-bezier(0.4, 0, 0.2, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  narrow: "cubic-bezier(0.22, 1, 0.36, 1)",
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",
  draw: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Springs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The signature "arrive" spring. animate-ui's block reveals measure to ~4.3%
 * overshoot peaking at ~52% of the run — damping ratio ζ ≈ 0.71. Just enough
 * life to read as physical, far too little to read as a gimmick. This single
 * curve is most of why that site feels expensive.
 */
export const SPRING_RISE = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 1,
} as const;

/** Softer, heavier. For large surfaces (cards, folders, panels) where the
 *  rise spring would look twitchy at scale. */
export const SPRING_SOFT = {
  type: "spring",
  stiffness: 120,
  damping: 14,
  mass: 1,
} as const;

/** Near-critically damped. Layout shifts and highlight indicators that must
 *  track a target without ringing. */
export const SPRING_SNAP = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 1,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Durations (seconds — Motion's unit)
// ─────────────────────────────────────────────────────────────────────────────

export const DUR = {
  /** Hover, colour, border. */
  micro: 0.15,
  /** Popover in. */
  popover: 0.13,
  /** Accordion, small state change. */
  state: 0.2,
  /** Dialog, overlay fade. */
  overlay: 0.3,
  /** Per-word text sharpening. */
  word: 0.4,
  /** Block rise, the main entrance beat. */
  block: 0.6,
  /** Splash fade, shimmer sweep. */
  splash: 0.8,
} as const;

/**
 * Stagger deltas. 50ms between adjacent siblings is animate-ui's measured
 * value and it is paced to reading speed — the eye tracks the sentence
 * left-to-right *as it sharpens*. 120ms separates major blocks.
 */
export const STAGGER = {
  word: 0.05,
  sibling: 0.05,
  block: 0.12,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Composed transitions — import these, not the parts
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  micro: { duration: DUR.micro, ease: EASE_MICRO },
  word: { duration: DUR.word, ease: EASE_OUT },
  block: SPRING_RISE,
  soft: SPRING_SOFT,
  snap: SPRING_SNAP,
  overlay: { duration: DUR.overlay, ease: EASE_EXPO },
  splash: { duration: DUR.splash, ease: EASE_OUT },
} as const;

/**
 * The house entrance: opacity + blur, never opacity alone. Blur adds a
 * focus-pull that pure fade cannot, and it is what makes a headline read as
 * *resolving* rather than *appearing*.
 */
export const BLUR_IN = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
} as const;

/** The house block entrance: rise + fade, driven by SPRING_RISE. */
export const RISE_IN = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
} as const;
