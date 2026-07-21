import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-(--container-page) flex-1 flex-col justify-center px-6 py-24">
      <h1 className="font-display text-6xl leading-none tracking-[-0.04em] text-balance sm:text-7xl">
        {site.name}
      </h1>
      <p className="text-ink-muted mt-6 max-w-(--container-prose) text-lg">
        {site.description}
      </p>
    </main>
  );
}
