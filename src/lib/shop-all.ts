import type { ProductCardProps } from "@/components/product-card";
import { apparel, listedColourways, runShot } from "@/lib/apparel";
import { houses, type House } from "@/lib/navigation";
import {
  apparelColourwayCard,
  colourwayCard,
} from "@/lib/product-cards";
import { stockFor, SWATCHES } from "@/lib/shop";

/**
 * ============================================================
 *  SHOP ALL. Every piece the house sells, as one list.
 * ============================================================
 *
 * ---- Where it comes from ----
 *
 * The Amazing Donuts catalogue (`src/shop/ShopAll.tsx` there), which lists
 * sixty items on one page and stays readable: a rail of the counters, one
 * pinned button holding every control that narrows the grid, dividers
 * that group the unfiltered list by counter, and counts on every choice
 * that say what picking it would LEAVE rather than what the catalogue
 * holds in total. The arithmetic is what was taken. None of its interface
 * came across; every surface is cut to STYLE-GUIDE.md.
 *
 * ---- What a "product" is here ----
 *
 * The storefront models every colourway as its own product, and so does
 * this list: thirty-six frames and five garments, each priced on its own.
 * That is the unit a reader comparing acetates shops in, and the unit the
 * bag holds. The house index on `/house/about` used to list collections
 * instead, on the argument that a wall of Caramel Stripe and Pixie Dust
 * answers a question nobody has asked yet. On a page called Shop All the
 * question has been asked.
 *
 * ---- Why this file is not the component ----
 *
 * The list, the filters, the sorts and the counts are arithmetic over the
 * catalogue and they do not need a browser. Keeping them here means the
 * component is only the surface, and the rules can be read (and changed)
 * without a `useState` in the way.
 */

/** Which of the house's two trades a piece belongs to. */
export type Kind = "eyewear" | "apparel";

export type Piece = {
  /** Stable, unique, and the grid's animation key. */
  id: string;
  name: string;
  /** The collection's slug: a house's, or the garment's. */
  collection: string;
  collectionName: string;
  kind: Kind;
  cents: number;
  available: boolean;
  /** For the bag's "already in it" mark. Eyewear only; the garment is
   *  bought on the storefront. */
  bagKey?: { slug: string; colorway: string };
  card: ProductCardProps;
};

export type Collection = {
  slug: string;
  name: string;
  kind: Kind;
  /** The collection's own picture, for the rail. */
  image: string | null | undefined;
  swatch?: string;
};

/**
 * The collections, in the order the site lists them: the houses as the
 * bench cut them, then the garment. The rail, the drawer's group and the
 * dividers in the grid all read this one order.
 */
export const collections: readonly Collection[] = [
  ...houses.map((house) => ({
    slug: house.slug,
    name: house.name,
    kind: "eyewear" as const,
    image: house.plate,
    swatch: house.swatch,
  })),
  ...apparel.map((line) => ({
    slug: line.slug,
    name: line.name,
    kind: "apparel" as const,
    /* The run's hero, not the first packshot — see `runShot`. */
    image: runShot(line),
    swatch: line.colourways[0]?.swatch,
  })),
];

export function collectionBySlug(slug: string | null | undefined) {
  return slug ? collections.find((c) => c.slug === slug) : undefined;
}

function eyewearPieces(house: House): Piece[] {
  /* The STORE's list, in the store's order — the same source the picker
     on the buy page reads. A colourway the storefront has never heard of
     is not an offer. */
  return stockFor(house).map((entry) => ({
    id: `${house.slug}/${entry.colorway}`,
    name: entry.colorway,
    collection: house.slug,
    collectionName: house.name,
    kind: "eyewear",
    cents: entry.cents,
    available: entry.available,
    bagKey: { slug: house.slug, colorway: entry.colorway },
    card: colourwayCard(house, entry.colorway),
  }));
}

/**
 * Everything, once. Built at module load because the catalogue is static
 * and this is read on every keystroke of the filter.
 */
