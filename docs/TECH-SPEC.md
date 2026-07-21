# torkay.com — Technical Specification

Companion to [`DESIGN.md`](../DESIGN.md). That document says what the site
should look like; this one says how it is built and why.

Status: **v2 in progress.** The v1 site (hand-written HTML + committed Vite
output) is preserved at commit `ce9dfa8`.

---

## 1. Stack

Chosen for two properties, in this order: **performance** (a personal site that
loads slowly is worse than no personal site) and **flexibility** (this is a
greenfield that will be tinkered with for years).

| Layer | Choice | Version | Why this and not the alternative |
|---|---|---|---|
| Framework | **Next.js, App Router** | 16.2.10 | Static-first: every route here is prerenderable, so we get a CDN-served site with React's component model on top. Alternatives: Astro renders less JS but forfeits the React ecosystem the whole component brief depends on; SvelteKit forfeits it entirely. |
| Runtime | React | 19.2.4 | Server Components mean the marketing prose ships zero JS; only the animated islands hydrate. |
| Bundler | Turbopack | bundled | Default in Next 16, ~2.7s cold production build here. |
| Styling | **Tailwind CSS v4** | 4.3.3 | v4's `@theme` makes the token layer a first-class CSS artifact rather than a JS config object — which is what lets `DESIGN.md` and `globals.css` be two views of one system. |
| Animation | **Motion** | 12.42.2 | The engine animate-ui is built on. Hybrid WAAPI/JS: transform and opacity run off the main thread. One runtime only — `framer-motion` (the legacy package) is explicitly not installed. |
| Components | **animate-ui** (registry) | — | Copy-in, not a dependency. Source lands in `components/animate-ui/` and is ours to edit. Satisfies the brief's requirement that page components compose effects primitives. |
| Headless | **Base UI** | 1.0.0-rc.0 | animate-ui's `primitives-base-*` family targets it. Accessibility without visual opinions. |
| Docs | **Fumadocs** | 16.11.5 | *Planned, phase 4.* Lives inside this Next app rather than as a second deploy, so `/p/` inherits the design system and the effects primitives verbatim. |
| Theme | next-themes | 0.4.6 | Class strategy, so `.dark` in `globals.css` is the single switch. |
| Icons | lucide-react | 1.25.0 | animate-ui's `index` style depends on it. |
| Package manager | pnpm | 10.33.3 | |
| Hosting | **Vercel** | — | Already wired: project `torkay.com`, team `torkays-projects`, `syd1` region. |

### Explicitly rejected

- **A monorepo.** Considered for `apps/web` + `apps/docs`. Rejected: one Next
  app serves both, and a workspace would double the config surface for a
  personal site with one deploy target.
- **A CMS.** Content is MDX in the repo. Writing goes through a pull request,
  which is the correct amount of ceremony for a portfolio.
- **A database.** Nothing here has state. The eBay OAuth handler is stateless
  by design (see §6).
- **`framer-motion`.** Pulled in transitively by the componentry Signature
  component and removed; that component now imports from `motion/react`.

---

## 2. File system

Organised by **role**, not by type. `components/ui` vs `components/chrome` vs
`components/sections` tells you what a thing is for; `components/buttons` vs
`components/cards` would only tell you what it looks like.

```
torkay.com/
├── DESIGN.md                    ← design contract (human half of the tokens)
├── README.md
├── components.json              ← shadcn registry config (animate-ui, magicui, componentry)
│
├── app/
│   ├── layout.tsx               ← fonts, theme provider, metadata. Nothing visual.
│   ├── globals.css              ← THE TOKEN LAYER. Machine half of DESIGN.md.
│   ├── (site)/                  ← the portfolio. Shares header/footer.
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← home; owns the entrance sequence
│   │   ├── work/
│   │   ├── about/
│   │   └── contact/
│   ├── (full)/                  ← routes that opt OUT of site chrome
│   │   └── terminal/page.tsx
│   ├── (docs)/p/                ← Fumadocs (phase 4)
│   │   └── [[...slug]]/page.tsx
│   └── api/
│       ├── ping/route.ts
│       ├── app-token/route.ts
│       └── oauth/callback/route.ts
│
├── components/
│   ├── animate-ui/              ← registry sink. Treat as vendored; edit freely,
│   │   └── primitives/            but expect `shadcn add` to overwrite.
│   │       ├── effects/         ← effect, blur, fade, slide, magnetic, tilt, shine, auto-height
│   │       ├── texts/           ← splitting, typing, shimmering, counting-number, highlight
│   │       └── animate/         ← slot, spring
│   ├── ui/                      ← our own reusable primitives
│   │   ├── signature.tsx        ← componentry, adapted
│   │   ├── bounce-sidebar.tsx
│   │   └── folder.tsx
│   ├── intro/                   ← the entrance sequence (§5)
│   ├── chrome/                  ← header, footer, theme provider, nav
│   ├── terminal/                ← the /terminal REPL
│   └── sections/                ← page-level compositions. Not reusable by design.
│
├── hooks/                       ← registry sink + ours
├── lib/
│   ├── utils.ts                 ← cn()
│   ├── motion.ts                ← THE MOTION VOCABULARY. Durations, easings, springs.
│   ├── fonts.ts                 ← next/font declarations
│   └── site.ts                  ← nav, metadata, external profiles
│
├── content/p/                   ← MDX for /p/ (phase 4)
├── public/
│   ├── fonts/                   ← LastoriaBoldRegular.otf (traced by Signature)
│   │   └── licensed/            ← gitignored. Purchased kits only.
│   ├── intro/                   ← generated wordmark frames (§5)
│   └── rideradar/               ← preserved static pages (§6)
└── docs/
    ├── TECH-SPEC.md             ← this file
    ├── DECISIONS.md             ← ADR log
    └── references/              ← the design teardowns the system is derived from
```

