/**
 * Heritage, a tab of About (Raviv, 5 Nov; built from what exists, Rems,
 * 9 Nov).
 *
 * ---- Sources, and only these ----
 *
 * - The opening lines: the house's own About text on its showcase
 *   (arianoir-showcase.pages.dev/about/): "a Toronto design house making
 *   eyewear and baby-alpaca knitwear", "Every frame is designed in 3D, and
 *   the 360° turntables on this site are rendered from those design files".
 * - The photographs: the house's own Book I and Book II (showcase, Books),
 *   real people, real frames, per the review's "Real people behind the
 *   maison". Margins trimmed, nothing else changed.
 * - The milestones: the press list (docs/feedback/PRESS-CONTENT.md), each
 *   linked to the article it is taken from. The NFT-led articles are left
 *   out: the review keeps that word off customer-facing pages.
 *
 * Nothing here is claimed that a source does not state. Jai's brand book,
 * when it arrives, is the source of truth and replaces this.
 *
 * NOTE: the menu's contact block (lib/navigation, `menu.contact.studio`)
 * says "Los Angeles, California"; the showcase and the press say Toronto,
 * and the company address is Markham, Ontario. To confirm with Jai.
 */

export type Milestone = {
  /** ISO year-month, for <time>. */
  date: string;
  label: string;
  text: string;
  source?: { outlet: string; href: string };
};

export const heritage = {
  title: "Heritage",
  line: "A Toronto design house.",
  /* Cover: the house's Kyiv shoot, from its photo bank on the showcase
     (bank/ukraine). Landscape
     on a computer, the standing group on a phone. */
  cover: {
    src: "/images/heritage/cover.webp",
    portrait: "/images/heritage/cover-m.webp",
    alt: "Four people in ARIA NOIR tees and frames, lying on the studio floor",
  },
  intro: [
    "The house works in acetate and baby alpaca. Its archive follows both through portraits, film and the seasonal lookbooks.",
    "Each frame begins as a three-dimensional drawing. The rotating views in the collection come from those original design files.",
  ],
  photos: [
    {
      src: "/images/heritage/house-trio.webp",
      alt: "Three people in ARIA NOIR knitwear and frames, against black",
      width: 1104,
      height: 1600,
    },
    {
      src: "/images/heritage/pink-blazer.webp",
      alt: "A man in a rose jacket and tortoise frames",
      width: 1200,
      height: 1503,
    },
    {
      src: "/images/heritage/knit-portrait.webp",
      alt: "A man in a geometric knit, tortoise frames with the gold emblem",
      width: 1200,
      height: 1541,
    },
  ],
  photosCaption: "Portraits from Book I and Book II.",
  milestones: [
    {
      date: "2022-08",
      label: "August 2022",
      text: "Aria Noir commissions film students to make a campaign film.",
      source: {
        outlet: "California Herald",
        href: "https://www.californiaherald.com/fashion-brand-aria-noir-creating-opportunities-for-young-creatives/",
      },
    },
    {
      date: "2023-01",
      label: "January 2023",
      text: "Profiled as a Toronto label known for its fabrics, geometric patterns and gold-embossed eyewear.",
      source: {
        outlet: "California Business Journal",
        href: "https://calbizjournal.com/fashion-brand-aria-noir-on-how-clothing-can-tell-stories-words-cant/",
      },
    },
    {
      date: "2023-04",
      label: "April 2023",
      text: "Aria Noir completes its music video shoot in Kyiv.",
      source: {
        outlet: "Yahoo Finance",
        href: "https://finance.yahoo.com/news/aria-noir-completes-shooting-music-201500910.html",
      },
    },
    {
      date: "2023-07",
      label: "July 2023",
      text: "Casa Modular, with Prima Arquitectura. A house built from parts small enough to transport, growing one module at a time.",
      source: {
        outlet: "designboom",
        href: "https://designboom.es/arquitectura/prima-arquitectura-aria-noir-crean-la-casa-modular-capaz-de-transportarse-y-armarse-en-cualquier-sitio-21-07-2023/",
      },
    },
    {
      date: "2026",
      label: "Today",
      text: "The collection comprises six eyewear families and El Patrón knitwear.",
    },
  ] satisfies readonly Milestone[],
  close: { label: "Press archive", href: "/house/press" },
} as const;
