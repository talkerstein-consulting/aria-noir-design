"use client";

import Image from "next/image";
import Link from "next/link";
import { shopPath } from "@/lib/navigation";
import type { House } from "@/lib/navigation";
import { formatPrice, galleryFor, swatchFor } from "@/lib/shop";

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
}: {
  house: House | undefined;
  slug: string;
  colorway: string;
  qty: number;
  cents?: number;
  /** Off on the confirmation, where the order is done and the card is a
   *  record rather than a way back to the shop. */
  linked?: boolean;
}) {
  const image = house ? galleryFor(house, colorway)[0] : undefined;
  const name = house?.name ?? slug;
  const body = (
    <>
      <div className="card-shot" style={{ background: swatchFor(colorway) }}>
        {image ? (
          <Image
            src={image}
            alt={`${name} in ${colorway}`}
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
        {colorway}
        {qty > 1 ? ` · ${qty}` : ""}
      </p>
    </>
  );

  return (
    <article>
      {linked && house ? (
        <Link
          href={`${shopPath(house)}?colourway=${encodeURIComponent(colorway)}`}
          className="card-link group block"
        >
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
    </article>
  );
}
