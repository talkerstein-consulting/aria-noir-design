"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Close } from "@/lib/product";
import type { House } from "@/lib/navigation";
import {
  COLLECTION_LABEL,
  defaultColorway,
  galleryFor,
  plateRatio,
  priceOf,
  sillFor,
  squareFor,
  stockFor,
  swatchFor,
} from "@/lib/shop";
import { useBag, openBag } from "@/lib/cart";
import { CtaButton, CtaLink } from "@/components/cta-link";
import { tryOnHref } from "@/lib/try-on";
import { ColourwayPicker } from "@/components/shop/colourway-picker";
import { HoldToggle } from "@/components/shop/hold-toggle";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { RevealText } from "@/components/reveal";
import { SPIN } from "@/components/shop/spin-plate";
import { QuarterPlate } from "@/components/shop/quarter-plate";
import { turntableStem } from "@/lib/turntable";
import { setStoryOffer } from "@/lib/story-offer";

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
  pdpHero = false,
}: {
  close: Close;
  house: House;
  /**
   * The counter drawn as the buy page's own hero: `.buy-grid`, the offer
   * panel, and a still of the frame at the quarter in place of the two
   * photographs. It is the shape the walk into `/shop/[slug]` lands in
   * (see StoryHandoff), so standing in it already is what makes that walk
   * seamless. No ground of its own, so it sits on the InvertFade's paper.
   */
  pdpHero?: boolean;
}) {
  /* Seeded with the same rule the picker seeds itself with, so the first
     photograph shown and the first swatch marked agree on the first
     frame. */
  const [chosen, setChosen] = useState<string | null>(
    () => defaultColorway(house) || null,
  );
  const [qty, setQty] = useState(1);
  /* The walk into the buy page draws a copy of this counter, so it has to
     know which acetate and how many it is showing. See lib/story-offer
     for why it travels through a store. */
  useEffect(() => {
    setStoryOffer({ slug: house.slug, colourway: chosen, qty });
  }, [house.slug, chosen, qty]);
  /* What went in, held so the sheet can name it. Null when the sheet is
     down. It is a SNAPSHOT rather than a read of `chosen` and `qty`: the
     picker behind the sheet stays live, and a confirmation that changed
     its mind about what it was confirming would be worse than none. */
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

  const tryOn = tryOnHref(house.slug, chosen);

  const stem = turntableStem(house.slug, chosen);
  const spin = !!stem && SPIN.has(stem);

  /* ---- the empty grey box under the plate ----

     The buy page's photograph column is the turntable's plate and then
     one photograph of the acetate. The counter has the plate and nothing
     under it, so the bottom of its first screen was paper where the buy
     page's is a picture — the last element the hand-off had left to
     disagree about.

     It stands the picture's GROUND here, at the picture's own box: the
     same tile grey, the same width, the same ratio, empty. The counter
     does not show the photograph (a reader has just come down a page of
     them), the buy page slides it into this box a beat after it lands,
     and the frame the route changes on is the same on both sides.

     The box is worked out the way buy-hero works out what to draw, from
     the same two helpers, so a colourway shot square and one shot 16:9
     each reserve the room their own photograph needs. */
  const nextSquare = squareFor(house, chosen ?? undefined);
  const nextShot = nextSquare ?? galleryFor(house, chosen ?? undefined)[0];
  const nextRatio = nextShot
    ? nextSquare
      ? 1
      : (plateRatio(nextShot) ?? 16 / 9)
    : null;

  const addToBag = () => {
    if (!chosen) return;
    add(house.slug, chosen, qty);
    /* The bag itself, not a panel of its own that says the bag changed.
       Same module the nav's Bag opens, on every buy control on the site
       (Rems, 20 Nov). */
    openBag();
  };

  /* The buy page's Buy now, here too: the counter is the end of the
     story, and a reader who has decided should be able to check out from
     it without a detour through /shop. Same bag, same route. */
  const router = useRouter();
  const buyNow = () => {
    if (!chosen) return;
    add(house.slug, chosen, qty);
    router.push("/checkout");
  };

  return (
    <section
      id="acquire"
      className={`relative px-6 sm:px-10 ${pdpHero ? "on-paper buy-section pb-24 sm:pb-32" : "section on-ink bg-ink"}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* The close, still the close.

            `data-counter="close"` where the walk is watching: these are
            the words the buy page does not have, and they are the last
            of this section to pass under the nav. StoryHandoff fades
            them out as they go, so the screen the route changes on holds
            nothing the destination lacks. */}
        <div
          data-counter="close"
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
        >
          {close.eyebrow ? <p className="hidden t-eyebrow preheader">{close.eyebrow}</p> : null}
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
        {pdpHero ? (
          /* ---- the counter, in the buy page's own shape ----

              Not a centred stack any more. This section is the first
              frame of the walk into `/shop/[slug]` (see StoryHandoff),
              and the walk is only as seamless as the distance it has to
              cover: a centred column going to a two-column panel was a
              whole layout changing while the reader scrolled, covered by
              a cross-fade.

              So the counter IS the buy page's hero: `.buy-grid`, the
              panel on the right with the same lines in the same order,
              the square plate on the left, and the phone's lead copy of
              it above the panel — the same three children, the same
              classes, the same stylesheet. What the walk moves is now the
              gap between two instances of one layout, which on a wide
              screen is close to nothing.

              `data-counter` on each piece is what StoryHandoff measures.
              Nothing here is styled by them. */
          <div className="buy-grid mx-auto mt-16 grid max-w-7xl grid-cols-1 items-start sm:mt-20">
            {/* ---- the offer ---- */}
            <div className="buy-panel buy-grid-panel">
              <div className="buy-panel-inner">
                {/* The buy page's own first line, and hidden here for
                    the same reason it is hidden there: the house rule
                    against preheaders takes out any eyebrow sitting on
                    top of a heading. It stays in the markup because this
                    panel is the buy page's panel; it never draws, so the
                    walk never measures it. */}
                <p data-counter="eyebrow" className="t-eyebrow">
                  {COLLECTION_LABEL}
                </p>
                <h3 data-counter="name" className="t-display-lg mt-3">
                  {house.name}
                </h3>
                <p data-counter="colourway" className="buy-colourway mt-2">
                  {chosen}
                </p>

                <div data-counter="picker" className="mt-6">
                  <Suspense fallback={null}>
                    <ColourwayPicker house={house} onChoose={setChosen} />
                  </Suspense>
                </div>

                <p
                  data-counter="note"
                  className="t-body mt-6 text-[var(--fg-tertiary)]"
                >
                  {house.note}
                </p>

                <p
                  data-counter="price"
                  className="buy-price mt-6 tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {priceOf(house, chosen ?? undefined)}
                </p>

                <div className="hairline mt-6 pt-6">
                  <div className="buy-slot max-lg:mt-0 mt-2">
                    <div data-counter="row" className="buy-row">
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
                  </div>

                  {/* The hook goes on a wrapper, not on the CTA: CtaButton
                      and CtaLink read their props and draw their own
                      element, so a `data-` attribute handed to either of
                      them never reaches the DOM and the walk would have
                      found nothing to measure. */}
                  {available ? (
                    <div data-counter="buynow" className="mt-3">
                      <CtaButton
                        kind="secondary"
                        className="cta-buy-now w-full"
                        onClick={buyNow}
                      >
                        Buy now
                      </CtaButton>
                    </div>
                  ) : null}
                  {/* The buy page's own last block, condition and all:
                      Try these on beside a phone-only Add to bag. It is
                      rendered whenever either of them has something to
                      say, because the buy page renders it then — and a
                      block the destination has and the counter does not
                      is 12px of drift in everything below it. */}
                  {tryOn || available ? (
                    <div
                      data-counter="tryon"
                      className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-1"
                    >
                      {tryOn ? (
                        <CtaLink
                          href={tryOn}
                          kind="secondary"
                          className={
                            available
                              ? "w-full"
                              : "col-span-2 w-full lg:col-span-1"
                          }
                        >
                          Try these on
                        </CtaLink>
                      ) : null}
                      {available ? (
                        <div className={tryOn ? "lg:hidden" : "col-span-2 lg:hidden"}>
                          <CtaButton
                            className="w-full"
                            alt="Add again"
                            swapped={inBag}
                            onClick={addToBag}
                          >
                            Add to bag
                          </CtaButton>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <p data-counter="caption" className="t-caption mt-6">
                    {available
                      ? "Ships in 3–5 days. Free worldwide standard shipping."
                      : "Made in runs. This colourway returns with the next one."}
                  </p>

                  {available ? null : (
                    <HoldToggle
                      slug={house.slug}
                      colorway={chosen}
                      className="mt-6"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ---- the frame, still, at the quarter ----

                A STILL, and the still is the quarter — the angle every
                turntable opens on and the one the shop tiles show. The
                plate the buy page opens on is the same photograph at the
                same angle in the same box, so the walk carries one
                picture from here to there rather than cross-fading
                between three views of one object.

                The turn itself is not lost: the offering section higher
                up the page has the full turntable, which is where a
                reader who wants to turn the frame already is.

                Twice, as the buy page draws it: the lead above the panel
                on a phone, the first plate of the column on a wide
                screen. The stylesheet hides whichever is not wanted, and
                both carry the hook — StoryHandoff measures the one that
                is actually drawn. */}
            <CounterPlate
              stem={stem}
              spin={spin}
              alt={`${house.name} in ${chosen}`}
              className="buy-grid-lead"
              priority={false}
            />
            <div className="buy-grid-photos stack stack--sm">
              <CounterPlate
                stem={stem}
                spin={spin}
                alt={`${house.name} in ${chosen}`}
              />
              {nextRatio ? (
                <div
                  aria-hidden
                  className="shop-tile w-full"
                  style={{ aspectRatio: nextRatio }}
                />
              ) : null}
            </div>
          </div>
        ) : (
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
                    sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    /* cover is safe: the box is the plate's own ratio. */
                  />
                ) : null}
              </div>
            ))}
          </div>

          {/* the offer */}
          <div className="lg:sticky lg:top-32">
            <p className="hidden t-eyebrow preheader">{COLLECTION_LABEL}</p>
            <h3 className="t-display-lg mt-3">{house.name}</h3>
            <p className="buy-colourway mt-2">{chosen}</p>

            <p className="buy-price mt-6 tabular-nums" aria-live="polite" aria-atomic="true">
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

              {available ? (
                <CtaButton kind="secondary" className="cta-buy-now mt-3 w-full" onClick={buyNow}>
                  Buy now
                </CtaButton>
              ) : null}
              {tryOn ? (
                <CtaLink href={tryOn} kind="secondary" className="mt-3 w-full">
                  Try these on
                </CtaLink>
              ) : null}
              <p className="t-caption mt-6">
                {available
                  ? "Ships in 3–5 days. Free worldwide standard shipping."
                  : "Made in runs. This colourway returns with the next one."}
              </p>

              {/* Out of the workshop, the caption promises a hold — so the
                  hold is here, not only on the buy page. In stock it stays
                  off: this counter's one job is the bag. */}
              {available ? null : (
                <HoldToggle slug={house.slug} colorway={chosen} className="mt-6" />
              )}

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
        )}
      </div>

    </section>
  );
}

/**
 * The square plate the counter stands the frame on.
 *
 * The buy page's `.shop-tile` box at the buy page's own ratio, holding
 * the quarter still — see QuarterPlate for why the quarter and why it is
 * drawn edge to edge rather than inset. Where a house has no rendered
 * turn, the cut-out still stands in, inset by its own 8%: the honest
 * difference between a render and a cut-out, not a layout to match.
 *
 * `data-counter="plate"` is the hook StoryHandoff measures. It is on both
 * copies — the phone's lead and the column's first plate — because the
 * stylesheet hides one of them at every width and the walk asks for
 * whichever is drawn.
 */
function CounterPlate({
  stem,
  spin,
  alt,
  className = "",
  priority = false,
}: {
  stem: string | null | undefined;
  spin: boolean;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!stem) return null;
  return (
    <div
      data-counter="plate"
      className={`shop-tile relative aspect-square w-full overflow-hidden [@media(orientation:landscape)_and_(max-height:540px)]:mx-auto [@media(orientation:landscape)_and_(max-height:540px)]:max-w-[78svh] ${className}`}
    >
      {spin ? (
        <QuarterPlate key={stem} stem={stem} alt={alt} priority={priority} />
      ) : (
        <Image
          key={stem}
          src={`/images/fronts-cut/${stem}.webp`}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
          priority={priority}
          className="object-contain p-[8%] mix-blend-multiply"
        />
      )}
    </div>
  );
}
