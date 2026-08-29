"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import type { House } from "@/lib/navigation";
import { SHOP_ALL_URL, stockFor, swatchFor } from "@/lib/shop";
import { CtaLink } from "@/components/cta-link";
import { RevealPlate, RevealText } from "@/components/reveal";
import { ColourwayPicker } from "@/components/shop/colourway-picker";

/**
 * The whole transaction, above the fold: the plate, the name, the picker.
 *
 * It is one client component rather than a server page holding two halves
 * because the two halves are the same fact. Choosing "309 Blue" and being
 * shown the house's default black frame is the buy page disagreeing with
 * itself — so the chosen colourway lives here, at the point where both the
 * picture and the picker can read it.
 *
 * The photograph comes from `colorwayPlates` (see lib/navigation). A house
 * without that set falls back to its single `plate`, and one without even
 * that falls back to its acetate, which is the same ladder the index grid
 * climbs down. Nothing has to know which house it is.
 */
export function BuyHero({ house }: { house: House }) {
  /* Seeded with the picker's OWN default rather than null.
  
     Null meant the first render — the server's — had no colourway, so a
     house with a colourway set rendered the "photography in progress"
     acetate and only became a photograph once the picker mounted and
     announced itself. The page's largest image would arrive after
     hydration, which is the one image on the site that must not. The two
     defaults have to stay the same rule, so this is the picker's, copied:
     first in stock, else first listed. */
  const [chosen, setChosen] = useState<string | null>(() => {
    const stock = stockFor(house);
    return (stock.find((e) => e.available) ?? stock[0])?.colorway ?? null;
  });

  /* ---- Which picture, and what it is honestly a picture OF ----
   *
   * Three cases, and the middle one is the one worth spelling out.
   *
   * The house has this colour shot   → show it. (ARCA I, all four.)
   * The house has a colourway SET,
   *   but not this colour            → show the acetate, not the set's
   *                                    default. ARCA II has one plate for
   *                                    eight colours: falling back to it
   *                                    puts a photograph of the Noir under
   *                                    the words "Velvet Rose", which is a
   *                                    product page lying about the
   *                                    product. The swatch is an
   *                                    approximation and says so; the
   *                                    photograph would be wrong and
   *                                    wouldn't.
   * The house has no set at all      → its single plate, as before. Four
   *                                    houses are here, and none of them
   *                                    claims to be showing a colourway.
   */
  const shot = chosen ? house.colorwayPlates?.[chosen] : undefined;
  const plate = shot ?? (house.colorwayPlates ? null : house.plate);
  const acetate = swatchFor(chosen ?? house.colorwayNames[0]);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      <RevealPlate className="relative aspect-[4/5] overflow-hidden bg-ink lg:sticky lg:top-28">
        {plate ? (
          <Image
            src={plate}
            alt={`${house.name}${chosen ? ` — ${chosen}` : ""}, ${house.material}`}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority
            /* Keyed on the file, so switching colourway mounts a NEW
               element rather than swapping the src on the old one — which
               is what lets the arriving photograph fade up instead of
               popping in. `arca-rise` is the page's own entrance, already
               used by the ARCA hero. */
            key={plate}
            className="arca-rise object-cover"
          />
        ) : (
          /* No photograph of THIS colour. The acetate itself — the same
             bargain the index grid strikes, and the more important one
             here, where the picture is what someone is deciding on. It
             follows the picker, so the panel is at least the right colour
             while it waits for the shoot. */
          <div
            className="flex h-full w-full items-end p-6 transition-colors duration-500"
            style={{
              background: `linear-gradient(160deg, ${acetate} 0%, var(--ink) 82%)`,
            }}
          >
            <span className="t-micro">
              {chosen ? `${chosen} — photography in progress` : "Photography in progress"}
            </span>
          </div>
        )}
      </RevealPlate>

      <div className="stack">
        <p className="t-eyebrow">
          {house.index} — {house.material}
        </p>
        <RevealText as="h1" text={house.name} className="t-display-lg" />
        <p className="t-body t-body--lede mt-2">{house.note}</p>

        <div className="mt-10">
          {/* The picker reads `?colourway=` so a story page can hand over
              the acetate it just showed. Reading search params on a
              prerendered route requires this boundary — without it the
              build fails rather than degrading. */}
          <Suspense fallback={null}>
            <ColourwayPicker house={house} onChoose={setChosen} />
          </Suspense>
        </div>

        {/* The way back out to everything else. A product page whose only
            exits are five more pairs of glasses is a smaller shop than the
            one that exists. */}
        <div className="hairline mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 pt-8">
          <CtaLink href={SHOP_ALL_URL} external tone="quiet">
            Shop all
          </CtaLink>
          <CtaLink href="/eyewear" tone="quiet">
            All six houses
          </CtaLink>
          {house.href ? (
            <CtaLink href={house.href} tone="quiet">
              {`Read the ${house.name} story`}
            </CtaLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}
