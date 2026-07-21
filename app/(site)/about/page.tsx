import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer and digital consultant in Brisbane, Australia.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-page) flex-1 flex-col px-6 py-20">
      <h1 className="font-display text-5xl leading-none tracking-[-0.035em] sm:text-6xl">
        About
      </h1>
      <div className="text-ink-muted mt-8 max-w-(--container-prose) space-y-5 text-lg">
        <p>
          I&apos;m Torrin Kay — a software engineer and digital consultant based in
          Brisbane, Australia.
        </p>
        <p>
          Most of my work sits where data infrastructure meets an interface someone
          has to actually use: search and ingestion pipelines, the systems that keep
          them honest, and the front ends that make them worth having.
        </p>
        <p>
          I run <span className="text-ink">Sorted Systems</span>, a small digital
          software consultancy, and build <span className="text-ink">RideRadar</span>,
          a motorcycle auction meta-search for the Australian market.
        </p>
      </div>
    </main>
  );
}
