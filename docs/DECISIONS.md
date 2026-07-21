# Decision log

Newest first. Each entry records what was decided, why, and — where it matters —
what it would cost to reverse.

Entries marked **⚠ unconfirmed** were taken as defaults while the brief's author
was away from the keyboard. They are all reversible; the reversal cost is stated.

---

## ADR-007 · Exposure ships only under a purchased Web licence ⚠ unconfirmed

**Decision.** `Instrument Serif` (OFL) carries the display role. `Exposure` is
named first in the font stack as a swap slot but is not committed.

**Why.** A 205TF *Trial* kit was supplied (`205TF Trial.zip`, order 283525). Its
EULA is explicit on three points that each independently rule it out here:

- the Trial licence "grants the user the right to test and explore the typeface
  for internal, non-commercial purposes only. All other uses, including creating
  or distributing visuals — whether internal, external, or public — are strictly
  prohibited";
- generating webfonts from the OpenType files is separately prohibited
  ("Only 205TF is authorized to produce files in other formats");
- the trial files "cannot, under any circumstances, be redistributed or shared".

Committing the `.ttf` to a public GitHub repository is redistribution; serving it
from `torkay.com` is public distribution *and* webfont use. The site being a
non-commercial personal portfolio does not engage any exception — the Trial
licence has none. The trial is installable on one machine for evaluation, which
is what it is for.

**Reversal.** Buy the 205TF **Web** licence for Exposure. It arrives as a
`.woff2` kit: drop it in `public/fonts/licensed/`, remove that path from
`.gitignore` if the licence permits repository storage (otherwise load it from
205TF's hosted delivery), add one `@font-face`. No other file changes — the swap
slot in `globals.css` already names `Exposure` ahead of the fallback.

---

## ADR-006 · Entrance sequence: six styles, static frames, hard cuts ⚠ unconfirmed

**Decision.** Six generated wordmark frames, snap-cut on a graphic cut, ~2.4s
total. Not an SVG morph; not twelve frames.

**Why.** A morph between six materially different renderings (sketch → clay →
riso → chrome → halftone → letterpress) has no shared path topology, so it
would require hand-authored interpolation per pair — high cost, and morphing
undercuts the brief's own word, *snap*. Twelve frames doubles the payload and
the runtime for a beat that a returning visitor has already seen. Six is enough
to read as a progression through media.

**Reversal.** Frame count is a data change: add entries to the frames array and
generate the assets. The timeline recalculates from the hold table.

---

## ADR-005 · `/p/` becomes Fumadocs inside this Next app ⚠ unconfirmed

**Decision.** Not Docusaurus, not Hugo, not a second Vercel project.

**Why.** The brief asks for `/p/` to inherit the site's look. A separate docs
generator means porting the token layer twice and keeping two copies in sync,
and Hugo forfeits React entirely — none of the animate-ui primitives would work
in `/p/`. Fumadocs is MDX-native, React-native, and is what animate-ui.com
itself runs. One build, one deploy, one design system.

**Reversal.** Moderate. Content is plain MDX, so it ports to Starlight or
Docusaurus; the layout work would be redone.

---

## ADR-004 · eBay surfaces preserved at their exact URLs ⚠ unconfirmed

**Decision.** `/api/oauth/callback`, `/api/app-token`, `/api/ping` and
`/rideradar/*` all keep their v1 paths.

**Why.** The callback is the registered redirect URI on a live eBay Developer
application; the `/rideradar/` pages are what eBay's compliance flow points at.
Deleting or moving them breaks an external integration that has nothing to do
with this refactor.

**Follow-up required.** The v1 callback renders the raw token exchange response
into the HTML body — a refresh token, in the browser, in logs, in scrollback.
The port must exchange and discard, returning only success/failure. This is a
pre-existing defect being carried forward, not one introduced here, and it
should be fixed in phase 8 rather than ported faithfully.

---

## ADR-003 · Sans is Geist, not poke.com's OpenRunde ⚠ unconfirmed

**Decision.** Geist carries the sans role.

**Why.** The brief describes poke.com's blend as "classic editorial serif with
neo-grotesque sans-serif". poke.com's actual sans is OpenRunde — a soft,
rounded geometric, not a neo-grotesque. The brief's stated intent and the
reference's actual face disagree, so this follows the intent: Geist is a genuine
neo-grotesque, is OFL, and is also evidence.dev's primary — which ties the two
references together rather than splitting them.

**Reversal.** Trivial. OpenRunde is OFL and already named first in the stack;
self-host it in `public/fonts/` and declare `@font-face`.

---

## ADR-002 · Single Next.js app, not a monorepo

**Decision.** One package at the repository root.

**Why.** A workspace was considered to separate the site from the docs. With one
deploy target, one language, and one design system, it would double the config
surface and buy nothing. Route groups (`(site)`, `(full)`, `(docs)`) give the
separation that actually matters — different chrome per region — at no cost.

**Reversal.** Cheap now, expensive later. Revisit only if a second deployable
appears.

---

## ADR-001 · One animation runtime

**Decision.** `motion` only. `framer-motion` is not installed.

**Why.** The componentry Signature component depends on `framer-motion`, the
legacy package name for the same library. Installing both ships two copies of
the animation engine and two independent frame loops. The vendored component was
re-pointed at `motion/react` and the dependency removed.

**Enforcement.** `grep -r framer-motion` should return only the comment in
`components/ui/signature.tsx` explaining this.
