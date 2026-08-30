import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CtaLink } from "@/components/cta-link";
import { CartTable } from "@/components/shop/cart-table";

export const metadata: Metadata = {
  title: "The Bag — Aria Noir",
  description: "What you are holding.",
  /* Nobody arrives here from a search result, and the contents are one
     person's. Same rule the Room follows. */
  robots: { index: false, follow: false },
};

/**
 * The bag, on its own page and reachable from the menu.
 *
 * ---- Why it moved out of the Room ----
 *
 * The Room is two errands wearing one title: the BAG, which is business
 * unfinished on this device, and the DESK — orders, addresses, sign-out —
 * which lives on Shopify. Those are not the same visit. Someone with three
 * frames in their bag is trying to check out; someone looking for an old
 * order is not, and making them scroll past each other's business served
 * neither.
 *
 * So the bag has its own address, and it is the one in the menu. The Room
 * keeps the desk and points here, which means there is still exactly one
 * bag on the site — the thing that was true when it was a section, and the
 * thing that would have stopped being true if this page had simply
 * rendered a second copy of it.
 *
 * ---- Why it is in the menu and not the header ----
 *
 * That decision is older than this page and is not being reversed: a cart
 * control in the chrome is a shop shouting about its own till on every
 * page, and this header spends itself on three words and a wordmark. The
 * menu is where destinations live, and the bag is now one of them — which
 * is the part that was missing, because until now the only way to the bag
 * was a footer link under "Client".
 */
export default function BagPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-5xl">
            <div className="stack stack--sm mb-16">
              <p className="t-eyebrow">The Bag</p>
              <h1 className="t-display-lg">What you are holding.</h1>
              <p className="t-body t-body--lede mt-2">
                Nothing here is held for long — the workshop cuts to order,
                and a colourway can go out between one visit and the next.
              </p>
            </div>

            <CartTable />

            {/* The desk is the other half of what used to be one page, and
                it stays one link away rather than one scroll away. */}
            <section className="hairline mt-20 pt-10">
              <h2 className="t-eyebrow mb-6">The Desk</h2>
              <p className="t-body t-body--tight max-w-xl">
                Orders, addresses and anything already on the bench are kept
                in the Room. You do not need an account to check out — the
                bag above will go through either way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
                <CtaLink href="/room">Go to the Room</CtaLink>
                <CtaLink href="/eyewear" tone="quiet">
                  Keep looking
                </CtaLink>
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
