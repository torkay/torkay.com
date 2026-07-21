import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";

/**
 * The portfolio shell. Everything in this group shares header and footer;
 * routes that need the full viewport (currently /terminal) live in `(full)`
 * instead, which is the entire reason for the group split.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
