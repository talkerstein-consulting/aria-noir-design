/**
 * Site-wide wayfinding — the menu overlay's contents and the house list the
 * eyewear index is built from.
 *
 * Kept apart from lib/content.ts (which is the home page's *copy*): these
 * are routes, and a route changing is a different kind of edit from a line
 * of copy changing. `nav.left` / `nav.right` stay in content.ts, since the
 * words on the header are copy; where they GO lives here.
 */

/**
 * Where the credential step happens.
 *
 * No longer linked from the chrome — `/access` is the branded sign-in and
 * this is what it hands off to. Kept as one constant because it is the only
 * thing on the site that knows the account host, and the day that moves it
 * should move here.
 */
export const ACCOUNT_URL = "https://account.arianoir.com";

export type MenuLink = { label: string; href: string; external?: boolean };

/**
 * The overlay's contents.
 *
 * `primary` is a single numbered stack, not a set of columns. That is the
 * whole idea of this menu: seven destinations set large enough to be read
 * across a room, in a fixed order, so the numeral tells you how big the
 * site is before you have finished reading the first word. Columns would
 * hide that — and with seven entries there is nothing to group anyway.
 *
 * The order is the site's own shape, not the alphabet: the shop first, the
 * house second, the desk last.
 *
 * `secondary` is the small print — the pages people go looking for rather
 * than browse into. It sits in the corner at label size, which is the
 * difference between "read this" and "this exists".
 */
export const menu = {
  /* Six destinations, and ARCA I is deliberately not among them. It is a
     frame, not a section — putting the one house that happens to have a
     page beside Eyewear and The House would tell a reader it is a peer of
     those, and would look stranger still the day a second house ships.
     It lives where its five siblings live: on the eyewear index. */
  primary: [
    { label: "Home", href: "/" },
    { label: "Eyewear", href: "/eyewear" },
    { label: "Lookbook", href: "/lookbook/ss26" },
    { label: "The House", href: "/house/about" },
    { label: "Process", href: "/house/process" },
    { label: "Contact", href: "/contact" },
  ] satisfies readonly MenuLink[],

  secondary: [
    { label: "Fit & Care", href: "/care" },
    { label: "Shipping", href: "/policies/shipping" },
    { label: "Returns", href: "/policies/returns" },
    { label: "Warranty", href: "/policies/warranty" },
    { label: "Terms", href: "/policies/terms" },
    { label: "Privacy", href: "/policies/privacy" },
  ] satisfies readonly MenuLink[],

  contact: {
    label: "Contact",
    email: "support@arianoir.com",
    studio: "Los Angeles, California",
    instagram: {
      label: "Instagram",
      href: "https://www.instagram.com/ARIANOIR_OFFICIAL/",
      external: true,
    },
  },

  close: "Close",
} as const;

/**
 * The six frame houses, as the live catalogue actually holds them.
 *
 * `plate` is null where the house has no photograph in the pool yet —
 * MONARCA is the last one sold on colourway stills we don't have. The
 * index renders it as the same swatch treatment ProductVariations uses, so
 * the grid stays complete rather than five-sixths full.
 */
