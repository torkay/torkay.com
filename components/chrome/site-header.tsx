"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

/**
 * The sticky header. The site's only `backdrop-filter` — a second one would
 * cost more per frame than everything else on the page combined.
 *
 * The wordmark is set in the display serif at the same tight tracking as a
 * headline, because it *is* a headline: it is the first piece of type a
 * visitor reads and it should establish the face immediately.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-line bg-overlay sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-(--container-page) items-center gap-6 px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-[-0.03em] transition-opacity duration-150 hover:opacity-70"
        >
          {site.domain}
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          {nav.slice(1).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
