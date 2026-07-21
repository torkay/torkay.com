"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_SOFT } from "@/lib/motion";

/**
 * Folder — a manila folder that fans its contents on hover and throws them
 * clear on click.
 *
 * The illusion rests on three things:
 *
 *  1. **A real 3D flap.** The front panel is rotated on `rotateX` inside a
 *     `perspective` context, so it foreshortens as it opens instead of just
 *     scaling. It rests at -15° (already slightly ajar — a flat 0° reads as a
 *     rectangle, not a folder), opens to -45° on hover and -55° on click.
 *  2. **Staggered delays, front card first.** The cards animate with
 *     *decreasing* delay down the array (0.1s, 0.05s, 0s), and later siblings
 *     paint on top — so the frontmost card leads and the ones behind trail
 *     out from under it. Uniform timing makes the three read as one sheet;
 *     this reads as a stack being pulled apart.
 *  3. **A blurred backdrop on the flap.** `backdrop-filter` clipped to the
 *     flap silhouette means cards passing behind it are genuinely frosted,
 *     which sells the flap as translucent material rather than a shape on top.
 *
 * `scale` renders at a fixed base size and transforms — the SVG filters
 * (inner shadows) are defined in userSpaceOnUse units, so re-rendering at a
 * different viewBox would change the shadow geometry rather than the size.
 */

const themes = {
  black: {
    backFill: "black",
    backInsetShadow: "inset 0 0 6px 2px rgba(255,255,255,0.37)",
    flapFill: "#292929",
    flapFillOpacity: 0.25,
    flapStroke: "#979797",
    flapInsetColor: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0",
    cardFill: "#F1F1F1",
    cardStroke: "#E0E0E0",
    cardLineFill: "#D4D4D4",
    cardInsetColor: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0",
  },
  white: {
    backFill: "#ffffff",
    backInsetShadow: "inset 0 0 6px 2px rgba(178,178,178,0.25)",
    flapFill: "#f5f5f5",
    flapFillOpacity: 0.85,
    flapStroke: "#d4d4d4",
    flapInsetColor: "0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0.15 0",
    cardFill: "#262626",
    cardStroke: "#404040",
    cardLineFill: "#737373",
    cardInsetColor: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0",
  },
  blue: {
    backFill: "#50B1FD",
    backInsetShadow: "inset 0 0 6px 2px rgba(255,255,255,0.35)",
    flapFill: "#3a9ae8",
    flapFillOpacity: 0.45,
    flapStroke: "#7ec8ff",
    flapInsetColor: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0",
    cardFill: "#F1F1F1",
    cardStroke: "#E0E0E0",
    cardLineFill: "#D4D4D4",
    cardInsetColor: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0",
  },
} as const;

const sizeScales = { sm: 0.65, md: 1, lg: 1.35 } as const;

export type FolderProps = Omit<React.ComponentProps<"div">, "color"> & {
  color?: keyof typeof themes;
  size?: keyof typeof sizeScales;
  /** Accessible name — the folder is decorative unless you give it one. */
  label?: string;
};

const BASE_WIDTH = 321;
const BASE_HEIGHT = 270;
const FLAP_HEIGHT = 241;

const FLAP_PATH =
  "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

/** Card resting / hover / open transforms, back-most first (DOM paint order:
 *  the last entry lands on top). Delays decrease so the top card leads. */
const CARD_STATES = [
  { rest: { y: -10, x: 40, rotate: 10 }, hover: { y: -30, x: 40, rotate: 14 }, open: { y: -160, x: 70, rotate: 18 }, delay: { open: 0.1, hover: 0.12 } },
  { rest: { y: -20, x: 3, rotate: 2 }, hover: { y: -35, x: 3, rotate: -1 }, open: { y: -180, x: 0, rotate: -3 }, delay: { open: 0.05, hover: 0.06 } },
  { rest: { y: -22, x: -40, rotate: -5 }, hover: { y: -44, x: -40, rotate: -9 }, open: { y: -170, x: -65, rotate: -14 }, delay: { open: 0, hover: 0 } },
] as const;

