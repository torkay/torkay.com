# RideRadar — Motion Kit (build-ready)

> Copy-paste Motion (`motion/react`) + CSS to make RideRadar move like animate-ui.com on our own stack.
> Everything below is real code against the **confirmed stack**: `motion ^12`, `@base-ui/react ^1.4.1`,
> `tailwindcss 4.1.7`, `next 15.5` (App Router), `next-themes` (dark = `.dark` class on `<html>`),
> `lucide-react`, `cn` at `@/lib/utils`. No Radix, no second primitive layer — `motion/react` + CSS only.
>
> **The law it expresses** — NORTH-STAR §6: the ONE spring `stiffness:260 / damping:26`, the ONE entrance ease
> `--ease-out-cubic = cubic-bezier(0.215,0.61,0.355,1)` at **380ms**, blur-resolve, reveal-once, restraint,
> chrome-vs-workspace. Nothing here invents a new curve.
>
> **Sources reverse-engineered:** animate-ui registry source (`primitives-effects-blur`, `-texts-splitting`,
> `-texts-gradient`, `-effects-shine`, `hooks-use-is-in-view`); zo's `zo-foil-sheen` (12s specular) + letterpress
> emboss; poke's `gradient-border` `@property` recipe + `noise.webp` grain + blur-resolve stagger (350ms
> easeOutCubic, 23ms step).

---

## 0. One-time setup

### 0a. Tokens — add to `apps/web/app/globals.css`

Two adds. The eases join the existing `@theme` motion block; the material/foil/texture vars go in `@layer tokens`
so `.dark` can override them (they are not meant to generate utilities).

```css
/* ── add inside the existing @theme { … } motion section ─────────────────────── */
@theme {
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1); /* THE blur-resolve / entrance ease */
  --ease-press:     cubic-bezier(0.23, 1, 0.32, 1);      /* tactile press overshoot (150ms)   */
  --dur-enter:      380ms;                                /* THE entrance duration             */
}

/* ── add as a new @layer tokens block (after the .dark tokens block) ──────────── */
@layer tokens {
  :root {
    /* The ONE "raised" material — zo's --foil-raise, warm-tuned. Cool ink under warm surfaces. */
    --shadow-ink: 27 31 34;                       /* #1b1f22 cool near-black */
    --raise:
      inset 0 1px 0 rgb(255 255 255 / 0.70),
      inset 0 -1px 0 rgb(0 0 0 / 0.05),
      0 1px 3px rgb(var(--shadow-ink) / 0.08),
      0 4px 12px rgb(var(--shadow-ink) / 0.06);
    --raise-hover:
      inset 0 1px 0 rgb(255 255 255 / 0.80),
      inset 0 -1px 0 rgb(0 0 0 / 0.05),
      0 2px 6px rgb(var(--shadow-ink) / 0.10),
      0 8px 20px rgb(var(--shadow-ink) / 0.08);

    /* Warm-foil keyword material — a champagne/bronze metal with ONE clay glint (brand-500). */
    --foil-gradient: linear-gradient(100deg,
      oklch(0.70 0.055 62)  0%,
      oklch(0.93 0.030 88)  16%,
      oklch(0.74 0.090 55)  32%,
      oklch(0.64 0.180 35)  46%,   /* the clay glint = brand-500 → the "warm soul" */
      oklch(0.96 0.020 90)  60%,
      oklch(0.74 0.070 60)  78%,
      oklch(0.70 0.055 62)  100%); /* first == last stop → seamless loop */
    --foil-emboss:                  /* zo's letterpress: white top-light + dark under-shadow */
      drop-shadow(0 -1px 0 rgb(255 255 255 / 0.55))
      drop-shadow(0  1px 1px rgb(0 0 0 / 0.28))
      drop-shadow(0  3px 6px rgb(0 0 0 / 0.14));

    /* Foreground textures */
    --tex-dot:   oklch(0.20 0.010 60 / 0.05);     /* dot-grid / dither undertone */
    --tex-noise: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.82'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .dark {
    /* Foil emboss flips on dark: dim the top light, deepen the under-shadow. */
    --foil-emboss:
      drop-shadow(0 -1px 0 rgb(255 255 255 / 0.10))
      drop-shadow(0  1px 1px rgb(0 0 0 / 0.55))
      drop-shadow(0  3px 6px rgb(0 0 0 / 0.35));
    --tex-dot: oklch(0.98 0.010 60 / 0.045);
  }
}
```

