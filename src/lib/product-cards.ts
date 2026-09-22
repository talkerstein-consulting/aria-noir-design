import type { ProductCardProps } from "@/components/product-card";
import {
  runHover,
  runShot,
  type ApparelCollection,
  type ApparelColourway,
} from "@/lib/apparel";
import {
  COLOURWAY_CARD_ART,
  colourwayKey,
} from "@/lib/colourway-cards.generated";
import { colorwayCount, shopPath, type House } from "@/lib/navigation";
import {
  defaultColorway,
  formatPrice,
  galleryFor,
  isAvailable,
  morphName,
  priceOf,
  shopHref,
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

/**
 * What a HOUSE-level card puts on the held list.
 *
 * The list is keyed by house and colourway, and a card showing a whole
 * house names no colourway — so it holds the one the house leads with, the
 * same acetate the buy page opens on and the picker starts from. That
 * keeps one rule for "which colourway did they mean" across the build
 * rather than a second answer invented here.
 *
 * A house the storefront carries nothing for returns an empty string, and
 * the card then draws no bookmark at all: `ProductCard` needs both halves of
 * the key before it renders one.
 */
function holdFor(house: House) {
  return { holdSlug: house.slug, holdColorway: defaultColorway(house) || null };
}

export type CardVariant = "index" | "grid" | "cross-sell";

/**
 * The second photograph, on every card that shows a house.
 *
 * ---- One rule, because the hover was three rules ----
 *
 * The eyewear grid swapped to `lifestyle`, the cross-sell rail swapped to
 * `gallery[0]`, and the house index did not swap at all — so the same six
 * products behaved three different ways depending on which page you met
 * them on, and four of the five cards in the rail had no hover to show
 * because only two houses declare a `gallery`. A card that lifts under the
 * pointer on one page and sits still on the next reads as a bug on the
 * page where it sits still.
 *
 * So it is one rule now, and every card asks this. The frame WORN comes
 * first where it exists — a card answering "which one is it" at rest and
 * "what is it like to wear" under the pointer is the most useful pair of
 * pictures the catalogue has — and the editorial set is the fallback.
 * All six houses satisfy the first clause today.
 */
export function cardHover(house: House) {
  return house.lifestyle ?? house.gallery?.[0];
}

/**
 * The separator between two facts of equal weight on a card.
 *
 * A middot, which is what the rest of the site sets between them; the
 * house index's em dash was the odd one out. One constant because the
 * choice is typographic and belongs in one place.
 */
const META_SEP = "·";

/* The "01 · Block acetate" line that used to sit over every card is gone,
   on every product and every grid. The numeral is the order the bench cut
   them in — house bookkeeping, not a fact a reader is shopping on — and
   the material was the same two words under all six frames, which is a
   line that stops being information the second time you read it. What the
   card says now is what distinguishes one house from the next: the name,
   the cuts and colourways, and the price where the grid carries one. */

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
 * Every variant uses this, including the cross-sell rail — which used to
 * be the documented exception and send readers to another buy page. It
 * does not any more: all six houses have a story now, and a card is an
 * introduction wherever it appears.
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
      /* ---- The Collection leads to the STORY, not to another till ----
      
         This used to be `shopPath` on the argument that a reader already
         inside the shop wants to go sideways to another buy page. That was
         true when four of the six houses had no story to send them to.
         All six do now, and the rule the rest of the site follows is that
         a house is met through its argument: the buy page is where a
         decision is made, and nobody arrives at one having decided about a
         frame they have just been introduced to.
      
         `cardHref` is that rule, so this uses it rather than restating it
         — one place decides where a house card goes. */
      href: cardHref(house),
      /* The house's own card picture, not galleryFor: that returns the
         CHOSEN COLOURWAY's frames and nothing else, which is right for
         the column being scrolled and empty for a card with no colourway
         selected. The second picture is the house's editorial set, which
         is a fair thing to show on a card — it is not claiming to be any
         particular acetate. */
      image: house.plate,
      hoverImage: cardHover(house),
      swatch: house.swatch ?? swatchFor(house.colorwayNames[0]),
      name: house.name,
      ...holdFor(house),
      sizes: "(min-width: 1024px) 20vw, 45vw",
    };
  }

  const common = {
    href: cardHref(house),
    image: house.plate,
    /* Every card swaps, including this one: the index used to be the one
       grid on the site that did not. See `cardHover`. */
    hoverImage: cardHover(house),
    swatch: house.swatch,
    name: house.name,
    /* A grid of products is a list of products, and each name is that
       list's heading. Both full-page grids sit under the page's h1. */
    as: "h2",
    ...holdFor(house),
    detail: cardDetail(house),
  } satisfies ProductCardProps;

  return variant === "index"
    ? { ...common, price: `from ${priceOf(house)}` }
    : {
        ...common,
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
  const opening = line.colourways[0];

  return {
    image: opening?.image,
    /* The same rule the frames follow: a second photograph of the same
       colourway, never a different one. See `cardHover`. */
    hoverImage: opening?.hover,
    swatch: opening?.swatch,
    name: line.name,
    as: "h2",
    detail: `One cut ${META_SEP} ${line.colourways.length} colourways ${META_SEP} ${line.sizes.length} sizes`,
    price: `from ${formatPrice(opening?.cents ?? 0)}`,
  };
}

