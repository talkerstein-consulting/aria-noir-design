import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CheckoutView } from "@/components/shop/checkout-view";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";

export const metadata: Metadata = {
  title: "Checkout — Aria Noir",
  description: "Four questions, one press.",
  robots: { index: false, follow: false },
};

/**
 * The checkout, on this origin.
 *
 * It used to be a permalink out to the store's checkout, and the bag page
 * asked three questions on the way to soften the handoff. Now the order is
 * settled here — the house API holds the stock, the tax and the card — so
 * the reader never changes buildings at the moment they are most likely to
 * leave. See docs/COMMERCE-FLOWS.md §2.
 */
export default function CheckoutPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <section className="on-ink section bg-ink pt-20 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="stack stack--sm mb-16">
              <CrumbEyebrow label="Checkout" className="t-eyebrow" />
              <h1 className="t-display-lg">Nearly yours.</h1>
              {/* No lede. The four steps below name themselves and the
                  step indices say how many are left, so a sentence here
                  was the page explaining what the reader could already
                  see. COPY.md: cut what can be cut. */}
            </div>
            <CheckoutView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
