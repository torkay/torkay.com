import type { Metadata } from "next";
import Link from "next/link";
import { profiles } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

const channels = [
  { label: "Email", value: profiles.email, href: `mailto:${profiles.email}` },
  { label: "GitHub", value: "github.com/torkay", href: profiles.github },
  { label: "LinkedIn", value: "linkedin.com/in/torrin-kay", href: profiles.linkedin },
  { label: "Consultancy", value: "sortedsystems.com.au", href: profiles.consultancy },
] as const;

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-page) flex-1 flex-col px-6 py-20">
      <h1 className="font-display text-5xl leading-none tracking-[-0.035em] sm:text-6xl">
        Contact
      </h1>
      <p className="text-ink-muted mt-5 max-w-(--container-prose) text-lg">
        Open to consulting work. Email is the fastest way to reach me.
      </p>

      <dl className="border-line mt-12 max-w-(--container-prose) divide-y divide-[var(--line)] border-t">
        {channels.map((c) => (
          <div key={c.label} className="flex items-baseline gap-6 py-4">
            <dt className="text-ink-subtle w-28 shrink-0 text-sm">{c.label}</dt>
            <dd>
              <Link
                href={c.href}
                className="text-ink hover:text-accent transition-colors duration-150"
              >
                {c.value}
              </Link>
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
