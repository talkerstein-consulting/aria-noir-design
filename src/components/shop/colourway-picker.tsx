"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { House } from "@/lib/navigation";
import { priceOf, shopHref, stockFor, swatchFor } from "@/lib/shop";
import { useBag } from "@/lib/cart";
import { CtaButton } from "@/components/cta-link";
import { CtaLink } from "@/components/cta-link";

/**
 * Pick a colourway, then buy it.
 *
 * The only stateful thing on the buy page, and it holds exactly one value:
 * which acetate. The cut and the specification are the same whichever one
 * you pick — but the PRICE is not, and neither is the stock. On the
 * storefront each colourway is its own product with its own price, so this
 * reads both from the synced catalogue rather than assuming a run is
 * uniform.
 *
 * ---- Swatches, not thumbnails ----
 *
 * Most of these colourways have no photograph. Rather than show four
 * pictures and two grey boxes, every colourway is a swatch: a square of the
 * acetate with its name beside it, which is what a bench hands you anyway.
 * It degrades to nothing, it is honest about being an approximation (see
 * SWATCHES in lib/shop), and it means the row is one object rather than a
 * gallery with holes in it.
 *
 * ---- Out of the workshop ----
 *
 * A colourway the store has marked out of stock is shown, struck, and
 * unselectable. Hiding it would turn "we make this, not right now" into "we
 * do not make this", and the catalogue copy already tells the reader it
 * exists. MATRIARCA's Black Wood is the one this currently applies to, and
 * the storefront agrees — that is where the flag comes from.
 */
export function ColourwayPicker({
  house,
  onChoose,
}: {
  house: House;
  /** Told whenever the acetate changes, so the plate beside the picker can
   *  show the colour being chosen. Optional: the picker is complete on its
   *  own and does not care whether anyone is listening. */
  onChoose?: (colourway: string) => void;
}) {
  /* The STORE's list, not the catalogue's. `colorwayNames` is what the
     house makes; this is what it currently sells, and a picker is an offer
     — offering a colourway the storefront has never heard of is a link to
     a 404 dressed as a product. */
  const stock = stockFor(house);
  const asked = useSearchParams().get("colourway");
  const [chosen, setChosen] = useState(
    (stock.find((e) => e.colorway === asked && e.available) ??
      stock.find((e) => e.available) ??
      stock[0])?.colorway ?? "",
  );
  /* Announce the opening position too, not only the changes — the first
     thing shown has to agree with the first thing selected. */
  useEffect(() => {
    if (chosen) onChoose?.(chosen);
  }, [chosen, onChoose]);

  const entry = stock.find((e) => e.colorway === chosen);
  const available = entry?.available === true;
  const { add } = useBag();
  const [added, setAdded] = useState(false);

  return (
    <div className="stack stack--sm">
      <div className="flex items-baseline justify-between gap-6">
        <p className="t-eyebrow">Colourway</p>
        {/* The chosen name is repeated here rather than only under its
            swatch. At six or eight across, the label under the selected
            square is easy to lose, and the reader is about to spend money
            on the strength of it. */}
        <p className="t-label text-[var(--fg-primary)]">{chosen}</p>
      </div>

      <ul
        className="mt-2 flex flex-wrap gap-3"
        role="radiogroup"
        aria-label="Colourway"
      >
        {stock.map(({ colorway: name, available: inStock }) => {
          const on = name === chosen;
          return (
            <li key={name}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={
                  inStock ? name : `${name} — out of the workshop`
                }
                disabled={!inStock}
                onClick={() => setChosen(name)}
                title={name}
                className="swatch"
                data-on={on}
                data-out={!inStock}
              >
                <span
                  aria-hidden
                  className="swatch-chip"
                  style={{ background: swatchFor(name) }}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-6">
          {/* Priced per colourway. The run is not one price: AHAVA's Dark
              Tortoise is $225 against $200 for its siblings. */}
          <p className="t-display-xs tabular-nums">{priceOf(house, chosen)}</p>
          <p className="t-caption">
            {available ? "Ships in 3–5 days" : "Out of the workshop"}
          </p>
        </div>

        {available ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-10 gap-y-4">
            {/* Two ways out, and they are genuinely different errands.
                The bag is for someone buying a second frame; the direct
                link is for someone who came to buy this one and is done. */}
            <CtaButton
              onClick={() => {
                add(house.slug, chosen);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 2200);
              }}
              alt="In the bag"
              swapped={added}
            >
              Add to bag
            </CtaButton>
            <CtaLink href={shopHref(house, chosen)} external tone="quiet">
              Buy it now
            </CtaLink>
            <CtaLink href="/room" tone="quiet">
              The bag
            </CtaLink>
            <CtaLink href="/contact" tone="quiet">
              Ask about fit
            </CtaLink>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-x-10 gap-y-4">
            <CtaLink href="/contact">Ask when it returns</CtaLink>
          </div>
        )}
      </div>
    </div>
  );
}
