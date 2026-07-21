"use client";

import Link from "next/link";
import { Effect } from "@/components/animate-ui/primitives/effects/effect";
import { SplittingText } from "@/components/animate-ui/primitives/texts/splitting";
import { useIntroReady } from "@/hooks/use-intro-ready";
import { DUR, SPRING_RISE, STAGGER } from "@/lib/motion";
import { profiles } from "@/lib/site";

/**
 * The hero.
 *
 * Two interleaved staggers, transcribed from the animate-ui landing timeline:
 *
 *   headline  ░░░░░░░░░░░░░░░░        per-word blur-in, 400ms, 50ms apart
 *   blocks       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓       spring rise, 600ms, 120ms apart
 *
 * The blocks start while the headline is still sharpening. That overlap is
 * deliberate and it is the whole effect — run them in sequence and the page
 * reads as two acts, one of which the visitor has to wait through.
 *
 * Both are keyed on `ready` so they *begin* as the entrance sequence lifts.
 * Re-keying restarts the animation from its initial state; the children are in
 * the DOM the entire time either way, so nothing reflows at the hand-off.
 */
export function Hero() {
  const ready = useIntroReady();

  return (
    <section className="mx-auto w-full max-w-(--container-page) px-6 pt-24 pb-16 sm:pt-32">
      <h1
        key={`h-${ready}`}
        className="font-display max-w-[15ch] text-5xl leading-[0.95] tracking-[-0.04em] text-balance sm:text-7xl"
      >
        <SplittingText
          type="words"
          text="Software that behaves the way it looks like it should."
          // `delay` is milliseconds on this primitive; `stagger` is seconds.
          delay={0}
          stagger={STAGGER.word}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: DUR.word, ease: "easeOut" }}
        />
      </h1>

      <Effect
        key={`p-${ready}`}
        fade
        slide={{ direction: "up", offset: 16 }}
        delay={0.35}
        transition={SPRING_RISE}
      >
        <p className="text-ink-muted mt-8 max-w-(--container-prose) text-lg">
          I&apos;m Torrin — a software engineer and consultant in Brisbane. I build
          systems for people who need them to work: search infrastructure, data
          pipelines, and the interfaces on top of them.
        </p>
      </Effect>

      <Effect
        key={`a-${ready}`}
        fade
        slide={{ direction: "up", offset: 16 }}
        delay={0.47}
        transition={SPRING_RISE}
      >
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/work"
            className="bg-accent text-accent-ink hover:bg-accent-hover shadow-key inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors duration-150"
          >
            See the work
          </Link>
          <Link
            href={`mailto:${profiles.email}`}
            className="border-line text-ink hover:bg-surface-sunken inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium transition-colors duration-150"
          >
            Get in touch
          </Link>
          <span className="text-ink-muted ml-1 inline-flex items-center gap-2 text-sm">
            <span className="bg-positive size-2 rounded-full" aria-hidden />
            Open to consulting work
          </span>
        </div>
      </Effect>
    </section>
  );
}
