import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CheckoutView } from "@/components/shop/checkout-view";

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
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="stack stack--sm mb-16">
              <p className="t-eyebrow">Checkout</p>
              <h1 className="t-display-lg">Nearly yours.</h1>
              {/* Was three facts in one sentence, joined by a semicolon,
                  explaining Square and live stock and tax before the
                  reader had answered anything. COPY.md: a sentence that
                  needs two commas and a semicolon is not an Aria Noir
                  sentence yet. The card is Square's business and the
                  reader will see that at the step that asks for it; what
                  they need at the top of the page is how long this takes
                  and when the money moves. */}
              <p className="t-body t-body--lede mt-2 max-w-xl">
                Four questions. Nothing is charged until the last one.
              </p>
            </div>
            <CheckoutView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
