"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CtaLink } from "@/components/cta-link";
import { useBag } from "@/lib/cart";

/**
 * The bag, at the foot of a phone's screen, while the reader keeps
 * looking.
 *
 * ---- Why it exists, and where it does not ----
 *
 * A bag with something in it is an intention the reader has already
 * formed; the shop's job after that is to stay out of the way of the
 * browsing and keep the way out one press away. The header's bag button
 * says how many; it does not say "and here is the way out", which is
 * what this band is for. Same two parts at every width — what is in the
 * bag on the left, the way out at the right — with the page's own
 * gutter on a desk and the CTA at its own width rather than stretched
 * across the band.
 *
 * It is absent on the routes where it would be furniture rather than a
 * way on: the checkout is the way out, so a band pointing at it is a
 * button that reloads the page someone is already filling in; `/bag` is
 * the drawer; the confirmation is an order that has been placed, and the
 * lines it is counting no longer exist.
 *
 * ---- Stacking ----
 *
 * The buy page pins its own Add to bag row to the same edge. Rather than
 * either one covering the other, this writes its height to
 * `--bag-bar-h` on the document, and the pinned row sits on top of that
 * (see .buy-row[data-pinned] in interactions.css). The variable is
 * cleared whenever the band is not drawn, so every other page's foot is
 * its own again.
 */

/** The band's own height, including the home-indicator clearance. Kept
 *  as a number so the buy row's offset and the page's bottom padding are
 *  one value rather than three that drift. */
const BAR_H = "4.25rem";

const HIDDEN = ["/checkout", "/bag"];

export function BagBar() {
  const pathname = usePathname();
  const { resolved, count, ready } = useBag();

  /* Something in the bag that can actually be sent: a band offering
     Checkout over a bag of frames that are all out of the workshop is an
     offer the next screen has to take back. */
  const sendable = resolved.some((r) => r.entry?.available);
  const route = HIDDEN.some((h) => pathname === h || pathname.startsWith(`${h}/`));
  const shown = ready && count > 0 && sendable && !route;

  useEffect(() => {
    const root = document.documentElement;
    if (shown) root.style.setProperty("--bag-bar-h", BAR_H);
    else root.style.removeProperty("--bag-bar-h");
    return () => {
      root.style.removeProperty("--bag-bar-h");
    };
  }, [shown]);

  if (!shown) return null;

  return (
    <div className="bag-bar" role="region" aria-label="Your bag">
      {/* What is in the bag, and not what it costs. A subtotal here is a
          number the reader has to check against one they cannot see —
          shipping and tax are counted at the checkout — so it reads as a
          price that is about to change. The count is the honest thing a
          band can say from outside the bag. */}
      <div className="bag-bar-sum">
        <span className="t-eyebrow">
          {count === 1 ? "One piece" : `${count} pieces`}
        </span>
      </div>
      {/* The way out, on the right, where the reader's thumb is. */}
      <CtaLink href="/checkout">Checkout</CtaLink>
    </div>
  );
}
