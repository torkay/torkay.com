import { IntroPreload, IntroSequence } from "@/components/intro/intro-sequence";
import { Hero } from "@/components/sections/hero";
import { SelectedWork } from "@/components/sections/selected-work";

export default function Home() {
  return (
    <>
      <IntroPreload />
      <IntroSequence />
      <main className="flex flex-1 flex-col">
        <Hero />
        <SelectedWork />
      </main>
    </>
  );
}
