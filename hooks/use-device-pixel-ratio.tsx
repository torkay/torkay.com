"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The current device pixel ratio, tracked live.
 *
 * Used to quantise small elements onto the physical pixel grid — a 6px dot at
 * a fractional offset renders visibly soft on a 1.5x or 2.25x display.
 *
 * Subscribing rather than reading once in an effect is not pedantry: dragging
 * a window from a Retina display to an external monitor changes the ratio
 * mid-session, and a value captured on mount would leave everything quantised
 * to the wrong grid until the next re-render. `matchMedia` on a `resolution`
 * query is the only event browsers fire for this.
 *
 * Returns 1 on the server, which is the safe assumption — it means the first
 * paint quantises to whole pixels and is corrected on hydration.
 */
export function useDevicePixelRatio(): number {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.devicePixelRatio || 1,
    () => 1,
  );
}

/** Snap a CSS pixel value onto the physical pixel grid. */
export const snapToPixel = (value: number, dpr: number) => Math.round(value * dpr) / dpr;
