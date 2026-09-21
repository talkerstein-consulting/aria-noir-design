/**
 * What the site can be asked for.
 *
 * ---- Why there is no search service ----
 *
 * The house shows two frames in fourteen colourways and keeps nine other
 * pages. That is a catalogue a person could read aloud, so an index built
 * at module scope and matched with `includes` is not a shortcut — it is the
 * right size of machine for the job, and it answers in the same frame the
 * reader typed in. The day this list is a hundred frames long, the shape to
 * keep is `query()`: swap its body for a fetch and nothing above it moves.
 *
 * What it deliberately does NOT do: correct spelling, stem words, or rank
 * by anything but where the match landed. Those belong to a search engine,
 * and pretending to them with a regex is how a shop starts confidently
 * answering the wrong question.
 */

import type { ProductCardProps } from "@/components/product-card";
import { houses, menu, shopPath, type MenuLink } from "@/lib/navigation";
import { CATALOGUE } from "@/lib/catalogue";
import { cardHover, colourwayCard, houseCard } from "@/lib/product-cards";
import { formatPrice, galleryFor } from "@/lib/shop";

export type HitKind = "frame" | "colourway" | "page";

export type Hit = {
  kind: HitKind;
  /** What the reader sees. */
  label: string;
  /** The right-hand column: a price, a material, a word of orientation. */
  note: string;
  href: string;
  /** Lower-cased haystack. Never rendered. */
  terms: string;
  /**
   * The product, as the same card every other grid on the site draws.
   *
   * A frame and a colourway are things you shop by looking at, and a line
   * of text with a price on the right is the one place the house was
   * describing them in words instead of showing them. The card is built by
   * `lib/product-cards`, so a search result says exactly what the eyewear
   * grid and the colourway wall say about the same product.
   *
   * Pages have none: a policy has no photograph, and inventing a tile for
   * one would be the sheet dressing a sentence up as merchandise.
   */
  card?: ProductCardProps;
};

/** The headings the sheet groups under, in the order they are shown. */
export const GROUPS: readonly { kind: HitKind; title: string }[] = [
  { kind: "frame", title: "Frames" },
  { kind: "colourway", title: "Colourways" },
  { kind: "page", title: "Pages" },
];

/* Pages worth answering for. The menu already decides which of these the
   house advertises; search is allowed to know about the rest, because a
   reader who types "warranty" has asked a direct question and sending them
   to the footer to look for it would be a small cruelty.

   The Process is the one page left out on purpose — it is reached from
   inside /house/about or not at all, and a search box is not "inside". */
const PAGES: readonly MenuLink[] = [
  { label: "Eyewear", href: "/eyewear" },
  { label: "ARCA I, the story", href: "/arca-i" },
  { label: "ARCA II, the story", href: "/arca-ii" },
  { label: "The House", href: "/house/about" },
  { label: "Contact", href: "/contact" },
  { label: "The Bag", href: "/bag" },
  { label: "Held", href: "/held" },
  { label: "Access", href: "/access" },
  ...menu.secondary,
];

function pageNote(href: string) {
  if (href.startsWith("/policies/")) return "Policy";
  if (href === "/care") return "Guide";
  if (href.startsWith("/arca") || href === "/house/about") return "Story";
  return "Page";
}

/**
 * Every photograph a card may page through, first one first, no gaps and
 * no repeats. The house's own plate opens the set because it is the
 * picture the rest of the site shows this product by.
 */
function shots(...sets: readonly (string | undefined | null | readonly string[])[]) {
  const out: string[] = [];
  for (const set of sets) {
    for (const src of typeof set === "string" ? [set] : (set ?? [])) {
      if (src && !out.includes(src)) out.push(src);
    }
  }
  return out;
}

/* The sheet's grid: two up on a phone, three from the small breakpoint.
   Narrower than any full-page grid because the panel is 56rem at most. */
const SIZES = "(min-width: 640px) 18rem, 45vw";

/** Built once, at module scope. It cannot change without a deploy. */
export const INDEX: readonly Hit[] = [
  ...houses.map((house) => ({
    kind: "frame" as const,
    label: house.name,
    note: house.material,
    href: shopPath(house),
    terms: `${house.name} ${house.material} ${house.note} ${house.colorwayNames.join(" ")}`.toLowerCase(),
    /* The index variant: the picture, the depth of the range and what it
       opens at. A result is a catalogue entry, so it carries the price. */
    card: {
      ...houseCard(house, "index"),
      as: "h3" as const,
      /* The plate, the frame worn, then the editorial set — the house's
         whole shoot, in the order the site introduces it. */
      images: shots(house.plate, cardHover(house), house.gallery),
      sizes: SIZES,
    },
  })),

  /* A colourway is its own answer, because it is how people actually name
     what they want: nobody asks for "ARCA II", they ask for the tortoise
     one. The hit lands on the buy page with that colourway selected. */
  ...houses.flatMap((house) =>
    (CATALOGUE[house.slug] ?? []).map((entry) => ({
      kind: "colourway" as const,
      label: entry.colorway,
      note: entry.available
        ? `${house.name} · ${formatPrice(entry.cents)}`
        : `${house.name} · out of the workshop`,
      href: `${shopPath(house)}?colourway=${encodeURIComponent(entry.colorway)}`,
      terms: `${entry.colorway} ${house.name} ${house.material}`.toLowerCase(),
      card: {
        ...colourwayCard(house, entry.colorway),
        /* Only ever this acetate: `galleryFor` returns the chosen
           colourway's own frames and nothing else, so paging a card never
           walks into a photograph of a different colour. The square render
           opens the set — it is the one shot composed for this box; the
           rest are the 16:9 campaign frames, cropped to it. */
        images: shots(
          colourwayCard(house, entry.colorway).image,
          galleryFor(house, entry.colorway),
        ),
        /* The card links to the buy page with the colourway chosen, which
           is the hit's own href — kept in step by using it. */
        href: `${shopPath(house)}?colourway=${encodeURIComponent(entry.colorway)}`,
        sizes: SIZES,
      },
    })),
  ),

  ...PAGES.map((page) => ({
    kind: "page" as const,
    label: page.label,
    note: pageNote(page.href),
    href: page.href,
    terms: `${page.label} ${pageNote(page.href)}`.toLowerCase(),
  })),
];

const LIMIT = 12;

/**
 * Answer a typed query.
 *
 * Partial terms work because this is substring matching, not word
 * matching: "tort" finds Dark Tortoise, and so does "ortoise". A hit whose
 * label STARTS with the query is ranked above one that merely contains it
 * somewhere, which is the whole of the ranking and is enough at this size.
 */
export function query(raw: string): readonly Hit[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: { hit: Hit; score: number }[] = [];
  for (const hit of INDEX) {
    const label = hit.label.toLowerCase();
    if (label.startsWith(q)) scored.push({ hit, score: 0 });
    else if (label.includes(q)) scored.push({ hit, score: 1 });
    else if (hit.terms.includes(q)) scored.push({ hit, score: 2 });
  }

  /* Stable within a score, so the index's own order — frames, then
     colourways, then pages — survives as the tie-break. */
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, LIMIT)
    .map((s) => s.hit);
}

/** The three things the sheet offers when it has nothing. */
export const NO_RESULT_ROUTES: readonly MenuLink[] = [
  { label: "All frames", href: "/eyewear" },
  { label: "Care", href: "/care" },
  { label: "Ask the studio", href: "/contact" },
];
