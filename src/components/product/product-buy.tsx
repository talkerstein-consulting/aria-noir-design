"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import type { Close } from "@/lib/product";
import type { House } from "@/lib/navigation";
import {
  COLLECTION_LABEL,
  defaultColorway,
  galleryFor,
  plateRatio,
  priceOf,
  sillFor,
  stockFor,
  swatchFor,
} from "@/lib/shop";
import { useBag } from "@/lib/cart";
import { CtaButton } from "@/components/cta-link";
import { ColourwayPicker } from "@/components/shop/colourway-picker";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { BagAdded } from "@/components/shop/bag-added";
import { RevealText } from "@/components/reveal";

/**
 * The page closes on the thing it has been arguing about, and the reader
 * can buy it here.
 *
 * This is the last section of the story page, where the closing block used
 * to be. The closing block made a fourth offer to acquire the frame and
 * sent the reader somewhere else to take it; fourteen sections of argument
 * ending in another link is the story page's oldest problem. The argument
 * now ends at a counter: one photograph, the acetate, how many, and the
 * bag.
 *
 * ---- It is NOT a second buy page ----
 *
 * `/shop/[slug]` is still the master template and still the whole
 * transaction — the colourway gallery, the turntable, the four panels a
 * buyer checks before spending money, the rest of the catalogue. This is
 * the short form of the same offer, built from the same parts (the picker,
 * the stepper, the bag, `priceOf`) rather than from a copy of them, so a
 * colourway going out of the workshop changes both at once.
 *
 * TWO image slots, and no more. The reader has just come down a page of
 * photography; a gallery here would be the shoot again. The slots re-shoot
 * themselves when the acetate changes, which is the only picture this
 * section owes anyone — what the colour they just picked looks like, at
 * the ratio it was photographed at.
 *
 * The copy is the closing block's, unchanged: the heading and the body
 * still land, they simply land above a counter instead of above a link.
 * `close.cta` is NOT drawn here — see the note where it used to be.
 */
