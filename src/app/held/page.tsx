import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { HeldView } from "@/components/shop/held-view";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";

export const metadata: Metadata = {
  title: "Held — Aria Noir",
  description: "What the house is keeping in view for you.",
  /* Same reason the bag is not indexed: the contents are a person's, not
     the house's, and there is nothing here for a crawler to find. */
  robots: { index: false, follow: false },
};

/**
 * `/held`, not `/wishlist`.
 *
 * A wishlist is a word from a gift registry. What this actually holds is
 * the frame someone has not finished deciding about, and the house's own
 * language for keeping something in view is holding it — the bag page has
 * said "what you are holding" since it was written.
 */
export default function HeldPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="stack stack--sm mb-16">
              <CrumbEyebrow label="Kept in view" className="t-eyebrow" />
              <h1 className="t-display-lg">Held.</h1>
              <p className="t-body t-body--lede mt-2">
                Not bought, not forgotten. The workshop cuts to order, so a
                colourway can go out between one visit and the next.
              </p>
            </div>
            <HeldView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