export type House = {
  name: string;
  slug: string;
  index: string;
  material: string;
  models: number;
  /**
   * The colourways, by name, in the order the bench holds them.
   *
   * These are read off the 3D source set in `3d models/` — one .blend per
   * colourway per house — which is the only place in this project that
   * knows what the frames are actually CALLED. Everything else was carrying
   * counts ("6 colourways") and a couple of names smuggled into prose.
   * A count is not a catalogue: it cannot be searched, cannot be linked,
   * and cannot be checked against the bench.
   *
   * `colorways` is derived from this rather than stored beside it, because
   * a hand-kept number next to a hand-kept list is a number that will
   * eventually disagree with the list.
   */
  colorwayNames: readonly string[];
  from: number;
  plate: string | null;
  /** Acetate swatch, for the houses with no plate in hand. */
  swatch?: string;
  /**
   * The house's EDITORIAL page, where one exists — the long argument, the
   * campaign film, the shoot. Null for the four houses that have not been
   * written yet.
   *
   * This is no longer "does the house have a page": every house has a buy
   * page at `/shop/<slug>`, templated from this catalogue. Prefer
   * `shopPath(house)` for "where does a reader go to get one", and use
   * this only where the offer is specifically to READ about it.
   */
  href: string | null;
  note: string;
  /**
   * Web-ready turntable model. Draco-compressed glTF, produced from the
   * house's first .blend by `scripts/export-models.mjs`. All six exist.
   */
  model?: string;
  /**
   * The turntable's ground for this house.
   *
   * NOT the card plate above. `plate` is a photograph you are meant to
   * LOOK at; this is a room the 3D frame stands in, and the two jobs want
   * opposite pictures. The stage blurs and sinks whatever it is given, so
   * what matters here is the light and the colour, not the subject — which
   * is why these are the quietest plates in the pool rather than the best
   * ones. A busy hero shot behind a turning frame is two objects competing
   * for the same middle of the same screen.
   */
  ground?: string;
};

/** Read off the list, never typed twice. */
export function colorwayCount(house: House) {
  return house.colorwayNames.length;
}

/**
 * Where a reader goes to buy this house, once they have read its page.
 *
 * Every house has one — the page is a template over this catalogue — but
 * only the story pages link to it. The funnel is index → story → buy, and
 * the four houses with no story yet have a buy page nothing points at. That
 * is deliberate: they become reachable when they are argued for, not when
 * the template happens to cover them.
 */
export function shopPath(house: House) {
  return `/shop/${house.slug}`;
}

export const houses: readonly House[] = [
  {
    name: "ARCA I",
    slug: "arca-i",
    href: "/arca-i",
    index: "01",
    material: "Block acetate",
    models: 4,
    /* The one house whose colourway IS its cut: each of the four shapes is
       held in exactly one colour, which is why they are named as pairs. */
    colorwayNames: ["Z White", "K Black", "Proceso Brown", "309 Blue"],
    from: 100,
    plate: "/images/arca-i/object-front.jpg",
    model: "/models/houses/arca-i-z-white.glb",
    ground: "/images/arca-i/object-lightshaft.jpg",
    note: "The founding model, and the only house cut in four distinct shapes — Z White, K Black, Proceso Brown and 309 Blue.",
  },
  {
    name: "ARCA II",
    slug: "arca-ii",
    href: "/arca-ii",
    index: "02",
    material: "Block acetate",
    models: 1,
    colorwayNames: [
      "Noir",
      "Dark Tortoise",
      "Caramel Stripe",
      "Root Beer Float",
      "Tutti Frutti",
      "Dreamy Rose",
      "Velvet Rose",
      "Pixie Dust",
    ],
    from: 125,
    plate: "/images/arca-ii/object-front.jpg",
    model: "/models/houses/arca-ii-noir.glb",
    ground: "/images/arca-ii/detail-lightfall.jpg",
    note: "The second cut, and the widest colourway run in the house — eight, from Noir to Pixie Dust.",
  },
  {
    name: "AHAVA",
    slug: "ahava",
    href: null,
    index: "03",
    material: "Acetate · Signature",
    models: 1,
    /* "Dark Tortoise", not "Black" — the .blend is filed as AHAVA-Black
       and the store sells it as Dark Tortoise. Where the bench and the
       shop disagree about a name, the shop wins: it is the one a customer
       will read on their receipt. */
    colorwayNames: [
      "Noir",
      "Dark Tortoise",
      "Caramel Stripe",
      "Root Beer Float",
      "Tutti Frutti",
      "Rose",
    ],
    from: 200,
    plate: "/images/plate-10-ahava.jpg",
    model: "/models/houses/ahava-ahava-noir.glb",
    ground: "/images/plate-10-ahava.jpg",
    note: "The house's most considered frame, and the one it prices highest.",
  },
  {
    name: "MATRIARCA",
    slug: "matriarca",
    href: null,
    index: "04",
    material: "Acetate · Wood",
    models: 1,
    /* Black Wood is in the catalogue and not in the 3D set — it is out of
       the workshop, so there is nothing on the bench to model. Listed here
       because the house sells it; absent from `3d models/` for the same
       reason it is absent from the shelf. */
    colorwayNames: ["Midnight Noir", "Brown", "Black Wood"],
    from: 150,
    plate: "/images/plate-08-matriarca.jpg",
    model: "/models/houses/matriarca-midnight-noir.glb",
    ground: "/images/plate-08-matriarca.jpg",
    note: "Midnight Noir, Black Wood, Brown. The Black Wood is currently out of the workshop.",
  },
  {
    name: "PATRIARCA",
    slug: "patriarca",
    href: null,
    index: "05",
    material: "Acetate · Polished",
    models: 1,
    colorwayNames: ["Midnight Noir", "Black", "Brown"],
    from: 175,
    plate: "/images/plate-09-patriarca.jpg",
    model: "/models/houses/patriarca-midnight-noir.glb",
    ground: "/images/plate-09-patriarca.jpg",
    note: "The widest frame the house cuts, in three finishes and no more.",
  },
  {
    name: "MONARCA",
    slug: "monarca",
    href: null,
    index: "06",
    material: "Block acetate",
    models: 1,
    /* Seven, not the six this note used to claim. The bench holds seven
       .blend files and the count here was simply stale. */
    colorwayNames: [
      "Noir",
      "Dark Tortoise",
      "Caramel Stripe",
      "Tutti Frutti",
      "Dreamy Rose",
      "Velvet Rose",
      "Pixie Dust",
    ],
    from: 150,
    plate: null,
    swatch: "#8d5b6a",
    model: "/models/houses/monarca-monarca-noir.glb",
    ground: "/images/arca-i/object-shadow.jpg",
    note: "Seven colourways, including the Velvet Rose the house prices as a premium acetate.",
  },
];

