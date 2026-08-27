"use client";

import Link from "next/link";
import { CtaLink } from "@/components/cta-link";
import { useBag, subtotal, checkoutHref } from "@/lib/cart";
import { formatPrice, swatchFor, SHOP_ALL_URL } from "@/lib/shop";

/**
 * The bag's contents.
 *
 * A hairline per line and nothing else — no cards, no boxes, no radii. It is
 * the same object the fit guide and the sitemap are built from, because a
 * cart is a list and this site already knows how to set a list.
 *
 * Each line carries its acetate as a swatch rather than a thumbnail: the
 * frame is the same shape in every colourway, so a photograph would say
 * less than the colour does about which one this is.
 */
export function CartTable() {
  const { resolved, ready, setQty, remove } = useBag();
  const total = subtotal(resolved);
  const href = checkoutHref(resolved);

  /* Before mount the bag is unknown, not empty. Rendering "nothing here"
     and then replacing it a frame later reads as the cart losing things. */
  if (!ready) {
    return <p className="t-caption">Opening the bag…</p>;
  }

  if (!resolved.length) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">The bag is empty.</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/eyewear">See the frames</CtaLink>
          <CtaLink href={SHOP_ALL_URL} external tone="quiet">
            Shop all
          </CtaLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul>
        {resolved.map(({ line, house, entry }) => {
          const gone = !entry || !entry.available;
          return (
            <li
              key={`${line.slug}-${line.colorway}`}
              className="hairline flex flex-wrap items-start gap-x-6 gap-y-4 py-7"
            >
              <span
                aria-hidden
                className="mt-1 block h-12 w-12 shrink-0 border border-[var(--fg-rule)]"
                style={{ background: swatchFor(line.colorway) }}
              />

              <div className="min-w-0 flex-1">
                <p className="t-label text-[var(--fg-primary)]">
                  {house?.name ?? line.slug}
                </p>
                <p className="t-caption mt-1">{line.colorway}</p>
                {gone ? (
                  /* Said plainly and kept in the bag. Silently dropping a
                     line the store has withdrawn is how someone reaches
                     checkout believing they bought something. */
                  <p className="t-caption mt-2 text-[var(--fg-accent)]">
                    No longer available — it will not be taken to checkout.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-4">
                <label className="sr-only" htmlFor={`qty-${line.slug}-${line.colorway}`}>
                  Quantity, {house?.name} {line.colorway}
                </label>
                <input
                  id={`qty-${line.slug}-${line.colorway}`}
                  type="number"
                  min={0}
                  max={99}
                  value={line.qty}
                  onChange={(e) =>
                    setQty(line.slug, line.colorway, Number(e.target.value))
                  }
                  className="field w-14 border-b border-[var(--fg-rule)] pb-1 text-center tabular-nums"
                />
                <p className="t-label w-20 text-right tabular-nums text-[var(--fg-primary)]">
                  {entry ? formatPrice(entry.cents * line.qty) : "—"}
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.slug, line.colorway)}
                  className="link-quiet link-quiet--micro"
                  aria-label={`Remove ${house?.name} ${line.colorway}`}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hairline mt-4 flex flex-wrap items-end justify-between gap-6 pt-8">
        <div>
          <p className="t-eyebrow">Subtotal</p>
          <p className="t-display-xs mt-2 tabular-nums">{formatPrice(total)}</p>
          <p className="t-caption mt-2">
            Shipping and tax are calculated at checkout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          <Link href="/eyewear" className="link-quiet">
            Keep looking
          </Link>
          {href ? (
            /* Out to Shopify. The permalink rebuilds these lines against
               live inventory, so the store — not this page — has the last
               word on price and availability. */
            <CtaLink href={href} external>
              Checkout
            </CtaLink>
          ) : (
            <p className="t-caption">Nothing in the bag can be checked out.</p>
          )}
        </div>
      </div>
    </div>
  );
}
