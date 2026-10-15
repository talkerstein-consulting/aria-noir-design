import { houses } from "@/lib/navigation";
import { isAvailable, priceOf, shopHref, swatchFor } from "@/lib/shop";

/**
 * What the try-on can put on a face: every colourway the bench has
 * modelled, grouped by house, in the order the catalogue lists them.
 *
 * Read from TRY_ON_MODELS below, then `colorwayModels`. A colourway with
 * neither is left out rather than shown in another acetate, for the same
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

/**
 * The try-on's own models: the second-generation set from the showcase
 * (arianoir-showcase.pages.dev/models/gen2, and /models/ARCAI* for ARCA I),
 * compressed by scripts/build-try-on-models.mjs into public/models/try-on.
 * One file per colourway, `<house slug>-<colourway, kebab-cased>.glb`.
 *
 * They replace the turntable exports here only. The turntables still load
 * public/models/houses; moving them over is a separate decision.
 *
 * A colourway missing from this list falls back to its turntable model.
 */
const TRY_ON_MODELS: ReadonlySet<string> = new Set([
  "ahava-caramel-stripe", "ahava-noir", "ahava-root-beer-float", "ahava-rose", "ahava-tutti-frutti",
  "arca-i-309-blue", "arca-i-k-black", "arca-i-proceso-brown", "arca-i-z-white",
  "arca-ii-caramel-stripe", "arca-ii-dark-tortoise", "arca-ii-dreamy-rose", "arca-ii-noir",
  "arca-ii-pixie-dust", "arca-ii-root-beer-float", "arca-ii-tutti-frutti", "arca-ii-velvet-rose",
  "matriarca-brown", "matriarca-midnight-noir",
  "monarca-caramel-stripe", "monarca-dark-tortoise", "monarca-dreamy-rose", "monarca-noir",
  "monarca-pixie-dust", "monarca-tutti-frutti", "monarca-velvet-rose",
  "patriarca-black", "patriarca-brown", "patriarca-midnight-noir",
]);

function modelFor(slug: string, colour: string, fallback?: string) {
  const key = `${slug}-${colour.toLowerCase().replace(/\s+/g, "-")}`;
  return TRY_ON_MODELS.has(key) ? `/models/try-on/${key}.glb` : fallback;
}

export function tryOnHouses(): TryOnHouse[] {
  return houses
    .map((house) => ({
      slug: house.slug,
      name: house.name,
      fit: FIT[house.slug] ?? {},
      colours: house.colorwayNames.flatMap((name) => {
        const model = modelFor(house.slug, name, house.colorwayModels?.[name]);
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
