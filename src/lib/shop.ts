import { houses, type House } from "@/lib/navigation";
import { CATALOGUE, type CatalogueEntry } from "@/lib/catalogue";

/**
 * The commerce layer: where a frame is bought, and what a colourway looks
 * like before its photograph exists.
 *
 * ---- There is no cart in this application, and that is the design ----
 *
 * The catalogue, the stock, the tax and the checkout all live on Shopify —
 * the same surface `ACCOUNT_URL` already points at. This site is the
 * argument for a frame; the shop is the transaction. Rebuilding a cart here
 * would mean a second inventory that can disagree with the real one, and
 * the first time it does, someone buys a frame the workshop does not have.
 *
 * So "buy" is a link out, straight to the product the reader chose. What
 * the store sells, at what price, and whether it is in stock is synced from
 * the storefront's own feed by scripts/sync-catalogue.mjs — never guessed
 * here, because every guess this file made before that script was wrong.
 */

/** The storefront. Verified live — this and /collections/all both answer,
 *  and scripts/sync-catalogue.mjs reads its product feed. */
export const SHOP_URL = "https://arianoir.com";

/**
 * Everything the shop sells, not just the frames.
 *
 * The house's storefront carries more than eyewear, and a product page that
 * can only send you to five more pairs of glasses is a smaller shop than
 * the one that exists. This is the way out to the rest of it.
 */
export const SHOP_ALL_URL = `${SHOP_URL}/collections/all`;

/**
 * What the store actually sells for this house, in the order the store
 * lists it. Empty for a house the storefront does not carry.
 */
export function stockFor(house: House): readonly CatalogueEntry[] {
  return CATALOGUE[house.slug] ?? [];
}

export function entryFor(house: House, colorway: string) {
  return stockFor(house).find((e) => e.colorway === colorway);
}

/**
 * A colourway's product page.
 *
 * Every colourway is its own Shopify PRODUCT, not a variant of one, and the
 * handles do not follow a rule — `ahava` is Root Beer Float, `arca` is
 * ARCA II Noir, `matriarca` is Brown. Guessing `/products/<slug>` 404s for
 * all six houses, which is why the handle is synced rather than derived.
 *
 * Falls back to the collection rather than to a broken product URL: a
 * reader who lands on the eyewear collection can still find the frame; one
 * who lands on a 404 has been thrown out of the shop.
 */
export function shopHref(house: House, colorway?: string) {
  const entry = colorway ? entryFor(house, colorway) : stockFor(house)[0];
  return entry ? `${SHOP_URL}/products/${entry.handle}` : SHOP_ALL_URL;
}

/**
 * Acetate, by name.
 *
 * ⚠️ These hexes are STAND-INS. The colourway names are real — read off the
 * 3D source set, see `colorwayNames` in lib/navigation — but nobody has
 * measured the acetate, and a hex is a claim about a material. They are
 * pitched to be honest about family (a tortoise is browner than a noir, a
 * Velvet Rose is not the same pink as a Dreamy Rose) and no more precise
 * than that, so a swatch reads as "roughly this" rather than a colour
 * match. Replace with the real values the moment the house supplies them.
 *
 * Keyed by name rather than per house on purpose: Noir is the same acetate
 * whichever cut it is poured for, and six houses each holding their own
 * copy of it is six chances for them to drift apart.
 */
export const SWATCHES: Record<string, string> = {
  /* The house black, and its variants. */
  Noir: "#141416",
  "Midnight Noir": "#111318",
  Black: "#1a1a1a",
  "Black Wood": "#2b2621",

  /* ARCA I names its cuts by colour — the shape and the acetate are one
     decision in that house, which is why these read as compound names. */
  "Z White": "#e8e4dc",
  "K Black": "#151515",
  "Proceso Brown": "#5b4130",
  "309 Blue": "#2f3d55",

  /* The browns and the tortoises. */
  Brown: "#6b4a2f",
  "Dark Tortoise": "#4a3220",
  "Caramel Stripe": "#8a5a2e",
  "Root Beer Float": "#6d4526",

  /* The colour run. */
  "Tutti Frutti": "#a8506a",
  Rose: "#b4707a",
  "Dreamy Rose": "#c08a92",
  "Velvet Rose": "#8d5b6a",
  "Pixie Dust": "#cbb6c4",
};

/** Anything unrecognised falls back to a neutral acetate rather than to
 *  nothing — a missing swatch should look like a frame, not like a bug. */
export const SWATCH_FALLBACK = "#3a3a3a";

export function swatchFor(name: string) {
  return SWATCHES[name] ?? SWATCH_FALLBACK;
}

/**
 * Stock, from the store rather than from a note in this repo.
 *
 * MATRIARCA's Black Wood is the one colourway currently out, which the
 * catalogue copy already said in prose ("currently out of the workshop")
 * and nothing enforced. It is now enforced by the same feed that decides
 * it on the storefront, so the two cannot drift: the buy page greys the
 * swatch and refuses the sale exactly when Shopify would.
 *
 * A colourway the store does not list at all is also unavailable — that is
 * the honest reading of "we do not sell this".
 */
export function isAvailable(house: House, colorway: string) {
  return entryFor(house, colorway)?.available === true;
}

/** Shopify gives price per colourway, not per house, and the spread is
 *  real: AHAVA's Dark Tortoise is $225 against $200 for the rest of its
 *  run, MONARCA's Velvet Rose $247.50 against $150. A single house price
 *  would under-quote three frames. */
export function priceOf(house: House, colorway?: string) {
  const entry = colorway ? entryFor(house, colorway) : undefined;
  const cents =
    entry?.cents ??
    /* No colourway chosen, or one the store does not carry: the opening
       price of whatever it does carry. */
    Math.min(...stockFor(house).map((e) => e.cents), house.from * 100);
  return formatPrice(cents);
}

