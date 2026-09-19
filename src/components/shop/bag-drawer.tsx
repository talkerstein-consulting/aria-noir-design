"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useBag, subtotal } from "@/lib/cart";
import { formatPrice, swatchFor } from "@/lib/shop";
import { shopPath } from "@/lib/navigation";
import { CtaLink } from "@/components/cta-link";

/**
 * The bag, as a drawer off the right edge.
 *
 * ---- Why it is not the page any more ----
 *
 * /bag still exists and still answers — it is the page with the desk under
 * it, and it is where the link at the foot of this panel goes. What changed
 * is what the glyph in the header does. Sending someone from the frame they
 * are reading to a till is the oldest way to lose them: they came back with
 * one thing in the bag and left with the page they were on gone. The drawer
 * puts the bag beside the page instead of in front of it, and closing it
 * returns the reader to the exact place they were, because they never left.
 *
 * ---- What it holds, and what it does not ----
 *
 * The lines, the quantities, the subtotal and the way out to checkout. Not
 * the six-card grid the empty bag PAGE shows: a drawer 30rem wide is not
 * the room to ask anyone to choose between six houses, and the reader is
 * already standing on the site that sells them. An empty drawer says so in
 * one line and offers the showcase.
 *
 * The panel is always mounted and hidden with `visibility`, for the same
 * reason the sheets are: `visibility` is what actually takes it out of
 * hit-testing and the accessibility tree, and it is the only hidden state
 * that can be transitioned out of.
 *
 * Its surface — glass, slide, delayed visibility — is `.drawer*` in
 * commerce.css, the sheet's sibling. See that file for why a bag hangs off
 * the side and runs full height while a menu comes down four fifths.
 */
export function BagDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const { resolved, ready, setQty, remove, count } = useBag();
  const total = subtotal(resolved);
  /* The checkout is on this origin now; the drawer only needs to know
     whether anything in the bag can be sent. */
  const sendable = resolved.some((r) => r.entry?.available);

  /* Escape closes, focus moves in, and the page behind stops scrolling.
     The gutter is reserved for the same reason the sheets reserve it:
     hiding overflow hands the scrollbar's width back to the viewport, and
     every fixed element — this panel and the header — grows by it. */
  useEffect(() => {
    if (!open) return;

    panel.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      root.style.scrollbarGutter = prevGutter;
    };
  }, [open, onClose]);

  return (
    <div
      className="drawer"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="The bag"
    >
      {/* The page, held under glass, and the way out of here. */}
      <button
        type="button"
        aria-label="Close the bag"
        onClick={onClose}
        className="drawer-glass"
      />

      <div ref={panel} className="drawer-panel on-ink">
        {/* ---- the head ----
            No Close control drawn here: the bag glyph in the header is the
            control, and it shows a cross for as long as this is open. The
            tally is said in words because a drawer that has just opened
            should answer "how much of what" before anything else. */}
        <div className="flex items-baseline justify-between px-7 pt-28 pb-6">
          <p className="t-eyebrow">The Bag</p>
          <p className="t-micro text-[var(--fg-quiet)]">
            {ready ? `${count} ${count === 1 ? "piece" : "pieces"}` : null}
          </p>
        </div>

        <div className="drawer-lines px-7">
          {!ready ? (
            <p className="t-caption">Opening the bag…</p>
          ) : !resolved.length ? (
            <div className="stack stack--sm">
              <p className="t-body t-body--lede">The bag is empty.</p>
              <p className="t-body t-body--tight mt-2 text-[var(--fg-tertiary)]">
                Six houses, cut from block acetate. Every one of them is made
                to order.
              </p>
              <CtaLink href="/eyewear" onClick={onClose} className="mt-8">
                See the showcase
              </CtaLink>
            </div>
          ) : (
            <ul>
              {resolved.map(({ line, house, entry }) => (
                <li
                  key={`${line.slug}-${line.colorway}`}
                  className="flex gap-4 border-b border-[var(--fg-rule)] py-5 first:pt-0"
                >
                  {/* The acetate as a swatch, not a photograph: the frame
                      is the same shape in every colourway, so the colour
                      says more about which one this is than a thumbnail at
                      this size ever could. */}
                  <span
                    aria-hidden
                    className="mt-1 h-10 w-10 flex-none"
                    style={{ background: swatchFor(line.colorway) }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      {house ? (
                        <Link
                          href={shopPath(house)}
                          onClick={onClose}
                          className="t-caption link-quiet"
                        >
                          {house.name}
                        </Link>
                      ) : (
                        <span className="t-caption">{line.slug}</span>
                      )}
                      <span className="t-micro tabular-nums">
                        {entry ? formatPrice(entry.cents * line.qty) : "—"}
                      </span>
                    </div>

                    <p className="t-micro mt-1 text-[var(--fg-quiet)]">
                      {line.colorway}
                      {entry && !entry.available ? " · no longer cut" : null}
                    </p>

                    {/* Quantity and removal on one line at label scale. The
                        page's own table can afford a stepper with a field
                        in it; a drawer cannot, and a number that is typed
                        is a number that can be typed wrong. */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="t-micro link-quiet"
                          onClick={() =>
                            setQty(line.slug, line.colorway, line.qty - 1)
                          }
                          aria-label={`One fewer ${house?.name ?? line.slug}`}
                        >
                          −
                        </button>
                        <span className="t-micro tabular-nums">{line.qty}</span>
                        <button
                          type="button"
                          className="t-micro link-quiet"
                          onClick={() =>
                            setQty(line.slug, line.colorway, line.qty + 1)
                          }
                          aria-label={`One more ${house?.name ?? line.slug}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="t-micro link-quiet link-quiet--micro"
                        onClick={() => remove(line.slug, line.colorway)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- the foot: the total, and the two ways on ----
            Held out of the scroll. A subtotal that scrolls away while you
            are deciding what to take out is the one line this panel exists
            to keep still. */}
        {ready && resolved.length ? (
          <div className="border-t border-[var(--fg-rule)] px-7 pt-6 pb-8">
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow">Subtotal</span>
              <span className="t-caption tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
            <p className="t-micro mt-2 text-[var(--fg-quiet)]">
              Shipping is free. Tax is counted at checkout.
            </p>

            {/* Each on its own line. The CTA is an inline-flex object by
                nature, so the line break has to come from the wrapper
                rather than from a `block` the component's own class wins
                against. */}
            <div className="mt-7">
              {sendable ? (
                <CtaLink href="/checkout" onClick={onClose}>
                  Checkout
                </CtaLink>
              ) : (
                <p className="t-micro text-[var(--fg-quiet)]">
                  Nothing in the bag is still being cut.
                </p>
              )}
            </div>

            {/* The page is still the page: orders, addresses and the desk
                live there, and this drawer is not trying to replace it. */}
            <div className="mt-5">
              <Link
                href="/bag"
                onClick={onClose}
                className="link-quiet link-quiet--micro"
              >
                Open the full bag
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
