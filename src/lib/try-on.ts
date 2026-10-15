import { houses } from "@/lib/navigation";
import { isAvailable, priceOf, shopHref, swatchFor } from "@/lib/shop";

/**
 * What the try-on can put on a face: every colourway the bench has
 * modelled, grouped by house, in the order the catalogue lists them.
 *
 * Read from `colorwayModels` and nothing else. A colourway without its own
 * glb is left out rather than shown in another acetate, for the same
 * reason the turntable never borrows a mesh: the mirror is a claim about
 * what the frame looks like on you.
 */

export type TryOnFit = {
  /** Up (+) or down (-), in the face's units: 1 is roughly 1mm. */
  y?: number;
  /** Toward the camera (+) or toward the ears (-), same units. */
  z?: number;
  /** Multiplies the true-to-size scale. Leave at 1 unless a model was
   *  exported at the wrong size. */
  scale?: number;
};

export type TryOnColour = {
  name: string;
  swatch: string;
  model: string;
  href: string;
  price: string;
  available: boolean;
};

export type TryOnHouse = {
  slug: string;
  name: string;
  fit: TryOnFit;
  colours: TryOnColour[];
};

/**
 * Per-house correction on top of the automatic fit (see
 * components/try-on/fit.ts). Empty until each house has been worn in front
 * of a camera and judged; the automatic fit is the baseline, and a house
 * gets an entry here only when it sits visibly wrong.
 */
const FIT: Readonly<Record<string, TryOnFit>> = {};

export function tryOnHouses(): TryOnHouse[] {
  return houses
    .map((house) => ({
      slug: house.slug,
      name: house.name,
      fit: FIT[house.slug] ?? {},
      colours: house.colorwayNames.flatMap((name) => {
        const model = house.colorwayModels?.[name];
        if (!model) return [];
        return [
          {
            name,
            swatch: swatchFor(name),
            model,
            href: shopHref(house, name),
            price: priceOf(house, name),
            available: isAvailable(house, name),
          },
        ];
      }),
    }))
    .filter((house) => house.colours.length > 0);
}