/**
 * One acetate, as a card — the unit the colourway wall is built from.
 *
 * A different product from the house above it: the name is the colourway,
 * the price is that colourway's own (MONARCA's Velvet Rose is $247.50
 * against $150 for the rest of its run), and the picture is only ever the
 * colourway shoot. No fallback to the house plate — a picture of another
 * colour is not a bonus picture, it is the wrong one.
 *
 * ---- The picture is a square RENDER, not a square crop ----
 *
 * The shoot is 16:9 and the card is square, and this used to bridge the
 * two with an `object-position` aimed a little above centre. That was the
 * best a crop could do and it was not good enough: the frame is the widest
 * thing in the picture, so squaring it cut the temples off both sides no
 * matter where the focal point was pointed.
 *
 * `scripts/build-colourway-cards.mjs` renders a real square instead — the
 * whole photograph fitted inside it, the band above and below filled with
 * the same photograph blurred and sunk. Nothing is cropped, so nothing
 * here needs a focal point.
 *
 * ---- The wall does not swap, it zooms ----
 *
 * The house cards change picture under the pointer. This one must not:
 * every card on the wall is the same composition in a different colour, so
 * swapping the photograph moves the room, the light and the angle at the
 * moment the reader is comparing acetates — the one moment nothing but the
 * colour should move. With no `hoverImage`, `ProductCard` zooms instead,
 * which is the same gesture with the subject held still.
 */
/**
 * The square photograph that stands for one colourway, wherever a card
 * of it is drawn.
 *
 * The colourway wall had this chain inline and every other list —
 * the bag, the checkout's summary, the held list — reached past it for
 * `galleryFor(...)[0]`, which is a 16:9 master. Square-cropped, that
 * takes the temples off both sides, and the temples are how a frame is
 * told apart from another frame. So the chain is named once here and
 * read everywhere:
 *
 *   1. the sill render cut square, where the run was shot that way;
 *   2. the colourway's own PORTRAIT plate, where it was not (ARCA I);
 *   3. the gallery's first frame, which is the last resort and the only
 *      one that can be cropped.
 */
export function cardImageFor(house: House, colorway: string) {
  return (
    COLOURWAY_CARD_ART[house.slug]?.[colourwayKey(colorway)]?.image ??
    house.colorwayCardPlates?.[colorway] ??
    galleryFor(house, colorway)[0]
  );
}

