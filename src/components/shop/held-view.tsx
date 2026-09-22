"use client";

import Link from "next/link";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";
import { useHeld } from "@/lib/held";
import { lineHref, lineImage, lineName, useBag } from "@/lib/cart";
import { formatPrice, shopHref, swatchFor } from "@/lib/shop";
import { cardImageFor } from "@/lib/product-cards";
import { shopPath } from "@/lib/navigation";

/**
 * The held list.
 *
 * ---- What it is, and what it is for ----
 *
 * A saved frame is a frame the reader is still deciding about, which means
 * the list has two jobs: show it as well as the grid they saved it from —
 * a favourite should never look less like itself than it did when they
 * pressed the bookmark — and let the decision be finished from here. So every
 * card is a live control: it can go to the bag without a detour through
 * the buy page, and it can be let go.
 *
 * ---- Where it lives ----
 *
 * In this browser. Nothing here is on an account, and the page says so
 * rather than implying a sync that does not happen. See lib/held.
 */
export function HeldView() {
  /* No `remove` here any more: the card's own bookmark is the control that
     takes a line off this list, the same control that put it on. A second
     remove in this file would be a second way to do one thing. */
  const { resolved, ready } = useHeld();
  const { add } = useBag();

  if (!ready) {
    /* The list is unknown, not empty. One rule's worth of height, so the
       page does not jump when the answer arrives. */
    return <div className="hairline mt-10" />;
  }

  if (!resolved.length) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">Nothing is saved.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          Press the bookmark on any colourway and it waits here. The list lives
          in this browser, not in your account, so it will not follow you to
          another machine.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/eyewear">Browse all frames</CtaLink>
          <CtaLink href="/bag" kind="secondary">
            The bag
          </CtaLink>
        </div>
      </div>
    );
  }

  /* Only what the workshop can actually send. "Add all" that silently
     skips two of five is a button that lies about what it did, so the
     count is on the label and the skipped ones are named underneath. */
  /* A garment is held without a size — the bookmark on a card knows the
     colour and nothing else — and a size cannot be guessed on the reader's
     behalf, so the sweater is never part of "Add all". It gets a way back
     to its own page instead, where the size is asked for. */
  const addable = resolved.filter((r) => r.entry?.available && !r.garment);
  /* Only the genuinely gone. A garment sits outside "Add all" because it
     needs a size, not because the workshop is out of it — counting it here
     put "one held colourway is out of the workshop" under a sweater that
     is in stock, which is the interface calling a stocked piece sold. */
  const skipped = resolved.filter((r) => !r.entry?.available).length;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <p className="t-caption">
          {resolved.length} {resolved.length === 1 ? "piece" : "pieces"} held
        </p>
        {addable.length > 0 ? (
          <CtaButton
            onClick={() =>
              addable.forEach((r) => add(r.line.slug, r.line.colorway, 1))
            }
          >
            {addable.length === resolved.length
              ? "Add all to bag"
              : `Add ${addable.length} to bag`}
          </CtaButton>
        ) : null}
      </div>

      {skipped > 0 ? (
        <p className="t-caption mt-3 text-[var(--fg-quiet)]">
          {skipped === 1
            ? "One held colourway is out of the workshop and cannot be added."
            : `${skipped} held colourways are out of the workshop and cannot be added.`}
        </p>
      ) : null}

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map((r) => {
          const { line, house, entry } = r;
          /* The shop grid's own square render — see cardImageFor. */
          const image = house ? cardImageFor(house, line.colorway) : lineImage(r);
          const gone = !entry || !entry.available;
          return (
            /* The SAME card the rest of the site is built from.
            
               This list used to hand-roll its own: a plate, a name, a
               caption and a price, assembled here and drifting from the
               grids every time one of them was touched. The bookmark was
               the visible symptom — pinned to the corner of the photograph
               on this page and beside the name everywhere else — but the
               spacing, the hover and the heading level were all its own
               too. `ProductCard` now draws it, and the only thing this file
               still decides is what the card SAYS. */
            <ProductCard
              key={`${line.slug}:${line.colorway}`}
              href={house || r.garment ? lineHref(r) : "/eyewear"}
              image={image}
              /* The acetate under the photograph, for the colourways the
                 shoot has not reached. */
              swatch={swatchFor(line.colorway)}
              name={lineName(r)}
              as="h2"
              meta={line.colorway}
              price={entry ? formatPrice(entry.cents) : undefined}
              soldOut={gone}
              holdSlug={line.slug}
              holdColorway={line.colorway}
              detail={gone ? "Out of the workshop" : undefined}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              action={
                gone && house ? (
                  <Link href={shopHref(house, line.colorway)} className="link-quiet link-quiet--micro">
                    Ask to be written to
                  </Link>
                ) : !gone && r.garment ? (
                  /* See the note on `addable`: the size is chosen on the
                     garment's own page, so this is a door and not a
                     purchase. */
                  <Link href={lineHref(r)} className="link-quiet link-quiet--micro">
                    Choose a size
                  </Link>
                ) : !gone ? (
                  <CtaButton onClick={() => add(line.slug, line.colorway, 1)}>
                    Add to bag
                  </CtaButton>
                ) : null
              }
            />
          );
        })}
      </div>
    </>
  );
}
