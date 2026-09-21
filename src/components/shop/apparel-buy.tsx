"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CtaButton } from "@/components/cta-link";
import { RevealPlate } from "@/components/reveal";
import { HoldToggle } from "@/components/shop/hold-toggle";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { useBag } from "@/lib/cart";
import { formatPrice, plateRatio } from "@/lib/shop";
import { listedColourways, type ApparelCollection, type ApparelColourway } from "@/lib/apparel";

/**
 * El Patrón's buy page.
 *
 * ---- Why it is not `BuyHero` ----
 *
 * The eyewear template is built on the eyewear catalogue: `stockFor`,
 * `CATALOGUE`, `houseBySlug`, a colourway picker keyed to acetate names.
 * A garment has none of that and has something the frames do not — sizes.
 * Forcing one component to serve both would mean a house-or-garment branch
 * at every line of it.
 *
 * What it DOES share is the shape: one square plate on the left, the offer
 * on the right, the detail underneath. A reader moving between a frame and
 * the sweater should not feel they have changed shops.
 *
 * ---- Why the offer stays here ----
 *
 * It used to leave: an "out to Shopify" link per colourway, because the
 * bag resolved its lines against the eyewear catalogue alone and a garment
 * added to it would have carried no price and fallen out of the subtotal.
 * That is no longer true — `resolve` in `lib/cart` now falls through to
 * `apparel` and synthesises a catalogue entry from the colourway, so a
 * garment line prices, totals and checks out like any frame. The reader
 * buys the sweater in the same bag as the glasses, which is the only
 * version of this that is not an apology.
 *
 * ---- Why size is chosen here ----
 *
 * A garment has a size and the frames do not, so the bag line carries an
 * optional `size` and two lines differing only by it are two lines. It is
 * REQUIRED: Add to bag with nothing picked asks for the size rather than
 * guessing a medium, because a guessed size is a return.
 */
export function ApparelBuy({ line }: { line: ApparelCollection }) {
  return (
    <Suspense fallback={null}>
      <ApparelBuyInner line={line} />
    </Suspense>
  );
}