### 0b. `apps/web/lib/motion.ts` — the shared vocabulary (one source, every component)

```ts
import type { Transition } from 'motion/react';

/** THE spring — marketing entrances only. ζ≈0.71, ~4% overshoot. NORTH-STAR §6. */
export const spring: Transition = { type: 'spring', stiffness: 260, damping: 26 };

/** THE blur-resolve / entrance ease — 380ms easeOutCubic. */
export const enter: Transition = { duration: 0.38, ease: [0.215, 0.61, 0.355, 1] };

/** THE micro-interaction — 150ms, workspace-legal. */
export const micro: Transition = { duration: 0.15, ease: [0.4, 0, 0.2, 1] };

/** Splash exit — a quick, calm fade-out. */
export const exitFade: Transition = { duration: 0.42, ease: [0.25, 1, 0.5, 1] };

/** Stagger steps (seconds). Chrome only. */
export const STAGGER_WORD = 0.04; // blur-resolve headline (40ms, reading order)
export const STAGGER_CARD = 0.06; // spring-rise blocks (60ms, cap first ~8)
```

> **CRITICAL gotcha — reduced motion.** The global `@media (prefers-reduced-motion: reduce)` block already in
> `globals.css` collapses **CSS** animations/transitions to `0.01ms`. It does **not** touch `motion/react` (WAAPI)
> animations. So **every Motion component below must call `useReducedMotion()`** and branch. That is done
> throughout this kit; do not skip it.

All components live under `apps/web/components/motion/`. They are self-contained — no shadcn CLI required. (If you
prefer registry installs, the equivalents are `@animate-ui/primitives-effects-blur`, `-texts-gradient`,
`-effects-shine`; but the copies here are hardened for our restraint rules — reduced-motion + off-screen pause.)

---

## 1. Splash screen `[chrome]`

Covers first paint on a `--color-bg` field, holds a brief beat, exits by ease-out fade. Gated to **data-ready OR a
hard cap ~900ms** (whichever comes first, after a ~450ms minimum so it never flashes), **skipped when already seen
this session**, and **reduced-motion → renders nothing (instant)**. Logo entrance = stroke-draw rings + a radar
sweep + a spring scale-in, matching animate-ui's calm-quality feel.

### `apps/web/components/motion/animated-radar-mark.tsx`

```tsx
'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';

const DRAW = { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } as const;
const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const;

/**
 * Demo radar mark. Swap the <circle>/<line> demo shapes for your real RadarMark's
 * paths as `motion.*` elements — keep `pathLength` on strokes and the rotating sweep <g>.
 */
export function AnimatedRadarMark({ size = 72 }: { size?: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="RideRadar"
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : SPRING}
      style={{ color: 'var(--color-brand-500)' }}
    >
      {/* concentric radar rings — stroke-draw entrance */}
      {[46, 32, 18].map((r, i) => (
        <motion.circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          stroke="var(--color-fg)"
          strokeOpacity={0.28 + i * 0.12}
          strokeWidth={1.5}
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { ...DRAW, delay: 0.05 + i * 0.08 }}
        />
      ))}

      {/* center dot — springs in last */}
      <motion.circle
        cx="50"
        cy="50"
        r="3"
        fill="currentColor"
        initial={reduced ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0 } : { ...SPRING, delay: 0.3 }}
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* radar sweep — a fading wedge that rotates ~1.2 turns during the beat */}
      <defs>
        <linearGradient id="rr-sweep" x1="50" y1="50" x2="96" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!reduced && (
        <motion.g
          style={{ transformOrigin: '50px 50px' }}
          initial={{ rotate: 0, opacity: 0 }}
          animate={{ rotate: 420, opacity: [0, 1, 1] }}
          transition={{ duration: 1.1, ease: 'linear', delay: 0.25 }}
        >
          <line x1="50" y1="50" x2="96" y2="50" stroke="url(#rr-sweep)" strokeWidth="6" strokeLinecap="round" />
        </motion.g>
      )}
    </motion.svg>
  );
}
```

### `apps/web/components/motion/splash.tsx`

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { exitFade } from '@/lib/motion';
import { AnimatedRadarMark } from './animated-radar-mark';

