import Link from "next/link";
import { profiles, site } from "@/lib/site";

const links = [
  { label: "GitHub", href: profiles.github },
  { label: "LinkedIn", href: profiles.linkedin },
  { label: "Sorted Systems", href: profiles.consultancy },
  { label: "Email", href: `mailto:${profiles.email}` },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-line mt-auto border-t">
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <p className="text-ink-subtle text-sm">
          © {new Date().getFullYear()} {site.name} · Brisbane, Australia
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-auto" aria-label="Elsewhere">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-ink-muted hover:text-ink text-sm transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
