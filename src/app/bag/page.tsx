import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { BagView } from "@/components/shop/bag-view";

export const metadata: Metadata = {
  title: "The Bag — Aria Noir",
  description: "What you are holding.",
  /* Nobody arrives here from a search result, and the contents are one
     person's. */
  robots: { index: false, follow: false },
};

/**
 * The bag, on its own page and reachable from the menu.
 *
 * ---- This replaced the Room ----
 *
 * There was a page called The Room holding two errands under one title: the
 * bag, which is business unfinished on this device, and the desk — orders,
 * addresses, sign-out — which lives on Shopify. The name was a word for the
 * pairing rather than a reason for it, and it meant the thing every shopper
 * looks for by name was filed under something only this site called it.
 *
 * The Room is gone, route and all. Both halves are here, in the order they
 * matter to someone standing at their own till: the bag, then the desk.
 *
 * ---- Why it is in the menu and not the header ----
 *
 * That decision is older than this page and is not being reversed: a cart
 * control in the chrome is a shop shouting about its own till on every
 * page, and this header spends itself on three words and a wordmark. The
 * menu is where destinations live, and the bag is one of them.
 */
export default function BagPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-5xl">
            <BagView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