const SESSION_KEY = 'rr:splash-seen';

/** Resolves once fonts are loaded and the first frame is committed. Feed the result to <Splash ready>. */
export function useAppReady() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setReady(true);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    Promise.resolve(fonts?.ready)
      .catch(() => {})
      .then(() => requestAnimationFrame(done));
    return () => { cancelled = true; };
  }, []);
  return ready;
}

type SplashProps = {
  ready?: boolean;      // data-ready signal (e.g. from useAppReady)
  minDuration?: number; // never exits before this (avoid a flash)
  maxDuration?: number; // hard cap — always exits by here
};

export function Splash({ ready = true, minDuration = 450, maxDuration = 900 }: SplashProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(true);
  const [armed, setArmed] = React.useState(false); // min beat elapsed

  React.useEffect(() => {
    const seen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY);
    if (seen || reduced) {
      setVisible(false); // skip on cached / repeat-nav, or reduced motion
      return;
    }
    const minT = window.setTimeout(() => setArmed(true), minDuration);
    const maxT = window.setTimeout(() => setVisible(false), maxDuration);
    return () => { window.clearTimeout(minT); window.clearTimeout(maxT); };
  }, [reduced, minDuration, maxDuration]);

  // exit as soon as data is ready AND the minimum beat has passed
  React.useEffect(() => {
    if (ready && armed) setVisible(false);
  }, [ready, armed]);

  React.useEffect(() => {
    if (!visible && typeof sessionStorage !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
  }, [visible]);

  if (reduced) return null; // reduced-motion → no overlay, instant content

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="rr-splash"
          aria-hidden
          initial={{ opacity: 1 }}                 // present from first paint — it *covers*, no fade-in
          exit={{ opacity: 0, transition: exitFade }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-bg)',
          }}
        >
          <AnimatedRadarMark />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Drop this once, high in the tree (e.g. in app/layout.tsx body, before children). */
export function SplashHost() {
  const ready = useAppReady();
  return <Splash ready={ready} />;
}
```

**Wire it in `app/layout.tsx`** (root layout can stay a Server Component; `SplashHost` is a client island):

```tsx
// app/layout.tsx (excerpt)
import { SplashHost } from '@/components/motion/splash';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SplashHost />
        {children}
      </body>
    </html>
  );
}
```

Because the overlay is `position:fixed; z-index:100` and mounts immediately, it hides the un-styled hero until
fonts + first frame land, then fades up whole — zo's "arrives, not loads" beat, capped so it never feels slow.

---

## 2. Blur-resolve headline `[chrome]`

Per-word `opacity 0→1` + `filter blur(10px)→blur(0)`, **380ms** on `--ease-out-cubic`, **40ms** reading-order
stagger. This is the exact mechanism poke ships (measured: 350ms easeOutCubic, ~23ms step, opacity+blur pairs) —
raised to the NORTH-STAR values. A11y: the real `<h1>` carries `aria-label`; the visible per-word spans are
`aria-hidden`. No layout shift (only opacity + filter animate — never size or transform), GPU-friendly
(`will-change: filter, opacity`).

### `apps/web/components/motion/blur-resolve-headline.tsx`

```tsx
'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { enter, STAGGER_WORD } from '@/lib/motion';
import { FoilKeyword } from './foil-keyword';

type Props = {
  text: string;       // full heading, e.g. "Find the exact bike."
  keyword?: string;   // the single word to render as foil, e.g. "exact"
  delay?: number;     // seconds — hand off after the splash (e.g. 0.1)
  className?: string;
};

