"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { Signature } from "@/components/ui/signature";
import { EASE_OUT } from "@/lib/motion";
import { PHASE_KEY, type IntroPhase } from "./intro-gate";
import { INTRO_FRAMES, introFrameSrc } from "./frames";

/**
 * The entrance sequence — the one piece of theatre on the site.
 *
 *   ┌ BEAT 1 · WELCOME ─────┐┌ BEAT 2 · CRASH ─┐┌ BEAT 3 · SETTLE ─┐
 *   black field, white ink   six styles, hard   field lifts, page
 *   "welcome" draws itself   cuts, no fades     arrives beneath
 *   0 ──────────────► 900    900 ─────► 1700    1700 ──────► 2400
 *
 * The design is a setup and a break. Beat 1 spends nearly a full second
 * establishing calm — a slow handwritten word on black, no movement anywhere
 * else — purely so that Beat 2 has something to violate. A snap-cut sequence
 * that opens cold is just fast; one that opens after this is a jolt.
 *
 * Beat 2 cuts on a GRAPHIC CUT: the wordmark's silhouette is pinned across all
 * six frames, so the eye never re-acquires the subject and reads the change as
 * the *material* transforming rather than six different pictures. Holds
 * accelerate (140→100ms) then the last frame lands long (230ms).
 *
 * Beat 3 overlaps the page: the black field begins lifting while the last
 * frame is still up, and the hero starts resolving underneath it. That overlap
 * is the whole trick — sequenced beats read as two acts, overlapped beats read
 * as one swell. (animate-ui teardown §3.b: blocks rise while the headline is
 * still sharpening.)
 *
 * FLASH-FREE CONTRACT. The overlay is server-rendered with static inline
 * styles, so the browser's first paint is already the black field — never
 * white, before a line of JS runs. It is gated by `<html data-intro>`, written
 * by IntroGate before paint, so SSR and the client's first render agree.
 *
 * IT MUST NEVER STRAND THE PAGE. Three independent releases: the normal path,
 * a 4s failsafe timer, and the effect cleanup. Whatever happens — a thrown
 * error, an image that never decodes, an unmount mid-sequence — the site comes
 * back.
 */

const BEAT_1_MS = 900;
const SETTLE_MS = 700;
const FAILSAFE_MS = 4000;

/**
 * The gate's decision, from the one place React cannot strip. See intro-gate.tsx
 * — the `data-intro` attribute is removed during the hydration commit, so it
 * cannot be read to decide anything.
 */
function readPhase(): IntroPhase | undefined {
  return (window as unknown as Record<string, IntroPhase | undefined>)[PHASE_KEY];
}

/** Sets both the global (source of truth) and the attribute (what CSS selects on). */
function setPhase(phase: IntroPhase) {
  (window as unknown as Record<string, IntroPhase>)[PHASE_KEY] = phase;
  document.documentElement.dataset.intro = phase;
}

/** Idempotent; safe to call from anywhere, any number of times. */
function releasePage() {
  setPhase("ready");
}

/** The gate's decision never changes after the inline script runs. */
const subscribeNever = () => () => {};

