"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
// opentype.js v2 ships ESM with named exports only — there is no default.
import { load as loadFont } from "opentype.js";
import { cn } from "@/lib/utils";

/**
 * Signature — handwriting that draws itself on.
 *
 * Vendored from componentry.dev (`@componentry/signature`) and adapted:
 *   · imports from `motion/react` rather than the legacy `framer-motion`
 *     package, so the app ships one animation runtime, not two
 *   · honours `prefers-reduced-motion` (the original always animates)
 *   · per-letter stagger is a prop — the upstream hard-codes 0.2s, which for
 *     a seven-letter word means a ~2.9s beat, far too long for our intro
 *   · font path is a prop defaulting into `/fonts/`, and the load is
 *     cancellable so a fast unmount can't setState on a dead component
 *   · colour comes from the token layer instead of a shadcn `foreground` class
 *
 * How it works: opentype.js converts each glyph to an SVG path at load, then
 * two copies of every path are drawn — a stroked outline that animates its
 * `pathLength` 0→1, and a filled copy revealed through a mask driven by the
 * same stroke. That is what makes it read as ink being laid down rather than
 * an outline being traced.
 *
 * The font (La storia Bold, Abo Daniel) is the file componentry.dev ships for
 * this component; see DESIGN.md § Typography → Third-party faces.
 */

export interface SignatureProps {
  /** Word to render. Glyph coverage is whatever the loaded font has. */
  text?: string;
  /** Stroke/fill colour. Defaults to the current ink token. */
  color?: string;
  /** Cap height in px. Drives every other measurement. */
  fontSize?: number;
  /** Seconds for a single letter to draw. */
  duration?: number;
  /** Seconds before the first letter starts. */
  delay?: number;
  /** Seconds between successive letters starting. */
  stagger?: number;
  className?: string;
  /** Wait until scrolled into view before drawing. */
  inView?: boolean;
  /** With `inView`, only ever draw once. */
  once?: boolean;
  /** Override the .otf to trace. */
  fontUrl?: string;
  /** Fired when the last letter finishes — lets a sequence chain off it. */
  onComplete?: () => void;
}

const DEFAULT_FONT = "/fonts/LastoriaBoldRegular.otf";

export function Signature({
  text = "Signature",
  color = "currentColor",
  fontSize = 32,
  duration = 1.5,
  delay = 0,
  stagger = 0.2,
  className,
  inView = false,
  once = true,
  fontUrl = DEFAULT_FONT,
  onComplete,
}: SignatureProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [width, setWidth] = useState<number>(text.length * fontSize * 0.6);
  const reduced = useReducedMotion();

  const height = fontSize * 3;
  const horizontalPadding = fontSize * 0.1;
  const baseline = fontSize * 1.5;
  const maskId = `signature-${useId().replace(/:/g, "")}`;

  // onComplete is read from a ref so a caller passing an inline arrow doesn't
  // retrigger the whole draw on every parent render. Synced in an effect
  // rather than assigned during render — writing a ref while rendering is a
  // side effect, and breaks under concurrent rendering where a render can be
  // thrown away.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    loadFont(fontUrl)
      .then((font) => {
        if (cancelled) return;

        let x = horizontalPadding;
        const next: string[] = [];

        for (const char of text) {
          const glyph = font.charToGlyph(char);
          next.push(glyph.getPath(x, baseline, fontSize).toPathData(3));
          x += (glyph.advanceWidth ?? font.unitsPerEm) * (fontSize / font.unitsPerEm);
        }

        setPaths(next);
        setWidth(x + horizontalPadding);
      })
      .catch((error) => {
        if (cancelled) return;
        // Falling back to nothing is correct: an un-drawn signature is a gap,
        // but a mis-measured one is a broken layout.
        console.error(`Signature: could not load ${fontUrl}`, error);
        setPaths([]);
      });

    return () => {
      cancelled = true;
    };
  }, [text, fontSize, baseline, horizontalPadding, fontUrl]);

  // Reduced motion: the word is still the point, so show it — just fully
  // formed, with no drawing.
  const effectiveDuration = reduced ? 0 : duration;
  const effectiveStagger = reduced ? 0 : stagger;
  const lastIndex = Math.max(paths.length - 1, 0);

  const variants = {
    hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    visible: { pathLength: 1, opacity: 1 },
  };

  const transitionFor = (i: number) => ({
    pathLength: {
      delay: delay + i * effectiveStagger,
      duration: effectiveDuration,
      ease: "easeInOut" as const,
    },
    opacity: { delay: delay + i * effectiveStagger + 0.01, duration: 0.01 },
  });

  return (
    <motion.svg
      // Remount when the glyph count changes so `initial` re-applies to the
      // new path set rather than the previous one's resting state.
      key={paths.length}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label={text}
      className={cn("overflow-visible text-ink", className)}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {paths.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="white"
              strokeWidth={fontSize * 0.22}
              fill="none"
              variants={variants}
              transition={transitionFor(i)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </mask>
      </defs>

      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={2}
          fill="none"
          variants={variants}
          transition={transitionFor(i)}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="butt"
          strokeLinejoin="round"
          onAnimationComplete={
            i === lastIndex ? () => onCompleteRef.current?.() : undefined
          }
        />
      ))}

      <g mask={`url(#${maskId})`}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={color} />
        ))}
      </g>
    </motion.svg>
  );
}
