import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { HeldView } from "@/components/shop/held-view";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";

export const metadata: Metadata = {
  title: "Saved — Aria Noir",
  description: "What you have saved.",
  /* Same reason the bag is not indexed: the contents are a person's, not
     the house's, and there is nothing here for a crawler to find. */
  robots: { index: false, follow: false },
};

/**
 * `/held` in the URL, "Saved" on the page.
 *
 * The room used to be called Held everywhere, on the argument that a
 * wishlist is a word from a gift registry and the house's own language for
 * keeping something in view is holding it. The argument was good and the
 * word still lost: nobody arrives here having read it. A reader scanning a
 * menu for the place their bookmarks went is looking for "Saved", and a
 * label they have to learn is a label doing no work on the one visit that
 * matters.
 *
 * The house keeps its voice in the prose, where a sentence can carry it.
 * Wayfinding is not the place to spend it.
 *
 * The path stays `/held`: it is an address, not a word, and changing it
 * would break every link anyone already has.
 */
export default function HeldPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <section className="on-ink section bg-ink pt-20 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="stack stack--sm mb-16">
              <CrumbEyebrow label="Saved" className="t-eyebrow" />
              <h1 className="t-display-lg">Saved.</h1>
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
