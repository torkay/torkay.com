"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False during server render and the hydrating pass, true thereafter.
 *
 * For UI that cannot be rendered correctly on the server — anything that
 * depends on the resolved theme, `matchMedia`, or storage. The usual
 * `useState(false)` + `useEffect(() => setMounted(true))` does the same job,
 * but schedules a synchronous state update inside an effect, which React's
 * compiler lint correctly flags as a cascading render.
 *
 * `useSyncExternalStore` expresses the same idea without any state at all:
 * the server snapshot is `false`, the client snapshot is `true`, and nothing
 * ever changes so it never needs to subscribe.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