export function ProductBuy({
  close,
  house,
}: {
  close: Close;
  house: House;
}) {
  /* Seeded with the same rule the picker seeds itself with, so the first
     photograph shown and the first swatch marked agree on the first
     frame. */
  const [chosen, setChosen] = useState<string | null>(
    () => defaultColorway(house) || null,
  );
  const [qty, setQty] = useState(1);
  /* What went in, held so the sheet can name it. Null when the sheet is
     down. It is a SNAPSHOT rather than a read of `chosen` and `qty`: the
     picker behind the sheet stays live, and a confirmation that changed
     its mind about what it was confirming would be worse than none. */
  const [added, setAdded] = useState<{ colorway: string; qty: number } | null>(
    null,
  );
  const { add, lines, ready } = useBag();

  /* The bag's own answer, not `added`, for the reasons written out at the
     same line in buy-hero.tsx: `added` dies with the sheet, and the label
     has to outlive it. */
  const inBag =
    ready &&
    chosen !== null &&
    lines.some((l) => l.slug === house.slug && l.colorway === chosen);

  const available =
    stockFor(house).find((e) => e.colorway === chosen)?.available === true;
  /* TWO shots of the chosen acetate, stacked, rather than one.

     The colourway photography is 1920x1080. The slot was a single 4:5
     portrait box filled with `object-cover`, which is a 16:9 frame with
     forty percent of its width cut off to fit — on a page whose whole
     argument is the geometry of the thing, shown by cropping the geometry.
     Two 16:9 slots hold the pair at the ratio they were shot at, and the
     column ends up about the height the portrait box was.

     The campaign's sill frame LEADS where the house has one. It is the
     same composition for every acetate in the run - same sill, same
     window, same hour - so moving the picker changes the colour of the
     frame and nothing else. The storefront's numbered set is eight
     separate sessions, where moving the picker moves the whole photograph
     and the colour is the hardest thing in it to see. It still follows
     underneath as the second slot, which is where a different angle
     belongs.

     `galleryFor` falls back through per-colourway gallery, per-colourway
     plate, then the house plate, and returns nothing at all rather than a
     sibling colour's photograph. A colour with only one shot renders one
     slot; the flat acetate underneath is honest about being an
     approximation where there is none. */
  const sill = sillFor(house, chosen ?? undefined);
  const shot = galleryFor(house, chosen ?? undefined);
  const images = (sill ? [sill, ...shot.filter((s) => s !== sill)] : shot).slice(
    0,
    2,
  );
  const acetate = swatchFor(chosen ?? house.colorwayNames[0]);

  const addToBag = () => {
    if (!chosen) return;
    add(house.slug, chosen, qty);
    setAdded({ colorway: chosen, qty });
  };

  return (
    <section
      id="acquire"
      className="on-ink section relative bg-ink px-6 sm:px-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* The close, still the close. */}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          {close.eyebrow ? <p className="t-eyebrow">{close.eyebrow}</p> : null}
          {close.heading ? (
            <RevealText
              as="h2"
              text={close.heading}
              className="font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-6xl md:text-7xl"
            />
          ) : null}
          {/* All three are optional. A deck whose gallery already closed on
              a line arrives here with nothing to say and says nothing; the
              counter below is the whole of the section. */}
          {close.body ? (
            <p className="t-body max-w-xl text-pretty text-[var(--fg-tertiary)]">
              {close.body}
            </p>
          ) : null}
        </div>

        {/* ---- the counter ---- */}
        <div className="mt-20 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* the slots, re-shot by the picker */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {(images.length ? images : [null]).map((src, i) => (
              /* One width, each plate its own height — the same rule the
                 buy page's column runs, so the two surfaces show the same
                 photographs at the same proportions. See plateRatio. */
              <div
                key={src ?? i}
                className="relative w-full overflow-hidden"
                style={{
                  background: acetate,
                  aspectRatio: (src ? plateRatio(src) : undefined) ?? 16 / 9,
                }}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={`${house.name} in ${chosen}`}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    /* cover is safe: the box is the plate's own ratio. */
                  />
                ) : null}
              </div>
            ))}
          </div>

          {/* the offer */}
          <div className="lg:sticky lg:top-32">
            <p className="t-eyebrow">{COLLECTION_LABEL}</p>
            <h3 className="t-display-lg mt-3">{house.name}</h3>
            <p className="buy-colourway mt-2">{chosen}</p>

            <p className="buy-price mt-6 tabular-nums">
              {priceOf(house, chosen ?? undefined)}
            </p>

            <div className="hairline mt-8 pt-8">
              <Suspense fallback={null}>
                <ColourwayPicker house={house} onChoose={setChosen} />
              </Suspense>

              <div className="buy-row mt-10">
                <QtyStepper value={qty} onChange={setQty} />
                {available ? (
                  <CtaButton
                    className="flex-1"
                    alt="Add again"
                    swapped={inBag}
                    onClick={addToBag}
                  >
                    Add to bag
                  </CtaButton>
                ) : (
                  <button type="button" className="cta-main flex-1" disabled>
                    Out of the workshop
                  </button>
                )}
              </div>

              <p className="t-caption mt-6">
                {available
                  ? "Ships in 3–5 days. Free worldwide standard shipping."
                  : "Made in runs. Tell us and we will write when this one returns."}
              </p>

              {/* No second way out of here.
              
                  There was a "Discover <house>" beneath the bag — a
                  secondary link to the very page this counter is the short
                  form of. By the time a reader reaches it they have passed
                  a buy CTA at the foot of every section above (see
                  StoryBuy), so it was the page's ninth offer of the same
                  destination and the last thing it said. The counter is the
                  end: pick the acetate, pick how many, buy it. */}
            </div>
          </div>
        </div>
      </div>

      {added ? (
        <BagAdded
          house={house}
          colorway={added.colorway}
          qty={added.qty}
          onClose={() => setAdded(null)}
        />
      ) : null}
    </section>
  );
}
