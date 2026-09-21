"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { House } from "@/lib/navigation";
import { defaultColorway, stockFor, swatchFor } from "@/lib/shop";

/**
 * Pick a colourway.
 *
 * This used to own the price and the buy button as well. It no longer does:
 * the panel around it lays those out in the order a buyer reads them —
 * name, description, price, rule, colour, quantity, buy — and a component
 * that held three of those would be deciding that order from the inside.
 * What is left is one job: which acetate.
 *
 * ---- Thumbnails where there is a photograph, swatches where there is not
 *
 * A thumbnail is a claim about what the acetate looks like, so it is only
 * ever a macro OF that colourway. ARCA I has the shoot and gets pictures;
 * the other five keep the flat swatch, which is visibly an approximation
 * rather than a photograph of the wrong frame under the right name. Both
 * render at the same size in the same row, so a mixed house would still
 * read as one control — see SWATCHES in lib/shop for what the hexes claim.
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
  /** Told whenever the acetate changes, so the column of photographs beside
   *  the picker can re-shoot itself and the price can follow. */
  onChoose?: (colourway: string) => void;
}) {
  /* The STORE's list, not the catalogue's. `colorwayNames` is what the
     house makes; this is what it currently sells, and a picker is an offer
     — offering a colourway the storefront has never heard of is a link to
     a 404 dressed as a product. */
  const stock = stockFor(house);
  const asked = useSearchParams().get("colourway");
  /* The same rule the panel and the turntable use, not a second copy of
     it: the frame that opens the page turning has to be the frame this
     control says is selected. */
  const [chosen, setChosen] = useState(() => defaultColorway(house, asked));
  /* Announce the opening position too, not only the changes — the first
     thing shown has to agree with the first thing selected. */
  useEffect(() => {
    if (chosen) onChoose?.(chosen);
  }, [chosen, onChoose]);

  return (
    <div className="stack stack--sm">
      <div className="flex items-baseline justify-between gap-6">
        <p className="t-eyebrow">Colourway</p>
        {/* The chosen name is repeated here rather than only under its
            thumbnail. At six or eight across, the label under the selected
            square is easy to lose, and the reader is about to spend money
            on the strength of it. */}
        <p className="t-label text-[var(--fg-primary)]">{chosen}</p>
      </div>

      {/* A `div`, not a `ul`. This was a list of list items with
          `role="radiogroup"` on the list — which REPLACES the list
          semantics, leaving every `<li>` inside it orphaned: a list item
          with no list, which is a real error in the accessibility tree and
          not a lint preference. A radiogroup's children are its radios;
          there is no list here to keep. */}
      <div
        className="mt-3 flex flex-wrap gap-3"
        role="radiogroup"
        aria-label="Colourway"
      >
        {stock.map(({ colorway: name, available: inStock }) => {
          const on = name === chosen;
          return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={inStock ? name : `${name} — out of the workshop`}
                disabled={!inStock}
                onClick={() => setChosen(name)}
                /* ---- Fetch the mesh while the hand is still travelling ----
                
                   Each colourway has its own glb (~830kb). Prefetching all
                   of them on arrival made the swap instant and cost close
                   to 6MB on a house with seven acetates, most of it for
                   frames nobody presses.
                
                   The pointer entering a swatch is the reliable warning
                   that a press is coming, and the last inch of travel is a
                   few hundred milliseconds — enough for a Draco mesh off a
                   warm connection. `onFocus` is the keyboard's equivalent:
                   arrowing onto a swatch starts the same fetch.
                
                   `preloadModels` is idempotent, so a reader sweeping the
                   row costs one fetch per acetate, not one per crossing. */
                title={name}
                className="swatch swatch--thumb"
                data-on={on}
                data-out={!inStock}
              >
                {/* One flat chip per acetate, the catalogue's swatch colour
                    and nothing else: a row of macro photographs was eight
                    different crops at eight different scales, and read as a
                    gallery rather than as a control. */}
                <span
                  aria-hidden
                  className="swatch-chip"
                  style={{ background: swatchFor(name) }}
                />
              </button>
          );
        })}
      </div>
    </div>
  );
}