export function formatPrice(cents: number) {
  /* Whole dollars where the price is whole — the store prices most frames
     at round numbers and "$200.00" is a receipt, not a price tag. */
  return cents % 100 === 0
    ? `$${cents / 100}`
    : `$${(cents / 100).toFixed(2)}`;
}

export function houseBySlug(slug: string) {
  return houses.find((h) => h.slug === slug);
}

/**
 * The collection this house is sold in, for the buy page's preheader.
 *
 * The storefront files every frame under a collection of the house's own
 * name — `arca-i`, `monarca` — which would print the h1 twice, once small
 * and once large. The collection worth naming is the one that distinguishes
 * this from the rest of the shop, and the store's own split is eyewear
 * against apparel. All six houses are the former, which is why this is one
 * label rather than a lookup — the day the site sells the alpaca knitwear
 * the storefront already carries, it becomes a field on the catalogue.
 */
export const COLLECTION_LABEL = "Eyewear";

/**
 * The left column: the chosen colourway, and nothing else.
 *
 * It used to append the house's own editorial set after the colourway's
 * frames, which meant scrolling past 309 Blue landed you on a hinge macro
 * of a different acetate. A buy page's photographs are evidence about the
 * thing being bought, so a picture of another colour is not a bonus
 * picture — it is the wrong one.
 *
 * A house with no shoot for this colour still falls back to its single
 * plate, which is the house rather than the colourway; that is the last
 * honest picture available, and the panel says which colour is chosen
 * regardless. Where even that is missing the caller renders the acetate.
 */
export function galleryFor(house: House, colorway?: string): readonly string[] {
  const perColour = colorway ? house.colorwayGallery?.[colorway] : undefined;
  if (perColour?.length) return perColour;
  const shot = colorway ? house.colorwayPlates?.[colorway] : undefined;
  if (shot) return [shot];
  /* No photograph of THIS colour. A house that has a colourway set at all
     shows nothing rather than a sibling's picture; one that has none has
     never claimed to be showing a colourway, so its plate still stands. */
  if (house.colorwayPlates || house.colorwayGallery) return [];
  return house.plate ? [house.plate] : [];
}

/** The macro crop for a colourway's thumbnail — the photograph AND where
 *  in it the acetate sits. Undefined where that colour has not been
 *  photographed and the flat swatch has to stand in. */
export function macroFor(house: House, colorway: string) {
  return house.colorwayMacros?.[colorway];
}

/**
 * How far a colourway thumbnail is magnified. One number, here, because
 * the CSS that scales the image and the arithmetic that aims it have to
 * agree — see focalOrigin.
 *
 * 4, not 2.6: at 2.6 the visible square is about 200px of the source, and
 * the temple bar is only ~150px deep, so blurred concrete came in above and
 * below it and every colourway averaged out grey. This is why the picker
 * asks next/image for a 384px file rather than a 96px one — a thumbnail
 * magnified four times needs the pixels to survive it.
 */
export const MACRO_ZOOM = 4;

/**
 * Turn "where the acetate is in the photograph" into a `transform-origin`.
 *
 * The two are NOT the same percentage, which is the whole reason this
 * exists. A Macro's `position` is measured off the source file, the honest
 * place to measure it. But transform-origin is resolved against the
 * rendered BOX, and two things sit in between:
 *
 *  1. `object-fit: cover` fitting a 16:9 source into a square crops the
 *     sides away — only the middle 56.25% of the image's width survives,
 *     so source x 25% is box x 5.6%. Height is untouched, so y passes
 *     through unchanged.
 *  2. transform-origin names the point that STAYS PUT under a scale, not
 *     the point that ends up in the middle. To land the acetate in the
 *     centre of the thumbnail, the origin has to be solved for:
 *     centre = O + (focal − O) × zoom.
 *
 * Getting either wrong is not a visible error — it is a thumbnail quietly
 * showing blurred concrete, which is exactly what these were doing before.
 */
const COVER_VISIBLE_WIDTH = 56.25; /* 16:9 into 1:1 */
const COVER_LEFT_EDGE = 21.875;

export function focalOrigin(position = "50% 50%", zoom = MACRO_ZOOM) {
  const [sx, sy] = position
    .split(/\s+/)
    .map((n) => Number.parseFloat(n));
  const boxX = ((sx - COVER_LEFT_EDGE) / COVER_VISIBLE_WIDTH) * 100;
  const solve = (p: number) => (zoom * p - 50) / (zoom - 1);
  return `${solve(boxX).toFixed(1)}% ${solve(sy).toFixed(1)}%`;
}

/**
 * Which colourway a page opens on, and the ONE place that decides it.
 *
 * The panel, the picker, the price and the turntable all need this answer
 * and they have to give the same one — a page that opens on a black frame
 * captioned "309 Blue" is broken in the most visible way available. It was
 * previously computed twice, once here and once in the picker, from the
 * same rule; this is that rule, named.
 */
export function defaultColorway(house: House, asked?: string | null) {
  const stock = stockFor(house);
  const wanted = stock.find((e) => e.colorway === asked && e.available);
  const hero = stock.find((e) => e.colorway === house.heroColorway && e.available);
  return (wanted ?? hero ?? stock.find((e) => e.available) ?? stock[0])?.colorway ?? "";
}

/** The turntable for a colourway, falling back to the house's own glb. A
 *  house with neither shows no viewer at all rather than another cut. */
export function modelFor(house: House, colorway?: string | null) {
  return (colorway ? house.colorwayModels?.[colorway] : undefined) ?? house.model;
}
