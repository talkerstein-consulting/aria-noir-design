import type { Metadata } from "next";
import { BagDoor } from "@/components/shop/bag-door";

export const metadata: Metadata = {
  title: "The Bag — Aria Noir",
  description: "What is in your bag.",
  /* Nobody arrives here from a search result, the contents are one
     person's, and there is no page here to index in any case. */
  robots: { index: false, follow: false },
};

/**
 * `/bag` is a door, not a page.
 *
 * ---- Why the page went ----
 *
 * The bag is the drawer in the header. It holds the lines, the quantities,
 * the subtotal and the way to checkout, and it does all of that BESIDE the
 * page the reader is on — which is the whole argument for it. The page was
 * the same list again at full width, plus a desk section whose every link
 * is in the desk drawer two glyphs away. Two surfaces for one errand, and
 * the worse one had the reader's place in the site taken off the screen to
 * show it.
 *
 * ---- Why the route stayed ----
 *
 * Eight places point at `/bag`: the menu, search, the checkout's way back,
 * `/cart`'s redirect, the held list, the bag-added panel, and Shopify's
 * post-auth return at `/bag?welcome=1`. `/bag` is also what a shopper
 * types. Deleting the route would have turned all of that into 404s, so it
 * answers exactly as it always did and opens the bag — just the drawer
 * rather than a page of its own.
 *
 * The work happens in `BagDoor`, a client component: where the reader was
 * before they came here is only known to the browser.
 */
export default function BagPage() {
  return <BagDoor />;
}