export const pieces: readonly Piece[] = [
  ...houses.flatMap(eyewearPieces),
  /* `listedColourways`, not every colourway the collection was designed
     in: only the Tweed has been cut. See the note on `listed`. */
  ...apparel.flatMap((line) =>
    listedColourways(line).map(
      (colourway): Piece => ({
        id: `${line.slug}/${colourway.name}`,
        name: colourway.name,
        collection: line.slug,
        collectionName: line.name,
        kind: "apparel",
        cents: colourway.cents,
        available: colourway.available,
        card: apparelColourwayCard(line, colourway),
      }),
    ),
  ),
];

/* ---- Family ----

   What COLOUR the thing is, which is the question a list of thirty-six
   acetates could not answer. Collection says which cut, Kind says frames
   or knitwear. Neither says tortoise, and on a wall of near-identical
   compositions that is the one thing most people arrive knowing.

   Matched on the colourway's name, because that is the only colour
   information the catalogue carries: the swatches in lib/shop are
   stand-ins and a family drawn from a guessed hex would be a guess about
   a guess. So each family is the words the house actually names its
   acetates with. Names match lowercased and un-anchored: "Midnight Noir"
   is noir, and should be.

   Deliberately not exhaustive. The garment's "X" belongs to nothing here
   and is reachable by every other route on the page. A family that would
   catch one item is a row that costs more to read than it saves. */
export type Family = "noir" | "tortoise" | "rose" | "pale" | "blue";

export const FAMILIES: readonly {
  id: Family;
  label: string;
  words: readonly string[];
  /**
   * The chip's mark.
   *
   * Taken from `SWATCHES` in lib/shop — the acetate this family is most
   * itself in, rather than a colour invented for the filter: Noir wears
   * its own hex, Tortoise wears Dark Tortoise, Rose wears Rose, Pale wears
   * Z White, Blue wears 309 Blue. Those hexes are stand-ins for real
   * acetate and say so where they are declared; a swatch here is no more
   * precise than the one on a card, and it is the same value, so the two
   * cannot disagree.
   */
  swatch: string;
}[] = [
  { id: "noir", label: "Noir", words: ["noir", "black"], swatch: SWATCHES.Noir },
  {
    id: "tortoise",
    label: "Tortoise and brown",
    words: ["tortoise", "stripe", "root beer", "brown", "perdiz", "tweed"],
    swatch: SWATCHES["Dark Tortoise"],
  },
  { id: "rose", label: "Rose", words: ["rose", "tutti", "pink"], swatch: SWATCHES.Rose },
  { id: "pale", label: "Pale", words: ["white", "pixie", "pastel"], swatch: SWATCHES["Z White"] },
  { id: "blue", label: "Blue", words: ["blue"], swatch: SWATCHES["309 Blue"] },
];

export function inFamily(piece: Piece, family: Family) {
  const words = FAMILIES.find((f) => f.id === family)!.words;
  const name = piece.name.toLowerCase();
  return words.some((w) => name.includes(w));
}

/* ---- Sort ----

   `featured` is the catalogue's own order — the houses as the bench cut
   them, each run as the store lists it — and it stays the default because
   that order is a merchandising decision rather than a default to
   overturn quietly. The other three are the ones people actually ask a
   list for.

   Every comparator is total and stable: `sort` runs on a copy, and ties
   fall back to catalogue position so a re-sort never reshuffles equal
   items under the layout animation. */
export type Sort = "featured" | "price-asc" | "price-desc" | "az";

export const SORTS: readonly { id: Sort; label: string }[] = [
  { id: "featured", label: "As the house lists them" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "az", label: "A to Z" },
];

/* ---- The query, as one object ---- */

export type Query = {
  collection: string | null;
  kind: Kind | null;
  families: readonly Family[];
  /** Hide what cannot be bought today. Off by default: a piece the house
   *  makes is still a piece the house makes. */
  inStock: boolean;
  /** Free text, from the header's search. */
  q: string;
  sort: Sort;
};

export const EMPTY_QUERY: Query = {
  collection: null,
  kind: null,
  families: [],
  inStock: false,
  q: "",
  sort: "featured",
};

/**
 * The header's search matcher, in miniature: the name and the collection,
 * lowercased, every word of the query present somewhere. "arca noir"
 * finds ARCA II Noir and nothing in AHAVA.
 */
