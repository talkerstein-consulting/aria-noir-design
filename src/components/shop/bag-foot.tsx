"use client";

import { CtaLink } from "@/components/cta-link";
import { formatPrice } from "@/lib/shop";
import type { ResolvedLine } from "@/lib/cart";

/**
 * The foot of the bag: the number, what is not coming, and the way on.
 *
 * This replaced `checkout-steps`, which asked three questions here to
 * soften a handoff to the store's checkout. There is no handoff now — the
 * checkout is `/checkout` on this origin and asks its own questions — so
 * the bag says the subtotal and points at the door.
 */
export function BagFoot({
  lines,
  subtotal,
}: {
  lines: readonly ResolvedLine[];
  subtotal: number;
}) {
  const sendable = lines.filter((l) => l.entry?.available);
  const withheld = lines.length - sendable.length;

  return (
    <div className="hairline mt-10 flex flex-wrap items-end justify-between gap-6 pt-8">
      <div>
        <p className="t-eyebrow">Subtotal</p>
        <p className="t-display-xs mt-2 tabular-nums">{formatPrice(subtotal)}</p>
        <p className="t-caption mt-2 max-w-md">
          Shipping is free everywhere the house sends. Tax and the total are
          settled at checkout, against your address.
        </p>
        {withheld > 0 ? (
          <p className="t-caption mt-2 text-[var(--fg-quiet)]">
            {withheld === 1
              ? "One line is out of the workshop and will not be taken to checkout."
              : `${withheld} lines are out of the workshop and will not be taken to checkout.`}
          </p>
        ) : null}
      </div>
      {sendable.length ? (
        <CtaLink href="/checkout">Continue to checkout</CtaLink>
      ) : (
        <p className="t-caption">Nothing in the bag can be checked out.</p>
      )}
    </div>
  );
}