export function BlurResolveHeadline({ text, keyword, delay = 0, className }: Props) {
  const reduced = useReducedMotion();
  const words = React.useMemo(() => text.split(' '), [text]);

  const container: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: reduced ? 0 : STAGGER_WORD } },
  };
  const word: Variants = {
    hidden: reduced ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: reduced ? { duration: 0 } : enter },
  };

  return (
    <h1 aria-label={text} className={className}>
      {/* aria-hidden: SR reads the label, not the animated fragments */}
      <motion.span aria-hidden variants={container} initial="hidden" animate="visible">
        {words.map((w, i) => {
          const bare = w.replace(/[.,!?;:]/g, '');
          const isKeyword = keyword != null && bare === keyword;
          return (
            <React.Fragment key={i}>
              <motion.span
                variants={word}
                style={{ display: 'inline-block', willChange: 'filter, opacity' }}
              >
                {isKeyword ? <FoilKeyword>{w}</FoilKeyword> : w}
              </motion.span>
              {i < words.length - 1 ? ' ' : null}
            </React.Fragment>
          );
        })}
      </motion.span>
    </h1>
  );
}
```

Usage in the hero (above the fold → `initial/animate`, not `whileInView`):

```tsx
<BlurResolveHeadline
  text="Find the exact bike."
  keyword="exact"
  delay={0.1}
  className="font-serif text-5xl tracking-[-0.03em] leading-[1.05] text-fg"
/>
```

> For a **below-the-fold** section title, swap the trigger: change the container to
> `whileInView="visible"` + `viewport={{ once: true, margin: '-15% 0px' }}` and drop `initial="hidden"`'s auto-run.
> Blur-resolve is reserved for the H1 and section titles — never body copy.

---

## 3. Spring stagger `[chrome]`

Card / section reveal: `opacity 0 + y:16 → 0` with the **ONE spring**, `whileInView` fired **once**, **60ms**
stagger, **capped at the first 8** (the rest snap in with no delay — NORTH-STAR §6.2). Reduced-motion → everything
visible instantly.

### `apps/web/components/motion/spring-stagger.tsx`

```tsx
'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { spring, STAGGER_CARD } from '@/lib/motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;      // seconds between items
  maxStaggered?: number; // cap — items beyond this reveal together
};

