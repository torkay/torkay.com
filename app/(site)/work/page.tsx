import type { Metadata } from "next";
import { SelectedWork } from "@/components/sections/selected-work";

export const metadata: Metadata = {
  title: "Work",
  description: "Projects, products and consulting engagements.",
};

export default function WorkPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-(--container-page) px-6 pt-20 pb-4">
        <h1 className="font-display text-5xl leading-none tracking-[-0.035em] sm:text-6xl">
          Work
        </h1>
        <p className="text-ink-muted mt-5 max-w-(--container-prose) text-lg">
          Things I have built, shipped, or been paid to think hard about.
        </p>
      </div>
      <SelectedWork />
    </main>
  );
}