export function colourwayCard(
  house: House,
  colorway: string,
): ProductCardProps {
  const out = !isAvailable(house, colorway);
  const art = COLOURWAY_CARD_ART[house.slug]?.[colourwayKey(colorway)];

  return {
    href: shopHref(house, colorway),
    /* The sill card where the run was shot that way, and the colourway's
       own photograph where it was not.
    
       ARCA I is the case: it was never put on the sill, so
       COLOURWAY_CARD_ART has no entry for it and every one of its four
       cards fell back to a flat acetate swatch — four products on the shop
       page with no picture of themselves. It does have a photograph per
       colourway (`variants/k-black-main` and its siblings), which
       `galleryFor` already finds for the held list.
    
       `colorwayCardPlates` is the PORTRAIT cut of that shoot, because the
       card is square: cropping ARCA I's 16:9 masters to a square takes the
       temples off both sides, which is the part of a frame you identify it
       by. A 9:16 source loses the top and bottom instead and keeps the
       frame whole.
    
       The composition still differs from the sill wall's, and the wall is
       filtered to houses that have one (see hasColourwayCards). But a real
       photograph of the right frame in the right acetate beats a gradient
       standing in for it on a page whose job is to show what is sold. */
    image: cardImageFor(house, colorway),
    swatch: swatchFor(colorway),
    /* The HOUSE is the product; the colourway is which one of it. The
       price reads across from the name, so the name has to be the thing
       being priced — "AHAVA … $200", with the acetate named underneath. */
    name: house.name,
    meta: colorway,
    /* This card IS a colourway, so the bookmark holds exactly what is on it —
       no defaulting required. */
    holdSlug: house.slug,
    holdColorway: colorway,
    /* The card's photograph and the buy page's lead plate are the same
       square render, so the browser can morph one into the other rather
       than swapping pages. See `morphName`. */
    morph: morphName(house, colorway),
    price: priceOf(house, colorway),
    detail: out ? "Out of the workshop" : undefined,
    soldOut: out,
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 45vw",
  };
}

/**
 * One colourway of the garment, as a card — the apparel's answer to
 * `colourwayCard`, for the one grid that lists every piece the house sells
 * side by side.
 *
 * The garment has no page in this build, so the card leaves for the
 * storefront's own product page. That is the honest link: a card with no
 * `href` is a card that cannot be bought from, and on a page called Shop
 * All a piece that cannot be bought is a piece that should not be listed.
 *
 * The price is the colourway's own, as the frames' are. The compare-at is
 * not printed: a struck-through number on a catalogue card is a sale
 * badge, and the house does not run sales on its own surfaces.
 */
export function apparelColourwayCard(
  line: ApparelCollection,
  colourway: ApparelColourway,
): ProductCardProps {
  return {
    /* The garment's own buy page on this origin, opened on this colourway
       — the same shape a frame's card uses.
    
       It used to be `SHOP_URL/products/<handle>` with `external: true`,
       which walked the reader off the site from the middle of the shop:
       one card in a grid of thirty-six left for Shopify while the other
       thirty-five stayed. The storefront is still where a size is chosen,
       and since the bag learned to price a garment, nothing hands off at
       all: the size is chosen on that page and the sweater goes into the
       same bag as the frames. */
    href: `/shop/${line.slug}?colourway=${encodeURIComponent(colourway.name)}`,
    /* The run, not the packshot — see `runShot`. `colourway.image` points
       at the cut-out-on-white series, which is the one catalogue-looking
       thing in a grid of editorial plates. */
    image: runShot(line, colourway.name),
    hoverImage: runHover(line, colourway.name),
    swatch: colourway.swatch,
    /* The GARMENT is the product and the colourway is which one of it —
       the rule the eyewear cards follow since the price moved up beside
       the name. */
    name: line.name,
    meta: colourway.name,
    price: formatPrice(colourway.cents),
    detail: colourway.available ? undefined : "Out of the workshop",
    soldOut: !colourway.available,
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 45vw",
  };
}