export function IntroSequence() {
  // SSR renders the overlay; the client's first render must agree with that
  // or React will complain and, worse, paint white for a frame.
  // The server cannot know whether this visitor has already seen the entrance,
  // so it always emits the overlay. The client must agree during hydration and
  // then diverge — which is exactly what useSyncExternalStore's separate server
  // snapshot is for. Reading the phase in a useState initializer instead would
  // make the two trees disagree, and React leaves a mismatched server subtree
  // stranded in the DOM: six decoded images that never unmount. Measured.
  //
  // The phase is fixed by the time React runs — the gate script is synchronous
  // and nothing else writes it — so there is nothing to subscribe to.
  const claimed = useSyncExternalStore(
    subscribeNever,
    () => readPhase() === "pending",
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);
  const show = claimed && !dismissed;
  const [frame, setFrame] = useState(-1);

  const [scope, animate] = useAnimate();
  const fieldRef = useRef<HTMLDivElement>(null);
  const ranRef = useRef(false);
  // Distinguishes "the entrance finished" from "an effect cleanup released the
  // page". StrictMode's mount → cleanup → mount would otherwise read its own
  // cleanup as a completed run and skip the sequence entirely in development.
  const doneRef = useRef(false);
  const reduced = useReducedMotion();

  // Undo React's hydration patch. The commit above this strips `data-intro`
  // from <html> (see intro-gate.tsx for the measurement); a layout effect runs
  // after the commit and before the browser paints, so restoring it here means
  // the entrance CSS never lapses for even one frame.
  useLayoutEffect(() => {
    const phase = readPhase();
    if (phase) document.documentElement.dataset.intro = phase;
  });

  const finish = useCallback(() => {
    doneRef.current = true;
    releasePage();
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (!show || ranRef.current) return;

    // The sequence genuinely ran to completion — nothing left to do. Tear down
    // on the next tick rather than synchronously: setting state during the
    // effect body would cascade an extra render pass for a component that is
    // about to unmount anyway.
    if (doneRef.current) {
      releasePage();
      const id = window.setTimeout(finish, 0);
      return () => clearTimeout(id);
    }

    // Reclaim the entrance. The cleanup below releases the page as a safety
    // measure, so by this point the phase may read `ready` even though the
    // sequence never played — that is exactly the StrictMode remount case.
    setPhase("pending");
    ranRef.current = true;

    const overlay = scope.current;
    const field = fieldRef.current;
    if (!overlay || !field) {
      finish(); // never hold the page behind a sequence that cannot run
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    // Own the viewport while the overlay is up, and always give it back.
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const restore = () => {
      html.style.overflow = prevOverflow;
    };

    // Failsafe. If anything below throws, hangs, or an asset never decodes,
    // the page still comes back.
    const failsafe = window.setTimeout(() => {
      restore();
      finish();
    }, FAILSAFE_MS);

    const prefersReduced =
      reduced ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      // Show the resolved wordmark, hold it, fade. The content, not a strobe —
      // and never an empty overlay, which would read as a broken page.
      // Scheduled rather than set inline, so both branches drive `frame`
      // through the same timer queue and the cleanup cancels either one.
      after(0, () => {
        if (!cancelled) setFrame(INTRO_FRAMES.length - 1);
      });
      after(400, () => {
        if (cancelled) return;
        releasePage();
        animate(overlay, { opacity: 0 }, { duration: 0.15, ease: "linear" }).then(() => {
          restore();
          finish();
        });
      });
    } else {
      // ── Beat 2 · CRASH — walk the frame table on its own hold schedule. ──
      let elapsed = BEAT_1_MS;
      INTRO_FRAMES.forEach((f, i) => {
        after(elapsed, () => {
          if (!cancelled) setFrame(i);
        });
        elapsed += f.hold;
      });

      // ── Beat 3 · SETTLE ──
      // The clock hands off HERE, while the last frame is still on screen —
      // not when the overlay unmounts. The hero is already resolving as the
      // field lifts, so the page emerges out of the black rather than popping
      // onto a finished layout.
      after(elapsed - 120, () => {
        if (cancelled) return;
        releasePage();
        animate(field, { opacity: 0 }, { duration: SETTLE_MS / 1000, ease: EASE_OUT });
        animate(
          overlay,
          { opacity: 0, scale: 1.04 },
          { duration: SETTLE_MS / 1000, ease: EASE_OUT },
        ).then(() => {
          restore();
          finish();
        });
      });
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(failsafe);
      restore();
      releasePage(); // never leave the page paused behind an unmounted overlay
      // Let a remount replay. Without this, StrictMode's double-invoke
      // (mount → cleanup → mount) cancels the first pass and short-circuits
      // the second, leaving the overlay up forever in development.
      ranRef.current = false;
    };
  }, [show, reduced, animate, scope, finish]);

  if (!show) return null;

  return (
    <div
      ref={scope}
      data-intro-overlay
      aria-hidden
      className="fixed inset-0 z-100 overflow-hidden"
      style={{ transformOrigin: "center" }}
    >
      {/* The field. Static inline styles so the FIRST PAINT is already black —
          this element is why the user never sees a white flash. */}
      <div
        ref={fieldRef}
        className="absolute inset-0 grid place-items-center"
        style={{ backgroundColor: "#0a0a0b" }}
      >
        {/* Beat 1 — drawn only while no frame has taken over. */}
        {frame < 0 && (
          <Signature
            text="welcome"
            color="#f4f5f6"
            fontSize={52}
            duration={0.5}
            stagger={0.055}
            className="w-[min(70vw,32rem)]"
          />
        )}

        {/* Beat 2 — every frame is mounted from the start and toggled by
            opacity. Mounting on demand would decode the image at cut time and
            the snap would arrive late; opacity is free. */}
        {INTRO_FRAMES.map((f, i) => (
          <picture key={f.src}>
            <source srcSet={introFrameSrc(f.src, "avif")} type="image/avif" />
            <img
              src={introFrameSrc(f.src, "webp")}
              alt=""
              decoding="sync"
              fetchPriority={i === 0 ? "high" : "low"}
              className={
                f.fill
                  ? "absolute inset-0 h-full w-full object-cover"
                  : "absolute inset-0 h-full w-full object-contain p-[8vw]"
              }
              style={{
                opacity: frame === i ? 1 : 0,
                // No transition. A snap cut that eases is a dissolve.
                transition: "none",
              }}
            />
          </picture>
        ))}
      </div>
    </div>
  );
}

/**
 * Preload tags for the frame set. Rendered in the document head so the cuts
 * never wait on the network — a snap cut that stalls is not a snap cut.
 */
export function IntroPreload() {
  return (
    <>
      {INTRO_FRAMES.map((f) => (
        <link
          key={f.src}
          rel="preload"
          as="image"
          href={introFrameSrc(f.src, "avif")}
          type="image/avif"
        />
      ))}
    </>
  );
}