export function matchesQuery(piece: Piece, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${piece.name} ${piece.collectionName}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

type Group = "collection" | "kind" | "family" | "stock";

/**
 * The list, narrowed by every group EXCEPT one.
 *
 * Counts are what each choice would leave, not what the catalogue holds in
 * total — a "Rose 4" under a picked house has to mean four of that house.
 * Every count therefore honours the OTHER groups' current answers, and
 * never its own, so choosing within a group cannot change the numbers you
 * were choosing between. `skip` names the group being counted.
 */
export function narrow(
  list: readonly Piece[],
  query: Query,
  skip?: Group,
): Piece[] {
  let out = [...list];
  if (query.collection && skip !== "collection")
    out = out.filter((p) => p.collection === query.collection);
  if (query.kind && skip !== "kind") out = out.filter((p) => p.kind === query.kind);
  if (query.families.length && skip !== "family")
    out = out.filter((p) => query.families.some((f) => inFamily(p, f)));
  if (query.inStock && skip !== "stock") out = out.filter((p) => p.available);
  /* The search narrows every count. It is not a group anyone picks from,
     so there is nothing to skip. */
  return out.filter((p) => matchesQuery(p, query.q));
}

/** What the grid shows, in the order asked for. */
export function shown(query: Query): Piece[] {
  const list = narrow(pieces, query);
  if (query.sort === "featured") return list;
  const at = new Map(pieces.map((p, i) => [p.id, i]));
  const tie = (a: Piece, b: Piece) => at.get(a.id)! - at.get(b.id)!;
  if (query.sort === "price-asc") list.sort((a, b) => a.cents - b.cents || tie(a, b));
  else if (query.sort === "price-desc") list.sort((a, b) => b.cents - a.cents || tie(a, b));
  else list.sort((a, b) => a.name.localeCompare(b.name) || tie(a, b));
  return list;
}

export function countInCollection(query: Query, slug: string | null) {
  const scope = slug ? pieces.filter((p) => p.collection === slug) : pieces;
  return narrow(scope, query, "collection").length;
}

export function countInKind(query: Query, kind: Kind | null) {
  const scope = kind ? pieces.filter((p) => p.kind === kind) : pieces;
  return narrow(scope, query, "kind").length;
}

export function countInFamily(query: Query, family: Family | null) {
  const scope = family ? pieces.filter((p) => inFamily(p, family)) : pieces;
  return narrow(scope, query, "family").length;
}

export function countInStock(query: Query) {
  return narrow(pieces.filter((p) => p.available), query, "stock").length;
}

/**
 * How many filters are narrowing the grid. Sort is deliberately not
 * counted: there is no unsorted grid, so a badge that always read at
 * least 1 would say nothing.
 */
export function activeFilters(query: Query) {
  return (
    (query.collection ? 1 : 0) +
    (query.kind ? 1 : 0) +
    query.families.length +
    (query.inStock ? 1 : 0)
  );
}

/**
 * What to offer when nothing matched.
 *
 * An empty result that is one line of apology puts the reader back at the
 * top of forty-one pieces having already told us what they wanted. So the
 * sentence, then four pieces: the hero colourway of each of the first
 * four houses, which is the house's own answer to "which one", not a
 * guess dressed as a recommendation. Four is a full row on the widest
 * grid; a consolation should not out-length the result it stands in for.
 */
export function fallback(): Piece[] {
  const out: Piece[] = [];
  for (const house of houses) {
    const hero = house.heroColorway;
    const piece =
      pieces.find(
        (p) => p.collection === house.slug && p.available && (!hero || p.name === hero),
      ) ?? pieces.find((p) => p.collection === house.slug && p.available);
    if (piece) out.push(piece);
    if (out.length === 4) break;
  }
  return out;
}

/* ---- The URL ----

   `/shop?collection=arca-ii&q=noir`. Read once, in the component's lazy
   initialiser rather than an effect: an effect would paint the unfiltered
   grid first and then visibly filter it. Only the two parameters another
   page would ever LINK with are carried; the drawer's other answers are
   the reader's own and do not belong in a URL they might send on. */
export function queryFromParams(params: URLSearchParams | null): Query {
  const slug = params?.get("collection");
  const kind = params?.get("kind");
  return {
    ...EMPTY_QUERY,
    collection: collectionBySlug(slug)?.slug ?? null,
    kind: kind === "eyewear" || kind === "apparel" ? kind : null,
    q: params?.get("q")?.trim() ?? "",
  };
}
