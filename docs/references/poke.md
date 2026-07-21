# poke.com — Forensic Design & Motion Teardown

> Reproduction-grade extraction for redirecting **RideRadar**'s design language toward poke.com's
> restraint, warmth, and legibly human-centered feel — while keeping our substrate
> (coss.ui + Base UI, Tailwind v4, OKLCH tokens, shadcn-CLI) and adding **animate-ui** (Base UI + Motion).
>
> All values below are transcribed from the deterministic capture in `poke/raw/`. Where a value is inferred
> rather than directly measured, it is marked **(inferred)**. Citations to raw files/frames are inline and
> collected in §7.

---

## 1. Snapshot

**What it is.** A calm, warm, editorial landing page for an AI text-assistant, art-directed like a boutique
California software studio rather than a SaaS dashboard. Cream paper backgrounds, a high-contrast editorial
serif for display, a rounded humanist sans for everything else, coastal photography with film grain, and
motion that is slow, ambient, and never demanding. It reads as *a friend who happens to ship software.*

**Stack** (`raw/static.json` -> `tech`, `interestingGlobals`, `markers`; `raw/_summary.json`):
- **Next.js** (App Router, Turbopack) on **Vercel**. `__next_f`, `NEXT_DEPLOYMENT_ID`, `x-powered-by: Next.js`.
- **Tailwind v4** — confirmed by the token surface: `@property --tw-*` registrations, `--spacing:.25rem`,
  `oklab(...)` gradient stops, `--color-*` scales stored as `lab(...)`. `markers.tailwind = true`.
- **GSAP** *and* **Motion** (motion.dev) both loaded: globals `gsapVersions` **and** `MotionIsMounted`.
  This is the key combo — see §3 for the split.
- **PostHog** (`palm-trees/*` proxy, surveys, recorder, web-vitals, dead-clicks), **Vercel Speed Insights**,
  GA/Google Ads + Meta Pixel. Analytics-heavy but all deferred (`start > 3800ms`, `raw/static.json` resources).
- Fonts self-hosted as `woff2` under `_next/static/media`, `<link rel=preload>` + HTTP `Link:` preload headers.

**Fonts & roles** (`raw/static.json` -> `fonts`, `loadedFonts`, `hist.fontFamilies`, `headings`):
| Family | Role | Weights loaded | Where |
|---|---|---|---|
| **Exposure** (`--font-exposure`, `--exposure-weight:600`) | **Display** — a high-contrast *editorial serif* (Didone/transitional; renders with visible serifs + thick/thin stroke contrast despite the `sans-serif` fallback string). Variable font `Exposure-205TF-VAR.woff2`. | 400 + variable | All H1/H2/H3 headings, big pull-quotes, footer "Poke" watermark. 132 nodes. |
| **OpenRunde** (`--font-sans`, `--font-open-runde`, `--default-font-family`) | **Body / UI** — a *rounded humanist sans* (rounded terminals, open apertures, generous x-height). | 400 / 500 / 600 (700 defined, unused) | Nav, sub-heads, body, buttons, labels, card titles. 1560 nodes — the workhorse. |
| **Times** | **Accent** | system | 1 node only — a hairline editorial flourish. |
| JetBrains Mono (`--font-jetbrains-mono`) | Mono | defined, **unloaded** | Not used on the landing page. |

**Why a rounded humanist sans reads "human/warm":** rounded stroke terminals and circular counters remove the
mechanical hard corners of a grotesk; the eye reads curves as organic/hand-made. High x-height + open apertures
keep it friendly at small sizes without shouting. Pairing it *under* a high-contrast editorial serif (Exposure)
is the whole trick: the serif supplies gravitas/taste (this is a *considered* product), the rounded sans supplies
approachability (this product is *for a person, not an enterprise*). That tension — refined headline, soft body —
is the visual signature of "human-centered."

**Aesthetic in two sentences.** Poke.com is a warm-neutral, paper-textured canvas where a single editorial serif
does all the emotional work and everything else recedes into soft, low-contrast calm. Motion is present
everywhere but almost subliminal — nothing moves fast, nothing bounces hard, and the one saturated color (an
ocean blue) is rationed to a single rotating gradient border.

---

## 2. Design system

### 2.1 Color (from `raw/static.json` -> `rootVars`, `hist.colors/backgrounds/borderColors/gradients`)

`darkVars` is **null** and `htmlClass` contains `light` with no `data-theme` — **the site ships light-mode only.**
There is no dark theme; the warmth is entirely in the light palette. Meta `theme-color = #FDFBF7`.

