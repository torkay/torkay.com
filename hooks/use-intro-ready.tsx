"use client";

import { useEffect, useState } from "react";

/**
 * True once the entrance sequence has released the page.
 *
 * Page-level entrance animations key off this so they *begin* as the black
 * field lifts rather than having quietly finished behind it. Overlapping the
 * two is the difference between one continuous swell and two separate acts.
 *
 * Returning visitors — and anyone landing on a route other than `/` — get
 * `true` on the first render, because IntroGate has already stamped `ready`
 * before the body was parsed. There is no delay to pay for a beat they aren't
 * being shown.
 *
 * Watches the attribute rather than accepting a callback from IntroSequence:
 * the hero and the overlay are siblings with no shared ancestor that could
 * hold the state, and `<html data-intro>` is already the single source of
 * truth for the gate. One observer, no prop drilling, no context.
 */
export function useIntroReady() {
  const [ready, setReady] = useState(
    () =>
      typeof document === "undefined" ||
      document.documentElement.dataset.intro !== "pending",
  );

  useEffect(() => {
    if (ready) return;

    const html = document.documentElement;
    const check = () => {
      if (html.dataset.intro === "ready") {
        setReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const observer = new MutationObserver(check);
    observer.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    return () => observer.disconnect();
  }, [ready]);

  return ready;
}
