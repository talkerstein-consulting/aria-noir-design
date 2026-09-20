import type { ProductCardProps } from "@/components/product-card";
import type { ApparelCollection } from "@/lib/apparel";
import { apparel } from "@/lib/apparel";
import {
  colorwayCount,
  houses,
  shopPath,
  type House,
} from "@/lib/navigation";
import {
  formatPrice,
  isAvailable,
  priceOf,
  shopHref,
  sillFor,
  swatchFor,
} from "@/lib/shop";

/**
 * ============================================================
 *  WHAT EACH PRODUCT'S CARD SAYS. Written once, per product.
 * ============================================================
 *
 * `components/product-card` is the card's SHAPE — the square, the crop,
 * the hover, the order the facts are read in. It was already shared, and
 * editing it already moved every grid on the site at once.
 *
 * What was not shared is the CONTENT. Each grid composed its own meta line
 * and its own detail line out of the same house record, four times over,
 * and they had drifted exactly the way the card's shape drifted before it
 * was pulled into one file: the house index printed `01 — Block acetate`
 * where the eyewear grid printed `01 · Block acetate`, and the
 * "One cut · seven colourways" sentence was typed out twice, with its
 * singular branch reimplemented each time. Changing what a product's card
 * says meant finding every grid that renders it and hoping.
 *
 * So the facts are derived here, from the catalogue, once per product.
 * A grid now asks for a product's card and gets it.
 *
 * ---- Variants are the differences that are on purpose ----
 *
 * The grids are not meant to be identical, and flattening them would lose
 * arguments that were made deliberately and written down where they were
 * made:
 *
 *   `index`      the house index — everything we make, with what it opens
 *                at. Price, because this grid is a catalogue.
 *   `grid`       the eyewear showcase — the frame worn on hover, the
 *                house's note, and NO price: those pages are the argument
 *                for a frame and a "from $100" would be the only number on
 *                a page with no cart behind it.
 *   `cross-sell` the rail under a buy page — a picture worth following and
 *                nothing else. No price and no colourway count: a
 *                cross-sell carrying a second offer competes with the one
 *                being made above it.
 *
 * The difference between them is now a named variant rather than four
 * files that happen to disagree. A fact common to all three — the meta
 * line, the detail sentence, where the card points — is written once
 * below and changes everywhere on one edit; a fact that belongs to one
 * grid is switched on in that grid's case and nowhere else.
 *
 * ---- These return props, not JSX ----
 *
 * A caller still renders `<ProductCard {...houseCard(house, "grid")} />`,
 * so a grid keeps the last word: the reveal stagger is the grid's own
 * business (it depends on position in the list, which this file cannot
 * know), and a one-off override stays a spread away rather than becoming
 * a fifth variant. What a caller should NOT be doing is retyping the
 * house's meta line, and now it cannot.
 */

export type CardVariant = "index" | "grid" | "cross-sell";

/**
 * The separator between the index numeral and the material.
 *
 * A middot, which is what the rest of the site sets between facts of equal
 * weight; the house index's em dash was the odd one out. One constant
 * because the choice is typographic and belongs in one place.
 */
const META_SEP = "·";

/** "01 · Block acetate" — what it is, at a glance. */
export function cardMeta(house: House) {
  return `${house.index} ${META_SEP} ${house.material}`;
}

/**
 * "One cut · seven colourways" — how deep the range goes.
 *
 * The singular branch is the reason this is a function: it was written
 * twice, and a third grid would have written it a third time.
 */
export function cardDetail(house: House) {
  const cuts = house.models === 1 ? "One cut" : `${house.models} cuts`;
  return `${cuts} ${META_SEP} ${colorwayCount(house)} colourways`;
}

/**
 * Where a card for this house points.
 *
 * The story where one is written, the buy page otherwise — the funnel is
 * index → story → buy, and a card must never skip the argument. The day a
 * house's story lands, adding its `href` moves every card on the site with
 * no edit here.
 *
 * The cross-sell rail is the documented exception and passes its own href:
 * by the time it is on screen the reader is already inside the shop, and
 * sideways from a buy page is another buy page.
 */
export function cardHref(house: House) {
  return house.href ?? shopPath(house);
}