**Warm-neutral core (the entire personality lives here):**
| Token | Value | Note |
|---|---|---|
| `--background` / `--card` / `--sidebar` | `#fffdfa` | Bone / warm off-white. Not `#fff` — a ~2-point warm lift. |
| meta `theme-color` | `#FDFBF7` | Even warmer cream (mobile chrome tint). |
| `--muted` / `--secondary` / `--accent` / `--color-muted` | `#f5f3f0` | Warm greige — hover fills, chips, section bands. |
| `--border` / `--input` / `--sidebar-border` | `#eeedeb` | Warm hairline. Dominant border: `rgb(238,237,235)` x1578. |
| `--foreground` / `--primary` / `--ring` | `#171717` | Near-black, **neutral** (not warm) — high-contrast ink on cream. |
| `--muted-foreground` | `#737373` | Neutral-500 grey for secondary copy / the "second line" of two-tone headings. |
| `--card-foreground` / `--popover-foreground` | `#171717` | |
| `--primary-foreground` | `#fafafa` | |

Observed body-ink also appears as `rgb(26,31,43)` (`#1A1F2B`, x856) — a faintly blue-black used inside the
product/phone mockups (iOS text), distinct from the neutral `#171717` used for site chrome.

**Accent + status colors (rationed):**
| Purpose | Value | Usage |
|---|---|---|
| **"ocean" accent** | `~ rgb(36,131,226)` = **`#2483E2`** | The *only* brand-saturated hue. Used for the animated gradient border + its glow on the featured pricing card, and "Learn more ->" links. Derived from `shadow-[...rgba(36,131,226,...)]` and `gradient-border-*-ocean` classes (`raw/scroll-reveals.json`). |
| Twitter blue(s) | `rgb(29,155,240)` `#1D9BF0`, `rgb(59,169,238)` `#3BA9EE` | Community tweet cards only (third-party chrome). |
| `--verified` | `#3a9750` | Green "All systems operational" dot + verified checks. |
| `--destructive` | `#dc2626` | Defined; not visible on landing. |

Tailwind ships full `--color-{red,blue,green,amber,neutral,zinc}-*` scales as `lab(...)`, but the **rendered
histogram uses almost none of them** — the palette actually painted on screen is: bone, greige, warm hairline,
near-black ink, one ocean blue, one green. That discipline is the point.

**Gradients** (`hist.gradients`):
- **Dark button:** `linear-gradient(rgb(58,58,58) 0%, rgb(58,58,58) 52.4%, rgb(44,44,44) 80.29%, rgb(31,31,31) 100%)` (x9) — the "Get Started" / "Get Pro" charcoal pills; a subtle top->bottom darkening, not flat black.
- **Paper white:** `linear-gradient(oklab(1 0 0) 0%, oklab(0.975 0 0.0001) 50%, oklab(0.966 0.0001 0.003) 100%)` (x3) — near-white->bone vertical wash on light surfaces.
- **Bevel grey:** `linear-gradient(rgb(237,236,234) 0%, ... rgb(196,196,196) 100%)` (x2) — light control bevels.

### 2.2 Typography (from `headings`, `hist.fontSizes`, `hist.letterSpacing`, `rootVars` text tokens)

**Measured type scale (as rendered):**
| Role | Font | Size | Weight | Line-height | Letter-spacing | Source |
|---|---|---|---|---|---|---|
| Hero H1 "Meet Poke, now on Apple Messages" | Exposure | **52px** | 600 | 52px (**1.0**) | **-2.08px** (-0.04em) | `headings[0]` |
| Section H2 "Poke fits into your life..." | Exposure | **36px** | 600 | 43.2px (1.2) | -1.08px (-0.03em) | `headings[2]` |
| Feature H3 "Handles tasks...", "Adapts...", etc. | Exposure | **36px** | 600 | 41.4px (1.15) | -0.72px (-0.02em) | `headings[6..]` |
| H2 "Choose a plan..." / "Community" | Exposure | 36px | 600 | 41.4-43.2px | -0.72 / -1.08px | `headings` |
| Integration card H3 (Notion/Oura/Gmail) | OpenRunde | 18.35px | 500 | 25.23px (1.375) | normal | `headings[3..5]` |
| Body (dominant) | OpenRunde | **16px** | 400 | ~1.5 | **-0.4px** (-0.025em) | `hist.fontSizes` x1205, `letterSpacing` x558 |
| Small / labels | OpenRunde | 14px | 400-500 | — | -0.015 to -0.18px | `hist.fontSizes` x242 |
| Micro (nav counters, footnote refs) | OpenRunde | 13px / 12px / 11.93px | 400 | — | — | `hist.fontSizes` |

**Rules to reproduce:**
- Display is Exposure @ **600 only**, always with **tight negative tracking that scales with size**
  (-0.04em hero -> -0.02em section) and **near-1.0 line-height** on the hero (52/52). This tightness is what makes
  the serif feel set/typeset rather than default.
- Body is OpenRunde @ 16/1.5 with a **standing -0.4px (-0.025em) tracking even on body copy** — a subtle premium detail; most sites leave body at 0.
- Tailwind tokens present: `--text-base:1rem` (lh `calc(1.5/1)`), `--text-lg:1.125rem`, `--text-xl:1.25rem`,
  `--text-2xl:1.5rem`, `--text-3xl:1.875rem`, `--text-4xl:2.25rem`; weights 400/500/600/700; `--leading-{tight:1.25,snug:1.375,normal:1.5,relaxed:1.625}`; `--tracking-{tight:-.025em,normal:0,wide:.025em,widest:.1em}`. Hero 52px / section 36px are bespoke sizes above `--text-4xl`.
