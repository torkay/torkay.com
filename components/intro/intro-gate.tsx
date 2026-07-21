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
 */

const GATE_SCRIPT = `
(function () {
  try {
    var seen = sessionStorage.getItem('torkay:intro');
    if (!seen && location.pathname === '/') {
      sessionStorage.setItem('torkay:intro', '1');
      document.documentElement.dataset.intro = 'pending';
      return;
    }
  } catch (e) {}
  document.documentElement.dataset.intro = 'ready';
})();
`.trim();

export function IntroGate() {
  return <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />;
}
