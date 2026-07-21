# References

Forensic teardowns of the sites this design system is derived from. Every
duration, easing, spring constant and stagger delta in `lib/motion.ts` traces to
a measured value in one of these documents rather than to taste.

| File | Subject | What we took |
|---|---|---|
| `animate-ui.md` | animate-ui.com landing | The motion system — splash structure, the ~0.71-damping "arrive" spring, the 50ms per-word blur stagger, the overlapping-timeline rule. §3 is the load-bearing part. |
| `poke.md` | poke.com | The typography method (§2.2) and the depth recipe (§2.4) — layered low-alpha shadows, the warm hairline, the single `backdrop-filter`. |
| `motion-kit.md` | synthesis | Build-ready recipes derived from both. |

**Provenance.** These were captured for a different project of Torrin's
(RideRadar) via instrumented page loads — `getAnimations()` sampled at fixed
timestamps, computed-style histograms, and scroll-position snapshots. Sections
titled "RideRadar reproduction playbook" are that project's application of the
findings and are not this site's design direction; `DESIGN.md` is.

They are kept verbatim rather than summarised because the measurements are the
value. A summary would leave you re-guessing the numbers the next time a
component needs a duration.
