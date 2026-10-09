"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBag, subtotal } from "@/lib/cart";
import { formatPrice } from "@/lib/shop";

/**
 * The bag's pinned way out: while anything is in the bag, the same compact
 * pill the story page pins for its offer, carrying the subtotal and
 * Checkout. Styled by `.story-pin` so the two read as one control.
 *
 * Stands down on the checkout itself, while the bag drawer is open (the
 * drawer has its own Checkout), and on a story page, whose own pill owns
 * the foot of the screen.
 */
export function BagPin({ hidden = false }: { hidden?: boolean }) {
  const { resolved, ready, count } = useBag();
  const pathname = usePathname();
  const [story, setStory] = useState(false);

  useEffect(() => {
    setStory(!!document.querySelector(".story-pin:not(.bag-pin)"));
  }, [pathname]);

  const shown =
    ready && count > 0 && !hidden && !story && !pathname.startsWith("/checkout");

  return (
    <div
      className="story-pin bag-pin fixed bottom-4 left-1/2 z-[60] sm:bottom-6"
      data-shown={shown}
      aria-hidden={!shown}
    >
      <span className="story-pin__price t-eyebrow tabular-nums">
        {formatPrice(subtotal(resolved))}
      </span>
      <Link href="/checkout" className="story-pin__buy t-eyebrow" tabIndex={shown ? 0 : -1}>
        Checkout
      </Link>
    </div>
  );
}