/**
 * One house, as a card.
 *
 * Everything a grid used to spell out for itself. See the variant table at
 * the top of this file for which facts each grid is allowed to carry and
 * why.
 */
export function houseCard(
  house: House,
  variant: CardVariant = "grid",
): ProductCardProps {
  if (variant === "cross-sell") {
    return {
      href: shopPath(house),
      /* The house's own card picture, not galleryFor: that returns the
         CHOSEN COLOURWAY's frames and nothing else, which is right for
         the column being scrolled and empty for a card with no colourway
         selected. The second picture is the house's editorial set, which
         is a fair thing to show on a card — it is not claiming to be any
         particular acetate. */
      image: house.plate,
      hoverImage: house.gallery?.[0],
      swatch: house.swatch ?? swatchFor(house.colorwayNames[0]),
      name: house.name,
      sizes: "(min-width: 1024px) 20vw, 45vw",
    };
  }

  const common = {
    href: cardHref(house),
    image: house.plate,
    swatch: house.swatch,
    name: house.name,
    /* A grid of products is a list of products, and each name is that
       list's heading. Both full-page grids sit under the page's h1. */
    as: "h2",
    meta: cardMeta(house),
    detail: cardDetail(house),
  } satisfies ProductCardProps;

  return variant === "index"
    ? { ...common, price: `from ${priceOf(house)}` }
    : {
        ...common,
        /* The object at rest, and the frame being WORN on hover where
           there is such a photograph. See `lifestyle` in lib/navigation. */
        hoverImage: house.lifestyle,
        swatchNote: "Photography in progress",
        note: house.note,
      };
}

/**
 * The garment, as a card.
 *
 * Apparel is not eyewear — it has sizes and no cuts — but it is a product
 * the house makes, and on the house index it stands in a row with six
 * frames. Its card is built here for the same reason theirs is: so the one
 * grid that renders it today is not the place its facts are defined.
 *
 * No `href`: there is no page to go to yet, and `ProductCard` renders a
 * link-less card as a plain container rather than a dead link. The day the
 * garment gets a page, one line here gives it to every grid at once.
 */
export function apparelCard(line: ApparelCollection): ProductCardProps {
  /* The numeral continues the houses' own sequence rather than being typed
     as "07" — the index is the order things were made in, and a seventh
     house would otherwise silently collide with the garment. */
  const index = String(houses.length + apparel.indexOf(line) + 1).padStart(
    2,
    "0",
  );
  const opening = line.colourways[0];

  return {
    image: opening?.image,
    swatch: opening?.swatch,
    name: line.name,
    as: "h2",
    meta: `${index} ${META_SEP} ${line.material}`,
    detail: `One cut ${META_SEP} ${line.colourways.length} colourways ${META_SEP} ${line.sizes.length} sizes`,
    price: `from ${formatPrice(opening?.cents ?? 0)}`,
  };
}

/**
 * Where the frame sits in the colourway shoot.
 *
 * One number for the whole run, because the run is one composition: the
 * frame centred left to right and resting a little below the middle of the
 * picture, with the table under it and the room above. Squaring a 16:9
 * still on its own centre crops to the tabletop and cuts both temples;
 * this aims the square at the eyewear.
 */
const COLOURWAY_FOCAL = "50% 45%";

/**
 * One acetate, as a card — the unit the colourway wall is built from.
 *
 * A different product from the house above it: the name is the colourway,
 * the price is that colourway's own (MONARCA's Velvet Rose is $247.50
 * against $150 for the rest of its run), and the picture is only ever the
 * colourway shoot. No fallback to the house plate and no hover swap — a
 * picture of another colour is not a bonus picture, it is the wrong one.
 */
export function colourwayCard(
  house: House,
  colorway: string,
): ProductCardProps {
  const out = !isAvailable(house, colorway);

  return {
    href: shopHref(house, colorway),
    image: sillFor(house, colorway),
    swatch: swatchFor(colorway),
    focal: COLOURWAY_FOCAL,
    name: colorway,
    meta: house.name,
    price: priceOf(house, colorway),
    detail: out ? "Out of the workshop" : undefined,
    soldOut: out,
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 45vw",
  };
}
