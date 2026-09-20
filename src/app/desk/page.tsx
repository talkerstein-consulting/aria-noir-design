import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { DeskView } from "@/components/shop/desk-view";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";

export const metadata: Metadata = {
  title: "The Desk — Aria Noir",
  description: "Orders, what you are holding, and your details.",
  robots: { index: false, follow: false },
};

/**
 * Where the profile glyph in the header goes, once the reader is known.
 *
 * The bag page already had a section called The Desk with the same two
 * links in it; this is that section given a room of its own, because it had
 * grown a wishlist and a details form and neither belongs under a cart.
 */
export default function DeskPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="stack stack--sm mb-16">
              <CrumbEyebrow label="The Desk" className="t-eyebrow" />
              <h1 className="t-display-lg">Yours.</h1>
            </div>
            <DeskView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