- **Two-tone headings**: H2 sets the first clause in `#171717` and the continuation in `--muted-foreground`
  grey (e.g. "Poke fits into your life**(1)**, / *not the other way around*"), `scroll1.png`. Cheap, elegant hierarchy.
- **Editorial footnote markers**: superscript `(1)...(5)` number each feature section and reappear as marginalia
  next to the body copy (`scroll1.png`, `scroll2.png`, `scroll3.png`). This is the single most "human/considered" typographic device on the page.

### 2.3 Radius — the friendliness dial (from `hist.borderRadii`, `rootVars` radius tokens)

Radius tokens: `--radius:.625rem` (10px); `--radius-md:8px` (`calc(.625rem - 2px)`); `--radius-lg:10px`;
`--radius-xl:14px` (`calc(.625rem + 4px)`); `--radius-2xl:16px`; `--radius-3xl:24px`.

**Rendered radii (what actually ships):**
| Radius | Count | Applied to |
|---|---|---|
| 0px | 1521 | Layout wrappers / text runs (not visual surfaces) |
| `3.35e7px` (= 9999px pill) | 65 | Buttons, badges/pills ("New" chip), status dot, avatars |
| **20px** | 40 | **Primary card radius** (feature mockup cards, pricing cards) |
| 16px | 10 | Secondary cards / media |
| 24px & 24.025px | 9 + 6 | Large media panels, phone-frame insets |
| **22px** | 3 | **The featured (gradient-border) pricing card** — `rounded-[22px]` |
| 12px | 16 | Chips, small tiles, inner elements |
| 14px / 10px / 6px | 3 / 5 / 12 | Nested controls |

**Takeaway:** Poke overrides shadcn's default 10px radius **upward** — surfaces sit at **20-24px**, controls are
**full pills**. That single choice (large, consistent, soft corners) does most of the "friendly" work. There is
almost nothing between 0 and 20px on actual cards; the jump is deliberate.

### 2.4 Shadow / border / depth (from `hist.boxShadows`, `hist.borderColors`, `hist.filters`, `backdropFilters`)

Depth is built from **many layers at very low alpha**, never a single dark drop.

- **Ambient card shadow** (x40, the signature):
  `0 1px 2px rgba(0,0,0,.035), 0 3px 8px rgba(0,0,0,.035), 0 8px 28px rgba(0,0,0,.043)` — three stacked
  layers, all a ~ 0.035-0.043, blur up to 28px. Barely-there lift.
- **Dark button** (x9):
  `0 .5px 1px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.08), inset 0 0 0 1.25px rgb(53,53,53), inset 0 0 12px rgba(255,255,255,.1)` — outer soft shadow **+ a 1.25px inset ring + an inner white glow**. That inset ring + inner highlight is what makes the charcoal pill look injection-molded.
- **Light button** ("Explore", `scroll5.png`):
  `inset 0 1px 0 rgba(255,255,255,.16), 0 1px 2px rgba(23,23,23,.24)` — top inner highlight + tight drop = a soft physical key.
- **Ocean glow** (featured card): `0 0 36px 2px rgba(36,131,226,.06), 0 8px 50px 6px rgba(36,131,226,.035)` — an almost-invisible blue haze; you feel it before you see it.
- **Icon soft shadow** (x48, `hist.filters`): `drop-shadow(rgba(0,0,0,.08) 0 3px 6px)` on the floating app icons.
- **Borders:** one warm hairline everywhere — `rgb(238,237,235)` (`#EEEDEB`) x1578. Borders do structure; shadows do lift; they rarely stack heavily.
- **Backdrop:** exactly one `backdrop-filter: blur(24px)` — the sticky top nav (frosted cream bar).
- **Texture:** `assets/noise.webp` painted as a repeating background grain, `textured-rock-background.webp`,
  and image filters like `blur(3px) brightness(1.03) saturate(1.02)` + `contrast(1.05) brightness(0.95)` on the
  coastal photos — a **film-grain / paper-tactility layer** that keeps flat cream from feeling sterile.

### 2.5 Gradient usage — the `gradient-border` effect (from `raw/static.json` keyframes/atProperties, `raw/scroll-reveals.json`)

