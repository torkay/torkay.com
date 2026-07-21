# torkay.com

Personal site of [Torrin Kay](https://torkay.com). Next.js 16, Tailwind 4,
Motion, deployed on Vercel.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # typecheck + lint + build — must be green before pushing
```

## Where things are

| Path | What |
|---|---|
| [`DESIGN.md`](DESIGN.md) | The design contract. Colour, type, spacing, depth, motion — and the rules for each. Read before touching anything visual. |
| [`app/globals.css`](app/globals.css) | The token layer. The machine half of `DESIGN.md`; change one, change the other. |
| [`lib/motion.ts`](lib/motion.ts) | Every duration, easing and spring in the site. Components import from here rather than inlining numbers. |
| [`docs/TECH-SPEC.md`](docs/TECH-SPEC.md) | Stack, architecture, route map, the entrance sequence, performance budget, delivery phases. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Why the stack is what it is. Entries marked ⚠ are unconfirmed defaults. |
| [`docs/references/`](docs/references/) | The measured teardowns the motion system is derived from. |

## House rules

1. No component hard-codes a colour, radius, shadow or duration. If the token
   doesn't exist, add it to `DESIGN.md` first.
2. One animation runtime — `motion`, never `framer-motion`.
3. Animated behaviour composes `components/animate-ui/primitives/effects/*`. A
   section importing `motion/react` directly is a smell.
4. Every animated component has a reduced-motion path, and that path shows the
   *finished* state.
5. Server Components by default. `"use client"` only where state or an effect
   genuinely requires it.

## Preserved surfaces

`/api/oauth/callback`, `/api/app-token` and `/rideradar/*` are load-bearing for
a live eBay Developer application and must keep their exact URLs. See
`docs/TECH-SPEC.md` §6 before touching them.

The previous version of this site is preserved at commit `ce9dfa8`.
