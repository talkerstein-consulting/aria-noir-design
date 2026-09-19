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
              <p className="t-body t-body--lede mt-2 max-w-xl">
                Four questions. The card is read by Square and never by this
                site; the total is settled against live stock and your
                address before anything is charged.
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
