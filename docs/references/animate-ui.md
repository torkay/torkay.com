# animate-ui.com — Forensic Teardown & Reproduction Contract

**Target:** https://animate-ui.com/ (the marketing landing / `app/(home)/page`)
**Purpose:** Reproduce its "everything is animated, zero-stutter, tasteful" quality inside RideRadar (coss.ui + Base UI + Tailwind v4 + OKLCH + shadcn CLI). animate-ui is Base UI + **Motion** + shadcn CLI, so it is drop-in compatible with our substrate.
**Method:** All values below are pulled verbatim from the deterministic capture in `./raw/` (see Evidence Appendix for file/line/frame citations). Web copy confirmed against the live docs.

---

## 1. Snapshot

**Stack**
- **Framework:** Next.js (App Router). Evidence: `_next/static/chunks/app/(home)/page-*.js`, `main-app-*.js`, `__next_f` / `next` globals, `next-size-adjust` meta. Server-rendered, RSC streaming (`?_rsc=` fetches).
- **Motion library:** **Motion** (the `motion` package, successor to Framer Motion). Evidence: meta description literally says *"…built with React, TypeScript, Tailwind CSS, **Motion** and Shadcn CLI"*; keywords include "Framer Motion"; global `MotionIsMounted` present; the WAAPI animations are serialized `linear(…)` spring easings (Motion's signature spring→`linear()` compilation).
- **Component substrate:** Base UI / Radix / Headless primitives wrapped with Motion. Docs expose the same primitives for **Base UI** (`@base-ui`), which is exactly our stack.
- **CSS:** Tailwind v4 (token set is the v4 `@theme` output: `--color-*`, `--text-*`, `--spacing`, `--radius-*`, `@property --tw-*`). `tailwind: true` probe. Plus `tailwindcss-animate`/`tw-animate-css` (the `enter`/`exit` keyframes + `--tw-enter-*` / `--tw-exit-*` `@property` rules).
- **Docs shell:** **Fumadocs** (all the `--fd-*` / `--color-fd-*` tokens and `fd-*` keyframes: dialog, popover, accordion, nav-menu, sidebar, collapsible). *This is the docs section, not the landing hero — keep the two motion systems separate when reproducing.*
- **Hosting:** Vercel (footer "VERCEL INC. // 2025 OPEN SOURCE SOFTWARE PROGRAM"; `vercel.com/oss` badge). Author `imskyleen` / "Skyleen".
- **Perf:** transferSize 7.4 KB main doc, 39 resources, DCL 551 ms, load 804 ms, **FCP 1108 ms**. The splash exists precisely to cover the 0→1108 ms pre-paint gap.

**Fonts** (2 families, both variable, self-hosted woff2, preloaded)
- **Outfit** (`100 900`, ~32.5 KB woff2) — the entire UI. 407 of 411 text nodes use `Outfit, "Outfit Fallback"`. Geometric-humanist sans; friendly, rounded, modern. Roles: logo wordmark, hero H1, body, buttons, nav, footer.
- **Dancing Script** (`400 700`, ~42.9 KB woff2) — decorative script accent, used on exactly **4** nodes: the card category labels *"Primitives", "Components", "Icons", "Soon…"* (~22 px, cursive). This is the one "personality" flourish against an otherwise clinical mono palette.

**Aesthetic (2 sentences):** A near-monochrome, almost Swiss landing — pure white ground, near-black ink, hairline neutral-200 borders, essentially shadowless, radii-soft cards, with a single cursive font as the only ornament. All the "premium" comes from motion, not decoration: a quiet centered-logo splash, a per-word blur-in headline, and spring-staggered cards, executed with zero layout stutter.

---

## 2. Design System

### 2.1 Color (OKLCH, light mode — captured; `htmlClass="… light"`, `darkVars: null`)

The palette is a **pure neutral (chroma = 0) grayscale ramp**. There is **no brand accent** on the landing; color exists only as an unused Tailwind/shadcn chart+status reserve.

**Semantic tokens (light):**
| Token | Value | Role |
|---|---|---|
| `--background` | `oklch(100% 0 0)` (#fff) | page ground |
| `--foreground` | `oklch(14.5% 0 0)` | primary ink (= neutral-950) |
| `--card` / `--popover` | `oklch(100% 0 0)` | surfaces |
| `--card-foreground` | `oklch(14.5% 0 0)` | |
| `--primary` | `oklch(14.5% 0 0)` | black buttons ("Get Started") |
| `--primary-foreground` | `oklch(98.5% 0 0)` | button text |
| `--secondary` / `--accent` / `--muted` | `oklch(97% 0 0)` | subtle gray fills ("Browse Components", cards) |
| `--secondary-foreground` / `--accent-foreground` | `oklch(20.5% 0 0)` | |
| `--muted-foreground` | `oklch(55.6% 0 0)` | sub-copy, captions |
| `--border` / `--input` | `oklch(92.2% 0 0)` | hairline borders (= neutral-200) |
| `--ring` | `oklch(70.8% 0 0)` | focus ring (= neutral-400) |
| `--destructive` | `oklch(57.7% .245 27.325)` | red (only non-neutral semantic) |
| `--radius` | `0.625rem` (10px) | base radius |

**Neutral ramp (the actual working palette):**
`50 oklch(98.5%)` · `100 oklch(97%)` · `200 oklch(92.2%)` · `300 oklch(87%)` · `400 oklch(70.8%)` · `500 oklch(55.6%)` · `600 oklch(43.9%)` · `700 oklch(37.1%)` · `800 oklch(26.9%)` · `900 oklch(20.5%)` · `950 oklch(14.5%)` — all chroma 0.

**Computed-color histogram (what actually renders):** `oklch(0.145 0 0)` ×143 (ink), `oklch(0.708 0 0)` ×81 (neutral-400 placeholders), `rgb(115,115,115)`=neutral-500 ×60, black ×52, `oklch(0.922 0 0)` ×40 (borders/fills), `oklch(0.985 0 0)` ×17. → the page is literally 5 grays + black + white.

**Reserve accents (defined, ~unused on landing):** chart-1 `oklch(64.6% .222 41.116)` (orange), chart-2 `oklch(60% .118 184.704)` (teal), chart-3 `oklch(39.8% .07 227.392)` (slate-blue), chart-4 `oklch(82.8% .189 84.429)` (amber), chart-5 `oklch(76.9% .188 70.08)`. Full Tailwind hue set (blue/green/red/purple/pink/teal/emerald/indigo/violet/amber/yellow) is present in `rootVars` but only referenced inside docs/status UI.

**Dark mode:** `darkVars` was `null` in this capture (page loaded light), but a theme toggle (moon icon, top-right) is present. Dark is the standard shadcn/animate-ui neutral inversion — reproduce as: `--background: oklch(14.5% 0 0)`, `--foreground: oklch(98.5% 0 0)`, `--card: oklch(20.5% 0 0)`, `--muted: oklch(26.9% 0 0)`, `--border: oklch(1 0 0 / 10%)`, `--muted-foreground: oklch(70.8% 0 0)`. (Inferred — verify against a dark capture before locking.)

### 2.2 Typography

**Families:** Outfit (all), Dancing Script (4 cursive labels). `--font-mono` = `ui-monospace, SFMono-Regular, Menlo…` — used only for the footer mono line ("VERCEL INC. // 2025").

**Scale tokens (Tailwind `--text-*`):**
`xs .75rem/12px` · `sm .875/14` · `base 1/16` · `lg 1.125/18` · `xl 1.25/20` · `2xl 1.5/24` · `3xl 1.875/30` · `4xl 2.25/36` · `5xl 3/48` · `6xl 3.75/60`.

**Rendered font-size histogram:** 16 px ×239 (body/base) · **48 px ×80 (hero H1)** · 14 px ×69 (buttons, nav, sub-copy) · 12 px ×12 (footer mono, badges) · 15 px ×6 · **22 px ×4 (Dancing Script card labels)** · 18 px ×1.

**Weights:** `normal 400 · medium 500 · semibold 600 · bold 700 · black 900`.

**Heading spec (the hero):** The visible H1 *"Animate your UI with smooth style"* renders at **48 px, bold (~700), tracking-tight (`-0.025em`)**, `line-height: 1` (from `--text-5xl--line-height: 1`). (Note: the *DOM* `<h1>` in `headings` reports 16px/400 because that is the visually-hidden accessible copy — the visible headline is per-word `<span>`s at 48 px that the SplittingText primitive animates. Reproduce with the same a11y pattern: real `<h1>` for screen readers, animated spans for sight.)

**Letter-spacing tokens:** `tracking-tight -0.025em` (headings), `tracking-widest 0.1em` (uppercase mono footer). `leading-tight 1.25`.

### 2.3 Spacing / Radius

- **Spacing base:** `--spacing: 0.25rem` (4px) — standard Tailwind 4px grid.
- **Container widths:** `--fd-page-width 1200px`, `--spacing-fd-container 1400px`, `--container-7xl 80rem`. Landing content column ≈ max-w-3xl/5xl centered.
- **Radius tokens:** `xs .125rem/2px` · `lg/DEFAULT .625rem/10px` · `2xl 1rem/16px` · `3xl 1.5rem/24px`.
- **Rendered border-radius histogram:** `16px ×4` (the 4 category cards, `rounded-2xl`) · `10px ×2` (buttons, `rounded-[--radius]`) · `8px ×2` · `4px ×1` · `3.35e7px ×4` (fully-round pills: the "New" badge, the theme toggle, the GitHub-stars badge). → **Convention: pills = fully round, cards = 16px, buttons = 10px, chips = 8px.**

### 2.4 Border & Shadow

- **Border:** one color only — `oklch(0.922 0 0)` (neutral-200) on **411** elements, `--tw-border-style: solid`, 1px. The whole UI is defined by hairline borders, not fills.
- **Shadow:** essentially **shadowless**. The box-shadow histogram has a *single* entry — a `shadow-lg` (`0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)`, plus a 0-spread ring layer) on **1** element (a hover/active elevation, likely the primary button or a lifted card). Elevation is earned by motion + border, not ambient shadow.
- **Filters:** `blur(0px)` on 28 elements — these are the *resting* states of blur-in text (blur animates 10px→0). No backdrop-filters.
- **Gradients:** none rendered (`gradients: []`).

### 2.5 Background treatment

Pure white (`oklch(1 0 0)`), transparent on 398 nodes. Cards are `oklch(0.97 0 0)` (neutral-100/muted) soft-gray panels with 16px radius and hairline borders. No texture, no gradient, no glow. The restraint is the point — it makes the motion legible.

---

## 3. Motion System (core deliverable)

Two distinct motion engines run here — do not confuse them:
- **Landing hero motion = Motion (WAAPI)** — springs serialized to `linear(…)`, opacity/blur/transform. This is what we want.
- **Docs-shell motion = CSS `@keyframes` (Fumadocs + tailwindcss-animate)** — the `fd-*` and `enter`/`exit` families. Useful vocabulary, but secondary.

### 3.a Splash Entrance (0 → ~1100 ms)

**What you see** (frames `t0000` → `t0950`): a blank white screen (`t0000`, pre-paint) resolves to the **centered gray "Animate UI" wordmark + rounded-triangle logo** (`t0260`, `t0650`, `t0950`), then the logo clears and the real page paints (first content by `t1400`).

**Reconstruction:**
- A full-viewport white overlay holds the centered logo (rounded-triangle glyph + "Animate UI" in Outfit, rendered in `neutral-400`/`neutral-500` gray).
- The only running animation captured through the splash (`t0000`–`t0650`, `animationName: null` ⇒ Motion/WAAPI, not CSS) is an **opacity `1 → 0` over 800 ms** on a small inner icon (`div.absolute [&_svg]:size-3 left-1 top-1/2 -translate-y-1/2 … text-neutral-400`), easing = a **monotonic Motion `linear(…)` ease-out** (starts slow, ~0.24 by 10%, ~0.85 by 37%, no overshoot — a decelerating spring/easeOut).
- By `t0950` the timeline is empty (`count: 0`) and stays empty at `t1400`/`t2000` — the splash has fully exited and the page is momentarily static before the reveal choreography fires (~2.9 s snapshot catches it mid-play).

**Why it reads as "quality / non-intrusive":**
1. It fills the *unavoidable* 0→1108 ms FCP gap, so the user never sees a white flash or reflow — perceived instant.
2. It is **monochrome and tiny** (just the mark), not a branded takeover — it whispers, it doesn't announce.
3. It **decelerates out** (ease-out, no bounce), which the eye reads as "settling into place," not "performing."
4. Total on-screen time is ~1 s — under the ~1.2 s threshold where a preloader starts to feel like a wait.

### 3.b Stagger Choreography (the hero reveal, ~2.0 → ~3.5 s)

Captured at the `atMs: 2900` snapshot: **34 concurrent WAAPI animations**, all `animationName: null` (Motion), all `currentTime: 1541`, all `fill: both`. Two interleaved staggers:

**(1) Headline — per-word blur-in ("Splitting Text"):**
- 13 text `<span>` segments (the H1 words, plus the sub-headline words), each with **two** paired animations:
  - `opacity 0 → 1`
  - `filter blur(10px) → blur(0px)`
- **duration 400 ms**, **easing `ease-out`**, iterations 1.
- **Stagger delta = 50 ms** — delays step `1150 → 1200 → 1250 → 1300 → 1350 → 1400 → 1450 → 1500 → 1550 → 1600 → 1650 → 1700 → 1750 ms`.
- Direction: left→right (leftmost word sharp first). In `t2900` you can literally see "Animate your" crisp while "UI with smooth style" is still blurred — a clean reading-order sweep.

**(2) Blocks — spring rise ("Effect"/Fade primitive):**
- 8 `<div>` blocks (badge pill, button row, tech-icon row, the 4 category cards), each `opacity 0 → 1` (transform handled on the parent by Motion; only opacity surfaced on these nodes).
- **duration 600 ms**, **easing = a Motion spring** serialized to `linear(…)` — it **overshoots to ~1.043 at ~52%** then settles to 1.0, i.e. ~4.3% overshoot ⇒ damping ratio **ζ ≈ 0.71** (a moderately-damped, barely-bouncy spring).
- **Stagger:** delays `950, 1000, 1050, 1150, 1150, 1300, 1450, 1600 ms` — ~50 ms between adjacent icons, ~100–150 ms between major blocks.

So the master timeline is: blocks begin rising (~950 ms in) while the headline blur-sweep runs 1150→2150 ms — the two overlap so the page feels like one continuous swell, not two separate animations. Everything lands by ~2.2 s of the reveal clock.

### 3.c Easing & Duration Vocabulary (complete enumeration)

**Springs / entrance easings (Motion, `linear(…)`):**
- **Spring-A ("rise"):** ~4.3% overshoot, peak at ~52%, settle 100%; ζ≈0.71; used at **600 ms** for block reveals. *(This is the signature "premium" spring.)*
- **EaseOut-A ("splash"):** monotonic decelerate, no overshoot; used at **800 ms** for the splash logo fade.
- **`ease-out` (native):** hero word blur-in (**400 ms**) and scroll shimmer (**800 ms**).

**Cubic-bezier easings (CSS transitions / Fumadocs keyframes):**
- `cubic-bezier(.4, 0, .2, 1)` — Tailwind default ease-in-out; **150 ms** hover/color transitions (`--default-transition-*`). Also seen at 100 ms, 200 ms, 300 ms variants.
- `cubic-bezier(.16, 1, .3, 1)` — easeOutExpo-ish; Fumadocs **dialog in/out @ 300 ms**.
- `cubic-bezier(.45, 0, .55, 1)` — easeInOutSine; **collapsible @ 150 ms**.
- `cubic-bezier(.4, 0, .6, 1)` — the `pulse` loop.

**Duration ladder (every value found):**
`130 ms` (fd-popover) · `150 ms` (hover, collapsible) · `200 ms` (accordion, opacity, nav-menu) · `250 ms` (sidebar, fd-enter/exit slide) · `300 ms` (fd-dialog, fd-fade) · **`400 ms` (hero word blur-in)** · **`600 ms` (block spring rise)** · **`800 ms` (splash fade, scroll shimmer)** · `1s` (spin loop) · `2s` (pulse loop).

**Distilled vocabulary to adopt (3 buckets):**
1. **Micro / hover:** 150 ms · `cubic-bezier(.4,0,.2,1)`.
2. **Entrance / reveal:** 400–600 ms · word text = `ease-out` + blur; blocks = spring ζ≈0.7.
3. **Overlay (modal/popover):** 130–300 ms · `cubic-bezier(.16,1,.3,1)`.

### 3.d "Everything is Animated" Inventory

Distinct animated behaviors evidenced by the capture:
1. **Splash logo fade-out** — opacity 1→0, 800 ms ease-out (§3.a).
2. **Per-word headline blur-in** — opacity+blur, 400 ms, 50 ms stagger (§3.b-1) → primitive **Splitting Text** (blur variant).
3. **Block spring-rise stagger** — opacity(+y), 600 ms spring, cards/buttons/badge (§3.b-2) → primitive **Effect** / **Fade** with `staggerChildren`.
4. **GitHub-stars rolling counter** — the star badge value animates up across frames (`t2900` empty → `t4200` "24…" → `scroll5`/`fullpage` "3777"): a digit-odometer roll → primitive **Sliding Number** / **Counting Number** inside the **GitHub Stars** button.
5. **Scroll-triggered shimmer sweep** — at scroll step 5 (y≈767), **6 `<div>`s**, `opacity 0 → 1 → 0` (peak at 50% offset), **800 ms**, `ease-out`, **50 ms stagger** (delays 0,50,100,150,200,250) → a highlight/shimmer passing across a row → primitive **Shimmering Text** / **Shine** effect. (Scroll steps 1–4 and 6 produced no animations — the landing is essentially one viewport, so scroll reveals are minimal.)
6. **Hover/color transitions** — 150 ms `cubic-bezier(.4,0,.2,1)` on buttons/links (color, bg, border).
7. **Loops** — `spin` (1s linear infinite) and `pulse` (2s infinite) available for spinners/skeletons.
8. **Docs-shell state animations** (Fumadocs, secondary) — dialog scale-in, popover scale-in, accordion/collapsible height, nav-menu, sidebar slide.

### 3.e Named `@keyframes` (verbatim, the load-bearing ones)

```css
/* Loops */
@keyframes spin  { 100% { transform: rotate(1turn); } }
@keyframes pulse { 50%  { opacity: .5; } }

/* tailwindcss-animate data-state driver (transform/opacity/blur via CSS vars) */
@keyframes enter {
  0% { opacity: var(--tw-enter-opacity,1);
       transform: translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0)
                  scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1))
                  rotate(var(--tw-enter-rotate,0));
       filter: blur(var(--tw-enter-blur,0)); }
}
@keyframes exit {
  100% { opacity: var(--tw-exit-opacity,1);
         transform: translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0)
                    scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1))
                    rotate(var(--tw-exit-rotate,0));
         filter: blur(var(--tw-exit-blur,0)); }
}

/* Fumadocs overlays (docs shell) */
@keyframes fd-dialog-in  { 0% { opacity:0; transform:scale(1.06); } 100% { transform:scale(1); } }
@keyframes fd-dialog-out { 0% { transform:scale(1); } 100% { opacity:0; transform:scale(1.04); } }
@keyframes fd-popover-in { 0% { opacity:0; transform:scale(.7); } }
@keyframes fd-fade-in    { 0% { opacity:0; } 100% { opacity:1; } }
@keyframes fd-enterFromRight { 0% { opacity:0; transform:translate(200px);} 100%{opacity:1;transform:translate(0);} }
@keyframes accordion-down { 0% { height:0; } 100% { height:var(--radix-accordion-content-height); } }
```
Associated animation tokens: `--animate-fd-dialog-in: fd-dialog-in .3s cubic-bezier(.16,1,.3,1)`, `--animate-fd-popover-in: fd-popover-in .13s ease`, `--animate-fd-fade-in: fd-fade-in .3s ease`, `--animate-fd-accordion-down: fd-accordion-down .2s ease-out`, `--animate-spin: spin 1s linear infinite`, `--animate-pulse: pulse 2s cubic-bezier(.4,0,.6,1) infinite`.

---

## 4. Signature Moments (what makes it feel premium)

1. **The centered monochrome splash that exits by ease-out.** *Why:* it converts the unavoidable ~1.1 s cold-load into an intentional beat, and by decelerating (not bouncing) it says "settled," setting a calm, high-craft tone before a single word is read.
2. **Per-word blur-in on the headline, in reading order, 50 ms apart.** *Why:* the eye tracks the sentence left-to-right *as it sharpens* — the animation is literally paced to reading speed, so it feels like the page is "speaking" the headline rather than decorating it. Blur (not just fade) adds depth/focus-pull that pure opacity can't.
3. **Spring-rise cards with only ~4% overshoot (ζ≈0.7).** *Why:* just enough life to feel physical, far too little to feel gimmicky. The tiny overshoot is the difference between "rendered" and "arrived."
4. **Overlapping timelines.** *Why:* blocks start rising (~950 ms) while the headline is still sweeping (1150→2150 ms). The overlap fuses everything into one swell — no perceptible "and now the cards animate" second act.
5. **A rolling GitHub-star odometer + one cursive word.** *Why:* two micro-flourishes of humanity (a live counting number, a script "Primitives") in an otherwise clinical grid — proof of attention to detail without breaking the restraint.

---

## 5. RideRadar Reproduction Playbook

RideRadar is a **search-first meta-search** landing: the hero is a **search bar** ("search everything, find the exact bike / best deal") with **listing/result cards** below. Map animate-ui's moves onto that.

### 5.1 Adopt (in priority order)
- **Splash beat** — a ~700–900 ms centered RideRadar wordmark/mark on `--background`, opacity 1→0 ease-out, gated to cover first paint only (skip if content is already cached; respect `prefers-reduced-motion`).
- **Search-bar entrance** — the single most important element rises first with **Spring-A** and its placeholder text blur-in.
- **Headline blur-in** — per-word Splitting-Text on the value-prop line.
- **Result-card stagger** — cards rise with Spring-A, 50–80 ms apart.
- **Live count** — Sliding/Counting Number on "X,XXX bikes matched" once results resolve.
- **Micro-interactions** — 150 ms ease-in-out on every hover/focus (cards, buttons, filter chips).

### 5.2 Exact Motion recipes (`motion` + Base UI)

**Shared transitions (define once):**
```ts
// motion/react
export const spring = { type: "spring", stiffness: 260, damping: 26 }; // ζ≈0.7, ~600ms, ~4% overshoot
export const easeOut400 = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };   // headline words
export const hover = { duration: 0.15, ease: [0.4, 0, 0.2, 1] };        // micro
```

**Splash (covers first paint, non-intrusive):**
```tsx
<AnimatePresence>
  {loading && (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-background"
      initial={{ opacity: 1 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}>
      <RideRadarMark className="size-10 text-neutral-400" />
    </motion.div>
  )}
</AnimatePresence>
// dismiss on next paint / data-ready, hard cap ~900ms
```

**Headline — per-word blur-in (Splitting Text):**
```tsx
const container = { animate: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } };
const word = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: easeOut400 },
};
<motion.h1 aria-label={text} variants={container} initial="initial" animate="animate"
           className="text-5xl font-bold tracking-tight leading-none">
  {text.split(" ").map((w,i)=>(
    <motion.span key={i} variants={word} aria-hidden className="inline-block mr-[0.25em]">{w}</motion.span>
  ))}
</motion.h1>
```
(Keep the real accessible `<h1>` text via `aria-label`; animate `aria-hidden` spans — matches animate-ui's a11y pattern.)

**Search bar + result cards — spring stagger:**
```tsx
const list = { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: spring } };

<motion.div variants={list} initial="initial" animate="animate">
  <motion.div variants={item}><SearchBar/></motion.div>       {/* rises first */}
  <motion.ul variants={list}>
    {results.map(r => <motion.li key={r.id} variants={item}><ListingCard {...r}/></motion.li>)}
  </motion.ul>
</motion.div>
```
Use Motion's **`layout`** on the results list so re-sorting/filtering (by price, "best deal") tweens positions instead of jumping — this is the meta-search "premium" tell.

**Result count odometer:** use animate-ui's **Sliding Number** primitive (shadcn CLI install) bound to the result total; animate on each query settle.

### 5.3 Restraint rules (keep it tasteful, not gaudy)
- **One spring, one ease** app-wide (`spring` + `easeOut400`). Do not invent per-component curves.
- **Entrance once, not on every scroll.** Reveal on first mount / first in-view (`whileInView` + `viewport={{ once: true }}`). No looping attention-grabbers except a subtle skeleton shimmer while fetching.
- **Overshoot ≤ ~5%** (ζ ≥ 0.7). Never bouncy.
- **Stagger 50–80 ms**, cap total reveal ≤ ~1.2 s. If a list is long, stagger only the first ~8 visible items, then fade the rest instantly.
- **Blur-in reserved for the H1 only.** Everywhere else use opacity+y.
- **No shadows for elevation** — hairline `--border` (neutral-200) + motion. At most one `shadow-lg` on the primary CTA hover.
- **`prefers-reduced-motion`:** collapse all of the above to a 150 ms opacity fade, no transform/blur.
- **Never animate the search input's own value/results container height without `layout`** — janky reflow is the opposite of this reference.

### 5.4 animate-ui → RideRadar component map
| Need | animate-ui primitive/component | Install |
|---|---|---|
| Headline blur-in | **Splitting Text** (Texts) | shadcn CLI |
| Card/section reveal + stagger | **Effect** / **Fade** / **Slide** (Effects) | shadcn CLI |
| Result count | **Sliding Number** / **Counting Number** (Texts) | shadcn CLI |
| Loading shimmer on skeleton cards | **Shimmering Text** / **Shine** (Effects) | shadcn CLI |
| Filter chips / tab bar | **Tabs**, **Motion Highlight** | shadcn CLI |
| Hover-magnet on primary CTA | **Magnetic** / **Tilt** (Effects) — use sparingly | shadcn CLI |
| Theme toggle | **Theme Toggler** button | shadcn CLI |
| Star/like affordance | **GitHub Stars** pattern (odometer) | reference only |

All are Base UI + Motion + shadcn CLI, so they install directly alongside coss.ui without a substrate conflict.

---

## 6. Evidence Appendix

| Claim | Source |
|---|---|
| Stack = Next.js + Motion + Tailwind v4 + shadcn CLI; Fumadocs docs shell | `raw/static.json` → `tech.scripts`, `tech.metas` (description/keywords), `tech.interestingGlobals` (`MotionIsMounted`, `__next_f`), `tech.markers.tailwind`, all `--fd-*` tokens |
| Fonts: Outfit (all) + Dancing Script (4 nodes) | `raw/static.json` → `loadedFonts`, `hist.fontFamilies` (`Outfit… ×407`, `Dancing Script… ×4`), preloaded woff2 in `tech.links` |
| Neutral OKLCH token set (light) + neutral ramp + reserve chart accents | `raw/static.json` → `rootVars` (`--background`,`--foreground`,`--primary`,`--muted`,`--border`,`--ring`,`--color-neutral-*`,`--chart-*`); `darkVars: null` |
| Rendered palette is ~5 grays + b/w | `raw/static.json` → `hist.colors`, `hist.backgrounds`, `hist.borderColors` |
| Type scale, weights, hero 48px, tracking | `raw/static.json` → `--text-*`, `--font-weight-*`, `hist.fontSizes` (48px×80), `headings` (hidden h1), `--tracking-tight` |
| Radius convention (pills/cards/buttons) + hairline borders + shadowless | `raw/static.json` → `--radius*`, `hist.borderRadii`, `hist.borderColors`, `hist.boxShadows` (single entry), `hist.gradients` (empty) |
| Transitions 150ms cubic-bezier(.4,0,.2,1) etc. | `raw/static.json` → `hist.transitions`, `--default-transition-*` |
| Splash = centered gray "Animate UI" mark; blank→mark→clear | frames `raw/shots/t0000ms.png`, `t0260ms.png`, `t0650ms.png`, `t0950ms.png` |
| Splash animation = opacity 1→0, 800ms, monotonic ease-out `linear(…)` | `raw/animation-timeline.json` → snapshots `atMs:0..650` (single anim, `animationName:null`, `duration:800`, that easing), then `atMs:950/1400/2000` = `count:0` |
| Hero per-word blur-in: 400ms ease-out, opacity+blur(10→0), 50ms stagger (delays 1150→1750) | `raw/animation-timeline.json` → `atMs:2900` span anims (13 delays × {opacity, filter}) |
| Block spring rise: 600ms, ~4.3% overshoot spring, delays 950–1600 | `raw/animation-timeline.json` → `atMs:2900` div anims (the overshooting `linear(… 1.0432 …)` easing) |
| Settled page layout (hero, buttons, tech icons, 4 cards, footer) | frames `raw/shots/t2900ms.png` (mid-reveal, right words still blurred), `t4200ms.png`, `fullpage.png` |
| GitHub-stars odometer counts up (blank→24…→3777) | frames `t2900` (empty) → `t4200` → `scroll5`/`fullpage` ("3777"); component confirmed via live docs (GitHub Stars / Sliding Number) |
| Scroll shimmer: 6 divs, opacity 0→1→0, 800ms ease-out, 50ms stagger, only at step 5 | `raw/scroll-reveals.json` → `step:5` (6 anims), steps 1–4/6 `count:0` |
| `@keyframes` + `@property --tw-*` (tailwindcss-animate) + Fumadocs animate tokens | `raw/static.json` → `keyframes[]`, `atProperties[]`, `rootVars` `--animate-*` |
| Component names (Splitting Text, Sliding/Counting Number, Effect/Fade/Slide, Shimmering Text, GitHub Stars, Base UI support) | live docs `animate-ui.com/docs/primitives`, `/docs/components` (WebFetch) |
| Perf / FCP 1108ms justifies splash | `raw/static.json` → `perf.nav`, `perf.paints` |

*Caveats:* `darkVars` was not captured (light-mode load) — §2.1 dark values are inferred from shadcn convention and must be verified against a dark capture. Motion `stiffness/damping` in §5.2 are fitted to the observed ~4.3% overshoot / ~600 ms visual duration, not read directly from source; tune by eye against the reference.