Registered animatable angle:
```css
@property --gradient-border-rotation { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes gradient-border { 100% { --gradient-border-rotation: 360deg; } }
```
Applied (featured "Ultra" pricing card, exact classes from `scroll-reveals.json`):
```
rounded-[22px] border bg-white p-6 min-[712px]:p-7
gradient-border before:[inset:-1px]!
gradient-border-from-ocean/55 gradient-border-via-white/85 gradient-border-to-ocean/55
[--gradient-border-duration:6s] border-ocean/40
shadow-[0_0_36px_2px_rgba(36,131,226,0.06),0_8px_50px_6px_rgba(36,131,226,0.035)]
animate-gradient-border
```
**Mechanics:** a `::before` pseudo-element, `inset:-1px` (1px larger than the card, sitting as the border ring),
filled with a conic gradient whose angle is the animated `--gradient-border-rotation` and whose stops are
`ocean/55 -> white/85 -> ocean/55`. Because the custom property is *registered* via `@property` with an `<angle>`
syntax, CSS can smoothly interpolate it; `@keyframes gradient-border` drives it 0->360deg over **6s linear infinite**.
Result: a light sweeping around the card edge — a "this one is special" tell that costs ~zero attention. Only
**one** card on the whole page gets it.

---

## 3. Motion system

Everything measured from `raw/animation-timeline.json` (getAnimations() at t = 0,120,260,420,650,950,1400,2000,2900,4200,5600ms)
and `raw/scroll-reveals.json` (6 scroll positions).

### 3.1 Named CSS @keyframes (verbatim, `raw/static.json` -> `keyframes`)

```css
@keyframes gradient-border            { 100% { --gradient-border-rotation: 360deg; } }
@keyframes integration-carousel-scroll-a { 0% { transform: translate3d(-50%,0,0); } 100% { transform: translate3d(0,0,0); } }
@keyframes integration-carousel-scroll-b { 0% { transform: translate3d(0,0,0); }   100% { transform: translate3d(-50%,0,0); } }
@keyframes tweets-marquee-scroll      { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-50%,0,0); } }
@keyframes build-cursor-blink         { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }   /* easing steps(2) */
@keyframes spin                       { 100% { transform: rotate(360deg); } }
@keyframes pulse                      { 50% { opacity:.5 } }
@keyframes skeleton                   { 100% { background-position:-200% 0; } }
```

### 3.2 Marquee / carousel mechanics (durations, direction, seamless loop)

| Track | Duration | Easing | Direction | Where |
|---|---|---|---|---|
| `integration-carousel-scroll-a` | **115,000ms (115s)** | linear | -50% -> 0 (rightward) | Integration logo carousel, row A |
| `integration-carousel-scroll-b` | 115,000ms (115s) | linear | 0 -> -50% (leftward) | Integration carousel, row B (counter-scrolls) |
| `tweets-marquee-scroll` | **400,000ms (400s)** | linear | 0 -> -50% (leftward) | Community tweet cards |

- **Seamless-loop technique:** the moving track is `flex w-max` containing the item set **duplicated twice**.
  Animating exactly **50%** of the track width (`translate3d(-50%,0,0)`) advances by one full copy, so the loop
  point is pixel-identical -> no visible seam. All three use `translate3d(...)` (GPU/compositor layer).
- **Two rows counter-scroll** (a vs b) for a gentle parallax weave.
- **Speeds are deliberately glacial**: 115s and *400s* per loop -> the motion is ambient wallpaper, not a
  demand for attention. `easing: linear` (constant velocity is correct for infinite loops).
- **Play-gated by viewport:** in `raw/scroll-reveals.json` the marquees are `playState:"paused"` when off-screen
  and flip to `"running"` only when their section is in view (carousel running at y~1217; tweets running at
  y~4867). Implemented by toggling `animation-play-state` on intersection — saves battery and keeps the loop
  phase-stable. Reproduce this.

### 3.3 Entrance / stagger (the hero headline reveal)

At **t=120ms** the timeline shows **196 concurrent animations** (`animation-timeline.json` frame[1]); at every
other timestamp only the 3 CSS loops run. So the entrance is a single tight burst, ~0-800ms, then stillness.

- **193 of the 196 are WAAPI `Animation` objects** (Motion-driven, not CSS) targeting `<span>` letter/word runs of
  the hero H1 (`target.cls` = `inline-block leading-[1.05] ... whitespace-pre ...`).
- They come in **pairs per span**: one animates `opacity: 0 -> 1`, its twin animates `filter: blur(4px) -> blur(0px)`.
- **Duration 350ms**, **easing `cubic-bezier(0.215, 0.61, 0.355, 1)`** (easeOutCubic) for both.
- **Stagger via `delay`**, stepping in **~23ms increments** (measured delays: 0, 23, 46, 69, 92, 115, 138, ...
  through ~690ms+ across ~8 spans per step). So each glyph/word fades-and-de-blurs in sequence, left->right.

**Net effect:** the headline doesn't slide or bounce — it *resolves into focus* (blur->sharp + fade), letter by
letter, in under a second. Warm and confident, zero kinetic aggression.

### 3.4 GSAP vs Motion — inferred split

Both libraries are loaded (`gsapVersions`, `MotionIsMounted`). Division of labor:
- **Motion (motion.dev)** drives **discrete, component-level reveals & micro-interactions** — confirmed by the 193
  WAAPI opacity/blur entrance animations and Motion's React-first API. Likely also the in-view fade-ups of feature
  blocks and hover springs. **(entrance measured; the rest inferred.)**
