import type { Metadata } from "next";
import Link from "next/link";
import { Terminal } from "@/components/terminal/terminal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terminal",
  description: `A command-line interface to ${site.domain}.`,
};

/**
 * The terminal route deliberately opts out of the site chrome — it lives in
 * the `(full)` group, so there is no header or footer to break the illusion.
 * The only way back is the link below the window, which is the point.
 */
export default function TerminalPage() {
  return (
    <main className="flex flex-1 flex-col justify-center bg-[#060607] px-6 py-16">
      <Terminal />
      <p className="mt-6 text-center text-sm text-[#868d97]">
        <Link href="/" className="transition-colors duration-150 hover:text-[#f4f5f6]">
          ← back to {site.domain}
        </Link>
      </p>
    </main>
  );
}