export function Folder({
  color = "black",
  size = "md",
  label,
  className,
  ...props
}: FolderProps) {
  const theme = themes[color] ?? themes.black;
  const scale = sizeScales[size];
  const reduced = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const transition = reduced ? { duration: 0 } : SPRING_SOFT;

  return (
    <div
      data-slot="folder"
      className={cn("relative flex h-full w-full items-center justify-center", className)}
      {...props}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? "Folder"}
        aria-expanded={isOpen}
        className="relative cursor-pointer select-none rounded-lg"
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
        onFocus={() => setIsHovered(true)}
        onBlur={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((o) => !o);
          }
        }}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            perspective: 800 * scale,
          }}
        >
          {/* Back panel — the solid body the cards sit against. */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                borderRadius: 25,
                backgroundColor: theme.backFill,
                boxShadow: theme.backInsetShadow,
              }}
            />
          </div>

          {/* The stack. Decreasing delays make the top card lead. */}
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            {CARD_STATES.map((card, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={isOpen ? card.open : isHovered ? card.hover : card.rest}
                transition={{
                  ...transition,
                  delay: reduced ? 0 : isOpen ? card.delay.open : isHovered ? card.delay.hover : 0,
                }}
              >
                <Card id={i + 1} theme={theme} />
              </motion.div>
            ))}
          </div>

          {/* Front flap. Rests ajar at -15°; never flat. */}
          <motion.div
            className="absolute top-1/2 left-1/2 mt-4 -translate-x-1/2 -translate-y-1/2"
            style={{
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
              width: BASE_WIDTH,
              height: FLAP_HEIGHT,
            }}
            animate={{ rotateX: isOpen ? -55 : isHovered ? -45 : -15 }}
            transition={transition}
          >
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                clipPath: `path('${FLAP_PATH}')`,
                WebkitClipPath: `path('${FLAP_PATH}')`,
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
            />
            <svg
              className="absolute inset-0"
              width={BASE_WIDTH}
              height={FLAP_HEIGHT}
              viewBox={`0 0 ${BASE_WIDTH} ${FLAP_HEIGHT}`}
              fill="none"
              aria-hidden
            >
              <g filter="url(#folder-flap-inset)">
                <path d={FLAP_PATH} fill={theme.flapFill} fillOpacity={theme.flapFillOpacity} />
                <path
                  d="M25 0.5H136.084C142.905 0.5 149.417 3.3431 154.054 8.3457L177.713 33.874C182.539 39.0808 189.317 42.04 196.416 42.04H296C309.531 42.04 320.5 53.0092 320.5 66.54V216C320.5 229.531 309.531 240.5 296 240.5H25C11.469 240.5 0.5 229.531 0.5 216V25C0.5 11.469 11.469 0.5 25 0.5Z"
                  stroke={theme.flapStroke}
                />
              </g>
              <defs>
                <filter
                  id="folder-flap-inset"
                  x="-25.4"
                  y="-25.4"
                  width="371.8"
                  height="291.8"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2.65" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values={theme.flapInsetColor} />
                  <feBlend mode="normal" in2="shape" result="innerShadow" />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Folder;

type Theme = (typeof themes)[keyof typeof themes];

/** The ruled "text" rows, generated rather than transcribed — two columns of
 *  nine, on a 14.1184px rhythm. The source export listed all eighteen. */
const ROW_COUNT = 9;
const ROW_STEP = 14.1184;
const COLUMNS = [
  { x: 14.8253, y0: 60.9939, matrix: "1 -0.000409158 0.00201956 0.999998" },
  { x: 84.4303, y0: 60.9617, matrix: "1 -0.000461045 0.00179228 0.999998" },
] as const;

function Card({ id, theme }: { id: number; theme: Theme }) {
  const filterId = `folder-card-inset-${id}`;

  return (
    <div data-slot="folder-card">
      <svg width="164" height="214" viewBox="0 0 164 214" fill="none" aria-hidden>
        <g filter={`url(#${filterId})`}>
          <rect width="163.078" height="213.262" rx="20" fill={theme.cardFill} />
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="162.078"
          height="212.262"
          rx="19.5"
          stroke={theme.cardStroke}
        />
        {/* Title bar */}
        <rect
          x="14.1193"
          y="31.2091"
          width="134.84"
          height="11.8892"
          rx="5.94459"
          fill={theme.cardLineFill}
        />
        {/* Body rows */}
        {COLUMNS.flatMap((col, ci) =>
          Array.from({ length: ROW_COUNT }, (_, ri) => (
            <rect
              key={`${ci}-${ri}`}
              width="64.5183"
              height="5.88276"
              rx="2.94138"
              transform={`matrix(${col.matrix} ${col.x} ${(col.y0 + ri * ROW_STEP).toFixed(4)})`}
              fill={theme.cardLineFill}
            />
          )),
        )}
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="166.078"
            height="218.262"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology radius="2" operator="erode" in="SourceAlpha" result="eroded" />
            <feOffset dx="3" dy="5" />
            <feGaussianBlur stdDeviation="3.05" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values={theme.cardInsetColor} />
            <feBlend mode="normal" in2="shape" result="innerShadow" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
