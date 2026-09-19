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

import { houses, menu, shopPath, type MenuLink } from "@/lib/navigation";
import { CATALOGUE } from "@/lib/catalogue";
import { formatPrice } from "@/lib/shop";

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
  { label: "Lookbook SS26", href: "/lookbook/ss26" },
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

/** Built once, at module scope. It cannot change without a deploy. */
export const INDEX: readonly Hit[] = [
  ...houses.map((house) => ({
    kind: "frame" as const,
    label: house.name,
    note: house.material,
    href: shopPath(house),
    terms: `${house.name} ${house.material} ${house.note} ${house.colorwayNames.join(" ")}`.toLowerCase(),
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
  { label: "Fit & Care", href: "/care" },
  { label: "Ask the studio", href: "/contact" },
];