/**
 * The footer's sitemap.
 *
 * Declared AFTER `houses` because it reads from it — the Eyewear group is
 * generated from the catalogue rather than hand-listed, so a new house
 * appears in the footer the moment it appears in the shop.
 *
 * Every href here is a route that exists. The footer used to carry three
 * columns of bare strings — "Atelier", "Journal", "Book a fitting", "The
 * Archive" — every one of them rendered as `href="#"`, which is four
 * columns of furniture describing a site that was never built. A footer is
 * where a reader goes when the page they are on has run out of answers, so
 * it is the last place to put a link that goes nowhere.
 *
 * Grouped by WHY someone is looking rather than by what the thing is: the
 * frames, the house behind them, the desk that helps after a purchase, and
 * the small print. The houses without a page of their own are deliberately
 * absent — they are on the index, and a footer link to a 404 is the same
 * broken promise the strings were.
 */
export type SitemapGroup = {
  title: string;
  links: readonly MenuLink[];
};

export const sitemap: readonly SitemapGroup[] = [
  {
    title: "Eyewear",
    links: [
      { label: "All frames", href: "/eyewear" },
      /* The houses that have a page, in catalogue order. Their buy pages
         are deliberately absent: the shop sits after the story, and a
         footer link is the one place a reader has not been argued to. */
      ...houses
        .filter((house) => house.href)
        .map((house) => ({ label: house.name, href: house.href as string })),
      { label: "Lookbook SS26", href: "/lookbook/ss26" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About", href: "/house/about" },
      { label: "Process", href: "/house/process" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Client",
    links: [
      { label: "Fit & Care", href: "/care" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/returns" },
      { label: "Warranty", href: "/policies/warranty" },
      { label: "Access", href: "/access" },
      { label: "The Room", href: "/room" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/policies/terms" },
      { label: "Privacy", href: "/policies/privacy" },
    ],
  },
];
