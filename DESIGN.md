---
version: alpha
name: torkay.com
description: >-
  Personal site of Torrin Kay. An instrument-panel design system — evidence.dev's
  structural restraint carrying poke.com's editorial typography — with one
  theatrical entrance and none anywhere else.
colors:
  primary: "#004bbd"
  primary-hover: "#003a94"
  primary-soft: "#eff4fd"
  on-primary: "#ffffff"
  secondary: "#111827"
  tertiary: "#6b7280"
  neutral: "#e5e7eb"
  surface: "#ffffff"
  surface-sunken: "#f9fafb"
  surface-raised: "#ffffff"
  on-surface: "#111827"
  on-surface-muted: "#6b7280"
  on-surface-subtle: "#9ca3af"
  line: "#e5e7eb"
  line-strong: "#d1d5db"
  positive: "#00a824"
  positive-soft: "#ebfaee"
  error: "#dc2626"
  error-soft: "#fef2f2"
  signal: "#fc4c01"
typography:
  display-hero:
    fontFamily: Exposure, Instrument Serif, ui-serif, Georgia, serif
    fontSize: 72px
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Exposure, Instrument Serif, ui-serif, Georgia, serif
    fontSize: 52px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -0.035em
  display-md:
    fontFamily: Exposure, Instrument Serif, ui-serif, Georgia, serif
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.02em
  display-italic:
    fontFamily: Exposure, Instrument Serif, ui-serif, Georgia, serif
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.02em
    fontVariation: italic
  headline-lg:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  headline-md:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.02em
  body-lg:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.015em
  body-md:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.015em
  body-sm:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.01em
  label-lg:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.01em
  label-md:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0em
  label-sm:
    fontFamily: OpenRunde, Geist, ui-sans-serif, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.02em
  mono-md:
    fontFamily: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  mono-sm:
    fontFamily: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  full: 9999px
spacing:
  0: 0px
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  24: 96px
  32: 128px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 10px 20px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 10px 20px
    height: 40px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 10px 20px
    height: 40px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  chip:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px 10px
    height: 24px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 40px
  panel:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.2xl}"
    padding: 32px
  terminal:
    backgroundColor: "#0a0a0b"
    textColor: "#f4f5f6"
    typography: "{typography.mono-md}"
    rounded: "{rounded.lg}"
    padding: 20px
---

# torkay.com — Design System

> This document is the human half of the token layer. The machine half is
> `app/globals.css`. The frontmatter above and the `@theme` block in that file
> describe the same system in two languages; if you change one, change the other.

## Overview

**What this is.** The personal site of a software engineer who builds systems for
other people. It is a portfolio, but the word oversells it — it is closer to an
instrument panel: a small number of surfaces, each doing one job, arranged so you
can read the whole thing at a glance.

**The personality, in one line.** Quiet, dense, and precisely set — with exactly
one moment of theatre at the front door.

**Where it comes from.** Two references, taken apart and used for different things:

| Reference | What we take | What we ignore |
|---|---|---|
| [evidence.dev](https://evidence.dev) | The *structure*: one neutral ramp doing all the work, two saturated hues rationed across the whole page, tight radii, generous whitespace, no decoration that isn't load-bearing. | Its typography — it runs Geist/Inter throughout and reads as a dev tool. |
| [poke.com](https://poke.com) | The *typography*: a high-contrast editorial serif carrying every display line at a single weight, negative tracking that tightens as size grows, and a standing negative track even on body copy. | Its cream palette, its 20–24px pillowy radii, and its warmth. |

The tension between those two is the point. evidence.dev's discipline stops the
serif from becoming a magazine; the serif stops evidence.dev's discipline from
becoming a spreadsheet.

**Emotional tone.** Considered, not precious. The site should feel like it was
*set* — the way a printed page is set — rather than assembled. Nothing bounces
that does not need to. The one exception is the entrance sequence, and it is an
exception on purpose: it earns its theatre by never repeating.

**Audience.** Three readers, in order of how much they matter:

1. Someone deciding whether to hire or work with Torrin. They need to find the
   work, understand it, and leave with a way to make contact — in under a minute.
2. An engineer who followed a link to `/p/`. They want the document, fast, and
   they will judge the site by how little it gets in the way.
3. Someone who typed the domain out of curiosity. They get the entrance, and
   `/terminal`, and everything else is a bonus.

---

## Colors

The palette is deliberately small. On any given viewport you should be able to
count the saturated pixels.

### Roles

| Token | Light | Dark | Role |
|---|---|---|---|
| `surface` / canvas | `#ffffff` | `#0a0a0b` | The page. |
| `surface-sunken` | `#f9fafb` | `#060607` | Recessed bands — section backgrounds, code wells. Sunken is *darker* than the canvas in light mode and *darker still* in dark mode; the ramp never inverts direction. |
| `surface-raised` | `#ffffff` | `#131417` | Cards and popovers. In light mode a raised surface is the same colour as the canvas and is separated by line + shadow alone. In dark mode it lifts, because shadows are nearly invisible on black. |
| `on-surface` (ink) | `#111827` | `#f4f5f6` | Body and headings. Never pure black — `#111827` carries a trace of blue that reads as ink rather than void. |
| `on-surface-muted` | `#6b7280` | `#868d97` | Secondary copy, the greyed continuation of a two-tone heading. |
| `on-surface-subtle` | `#9ca3af` | `#4b5058` | Placeholders, disabled, timestamps. |
| `line` | `#e5e7eb` | `#1e2024` | The hairline. Does nearly all of the structural work. |
| `line-strong` | `#d1d5db` | `#2a2d33` | Emphasis borders and dividers between major regions. |
| `primary` | `#004bbd` | `#5b9bff` | Links, primary action, focus ring. evidence.dev's brand blue, `hsl(216 100% 37%)`. |
| `positive` | `#00a824` | `#3ddc6a` | Status only — "available", "shipped". evidence.dev's green, `hsl(133 100% 33%)`. Never decorative. |
| `error` | `#dc2626` | `#f87171` | Destructive and failure states. |
| `signal` | `#fc4c01` | `#ff6a2b` | **One element on the entire site**: the travelling dot in `BounceSidebar`. It exists so that one warm point of heat is unmistakably a *place marker* and can never be confused with a link, a status, or an action. |

### Rules

- **Two hues, rationed.** Blue and green are the only saturated colours in the
  system, plus `signal` in its single sanctioned location. If a new colour feels
  necessary, the answer is almost always a different neutral step or more space.
- **Dark mode is not an inversion.** The neutral ramp is re-authored, not
  flipped: `#0a0a0b` canvas with `#131417` raised surfaces, and the blue lifts
  to `#5b9bff` because `#004bbd` is unreadable on black. Contrast ratios are
  re-checked per mode, never assumed to carry over.
- **Light is the resting state.** The site defaults to light and follows the
  system preference. `/terminal` is the one route that is dark regardless.
- **Colour is never the only signal.** Status uses a dot *and* a word. Links are
  underlined on hover, not blue-only.

---

## Typography

This is where the site gets its character, and it is copied — method, not
files — from poke.com.

### The three faces

| Role | Shipping face | Licence | Replaces |
|---|---|---|---|
| **Display** | Instrument Serif | OFL | Exposure (205TF) |
| **Sans** | Geist | OFL | OpenRunde (OFL) |
| **Mono** | JetBrains Mono | OFL | — |

**Display** carries every headline and nothing else. One weight (400), always
italic-capable, always tightly tracked. A serif used at a single weight and
tight measure reads as *typeset*; the same serif at 400/600/700 with default
tracking reads as a word processor.

**Sans** does all the reading work: body, labels, navigation, UI. It is a
neo-grotesque — even, unfussy, invisible. Its job is to disappear.

**Mono** appears wherever a machine is talking: `/terminal`, code blocks in
`/p/`, and tabular numerals.

### The method (what actually makes it look like poke.com)

1. **Tracking scales inversely with size.** `-0.04em` at the hero, `-0.035em`
   at 52px, `-0.02em` at 36px, and *positive* `+0.02em` at 12px labels. Large
   type needs the air taken out; small type needs air put back in. Getting this
   backwards is the single most common way a type system looks amateur.
2. **A standing negative track on body copy.** Body sits at `-0.015em`, not `0`.
   Almost no site does this. It is most of why poke.com's paragraphs feel
   deliberate rather than default, and it costs one line in `globals.css`.
3. **Near-1.0 line height on display.** The hero runs `0.95`; 52px runs `1.0`.
   Display type is a shape, not a paragraph — leading should hold the words
   together, not separate them.
4. **Two-tone headings.** Set the first clause in `on-surface` and the
   continuation in `on-surface-muted`. It creates hierarchy inside a single
   sentence with no size change and no extra element.
5. **Editorial footnote markers.** Superscript `(1)…(n)` numbering sections,
   reappearing as marginalia beside the body. It is the most "considered"
   typographic device available and it is nearly free.

### The scale

Thirteen levels, defined in the frontmatter. Reach for an existing level before
inventing one; if you need a size that isn't there, the layout is usually the
thing that's wrong.

`display-hero` · `display-lg` · `display-md` · `display-italic` ·
`headline-lg` · `headline-md` · `body-lg` · `body-md` · `body-sm` ·
`label-lg` · `label-md` · `label-sm` · `mono-md` · `mono-sm`

### Swap slots

`Exposure` and `OpenRunde` are named **first** in their font stacks in
`globals.css`, ahead of the shipping faces. That is deliberate: dropping a
licensed kit into `public/fonts/licensed/` and declaring one `@font-face`
re-faces the entire site with no other edit.

> **On Exposure specifically.** The 205TF *Trial* licence covers evaluation
> only — its EULA states that "all other uses, including creating or
> distributing visuals — whether internal, external, or public — are strictly
> prohibited", separately forbids generating webfonts from the OpenType files,
> and forbids redistribution of the trial files. A trial `.ttf` therefore cannot
> be committed to this repository or served from this domain, regardless of the
> site being non-commercial. Shipping Exposure means buying the 205TF **Web**
> licence, which is delivered as a ready `.woff2` kit — at which point the swap
> slot above does the rest. Until then, Instrument Serif carries the role.

### Third-party faces

`public/fonts/LastoriaBoldRegular.otf` (La storia Bold, Abo Daniel) is loaded at
runtime by `Signature` and traced to SVG paths — it is never rendered as text.
It is the file componentry.dev distributes for that component, per their
documented install step. It is not part of the type scale.

---

## Layout

### The grid

A single centred column, not a twelve-column grid. Portfolios do not have enough
simultaneous content to justify one, and a column keeps the measure honest.

| Token | Value | Use |
|---|---|---|
| `--container-page` | `72rem` (1152px) | Outer bound for any full-width region. |
| `--container-prose` | `68ch` | Every run of body copy. Measured in `ch`, so it tracks the font, not the viewport. |

Gutters: `24px` at mobile, `48px` from `768px`, `64px` from `1280px`. The page
container stops growing at `72rem`; beyond that, margins absorb the extra.

### Spacing

A 4px base, with the scale in the frontmatter. Two rules:

- **Vertical rhythm is coarser than horizontal.** Space between sections comes
  from `{16, 24, 32}` (64/96/128px). Space inside a component comes from
  `{1…6}` (4–24px). There should be an obvious gap in the middle of the scale
  where nothing lives — that gap is what separates "these things are related"
  from "these things are not".
- **Whitespace is the primary hierarchy device.** Before adding a rule, a shade,
  or a border to separate two things, double the space between them. It works
  more often than it doesn't, and it costs no tokens.

### Breakpoints

Tailwind defaults, unmodified: `sm 640` · `md 768` · `lg 1024` · `xl 1280` ·
`2xl 1536`. Design at 390px first — the entrance sequence in particular must be
authored mobile-first, because it is the one thing every visitor sees and the
one thing that breaks most easily under a narrow viewport.

---

## Elevation & Depth

**Borders do structure. Shadows do lift. They rarely stack.**

Depth is built from many layers at very low alpha, never a single dark drop —
poke.com's method, and the reason its cards look photographed rather than
rendered.

| Token | Value | Use |
|---|---|---|
| `--shadow-raise` | `0 1px 2px rgb(0 0 0 / .035)`, `0 3px 8px rgb(0 0 0 / .035)`, `0 8px 28px rgb(0 0 0 / .043)` | Every raised surface. Three stacked layers, none above 4.3% alpha. |
| `--shadow-raise-lg` | `0 2px 4px / .04`, `0 8px 20px / .05`, `0 24px 64px / .06` | Modals and the one hero panel. |
| `--shadow-key` | `inset 0 1px 0 rgb(255 255 255 / .16)`, `0 1px 2px rgb(17 24 39 / .24)` | Buttons. The inset top highlight is what makes a pill look physically keyed rather than drawn. |

There is exactly one `backdrop-filter` on the site: the sticky header. A second
one is a bug, not a feature — they are the most expensive thing a browser does
per frame.

**In dark mode, shadows stop working.** A black shadow on a black canvas is
invisible. Dark mode gets its depth from the `surface-raised` step
(`#0a0a0b` → `#131417`) and from `line`; the shadow tokens remain applied but
carry almost nothing.

Use `@utility raise` rather than composing a bespoke shadow at a call site. One
recipe, every lifted surface.

---

## Shapes

evidence.dev sits tighter than poke.com, and we follow evidence.dev.

| Token | Value | Applied to |
|---|---|---|
| `none` | `0` | Full-bleed sections, the entrance overlay. |
| `sm` | `6px` | Nested controls, chips inside cards. |
| `md` | `8px` | Inputs, ghost buttons, small tiles. |
| `lg` | `12px` | The terminal window, code blocks. |
| `xl` | `16px` | **The primary card radius.** |
| `2xl` | `20px` | Large panels and media. |
| `full` | `9999px` | **Every control.** Buttons, badges, status dots, avatars. |

The shape language is a **barbell**: surfaces are moderately rounded (12–20px),
controls are fully round, and there is nothing in between. That gap is what
makes a button unmistakably a button. Do not introduce a `10px` pill or a `24px`
card to split the difference.

---

## Components

Every component below reads its values from the token layer. None of them
hard-code a colour, radius, shadow, or duration.

### Buttons

Three variants and no more.

- **Primary** — `primary` fill, white text, full pill, `--shadow-key`. One per
  view. If a screen needs two primary buttons, it needs one primary button.
- **Secondary** — `surface` fill, `line` border, ink text, full pill. The default
  for everything that isn't the single most important action.
- **Ghost** — transparent, `on-surface-muted` text, `md` radius. Navigation,
  toolbars, anything in a dense row.

All three transition `background-color`, `border-color` and `color` over
`150ms · cubic-bezier(.4, 0, .2, 1)`. They do not scale, translate, or bounce on
hover.

### Cards

`surface-raised` + `1px line` + `--shadow-raise`, `xl` radius, `24px` padding.
On hover, a card may raise to `--shadow-raise-lg` over `150ms`; it may not lift,
tilt, or grow.

### Inputs

`md` radius, `40px` tall, `1px line` border. Focus replaces the border with a
`2px primary` outline at `2px` offset — the same ring as `:focus-visible`
globally, so keyboard and pointer focus look identical.

### Chips

`surface-sunken` fill, no border, full pill, `label-md`. Metadata only — a chip
is never interactive. If it needs to be clickable it is a ghost button.

### Terminal

Dark regardless of theme (`#0a0a0b` / `#f4f5f6`), `mono-md`, `lg` radius,
`20px` padding, with the three-dot window chrome. It is a deliberate quotation
of the previous site and the only place the mono face appears at length.

### Motion primitives

Animated behaviour comes from `components/animate-ui/primitives/effects/*` —
`Effect`, `Blur`, `Fade`, `Slide`, `Magnetic`, `Tilt`, `Shine`, `AutoHeight` —
and the text primitives `Splitting`, `Typing`, `Shimmering`, `CountingNumber`,
`Highlight`. Components compose these rather than reaching for `motion` directly.

Timing and easing come from `lib/motion.ts`, which is transcribed from the
measured animate-ui and poke.com timelines. Three buckets, and only three:

| Bucket | Duration | Curve |
|---|---|---|
| Micro — hover, colour, border | `150ms` | `cubic-bezier(.4, 0, .2, 1)` |
| Entrance — text | `400ms` | `ease-out`, opacity **and blur**, `50ms` per-word stagger |
| Entrance — blocks | `600ms` | spring, damping ratio ≈ 0.71 (~4% overshoot) |
| Overlay — dialog, popover | `130–300ms` | `cubic-bezier(.16, 1, .3, 1)` |

Two structural rules carried over from the animate-ui teardown:

- **Entrances overlap.** Blocks begin rising while the headline is still
  sharpening. The overlap fuses everything into one swell; sequencing them
  produces a perceptible "and now the cards animate" second act.
- **Blur, not just opacity.** A headline that fades in *appears*. A headline
  that resolves from `blur(10px)` *arrives*. The difference is one property.

---

## Do's and Don'ts

### Do

- **Reach for space before you reach for a border.** Most separation problems
  are spacing problems.
- **Set display type tight.** If a headline looks slightly too tight, it is
  probably right. If it looks comfortable, it is loose.
- **Let the neutral ramp do the work.** Nine greys and a hairline can express
  more hierarchy than a second accent colour ever will.
- **Overlap entrance animations.** One swell, never two acts.
- **Animate opacity, transform and filter.** Nothing else is cheap.
- **Give every animated component a reduced-motion path**, and make that path
  show the *finished* state — never an empty one. A user with vestibular
  sensitivity should get the content, not a blank div.
- **Compose from the effects primitives.** If a component needs bespoke
  `motion` code, that is a signal it should become a primitive.

### Don't

- **Don't add a third saturated hue.** The answer is a neutral step or space.
- **Don't use `signal` orange anywhere except the sidebar dot.** Its entire
  value is that it means exactly one thing.
- **Don't set display type at more than one weight.** The face is 400. That is
  the system.
- **Don't put a radius between `20px` and `full`.** The barbell is deliberate.
- **Don't stack shadows on a bordered surface.** Pick lift or structure.
- **Don't add a second `backdrop-filter`.** There is one, on the header.
- **Don't bounce anything that isn't entering.** Hover states do not spring.
  Springs are for arrival; hovers are for feedback.
- **Don't let the entrance play twice.** It is gated to one cold load per
  session. A sequence that repeats stops being theatre and becomes a toll gate.
- **Don't hard-code a hex, a radius, or a duration in a component.** If the
  token doesn't exist, add it here first.