### The four rules that keep this scalable

1. **`lib/` holds no JSX.** If it renders, it is a component.
2. **`components/sections/` is a one-way street.** Sections compose `ui/` and
   `animate-ui/`; nothing imports *from* a section. When two sections need the
   same thing, it moves down to `ui/`.
3. **`app/` holds routing and data-fetching, not markup.** A `page.tsx` should
   read as a table of contents.
4. **Tokens flow one way**: `DESIGN.md` → `globals.css` → components. A
   component never defines a colour, radius, shadow or duration.

---

## 3. Route map

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Entrance sequence + hero + selected work. |
| `/work` | Static | Project index. `Folder` components as the grid. |
| `/work/[slug]` | SSG | Case studies from MDX. |
| `/about` | Static | |
| `/contact` | Static | |
| `/terminal` | Static + client island | The v1 REPL, rebuilt. Dark regardless of theme. |
| `/p` | Static | Fumadocs index. |
| `/p/[[...slug]]` | SSG | MDX documents. |
| `/api/ping` | Node function | Health check. Preserved. |
| `/api/app-token` | Node function | eBay app token. Preserved. |
| `/api/oauth/callback` | Node function | **eBay OAuth redirect. Load-bearing — see §6.** |
| `/rideradar/*` | Static passthrough | **eBay compliance pages. Load-bearing — see §6.** |
| `/portfolio` | — | **Removed.** Redirect to `/work`. |

`cleanUrls` was set in the v1 `vercel.json`; App Router gives extensionless
routes natively, so the file is not reintroduced. Redirects live in
`next.config.ts` instead, which keeps them in version control next to the
routes they point at.

---

## 4. Component inventory

### Reusable (`components/ui/`)

| Component | Source | Adaptations |
|---|---|---|
| `Signature` | componentry.dev | Re-pointed to `motion/react`; reduced-motion path; per-letter stagger became a prop (upstream hard-codes 0.2s, which is ~2.9s for a seven-letter word); cancellable font load; `onComplete` so a sequence can chain off it. |
| `BounceSidebar` | supplied | Dot colour defaults to the `signal` token; reduced-motion snaps instead of arcing; `aria-current` / `aria-pressed`; timings from `lib/motion.ts`. |
| `Folder` | supplied | Keyboard operable (`role=button`, Enter/Space, focus opens); reduced-motion; the 18 hand-transcribed card rows are generated from a 14.1184px rhythm; shared `SPRING_SOFT`. |

### From the animate-ui registry

**Effects** — `Effect` `Blur` `Fade` `Slide` `Magnetic` `Tilt` `Shine` `AutoHeight`
**Texts** — `Splitting` `Typing` `Shimmering` `CountingNumber` `Highlight`
**Animate** — `Slot` `Spring`

Page components compose these rather than importing `motion` directly. The
practical test: if a component in `sections/` imports from `motion/react`, it
either belongs in `ui/` or the behaviour belongs in a primitive.

---

## 5. The entrance sequence

The one piece of theatre on the site. Modelled on the animate-ui.com landing
timeline and the rideradar.com.au splash, both measured rather than eyeballed
(`docs/references/`).

### Structure

```
   0ms ─────────────────────────────────────────────────────────────► ~2400ms

   [ BEAT 1 · WELCOME ]        [ BEAT 2 · CRASH ]  [ BEAT 3 · SETTLE ]
   black field, white ink      snap-cut wordmark   land into the page
   Signature draws "welcome"   6 styles, hard cuts  final style → hero
   0 ──────────► 900           900 ──────► 1700     1700 ─────► 2400
```

**Beat 1 · Welcome.** Full-bleed `#0a0a0b`, white `Signature` drawing the word
*welcome* centred. Server-rendered as a static element with inline styles, so
the very first paint is already the black field — the user never sees white.
Slow, quiet, calm. Its entire job is to establish a register it can then break.

**Beat 2 · Crash.** The calm breaks. The word *torkay* snap-cuts through six
art styles on a **graphic cut** — the wordmark's silhouette, baseline, cap
height and optical centre are pinned identically across every frame, so the eye
never has to re-find it. Only the material changes.

