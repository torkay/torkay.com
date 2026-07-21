/**
 * The entrance gate.
 *
 * Decides *before first paint* whether this load gets the entrance sequence,
 * and records that decision on `<html data-intro>`. Everything downstream —
 * the overlay's own SSR output, the page's entrance CSS — reads that attribute
 * rather than deciding for itself, so there is exactly one source of truth and
 * server and client cannot disagree.
 *
 * Why an inline blocking script and not React state:
 *
 *  · A module-level boolean cannot tell a cold load of `/` from a client-side
 *    navigation back home after landing on `/work`. The flag would still be
 *    false and the sequence would replay *over* a navigation, which is the
 *    single worst failure mode this component has.
 *  · Anything that runs after hydration is too late. The overlay must be
 *    painted on the very first frame or the user sees a white flash followed
 *    by a black one — worse than no entrance at all.
 *
 * `sessionStorage` rather than `localStorage`: once per browsing session is the
 * right cadence. A visitor who returns next week should get the entrance again;
 * one who is clicking around today should not.
 *
 * The try/catch is load-bearing. `sessionStorage` throws on access in Safari's
 * private mode and under some embedded webviews. Failing closed — no entrance —
 * is correct: the site must render regardless.
 *
 * WHY THE DECISION IS ALSO PARKED ON `window`, not just the attribute:
 *
 * React OWNS `<html>` — it is rendered by the root layout — and at hydration it
 * reconciles that element's attribute set against its props. `data-intro` is not
 * among them, so React REMOVES it. Measured, not assumed: a MutationObserver on
 * `documentElement` recorded `data-intro="pending"` at 130ms and `null` at 334ms,
 * three times in the hydration commit. `suppressHydrationWarning` does not help;
 * it silences the warning, not the patch.
 *
 * The consequence was total: IntroSequence read the attribute in its useState
 * initializer, saw nothing, rendered null, and the entrance never played at all.
 *
 * A `window` global is the one channel React cannot touch. The attribute stays
 * because CSS needs a selector, but it is now a projection of the global rather
 * than the source of truth — IntroSequence re-asserts it in a layout effect,
 * which runs after the hydration commit and before paint, so the removal is
 * never visible.
 */

/** Read by IntroSequence; see the note above on why this is not just an attribute. */
export const PHASE_KEY = "__torkayIntroPhase";

export type IntroPhase = "pending" | "ready";

const GATE_SCRIPT = `
(function () {
  var phase = 'ready';
  try {
    var seen = sessionStorage.getItem('torkay:intro');
    if (!seen && location.pathname === '/') {
      sessionStorage.setItem('torkay:intro', '1');
      phase = 'pending';
    }
  } catch (e) {}
  window.${PHASE_KEY} = phase;
  document.documentElement.dataset.intro = phase;
})();
`.trim();

export function IntroGate() {
  return <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />;
}