- **GSAP** drives **scroll-scrubbed / pinned sequences** — inferred from `--hero-locked-vh: 900px` (a pinned hero of
  fixed scroll length) and the scrubbed Apple-Messages device demo (the phone/laptop mockup that plays through its
  conversation as you scroll, `t2900.png`->`t5600.png`), plus the floating app-icon parallax scatter in "Poke fits
  into your life" (`scroll1.png`). ScrollTrigger `pin` + `scrub` is the standard tool for exactly these. **(inferred.)**
- **Marquees/carousels/gradient-border are neither** — pure CSS `@keyframes` (see 3.1/3.2).

### 3.5 Scroll-triggered reveals (`raw/scroll-reveals.json`)

Across 6 scroll depths the only *animations that exist* are the 3 CSS loops + `build-cursor-blink` (a typing
caret in the "Extends for more advanced use cases" mockup, `blur`-free `steps(2)` opacity blink, 1s). There are no
heavy scroll-parallax animation objects registered — reveals are done as **one-shot in-view fades** (Motion,
short-lived, so they don't appear in a steady-state snapshot) rather than persistent scroll-linked timelines,
except the GSAP-pinned hero. This is why the page feels *still* once settled.

### 3.6 Transitions & hover micro-motions (`hist.transitions`)

| Transition | Count | Read as |
|---|---|---|
| `scale, box-shadow, border-color 0.15s cubic-bezier(0,0,.2,1)` | 40 | **Card/button hover** — lifts scale + shadow + border together, ease-out 150ms |
| `all 0.075s cubic-bezier(0.4,0,.2,1)` | 40 | **Press/active** — 75ms snap feedback |
| `color,background-color,border-color,... 0.15s ease-out` | 12 | Link/hover color |
| `transform, filter 0.15s ease-out` | 11 | Icon/media hover |
| `transform,translate,scale,rotate 0.2s cubic-bezier(0.215,0.61,0.355,1)` | 4 | easeOutCubic 200ms moves |
| `opacity 0.36s cubic-bezier(0.22,1,0.36,1)` / `opacity 1s ease-out` | 1 / 2 | Slow crossfades (media, hero) |

**Easing vocabulary (whole site):** `ease-out` `cubic-bezier(0,0,.2,1)` for entrances/hover; `cubic-bezier(0.4,0,.2,1)`
(ease-in-out) for fast presses; **`cubic-bezier(0.215,0.61,0.355,1)` (easeOutCubic)** for the hero stagger and
transform moves; `linear` for infinite loops. Durations cluster at **75ms (press) / 150ms (hover) / 200ms (move) /
350ms (entrance) / 6s / 115s / 400s (ambient loops)**. No spring overshoot, no bounce anywhere.

---

## 4. Human / warm design language — decoded to measurable values

Each "warm" impression maps to a concrete, copyable number:

| Perceived quality | Concrete choice | Measured value |
|---|---|---|
| **Warm, not clinical** | Bone/cream surfaces instead of white | `--background:#fffdfa`, `theme-color #FDFBF7`, `--muted:#f5f3f0`, `--border:#eeedeb` — every neutral carries a small warm (yellow) bias |
| **Friendly, not corporate** | Oversized, consistent rounding | Cards **20-24px** (`hist.borderRadii`), controls **full pill** (9999px x65) |
| **Considered / editorial / human** | High-contrast serif display + rounded sans body | Exposure 600 for all headings; OpenRunde 400-600 for all else; footnote `(1)...(5)` marginalia |
| **Tasteful, typeset** | Tight, size-scaled negative tracking | Hero -2.08px/-0.04em @52px, lh 1.0; body standing -0.4px/-0.025em |
| **Calm / effortless** | Ambient, ultra-slow motion; blur-resolve entrance | Loops 115s & 400s; entrance 350ms easeOutCubic, +23ms stagger, blur 4->0 |
| **Soft depth, never heavy** | Multi-layer shadows at a~0.035 | `0 8px 28px rgba(0,0,0,.043)` card; no shadow darker than a 0.24 |
| **Tactile, not flat** | Paper grain + film-grain photo treatment | `noise.webp` overlay; `blur(3px) brightness saturate` image filters |
| **One personality color, rationed** | Single ocean-blue accent, used once | `#2483E2` only on the gradient-border card + "Learn more ->" |
| **Restraint** | One frosted surface, one accent, light-mode only | `backdrop-filter:blur(24px)` x1; `darkVars:null` |
| **Place & people** | Copy voice + human signatures | "keeps things as real as a friend"; "Designed in Palo Alto, California"; palm-tree logo; "All systems operational" |

**Copy voice** (WebFetch of poke.com): short, second-person, plain, warm — "Poke fits into your life, not the
other way around", "just send a text or voice message", "keeps things as real as a friend". Verbs over adjectives;
no jargon; every feature framed as *what it does for you*, not what it is. Feature headings are declarative
sentences, not nouns.

---

## 5. Signature moments (with why they work)

1. **Blur-resolve headline stagger.** Hero H1 fades + de-blurs (blur 4px->0, opacity 0->1), 350ms easeOutCubic,
   23ms per span, left->right. *Why:* "coming into focus" is a gentle, human metaphor for arrival; no slide/bounce
   means it reads as calm confidence, and it's over in <1s so it never delays reading. (`animation-timeline.json` frame[1])

2. **The single rotating gradient border.** Exactly one card (Ultra plan) wears a 6s conic-gradient ocean/white/ocean
   ring + a near-invisible blue glow. *Why:* one animated accent on an otherwise still, monochrome page is
   irresistible — attention is directed by scarcity, not by shouting. (`scroll4.png`, `scroll-reveals.json`)

3. **Editorial footnote system.** Superscript `(1)...(5)` number the feature sections and reappear as margin notes
   beside the copy. *Why:* it signals "written by people who care about craft," turns a feature list into a
   narrative, and adds warmth with zero graphic weight. (`scroll1-3.png`, `headings`)

4. **Injection-molded charcoal pill.** The CTA isn't flat black: charcoal *gradient* (58->31) + outer soft shadow +
   1.25px inset ring + inner white glow. *Why:* the inset ring + inner highlight give a physical, tactile object
   you want to press — premium feel from shadow layering alone, no color. (`hist.boxShadows`, `scroll5.png`)

5. **Film-grain coastal close.** The final "Get started with just a text" sits on a sun-faded, grainy California
   surf photo, with a giant ghosted "Poke" serif watermark + palm logo in the footer. *Why:* it ends on emotion and
   place, not a form — the product is associated with a warm, unhurried life. (`scroll5.png`, `scroll6.png`)

Runner-up: **counter-scrolling 115s integration carousels** and the **400s tweet marquee** — so slow they read as
living texture rather than animation, and they pause when off-screen.

---

## 6. RideRadar reproduction playbook

Goal: borrow poke's **warmth and restraint** without losing RideRadar's identity as a **fast, precise meta-search**.
The tension to manage: poke is a leisurely brochure; RideRadar is a tool people use to *find the exact bike / best
deal quickly*. So adopt poke's **surface warmth, rounding, and motion restraint**, but keep **information density,
scannability, and snappy interaction** where the user is actually working (search, results, filters).

### 6.1 Warm-neutral OKLCH tokens (Tailwind v4 `@theme`)

Poke's warmth = **very-low-chroma neutrals biased to a warm hue (~90deg in OKLCH)** + near-black neutral ink. Port to
OKLCH (values are close conversions of poke's hexes — verify in a converter, then tune):

```css
@theme {
  /* Warm-neutral surfaces (the whole personality) — hue ~85-95deg, chroma ~0.004 */
  --color-background: oklch(0.993 0.004 95);   /* ~ #fffdfa bone            */
  --color-card:       oklch(0.993 0.004 95);
  --color-muted:      oklch(0.966 0.004 92);   /* ~ #f5f3f0 greige          */
  --color-border:     oklch(0.943 0.004 92);   /* ~ #eeedeb warm hairline   */
  --color-foreground: oklch(0.22  0.00  0);    /* ~ #171717 neutral ink     */
  --color-muted-foreground: oklch(0.556 0 0);  /* ~ #737373                 */

  /* Accent — rideradar can pick its own hue; keep chroma modest & use it RARELY */
  --color-accent:     oklch(0.62 0.17 250);    /* ~ #2483E2 ocean (example) */
  --color-success:    oklch(0.62 0.14 150);    /* ~ #3a9750                 */
}
```
Rules: (a) **do not use pure white** anywhere — start at `oklch(~0.99 0.004 92)`; (b) keep neutral **chroma <= 0.006**
so it whispers warmth, never looks yellow; (c) **one** saturated accent, and reserve it for a single hero moment
(see 6.4) plus links/active-deal highlights. If RideRadar wants a dark mode (poke has none), mirror the warm bias:
warm-dark surfaces `oklch(0.20 0.006 90)`, not blue-black.

### 6.2 Radius tokens (the friendliness dial)

shadcn/coss default is 10px. Nudge **up** toward poke but stop short of brochure-soft, because dense data tables
read better with tighter corners:
```css
@theme {
  --radius: 0.875rem;          /* 14px base for inputs/buttons                    */
  --radius-lg: 1.25rem;        /* 20px — cards, result tiles (poke's primary)     */
  --radius-xl: 1.5rem;         /* 24px — hero/media panels                        */
  /* pills: use rounded-full on chips, source-logo badges, filter tags, CTAs      */
}
```
Guidance: **result cards / listing tiles at 16-20px**, **filter chips & source-platform badges as full pills**,
**inputs/buttons at 12-14px**. Consistency matters more than the exact number — pick two radii and hold the line.

### 6.3 Tasteful marquee / vendor-logo strip (high relevance)

RideRadar tags each listing with its **source platform's logo**. Poke's integration carousel is the exact pattern to
borrow for a hero "we search everywhere" moment — a slow, seamless, counter-scrolling strip of vendor marks
(BikeSales, Facebook Marketplace, Gumtree, CycleTrader, AutoTrader, dealer sites, etc.).

Recipe (matches poke's mechanics):
- Track = `flex w-max` with the **logo set duplicated x2**; animate `translate3d(0,0,0) -> translate3d(-50%,0,0)`
  linear infinite for a seamless loop.
- **Speed:** poke uses 115s. For a search tool, go a touch quicker to feel *alive but not distracting* — target
  **40-70s** per loop; still linear, still ambient. Two rows counter-scrolling (a/b) optional.
- **Pause off-screen** (toggle `animation-play-state` on `useInView`) and **`prefers-reduced-motion` -> paused**.
- Logos: greyscale/mono at rest, soft `drop-shadow(rgba(0,0,0,.08) 0 3px 6px)`, optional color on hover.
- **animate-ui / Motion mapping:** use animate-ui's marquee/`InfiniteSlider` particle if present, or a Motion
  `useAnimationFrame`/CSS-keyframe hybrid gated by Motion `useInView`. Keep it CSS-driven for the loop (cheap,
  compositor-only) and use Motion only to start/stop it. Do **not** make this the whole hero — it's a garnish that
  proves breadth; the search box stays the hero.

### 6.4 Gradient-border accent recipe (for ONE element)

Reserve for a single "best deal" / "featured listing" / primary CTA — never repeat it.
```css
@property --gb-rot { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes gb-rotate { to { --gb-rot: 360deg; } }
.deal-highlight {                         /* the card itself */
  position: relative; border-radius: 22px; background: var(--color-card);
  box-shadow: 0 0 36px 2px oklch(0.62 0.17 250 / 0.06),
              0 8px 50px 6px oklch(0.62 0.17 250 / 0.035);
}
.deal-highlight::before {                 /* the animated ring */
  content: ""; position: absolute; inset: -1px; border-radius: inherit; z-index: -1;
  background: conic-gradient(from var(--gb-rot),
              oklch(0.62 0.17 250 / .55), oklch(0.99 0 0 / .85), oklch(0.62 0.17 250 / .55));
  animation: gb-rotate 6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .deal-highlight::before { animation: none } }
```
This is directly copyable to coss/Base UI cards (`Card` root gets the class; the ring is a pseudo-element, no extra
DOM). Use it to say "this is the best price we found" — a natural fit for a deal-finder.

### 6.5 Motion & interaction — mapped to Motion / animate-ui

- **Entrance:** port the blur-resolve stagger for the **landing hero headline only**. Motion: `opacity 0->1` +
  `filter blur(4px)->blur(0)`, `duration: 0.35`, `ease: [0.215,0.61,0.355,1]`, `staggerChildren: 0.023`. In app
  views (search/results) skip entrance choreography — data should appear instantly.
- **Hover/press:** replicate poke's transition set as tokens — hover `scale/box-shadow/border-color 150ms ease-out
  [cubic-bezier(0,0,.2,1)]`, press `all 75ms [cubic-bezier(.4,0,.2,1)]`. animate-ui hover/press primitives or Base
  UI `data-*` + Tailwind `transition`. **No spring overshoot** — it would undercut "fast/precise."
- **Reveals:** one-shot in-view fade-ups (Motion `whileInView`, ~350-500ms ease-out), not persistent scroll-linked
  timelines. Keeps the page still once read.
- **Result streaming:** if results load progressively, a **23-40ms stagger fade-in** of result cards echoes poke's
  entrance and reads as "fast + alive." This is the one place to let poke's stagger into the app itself.

### 6.6 Restraint rules (the discipline that makes it work)

1. **One accent color, rationed.** Neutrals do 95% of the surface; the accent appears on <=1 hero moment + links +
   the active/best-deal signal. (Poke: `#2483E2` used essentially once.)
2. **Two type roles only.** Editorial-ish display for headings, rounded humanist sans for everything else. Don't
   introduce a third face. (For RideRadar keep OpenRunde-class body; a serif display is optional but on-brand-warm —
   test it against "fast tool" credibility. A safer path: keep one rounded-sans, add warmth via color/radius/space.)
3. **Shadows whisper.** Multi-layer, a <= 0.05 for ambient lift; reserve inset-ring + inner-glow for the primary CTA.
4. **Motion is ambient or absent.** Loops >=40s and linear; interactions <=200ms and ease-out; nothing bounces;
   everything respects `prefers-reduced-motion` and pauses off-screen.
5. **Warm, never white.** No `#fff`, no pure-black text — bone surfaces + `oklch(0.22 0 0)` ink.
6. **Generous, consistent rounding & spacing** on marketing surfaces; **tighten** for dense result/data views so
   the tool still feels fast. Let warmth live in the chrome, speed live in the workspace.

---

## 7. Evidence appendix (claim -> source)

**Stack / tech**
- Next.js + Vercel + PostHog + GSAP + Motion: `raw/static.json` -> `tech.interestingGlobals` (`gsapVersions`,
  `MotionIsMounted`, `__PosthogExtensions__`, `__next_f`); `raw/_summary.json` -> `interestingGlobals`, `server:"Vercel"`.
- Tailwind v4: `raw/static.json` -> `atProperties` (`@property --tw-*`), `rootVars` (`--spacing`, `oklab` stops), `markers.tailwind:true`.
- Light-mode only: `raw/static.json` -> `darkVars: null`, `htmlClass:"light ..."`, `colorScheme:"normal"`.
- Fonts: `raw/static.json` -> `fonts`, `loadedFonts` (OpenRunde 400/500/600 loaded, Exposure 400 loaded), `tech.links` preload of `Exposure-205TF-VAR.woff2`, `OpenRunde-Medium/Regular.woff2`.

**Color**
- Warm surfaces/tokens: `raw/static.json` -> `rootVars` (`--background:#fffdfa`, `--muted:#f5f3f0`, `--border:#eeedeb`, `--foreground:#171717`, `--verified:#3a9750`); `tech.metas` `theme-color:#FDFBF7`.
- Rendered histograms: `raw/static.json` -> `hist.colors` (`rgb(26,31,43)` x856), `hist.backgrounds`, `hist.borderColors` (`rgb(238,237,235)` x1578), `hist.gradients`.
- Ocean accent `#2483E2`: `raw/scroll-reveals.json` featured-card `cls` (`gradient-border-*-ocean`, `shadow-[...rgba(36,131,226,...)]`).

**Typography**
- Scale/weights/tracking/line-height: `raw/static.json` -> `headings` (hero 52/600/lh52/-2.08px Exposure; H2/H3 36/600 Exposure; integration H3 18.35/500 OpenRunde), `hist.fontSizes`, `hist.letterSpacing`, `hist.fontFamilies` (OpenRunde x1560, Exposure x132, Times x1).
- Two-tone headings + footnote markers: `shots/scroll1.png`, `shots/scroll2.png`, `shots/scroll3.png`; `headings` text "Poke fits into your life (1)...".

**Radius / shadow / depth / texture**
- Radii: `raw/static.json` -> `hist.borderRadii` (20px x40, pill x65, 22px x3, 24px x9), `rootVars` radius tokens.
- Shadows: `raw/static.json` -> `hist.boxShadows` (card a.035-.043; dark-button inset ring; ocean glow).
- Backdrop/filters/texture: `hist.backdropFilters` (`blur(24px)` x1), `hist.filters` (`drop-shadow ...` x48, `blur(3px) brightness...`), resources `assets/noise.webp`, `textured-rock-background.webp` in `perf.resources`.

**Motion**
- Named keyframes verbatim + `@property --gradient-border-rotation`: `raw/static.json` -> `keyframes`, `atProperties`.
- Marquee/carousel durations/direction/paused-when-offscreen: `raw/scroll-reveals.json` (carousel 115000ms, tweets 400000ms, gradient-border 6000ms; `playState` running/paused per step) and `raw/animation-timeline.json` frames 0/2/10.
- Entrance stagger (196 anims @120ms; 193 WAAPI opacity+blur pairs; 350ms; `cubic-bezier(0.215,0.61,0.355,1)`; delays 0/23/46...): `raw/animation-timeline.json` -> `timeline[1]`.
- Transition/hover vocabulary: `raw/static.json` -> `hist.transitions` (`scale,box-shadow,border-color .15s` x40; `all .075s` x40).
- `--hero-locked-vh:900px` (pinned hero -> GSAP inference): `raw/static.json` -> `rootVars`.

**Copy / narrative / sections**
- Verbatim copy: WebFetch https://poke.com/ (hero, features 1-5, pricing $0/$19/$199, "Community", "Get started with just a text", "Designed in Palo Alto, California").
- Section visuals: `shots/t0650ms.png`, `shots/t5600ms.png` (hero + entrance), `shots/scroll1.png` (integration scatter + footnotes), `shots/scroll2.png` (feature 3 + phone mockup), `shots/scroll3.png` (feature 5 + paper texture), `shots/scroll4.png` (pricing 3-tier + gradient-border Ultra card + Community marquee), `shots/scroll5.png`/`scroll6.png` (closing CTA, dark+light buttons, film-grain coast, footer + ghost watermark).

**Page order (as captured):** Hero ("Meet Poke, now on Apple Messages") -> (1) "Poke fits into your life, not the
other way around" (integration scatter) -> (2) "Adapts to your needs with Poke Recipes" -> (3) "Handles tasks
according to your schedule" -> (4) "Proactively keeps you in the loop" -> (5) "Extends for more advanced use cases" ->
"Choose a plan to get started" (Free $0 / Pro $19 / Ultra $199, Ultra = gradient-border) -> "Community" (tweet
marquee) -> "Get started with just a text" (dark "Get Started" + light "Explore") -> footer.
