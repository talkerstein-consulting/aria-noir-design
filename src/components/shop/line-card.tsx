"use client";

import Image from "next/image";
import Link from "next/link";
import { useHeld } from "@/lib/held";
import { CtaButton } from "@/components/cta-link";
import { shopPath } from "@/lib/navigation";
import type { House } from "@/lib/navigation";
import { formatPrice, swatchFor } from "@/lib/shop";
import { cardImageFor } from "@/lib/product-cards";

/**
 * A bag line as a product card — the same object the held list and the
 * eyewear grid are set with: the square shot, the name, the colourway, the
 * price. The order summary, the review step and the confirmation all draw
 * lines with this, so a frame looks like itself all the way to the receipt
 * rather than shrinking to a chip the moment money is mentioned.
 */
export function LineCard({
  house,
  slug,
  colorway,
  qty,
  cents,
  linked = true,
  holdable = false,
  name: nameIn,
  image: imageIn,
  meta,
  href,
}: {
  house: House | undefined;
  slug: string;
  colorway: string;
  qty: number;
  cents?: number;
  /* ---- The four overrides, and why they exist ----
     A bag line is no longer always a frame: El Patrón sells here too, and
     a garment has no `House`, no card art and a colourway that carries
     a size beside it. Rather than branch on eyewear-or-garment inside this
     component, the caller — which has the resolved line and `lineName`,
     `lineMeta`, `lineImage`, `lineHref` to read it with — hands over what
     it already knows. Left out, every one of them falls back to the
     eyewear behaviour this card has always had. */
  name?: string;
  image?: string;
  meta?: string;
  href?: string;
  /** Off on the confirmation, where the order is done and the card is a
   *  record rather than a way back to the shop. */
  linked?: boolean;
  /**
   * Offer to hold this one instead, where it is not held already.
   *
   * The checkout's own list: a reader looking at four lines and having
   * second thoughts about one of them had nothing to do but delete it,
   * which loses the frame and the colourway they picked. Held, it is
   * still theirs to come back to. Drawn only when it is NOT already
   * held — a button that says "save for later" over something already
   * saved is a question with no answer.
   */
  holdable?: boolean;
}) {
  const { holds, toggle, ready } = useHeld();
  const alreadyHeld = ready && holds(slug, colorway);
  /* The SAME photograph the shop's grid draws — the square card render,
     via the one resolver that knows the chain. This used to reach for
     `galleryFor(...)[0]`, a 16:9 master, and the square shot box then
     cropped the temples off both sides: the shop showed one picture of a
     frame and the bag showed a different, worse one. See cardImageFor. */
  const image = imageIn ?? (house ? cardImageFor(house, colorway) : undefined);
  const name = nameIn ?? house?.name ?? slug;
  const sub = meta ?? colorway;
  const to = href ?? (house ? `${shopPath(house)}?colourway=${encodeURIComponent(colorway)}` : undefined);
  const body = (
    <>
      <div className="card-shot" style={{ background: swatchFor(colorway) }}>
        {image ? (
          <Image
            src={image}
            alt={`${name} in ${sub}`}
            fill
            /* Two up in the checkout's 24rem aside, so about 11rem there
               rather than the 24rem this asked for before: a card that
               downloads twice the plate it draws is the summary paying
               for a photograph nobody sees at that size. */
            sizes="(min-width: 1024px) 11rem, (min-width: 480px) 45vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <h3 className="card-name mt-5">{name}</h3>
      <p className="t-caption mt-1">
        {sub}
        {qty > 1 ? ` · ${qty}` : ""}
      </p>
    </>
  );

  return (
    <article>
      {linked && to ? (
        <Link href={to} className="card-link group block">
          {body}
        </Link>
      ) : (
        body
      )}
      <p className="t-caption mt-2 tabular-nums">
        {typeof cents === "number" ? formatPrice(cents * qty) : "—"}
        {qty > 1 && typeof cents === "number" ? (
          <span className="text-[var(--fg-quiet)]"> · {formatPrice(cents)} each</span>
        ) : null}
      </p>
      {/* Outlined, not filled: the filled CTA on this screen is the one
          that places the order, and a second fill beside every line
          would be four of them arguing with it. */}
      {holdable && !alreadyHeld ? (
        <CtaButton
          kind="secondary"
          className="line-card-hold mt-3"
          onClick={() => toggle(slug, colorway)}
        >
          Save for later
        </CtaButton>
      ) : null}
    </article>
  );
}
