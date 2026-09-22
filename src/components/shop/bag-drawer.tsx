"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import {
  useBag,
  subtotal,
  lineName,
  lineMeta,
  lineImage,
  lineHref,
} from "@/lib/cart";
import { formatPrice, swatchFor } from "@/lib/shop";
import { cardImageFor } from "@/lib/product-cards";
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
        <div className="flex items-baseline justify-between px-7 pt-28 pb-5">
          <p className="t-eyebrow">The Bag</p>
          <p className="t-micro text-[var(--fg-quiet)]">
            {ready ? `${count} ${count === 1 ? "piece" : "pieces"}` : null}
          </p>
        </div>

        {/* `data-lenis-prevent`: the page's own smooth scroll captures the
            wheel document-wide, so without this the panel simply does not
            scroll — the list is clipped at the fold and the wheel moves the
            page behind the glass instead. The filter drawer has carried
            this since it was built; these two did not, which is why a bag
            with more lines than fit could not be reached. */}
        <div className="drawer-lines px-7" data-lenis-prevent>
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
              {resolved.map((r) => {
                const { line, house, entry } = r;
                /* Name, colour-and-size, picture and destination all come
                   from the resolver now: a line can be a frame or a
                   garment, and the row does not need to know which. */
                const shot = house
                  ? cardImageFor(house, line.colorway)
                  : lineImage(r);
                const title = lineName(r);
                const meta = lineMeta(r);
                return (
                <li key={`${line.slug}-${line.colorway}-${line.size ?? ""}`} className="line-row">
                  {/* The frame itself, lying on its acetate.

                      This was a 40px square of colour, on the argument
                      that the shape is the same in every colourway so the
                      colour said more than a thumbnail could. At 40px
                      that was true. At the card's own size it is not: the
                      reader chose a photograph and this is the last place
                      they see it before the till, so it should be the
                      thing they chose. The acetate stays underneath, as
                      the ground, which is what carries a colourway the
                      shoot has not reached yet. */}
                  <div
                    className="line-row-shot"
                    style={{ background: swatchFor(line.colorway) }}
                  >
                    {shot ? (
                      <Image
                        src={shot}
                        alt={`${title} in ${line.colorway}`}
                        fill
                        sizes="6rem"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      {house ? (
                        <Link
                          href={lineHref(r)}
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
                      {meta}
                      {entry && !entry.available ? " · no longer cut" : null}
                    </p>

                    {/* Quantity and removal on one line at label scale. The
                        page's own table can afford a stepper with a field
                        in it; a drawer cannot, and a number that is typed
                        is a number that can be typed wrong. */}
                    {/* ---- Down-to-nothing is no longer the same gesture ----

                        It was, and the argument for it was good: taking
                        the last one out of the bag IS decrementing from
                        one, so the minus key turned into a bin at that
                        point and did it. One control, pressed the same
                        way, rather than a word beside the stepper
                        duplicating its floor.

                        What that argument missed is the SEQUENCE. Going
                        from two to one is a press in this spot; removing
                        the line is then the same press in the same spot,
                        a moment later, with nothing between them. A
                        reader tapping down through a quantity does not
                        stop to re-read a key that has not moved, so the
                        press that was undoing a choice becomes the press
                        that destroys the line — and there is no undo
                        here to catch it.

                        So the bin has its own key, outside the group and
                        set apart from it, and it is drawn on every line
                        rather than appearing at one. The minus key keeps
                        its floor at one and stops there. Two controls,
                        two places, and the destructive one is never
                        where the reader's finger already is.

                        The icon is `aria-hidden`; the label on the
                        button is what carries its meaning. */}
                    <div className="mt-3 flex items-center">
                      <div className="bag-qty">
                        <button
                          type="button"
                          className="t-micro bag-qty-btn"
                          disabled={line.qty <= 1}
                          onClick={() =>
                            setQty(line.slug, line.colorway, line.qty - 1, line.size)
                          }
                          aria-label={`One fewer ${house?.name ?? line.slug}`}
                        >
                          −
                        </button>
                        <span className="t-micro bag-qty-count tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          className="t-micro bag-qty-btn"
                          onClick={() =>
                            setQty(line.slug, line.colorway, line.qty + 1, line.size)
                          }
                          aria-label={`One more ${house?.name ?? line.slug}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="bag-qty-btn bag-qty-bin"
                        onClick={() => remove(line.slug, line.colorway, line.size)}
                        aria-label={`Remove ${title}, ${meta}, from the bag`}
                      >
                        <Trash2 size={13} strokeWidth={1.5} aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ---- the foot: the total, and the two ways on ----
            Held out of the scroll. A subtotal that scrolls away while you
            are deciding what to take out is the one line this panel exists
            to keep still. */}
        {ready && resolved.length ? (
          <div className="border-t border-[var(--fg-rule)] px-7 pt-5 pb-7">
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
            <div className="mt-6">
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

          </div>
        ) : null}
      </div>
    </div>
  );
}