| # | Style | Hold |
|---|---|---|
| 1 | Charcoal sketch — raw construction lines, visible under-drawing | 140ms |
| 2 | Clay render — matte 3D, single soft key light, no texture | 120ms |
| 3 | Risograph — two-colour misregistration, paper grain | 110ms |
| 4 | Chrome — liquid metal, environment reflection | 100ms |
| 5 | Halftone pop — heavy CMYK dot screen | 100ms |
| 6 | Letterpress — photoreal, deep impression into cotton stock | 230ms |

Holds shorten (140 → 100ms) then the last frame lands long. Accelerating cuts
build pressure; the long final hold releases it. Uniform holds would read as a
slideshow.

**Beat 3 · Settle.** The final frame cross-dissolves as the black field lifts
and the page arrives beneath it — the hero headline resolving from `blur(10px)`
per word at 50ms intervals while the blocks are already rising. The beats
overlap by design; the entrance and the page are one continuous move, not two.

### Asset pipeline

Frames are generated through the `codex-image` plugin (`codex-image:generate`,
verified available — Codex CLI 0.144.6, logged in) and committed to
`public/intro/`. Per frame: three widths (640/1280/1920), AVIF with WebP
fallback, budget ≤ 40KB each, ≤ 220KB total.

Every frame is `<link rel="preload">`ed in the document head. A snap cut that
has to wait on a network request is not a snap cut.

### Gating and accessibility

- **Plays once per session,** gated on a `sessionStorage` flag written before
  first paint, not a module-level boolean — a module flag cannot distinguish a
  cold load of `/` from a client-side navigation home, and would replay the
  sequence over a navigation.
- **A 4s failsafe** releases the page regardless of animation state. The
  entrance must never be able to strand the site behind it.
- **`prefers-reduced-motion`** collapses the whole thing to frame 6 held for
  400ms, then a 150ms fade. The user gets the wordmark, not a strobe.
- **`aria-hidden`** on the overlay throughout; it is decoration, and the real
  page is in the accessibility tree beneath it the entire time.
- The overlay owns `overflow: hidden` on `<html>` while up, and restores the
  previous value on unmount — including on an unmount mid-sequence.

---

## 6. Preserved surfaces

Two things in the v1 repo are load-bearing for an **external** system and were
kept at their exact URLs.

**`/api/oauth/callback`** is the registered OAuth redirect URI for Torrin's eBay
Developer application (used by RideRadar). It exchanges an authorization code
for tokens against `api.ebay.com`, reading `EBAY_CLIENT_ID`,
`EBAY_CLIENT_SECRET`, `EBAY_REDIRECT_URI` and `EBAY_ENV` from the environment.
Changing this path requires re-registering with eBay.

> **Carried-over issue, not introduced here:** the v1 handler renders the raw
> token response into the HTML body. That puts a refresh token in the browser,
> in logs, and in scrollback. The port should exchange and discard, returning
> only a success/failure state. Tracked in `DECISIONS.md`.

**`/rideradar/*`** — `privacy`, `about`, `ebay/accepted`, `ebay/declined` — are
the pages eBay's marketplace-account-deletion compliance flow points at. They
now live in `public/rideradar/` and resolve at the same URLs.

`/portfolio` is gone. It was a Three.js scene with ~30MB of committed `.gltf`
assets, and it 301s to `/work`.

---

## 7. Performance budget

Enforced per route, not site-wide.

| Metric | Budget | Notes |
|---|---|---|
| LCP | < 1.2s | The entrance covers the cold-load gap; it must not *become* the gap. |
| CLS | 0 | `next/font` supplies fallback metrics; every image is dimensioned. |
| INP | < 100ms | |
| JS, `/p/*` | < 40KB gzip | Docs pages are prose. They hydrate almost nothing. |
| JS, `/` | < 140KB gzip | Includes Motion and the entrance. |
| Intro assets | < 220KB | Preloaded; counted separately from the JS budget. |

Supporting rules: Server Components by default (`"use client"` only on an island
that genuinely needs state or an effect); animate only `opacity`, `transform`
and `filter`; one `backdrop-filter` on the whole site; anything that loops
pauses when off-screen.

---

## 8. Delivery phases

| Phase | Scope | State |
|---|---|---|
| 0 | Clone, audit, purge, branch `refactor/v2` | **done** |
| 1 | Scaffold, token layer, motion vocabulary, fonts | **done** |
| 2 | Registry components + the three reusables | **done** |
| 3 | Chrome — header, footer, nav, theme toggle | next |
| 4 | Entrance sequence + generated frames | |
| 5 | Home, `/work`, `/about`, `/contact` | |
| 6 | `/terminal` rebuild | |
| 7 | Fumadocs at `/p/`, migrate the three v1 documents | |
| 8 | Port API routes, verify eBay flow end to end | |
| 9 | Budget audit, a11y pass, Lighthouse, ship to Vercel | |

Each phase ends green on `pnpm verify` (typecheck + lint + build).
