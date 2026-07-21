"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { arc } from "motion";
import { cn } from "@/lib/utils";
import { DUR, EASE_OUT } from "@/lib/motion";

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * BounceSidebar — a vertical nav whose active marker travels along an arc
 * rather than a straight line.
 *
 * The arc is the whole idea. A dot sliding straight down reads as a value
 * changing; a dot that bows outward as it travels reads as an object moving
 * through space. `arc()` from Motion supplies the curved path, and the
 * curvature is scaled *inversely* to distance (`14 / distance`, capped at
 * 0.8) so a one-item hop bows about as much as a five-item hop — without
 * that scaling, long journeys would balloon into a semicircle.
 *
 * Three details that are easy to lose and expensive to debug:
 *
 *  1. Every position is quantised to the device pixel grid (`Math.round(v *
 *     dpr) / dpr`). On fractional-DPR displays an unquantised 6px dot renders
 *     visibly soft.
 *  2. The first placement is a zero-duration snap, not an animation, and the
 *     dot stays `opacity: 0` until it lands — otherwise it visibly flies from
 *     the origin on mount.
 *  3. The snap re-runs after `document.fonts.ready`, because item heights
 *     change when the real face swaps in and the dot would otherwise sit off
 *     centre until the next selection.
 */

export type BounceSidebarItem = string | { label: string; href?: string };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  /** Controlled active index. Omit for uncontrolled. */
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** Defaults to the `--signal` token — the palette's single warm hue. */
  dotColor?: string;
};

const DOT_BASE = 6;

export function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor = "var(--signal)",
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const [dotSize, setDotSize] = useState(DOT_BASE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setDotSize(Math.round(DOT_BASE * dpr) / dpr);
  }, []);

  // Initial placement: snap, never animate, and don't reveal until placed.
  useIsomorphicLayoutEffect(() => {
    let cancelled = false;

    const snap = () => {
      const el = itemRefs.current[activeIndex];
      if (cancelled || !el || !dot.current) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(DOT_BASE * dpr) / dpr;
      const toY = Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    // Item heights shift when the real face replaces the fallback metrics.
    document.fonts?.ready.then(snap);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // Mount only — later moves are the animated effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const dpr = window.devicePixelRatio || 1;
    const toY = Math.round((el.offsetTop + el.offsetHeight / 2 - dotSize / 2) * dpr) / dpr;

    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;

    if (reduced) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      return;
    }

    const distance = Math.abs(delta);
    // Curvature falls off with distance so short and long hops bow alike.
    const path = arc({
      strength: Math.min(0.8, 14 / distance),
      direction: delta > 0 ? "ccw" : "cw",
    });

    animate(dot.current, { x: 0, y: toY }, { duration: DUR.micro + 0.1, ease: EASE_OUT, path });
  }, [activeIndex, animate, dot, dotSize, reduced]);

  const select = (index: number) => {
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1 pl-6", className)}
      {...props}
    >
      <span
        ref={dot}
        aria-hidden
        className="absolute top-0 left-2 rounded-full transition-opacity duration-150"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: dotColor,
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? undefined : item.href;
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full cursor-pointer items-center rounded-lg p-1 text-left text-sm transition-colors duration-200",
          isActive ? "text-ink" : "text-ink-muted hover:text-ink",
        );

        return (
          <li
            key={label}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <MotionLink
                href={href}
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                aria-current={isActive ? "page" : undefined}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                aria-pressed={isActive}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