function ApparelBuyInner({ line }: { line: ApparelCollection }) {
  const params = useSearchParams();
  const asked = params.get("colourway") ?? params.get("colorway");
  /* Only what is being sold. The collection carries five yarns and one
     run has been cut, so the picker offers the one — see `listed` in
     lib/apparel. A `?colourway=` for an unlisted yarn falls through to
     the listed one rather than opening a page that cannot be bought. */
  const offered = listedColourways(line);
  const first =
    offered.find((c) => c.name === asked && c.available) ??
    offered.find((c) => c.available) ??
    offered[0] ??
    line.colourways[0];

  const [picked, setPicked] = useState<ApparelColourway | null>(null);
  const chosen = picked ?? first;

  const { add, lines, ready } = useBag();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  /* Raised by a press with no size, cleared the moment one is picked — so
     it is a reply to an action and never a warning the page opens with. */
  const [asking, setAsking] = useState(false);

  /* Already in the bag, for THIS colour in THIS size. Colour alone would
     say "in the bag" to somebody looking at a size they have not bought. */
  const inBag =
    ready &&
    lines.some(
      (l) =>
        l.slug === line.slug &&
        l.colorway === chosen.name &&
        (l.size ?? "") === (size ?? ""),
    );

  const addToBag = () => {
    if (!size) {
      setAsking(true);
      return;
    }
    add(line.slug, chosen.name, qty, size);
  };

  /* ---- The run, and only the run ----
   *
   * The nine photographs the shoot delivered — see `run` on the
   * collection. Not `colourway.image`, which points at the older numbered
   * set the cards were built from.
   *
   * They do not change with the picker, and cannot: the shoot produced a
   * campaign, not a product shot per yarn. Showing the same nine under
   * every swatch is the honest version of that; re-using one colour's
   * photograph to stand for another would be a lie about what is being
   * bought. The colour is named in the offer and carried by the swatch. */
  const plates = line.run;

  return (
    <div className="buy-grid mx-auto grid max-w-7xl grid-cols-1 items-start">
      {/* ---- the offer ---- */}
      <div className="buy-panel buy-grid-panel">
        <div className="buy-panel-inner">
          <p className="t-eyebrow">Apparel</p>
          <h1 className="t-display-lg mt-3">{line.name}</h1>
          <p className="buy-colourway mt-2">{chosen.name}</p>

          <div className="mt-6">
            <p className="t-eyebrow">Colourway</p>
            {/* A `div`, not a `ul`: `role="radiogroup"` replaces list
                semantics and would leave every `<li>` orphaned. Same fix
                the eyewear picker carries. */}
            <div
              className="mt-3 flex flex-wrap gap-3"
              role="radiogroup"
              aria-label="Colourway"
            >
              {offered.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={c.name === chosen.name}
                  aria-label={
                    c.available ? c.name : `${c.name} — out of stock`
                  }
                  disabled={!c.available}
                  title={c.name}
                  onClick={() => setPicked(c)}
                  className="swatch swatch--thumb"
                  data-on={c.name === chosen.name}
                  data-out={!c.available}
                >
                  <span
                    aria-hidden
                    className="swatch-chip"
                    style={{ background: c.swatch }}
                  />
                </button>
              ))}
            </div>
          </div>

          <p className="t-body mt-6 text-[var(--fg-tertiary)]">{line.note}</p>

          <p className="buy-price mt-6 tabular-nums">
            {formatPrice(chosen.cents)}
            {chosen.compareAtCents && chosen.compareAtCents > chosen.cents ? (
              <span className="ml-3 text-[var(--fg-quiet)] line-through">
                {formatPrice(chosen.compareAtCents)}
              </span>
            ) : null}
          </p>

          <div className="hairline mt-6 pt-6">
            <p className="t-eyebrow">Size</p>
            {/* `radiogroup`, like the colourway row above it: these are one
                question with three answers, not three toggles. */}
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Size"
            >
              {line.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={s === size}
                  onClick={() => {
                    setSize(s);
                    setAsking(false);
                  }}
                  className="size-chip"
                  data-on={s === size}
                >
                  {s}
                </button>
              ))}
            </div>
            {asking ? (
              <p className="t-caption size-ask mt-3" role="status">
                Choose a size first.
              </p>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              {chosen.available ? (
                <>
                  <QtyStepper value={qty} onChange={setQty} />
                  <CtaButton
                    className="flex-1"
                    alt="Add again"
                    swapped={inBag}
                    onClick={addToBag}
                  >
                    Add to bag
                  </CtaButton>
                </>
              ) : (
                <p className="t-caption text-[var(--fg-quiet)]">
                  Out of stock in {chosen.name}.
                </p>
              )}
            </div>
            {inBag ? (
              <p className="t-caption mt-3">
                <Link href="/bag" className="link-quiet link-quiet--micro">
                  In the bag — review it
                </Link>
              </p>
            ) : null}

            <p className="t-caption mt-4">
              Ships in 3–5 days. Free worldwide standard shipping.
            </p>

            <HoldToggle
              slug={line.slug}
              colorway={chosen.name}
              className="mt-6"
            />
          </div>
        </div>
      </div>

      {/* ---- the photographs ---- */}
      <div className="buy-grid-photos stack stack--sm">
        {plates.map((plate, i) => (
          <RevealPlate
            key={plate.src}
            className="relative w-full overflow-hidden bg-ink"
            /* The run is a mixed set — portrait models, landscape rooms, a
               square macro — so each plate keeps its own proportion rather
               than being cropped to a shape the shoot did not shoot for. */
            style={{ aspectRatio: plateRatio(plate.src) ?? 4 / 5 }}
          >
            <Image
              src={plate.src}
              alt={plate.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority={i === 0}
              className="object-cover"
            />
          </RevealPlate>
        ))}
      </div>
    </div>
  );
}