export function SpringStagger({
  children,
  className,
  stagger = STAGGER_CARD,
  maxStaggered = 8,
}: Props) {
  const reduced = useReducedMotion();
  const items = React.Children.toArray(children);

  const item: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    // `custom` = index → clamp the delay so only the first N stagger
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { ...spring, delay: Math.min(i, maxStaggered) * stagger },
    }),
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      variants={{ hidden: {}, visible: {} }} // parent propagates labels to children
    >
      {items.map((child, i) => (
        <motion.div key={i} custom={i} variants={item} style={{ willChange: 'transform, opacity' }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

Usage — the below-the-fold listing cards that "prove the product":

```tsx
<SpringStagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
</SpringStagger>
```

> **Search bar first, then cards.** Give the hero search bar its own `SpringStagger` wrapper (or a single
> `motion.div` with `spring`) that fires slightly earlier, so the input rises before the result tiles — the §6.2
> cadence. **In the workspace** (`/search` results) do **not** use this — data appears instantly; at most a
> 23–40ms stagger fade as results stream in.

---

## 4. Animated keyword material — the "warm soul" foil `[chrome]`

### Decision (evaluated, one pick)

| Option | Mechanism | Verdict |
|---|---|---|
| **1. Reproduce zo's foil sheen** | CSS `@keyframes zo-foil-sheen` 12s specular sweep + metallic gradient + emboss | Great look, but a CSS-keyframe island for text is awkward and can't pause off-screen cleanly. |
| **2. Motion-driven animated gradient** | animate-ui `texts-gradient`: `background-clip:text` + Motion-animated `background-position` | **PICK.** Already the sanctioned registry (NORTH-STAR §8), pure `motion/react` + CSS, zero Radix, zero new primitive layer. |
| **3. Cult UI / componentry.dev** | shadcn-registry shine/shimmer text | **Reject.** Adds a *third* component registry for zero unique capability (Cult UI docs 404'd on the components index; componentry.dev exposes no Base-UI-safe foil-text primitive). Violates the single-registry discipline in REGISTRIES §7. |

**Recommendation: Option 2, realized as `FoilKeyword`** — animate-ui's `texts-gradient` mechanism, hardened for
our rules and tuned to a **warm** foil. It captures Option 1's *look* (a metallic gradient whose highlight band
travels = a slow specular sheen, plus zo's letterpress emboss) using Option 2's *mechanism* (Motion, so it obeys
`useReducedMotion` + `useInView` off-screen pause). The palette is a champagne/bronze metal with exactly **one
clay glint** (`brand-500` at the 46% stop) — the "warm soul" made literal. It loops slowly (~11s), subtle and
premium. This is the seamless-loop trick from animate-ui GradientText (symmetric gradient, `background-size:200%`,
travel one full period → no visible seam) and the traveling highlight *is* zo's 12s sheen, applied to the glyphs.

### `apps/web/components/motion/foil-keyword.tsx`

```tsx
'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

type Props = {
  children: React.ReactNode;
  duration?: number; // seconds per sheen cycle — slow = premium
  className?: string;
  style?: React.CSSProperties;
};

export function FoilKeyword({ children, duration = 11, className, style }: Props) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: '0px' });
  const reduced = useReducedMotion();
  const loop = !reduced && inView; // off-screen or reduced → static metal, no repaint

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: 'var(--foil-gradient)',
        backgroundSize: '200% auto',       // 2-tile → seamless travel
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        filter: 'var(--foil-emboss)',      // zo letterpress, theme-aware
        willChange: loop ? 'background-position' : undefined,
        ...style,
      }}
      initial={{ backgroundPosition: '0% center' }}
      animate={loop ? { backgroundPosition: ['0% center', '-200% center'] } : { backgroundPosition: '0% center' }}
      transition={loop ? { duration, ease: 'linear', repeat: Infinity } : { duration: 0 }}
    >
      {children}
    </motion.span>
  );
}
```

Used standalone or, as in §2, dropped inside the blur-resolve headline for the one keyword. The blur reveal runs
first (the parent word span blurs → resolves); the foil sheen continues underneath.

> **Surface-level sibling (zo's `zo-foil-sheen`, transcribed).** For the *active sort/filter segment* (one at a
> time), the zo effect is a specular sweep across the surface. Do it with animate-ui's `effects-shine` primitive
> (`@animate-ui/primitives-effects-shine`) — `enable loop deg={-15} duration={2400}` gives the same left-to-right
> light band; set a long `loopDelay` (~9000) to reach zo's ~12s subliminal cadence. It's `motion/react`, so it
> pauses/obeys reduced motion the same way. The verbatim zo keyframe it replaces:
> `@keyframes zo-foil-sheen { 0%,100% { transform: translate3d(-100%,0,0) } 50% { transform: translate3d(100%,0,0) } }`
> at `12s linear infinite` on `.tab-active`.

---

## 5. Foreground texture `[chrome, both]`

Two very-low-opacity, non-interactive, theme-aware layers. **(a)** a dot-grid/dither *undertone* that sits
*behind* content (zo's hero dot-grid), and **(b)** a crumpled-paper/noise *grain* that sits *in front* as a
whole-page film layer (poke's `noise.webp`, here as a self-contained `feTurbulence` data-URI — no external asset).

### 5a. CSS (add to `globals.css`, `@layer components`)

```css
@layer components {
  /* (a) DOT-GRID UNDERTONE — section background, behind content (z below text). */
  .texture-dots {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: radial-gradient(var(--tex-dot) 1px, transparent 1.5px);
    background-size: 22px 22px;
  }

  /* (b) CRUMPLED-PAPER GRAIN — whole-page FOREGROUND film, above everything, ~4% opacity. */
  .texture-grain {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    background-image: var(--tex-noise);
    background-size: 140px 140px;   /* stitchTiles='stitch' → seamless tile */
    opacity: 0.04;
    mix-blend-mode: soft-light;     /* reads as paper tactility on warm cream */
  }
  .dark .texture-grain {
    opacity: 0.05;
    mix-blend-mode: overlay;        /* film grain reads better over warm-dark */
  }

  @media (prefers-reduced-motion: reduce) {
    /* textures are static, so they stay — no motion to reduce */
  }
}
```

### 5b. React overlays (optional convenience)

```tsx
// apps/web/components/motion/texture.tsx
export function TextureDots({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`texture-dots ${className}`} />;
}

/** Mount ONCE, high in the tree (e.g. app/layout.tsx after children). Whole-page grain. */
export function TextureGrain() {
  return <div aria-hidden className="texture-grain" />;
}
```

Usage — dot-grid behind the hero, grain over the whole app:

```tsx
// hero section
<section className="relative overflow-hidden">
  <TextureDots />
  <div className="relative z-10"> {/* content above the dots */}
    <BlurResolveHeadline text="Find the exact bike." keyword="exact" />
  </div>
</section>

// app/layout.tsx <body>: <SplashHost /> {children} <TextureGrain />
```

> Keep both **whispering**: dots ≤ 5% alpha, grain ≤ 5% opacity. If either becomes *noticeable* as a pattern,
> it's too strong — the goal is that flat cream stops feeling sterile, not that you see dots or noise.

---

## 6. Restraint, reduced-motion & off-screen-pause — the rules

### Restraint (NORTH-STAR §6.5)
- **One spring, one ease, one micro.** `spring` (260/26) and `enter` (380ms easeOutCubic) for marketing entrances;
  `micro` (150ms) for hover/press. Never author a per-component curve.
- **Overshoot ≤ 5%, chrome only.** The workspace is strict no-bounce ease-out.
- **Reveal once.** `whileInView` + `viewport={{ once: true }}`. Never re-fire on scroll-back.
- **Stagger 23–80ms, capped.** 40ms words, 60ms cards, first ~8 only. Longer/uncapped reads as slow.
- **One accent glint, one sheen.** The foil keyword is the single animated accent above the fold; the surface
  sheen is one active segment at a time; the poke `gradient-border` (below) is at most one element per page.
- **Depth is material, not motion.** Raise via `--raise` (hairline + inset highlight + two soft shadows), never a
  hard drop shadow, never alpha > 12%.

### Reduced motion (mandatory on every Motion component)
- `useReducedMotion()` branches to: **no blur, no y-offset, no loop, `duration:0`** — content appears immediately.
- The splash returns `null`.
- The foil keyword renders as **static metal** (no sheen).
- The global CSS `@media (prefers-reduced-motion: reduce)` block already zeroes CSS animations/transitions; the
  Motion branches above cover what CSS can't.

### Off-screen pause (anything that loops)
- **Motion loops** (`FoilKeyword`, any `whileInView` re-runs): gate `animate` on `useInView` — off-screen ⇒ static,
  zero repaint. Pattern used in `FoilKeyword`.
- **CSS loops** (a bare `@keyframes` sheen / gradient-border): toggle `animation-play-state: paused` via an
  `IntersectionObserver`, or set the class only while a `useInView` ref is true. Never leave a loop running
  off-screen — it burns battery and drifts the loop phase.

### Bonus — sanctioned one-offs (poke `gradient-border`, transcribed exactly)

At most **one** element per page (the "best deal" / featured listing). Uses a registered `@property <angle>` so CSS
can interpolate the conic sweep. Pure CSS, no DOM added (a `::before` ring).

```css
@property --gb-rot { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes gb-rotate { to { --gb-rot: 360deg; } }

.deal-highlight {
  position: relative;
  border-radius: 22px;
  background: var(--color-bg-alt);
  box-shadow: 0 0 36px 2px oklch(0.64 0.18 35 / 0.06),
              0 8px 50px 6px oklch(0.64 0.18 35 / 0.035); /* barely-there clay haze */
}
.deal-highlight::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  z-index: -1;
  background: conic-gradient(from var(--gb-rot),
    oklch(0.64 0.18 35 / 0.55), oklch(0.99 0 0 / 0.85), oklch(0.64 0.18 35 / 0.55));
  animation: gb-rotate 6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .deal-highlight::before { animation: none; } }
```

### Why animate-ui feels premium — and where each snippet captures it
- **It arrives, it doesn't load.** A held first frame + a calm fade-out reads as craft, not a spinner. → **§1 Splash**
  (covers first paint, capped ~900ms, exits on `[0.25,1,0.5,1]`).
- **Focus, not motion.** The headline *resolves into focus* (blur→sharp), never slides or bounces — gentle
  confidence. → **§2 Blur-resolve**.
- **One material.** A single spring + a single ease make every reveal feel cut from the same cloth. → **§3 Spring
  stagger** + the shared `lib/motion.ts`.
- **Premium is what's withheld.** One clay glint travels through one keyword; everything else is still and
  monochrome, so the eye is directed by scarcity. → **§4 FoilKeyword**.
- **Tactile, never sterile.** Sub-5% grain + dot-grid give flat cream a paper hand. → **§5 Texture**.
- **Respect the user.** Every loop pauses off-screen and every entrance collapses under reduced motion — it is
  never janky and never in the way. → **§6 rules**, wired into every component.
```
