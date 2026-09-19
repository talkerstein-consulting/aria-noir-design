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

/**
 * The live storefront, for the menu entries this build has no room of its
 * own for yet.
 *
 * Declared here rather than imported from lib/shop, which owns the same
 * string: shop.ts already imports the house list from THIS file, and
 * importing back would put a cycle between two modules that both build
 * objects at load time. One duplicated origin is cheaper than that.
 */
const SHOP_URL = "https://arianoir.com";

/* For `architecture` at the foot of this file, which lists every policy
   page from the policies themselves rather than by hand. A value import,
   which is safe here: policies.ts imports one TYPE and nothing else, so
   there is no runtime edge back to this module. */
import { policies } from "@/lib/policies";


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
  /* ---- FOUR DOORS ----

     The stack was the storefront's whole top level, thirteen destinations
     deep once the frame families were counted. This is the short version,
     and the short version is the point: four words, each one a different
     kind of place to be, set large enough that the panel is read rather
     than scanned.

     What went is the product layer. The six houses had a row of their own
     under the stack and every one of them is still a page — they are
     reached from the showcase, which is the room that exists to list them.
     A menu that names six products is a menu doing the index's job at half
     its size.

     Home leads, because the mark in the header is the only other way back
     to it and a menu that cannot return you to the front page is a menu
     that has to be closed rather than used.

     The showcase is the eyewear, which is what this house makes. Shop All
     is everything including the garment, and it is the one entry that
     leaves: the full inventory screen lives on the storefront, and here it
     appears only inside /house/about, which is already About us. Pointing
     both words at one route would be the menu saying the same thing
     twice. */
  primary: [
    { label: "Home", href: "/" },
    { label: "Our Showcase", href: "/eyewear" },
    {
      label: "Shop All",
      href: `${SHOP_URL}/collections/all`,
      external: true,
    },
    { label: "About us", href: "/house/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies readonly MenuLink[],

  /* The storefront's footer, which is where the policies live there too.
     Warranty, terms and privacy map one to one; the storefront's single
     "Refund and Shipping Policy" is two pages here, and both are listed
     rather than picking one. "All pages" is this build's own addition and
     the way to every room the storefront has no equivalent for. */
  secondary: [
    { label: "Fit & Care", href: "/care" },
    { label: "Shipping", href: "/policies/shipping" },
    { label: "Returns", href: "/policies/returns" },
    { label: "Warranty", href: "/policies/warranty" },
    { label: "Terms", href: "/policies/terms" },
    { label: "Privacy", href: "/policies/privacy" },
    { label: "All pages", href: "/sitemap" },
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
 * A colourway's thumbnail: the photograph, and WHERE in it the acetate is.
 *
 * The crop matters more than the file. These are 16:9 frames of a whole
 * frame on a ledge, squeezed into a 72px square — centred, that square
 * lands on blurred concrete and the thumbnail reads as grey whatever
 * colour the frame is. `position` puts the square on the temple, which is
 * the largest unbroken run of acetate in every one of these shots.
 *
 * Percentages, in `object-position` order (x y), measured off the source
 * image rather than guessed.
 */
export type Macro = {
  src: string;
  /** Defaults to the centre, which is right only by accident. */
  position?: string;
};

/**
 * The house's own campaign, curated down to what a buy page can carry.
 *
 * Each house has been shot as a world of its own: AHAVA in a Parisian
 * apartment, MONARCA in a faded palazzo, PATRIARCA in imperial Rome,
 * MATRIARCA in Egypt. Those frames are not product stills and they do not
 * belong in the buy page's left column, which is evidence about the thing
 * being bought. They are the argument, which is what the four houses
 * without a story page have never had in front of their price.
 *
 * Three plates and one line, not the shoot. The full set is imported by
 * `scripts/import-campaign-photography.mjs`; this is what was chosen from
 * it. A buy page that turns into a lookbook is a buy page the reader
 * scrolls past to get back to the price.
 *
 * Absent on ARCA I and ARCA II, which have story pages and do not need the
 * short version of one.
 */
export type Campaign = {
  /** Where it was shot. Stated once, plainly, and not returned to. */
  place: string;
  /** The line that would still stand if every other word were cut. */
  line: string;
  /** The establishing frame: the world, wide. 16:9. */
  world: string;
  /** The frame worn, in that world. Two, shown side by side. 4:5. */
  worn: readonly string[];
  /** The object itself, close. Sits beside the worn pair. */
  macro?: string;
};

/**
 * The six frame houses, as the live catalogue actually holds them.
 *
 * `plate` is null where the house has no photograph in the pool yet —
 * MONARCA is the last one sold on colourway stills we don't have. The
 * index renders it as the same swatch treatment the offering's colourway squares use, so
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
  /**
   * A photograph of the frame being WORN, in the place it was shot.
   *
   * Separate from `plate`, which is the object alone. The eyewear index
   * prefers this: that page opens on a turntable of the bare object and
   * then argues in a grid, and a grid of six more bare objects is the same
   * sentence twice. Everywhere else still wants the plate, because a
   * catalogue card and a home page panel are answering "which one is it",
   * not "what is it like to wear".
   */
  lifestyle?: string;
  /**
   * A photograph PER COLOURWAY, keyed by the names in `colorwayNames`.
   *
   * `plate` is the house's one card picture; this is the run, shot colour
   * by colour. Where it exists every surface that names a colourway can
   * show that colour instead of standing in the house's default acetate —
   * which is the difference between a buy page for a frame and a buy page
   * for the colour you actually chose.
   *
   * ARCA I is the only house with the set so far. A house without it keeps
   * showing `plate`, and nothing anywhere has to know the difference.
   */
  colorwayPlates?: Readonly<Record<string, string>>;
  /**
   * The buy page's left column, which is a SCROLL rather than a hero: the
   * frame from several distances, in the order someone actually inspects
   * one. Falls back to the single plate, so a house with one photograph
   * renders one tall picture instead of a carousel with nothing in it.
   */
  gallery?: readonly string[];
  /**
   * The same scroll, but shot per colourway — prepended to `gallery` when
   * the chosen acetate has its own frames. ARCA I is the only house whose
   * run has been photographed, so it is the only one where changing the
   * swatch changes the pictures rather than just the caption.
   */
  colorwayGallery?: Readonly<Record<string, readonly string[]>>;
  /**
   * The campaign's own frame of each acetate, one composition for the whole
   * run — the frame on the same stone sill, in the same window light,
   * shot colour by colour.
   *
   * Kept apart from `colorwayGallery` because it is a different SHOOT and
   * a different shape: these are 16:9, where the storefront's numbered set
   * is square. Holding the composition is the whole value: a reader moving
   * the picker sees the colour of the frame change and nothing else, where
   * the storefront's set is eight separate sessions and moving the picker
   * moves the whole photograph.
   *
   * NOT for the palette band under the opening. That band is flat colour
   * by design - a material sample card, the acetate itself rather than a
   * picture of a frame made from it - and photographs in it turn a colour
   * scheme into a second gallery.
   *
   * ARCA II is the only house shot this way. A house without the set keeps
   * the flat swatch, and nothing has to know the difference.
   */
  colorwaySills?: Readonly<Record<string, string>>;
  /**
   * The macro crop that stands for a colourway in the picker.
   *
   * A thumbnail is a claim that this is what the acetate looks like, so it
   * is only ever a photograph OF that colourway — never the house plate
   * reused six times, which would show one frame under six names. Houses
   * without the shoot keep the flat swatch, which is honest about being an
   * approximation. See SWATCHES in lib/shop.
   */
  colorwayMacros?: Readonly<Record<string, Macro>>;
  /**
   * The colourway the page OPENS on.
   *
   * Not the same question as "what is in stock first". The buy page now
   * opens on a turntable rather than a photograph, so the opening colour is
   * the one the house wants seen first — its hero — and every other surface
   * that picks a default (the picker, the price, the scroll) has to agree
   * with it or the page contradicts itself on the first frame.
   *
   * Falls back to the first colourway the store has in stock.
   */
  heroColorway?: string;
  /**
   * A turntable PER COLOURWAY.
   *
   * `model` is the house's one glb; this is the run, modelled colour by
   * colour. Where it exists, choosing an acetate turns the frame in the
   * viewer into that acetate — which is the same promise `colorwayPlates`
   * makes about photography, kept in 3D.
   */
  colorwayModels?: Readonly<Record<string, string>>;
  /**
   * The house's world, where it has been shot as one. See `Campaign`.
   * A house without it renders no campaign section at all and the buy page
   * closes up around it.
   */
  campaign?: Campaign;
  /**
   * The campaign film, where one has been cut. Sits beside the detail tabs
   * lower down the buy page; a house without one shows its quietest plate
   * there instead, which is the same ladder every other surface climbs.
   */
  video?: string;
  /** Held under the film until it can play. */
  videoPoster?: string;
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

/**
 * The houses on show, and the only ones with a buy page built.
 *
 * The other four rows stay in `allHouses` — they are still the catalogue,
 * and the cart, the prices and the photography all read from them — but
 * nothing renders them and `/shop/<their slug>` is a 404. Widen this set
 * and a house comes back everywhere at once: the index, the home panels,
 * the footer, and its own buy page.
 */
/* ---- OPEN, for the design pass ----

   Held at ["arca-i", "arca-ii"] until now, so the four houses without a
   story of their own had a buy page nothing pointed at. All six are open
   while every page is being designed: the index shows the whole bench, the
   footer lists it, and `/shop/<slug>` builds for each.

   Narrowing this set again is one line, and everything follows it on the
   same commit — including `housesOnShow()`, which is why no heading on the
   site has to be corrected by hand when it moves. */
const VISIBLE_SLUGS: ReadonlySet<string> = new Set(
  ["arca-i", "arca-ii", "ahava", "matriarca", "patriarca", "monarca"],
);

/**
 * Every house the bench has cut, shown or not.
 *
 * Read this only where a slug has to RESOLVE — a cart line, a price, a
 * catalogue lookup. Anything that RENDERS a list of houses reads `houses`,
 * which is this filtered by what is currently on show.
 */
export const allHouses: readonly House[] = [
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
    /* The house's card picture is the K Black still from the colourway
       shoot, which is the most recent and best-lit frame in the pool — the
       old object-front plate predates it. */
    plate: "/images/arca-i/cover/square.webp",
    colorwayPlates: {
      "Z White": "/images/arca-i/variants/z-white-main.webp",
      "K Black": "/images/arca-i/variants/k-black-main.webp",
      "Proceso Brown": "/images/arca-i/variants/proceso-brown-main.webp",
      "309 Blue": "/images/arca-i/variants/309-blue-main.webp",
    },
    /* The only house with a colourway shoot, so the only one whose left
       column re-shoots itself when the picker moves. Each entry is that
       acetate front-on then in profile; the house set below carries the
       distances no single colourway owns. */
    colorwayGallery: {
      "Z White": [
        "/images/arca-i/variants/z-white-main.webp",
        "/images/arca-i/variants/z-white-side.webp",
        "/images/arca-i/variants/z-white-side-zoom.webp",
      ],
      /* Six, where the other three cuts have two: the ARCA I story page's
         macro shoot is all of THIS frame — matte black, gold bridge — so
         those photographs belong to this colourway rather than to the
         house. The studio renders on pure black are deliberately not here;
         they are a different object from the shoot. `spec-macro-bridge` is
         excluded by instruction. */
      "K Black": [
        "/images/arca-i/variants/k-black-main.webp",
        "/images/arca-i/variants/k-black-side-macro.webp",
        "/images/arca-i/spec-macro-keyhole.webp",
        "/images/arca-i/spec-macro-nose.webp",
        "/images/arca-i/spec-macro-inner-left.webp",
        "/images/arca-i/spec-macro-inner-right.webp",
      ],
      "Proceso Brown": [
        "/images/arca-i/variants/proceso-brown-main.webp",
        "/images/arca-i/variants/proceso-brown-side.webp",
      ],
      "309 Blue": [
        "/images/arca-i/variants/309-blue-main.webp",
        "/images/arca-i/variants/309-blue-side.webp",
      ],
    },
    /* Supplied crops, not crops computed here. These are 234px squares cut
       at the bridge — the one place on this frame where the acetate is a
       broad unbroken field — so they carry no `position`: nothing needs
       aiming, and the picker renders them at their own scale.
       `green.webp` is 309 Blue. The file is named for what the acetate
       looks like and the colourway is named for its reference number; the
       four files map one-to-one onto the four cuts. */
    colorwayMacros: {
      "Z White": { src: "/images/arca-i/thumbnails/white.webp" },
      "K Black": { src: "/images/arca-i/thumbnails/black.webp" },
      "Proceso Brown": { src: "/images/arca-i/thumbnails/brown.webp" },
      "309 Blue": { src: "/images/arca-i/thumbnails/green.webp" },
    },
    /* Held by the house rather than by a colourway: a hinge macro and a
       frame on concrete are true of all four cuts. */
    gallery: [
      "/images/arca-i/object-lowangle.webp",
      "/images/arca-i/spec-macro-keyhole.webp",
      "/images/arca-i/worn-close.webp",
    ],
    /* The house opens on K Black: it is the plate, the campaign shoot and
       the frame the macro set was photographed from. */
    heroColorway: "K Black",
    /* All four cuts are modelled — scripts/export-models.mjs produced one
       glb per colourway — so the turntable is never showing a different
       acetate from the one the picker says is selected. */
    colorwayModels: {
      "Z White": "/models/houses/arca-i-z-white.glb",
      "K Black": "/models/houses/arca-i-k-black.glb",
      "Proceso Brown": "/models/houses/arca-i-proceso-brown.glb",
      "309 Blue": "/models/houses/arca-i-309-blue.glb",
    },
    video: "/video/arca-i-hero.mp4",
    videoPoster: "/images/arca-i/hero-poster.webp",
    model: "/models/houses/arca-i-z-white.glb",
    /* The ground behind the turning frame. Was `object-lightshaft.webp` —
       the object again, behind the object, which at 96px and ten pixels of
       blur left the stage looking like it had no background at all. The
       rooftop is two figures on a concrete plane cut by one long diagonal
       shadow, and that diagonal is the whole point: it is the one thing in
       the pool that still reads as composition after the blur. */
    /* The brutalist corridor: one lamp, and everything else falling away
       into it. An EMPTY room, which is what the turntable's ground has to
       be — the old plate had the pair standing in it, so a frame turning
       in front of it was the third and fourth pair of glasses on screen. */
    ground: "/images/arca-i/ground-corridor.webp",
    lifestyle: "/images/arca-i/lifestyle/aria-low-angle.webp",
    note: "The founding model, and the only house cut in four distinct shapes: Z White, K Black, Proceso Brown and 309 Blue.",
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
    plate: "/images/arca-ii/cover/square.webp",
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      "Caramel Stripe": "/images/arca-ii/variants/caramel-stripe-01.webp",
      "Dark Tortoise": "/images/arca-ii/variants/dark-tortoise-01.webp",
      "Dreamy Rose": "/images/arca-ii/variants/dreamy-rose-01.webp",
      Noir: "/images/arca-ii/variants/noir-01.webp",
      "Pixie Dust": "/images/arca-ii/variants/pixie-dust-01.webp",
      "Root Beer Float": "/images/arca-ii/variants/root-beer-float-01.webp",
      "Tutti Frutti": "/images/arca-ii/variants/tutti-frutti-01.webp",
      "Velvet Rose": "/images/arca-ii/variants/velvet-rose-01.webp",
    },
    colorwayGallery: {
      "Caramel Stripe": [
        "/images/arca-ii/variants/caramel-stripe-01.webp",
        "/images/arca-ii/variants/caramel-stripe-02.webp",
        "/images/arca-ii/variants/caramel-stripe-03.webp",
      ],
      "Dark Tortoise": [
        "/images/arca-ii/variants/dark-tortoise-01.webp",
        "/images/arca-ii/variants/dark-tortoise-02.webp",
        "/images/arca-ii/variants/dark-tortoise-03.webp",
        "/images/arca-ii/variants/dark-tortoise-04.webp",
      ],
      "Dreamy Rose": [
        "/images/arca-ii/variants/dreamy-rose-01.webp",
        "/images/arca-ii/variants/dreamy-rose-02.webp",
        "/images/arca-ii/variants/dreamy-rose-03.webp",
      ],
      Noir: [
        "/images/arca-ii/variants/noir-01.webp",
        "/images/arca-ii/variants/noir-02.webp",
        "/images/arca-ii/variants/noir-03.webp",
        "/images/arca-ii/variants/noir-04.webp",
      ],
      "Pixie Dust": [
        "/images/arca-ii/variants/pixie-dust-01.webp",
        "/images/arca-ii/variants/pixie-dust-02.webp",
        "/images/arca-ii/variants/pixie-dust-03.webp",
      ],
      "Root Beer Float": [
        "/images/arca-ii/variants/root-beer-float-01.webp",
        "/images/arca-ii/variants/root-beer-float-02.webp",
        "/images/arca-ii/variants/root-beer-float-03.webp",
      ],
      "Tutti Frutti": [
        "/images/arca-ii/variants/tutti-frutti-01.webp",
        "/images/arca-ii/variants/tutti-frutti-02.webp",
        "/images/arca-ii/variants/tutti-frutti-03.webp",
      ],
      "Velvet Rose": [
        "/images/arca-ii/variants/velvet-rose-01.webp",
        "/images/arca-ii/variants/velvet-rose-02.webp",
        "/images/arca-ii/variants/velvet-rose-03.webp",
      ],
    },
    /* One composition across the whole run - see `colorwaySills`. The
       closing counter re-shoots itself from these, and they close out each
       colourway's gallery on the buy page. */
    colorwaySills: {
      Noir: "/images/arca-ii/variants/noir-sill.webp",
      "Dark Tortoise": "/images/arca-ii/variants/dark-tortoise-sill.webp",
      "Caramel Stripe": "/images/arca-ii/variants/caramel-stripe-sill.webp",
      "Root Beer Float": "/images/arca-ii/variants/root-beer-float-sill.webp",
      "Tutti Frutti": "/images/arca-ii/variants/tutti-frutti-sill.webp",
      "Dreamy Rose": "/images/arca-ii/variants/dreamy-rose-sill.webp",
      "Velvet Rose": "/images/arca-ii/variants/velvet-rose-sill.webp",
      "Pixie Dust": "/images/arca-ii/variants/pixie-dust-sill.webp",
    },
    /* The plate, and the only cut of this house the campaign has shot. */
    heroColorway: "Noir",
    /* House-level, and still house-level: these are the campaign's own
       frames of the Noir, true of the cut rather than of an acetate. They
       sit UNDER the colourway set above, which is what a reader sees when
       the picker moves. */
    gallery: [
      "/images/arca-ii/object-front.webp",
      "/images/arca-ii/spec-macro-eye.webp",
      "/images/arca-ii/spec-macro-temple.webp",
      "/images/arca-ii/worn-noir-front.webp",
    ],
    model: "/models/houses/arca-ii-noir.glb",
    /* The pair in a lit doorway, which blurs down to exactly what this cut
       is: a bright centre and everything else given away to the dark. */
    /* The vaulted hall, light laid across the floor in bars. Warm stone
       against ARCA I's cold concrete, which is the difference between the
       two cuts said in a room rather than in a sentence. Empty, for the
       same reason as above. */
    ground: "/images/arca-ii/ground-hall.webp",
    lifestyle: "/images/arca-ii/lifestyle/noir-cloister.webp",
    note: "The second cut, and the widest colourway run in the house: eight, from Noir to Pixie Dust.",
  },
  {
    name: "AHAVA",
    slug: "ahava",
    href: "/ahava",
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
    /* The hero acetate from the house's own shoot, in portrait. Was
       `plate-10-ahava.webp`, a stock frame from the shared pool: the house
       is photographed as itself now, so its card is one of its own
       pictures. */
    plate: "/images/ahava/cover/square.webp",
    /* ---- the colourway shoot ----
       The campaign's own frame of each acetate, one composition for the whole
       run. This REPLACED the storefront's product stills: the house is shot as
       its own world now, and a page that mixed the two put a frame on a white
       ledge directly above the same frame in a room. Imported by
       scripts/import-campaign-photography.mjs; regenerate rather than
       hand-edit. */
    colorwayPlates: {
      "Dark Tortoise": "/images/ahava/variants/dark-tortoise-tall.webp",
      "Caramel Stripe": "/images/ahava/variants/caramel-stripe-tall.webp",
      "Rose": "/images/ahava/variants/rose-tall.webp",
      "Noir": "/images/ahava/variants/noir-tall.webp",
      "Root Beer Float": "/images/ahava/variants/root-beer-float-tall.webp",
      "Tutti Frutti": "/images/ahava/variants/tutti-frutti-tall.webp",
    },
    /* The portrait frame of this acetate, which is what the column opens on.
       `galleryFor` closes every colourway scroll with that colourway's sill, so
       the landscape below is not listed here as well. */
    colorwayGallery: {
      "Dark Tortoise": ["/images/ahava/variants/dark-tortoise-tall.webp"],
      "Caramel Stripe": ["/images/ahava/variants/caramel-stripe-tall.webp"],
      "Rose": ["/images/ahava/variants/rose-tall.webp"],
      "Noir": ["/images/ahava/variants/noir-tall.webp"],
      "Root Beer Float": ["/images/ahava/variants/root-beer-float-tall.webp"],
      "Tutti Frutti": ["/images/ahava/variants/tutti-frutti-tall.webp"],
    },
    /* The same setup in landscape, held across the whole run: the picker
       moves and only the colour of the frame changes. */
    colorwaySills: {
      "Dark Tortoise": "/images/ahava/variants/dark-tortoise-sill.webp",
      "Caramel Stripe": "/images/ahava/variants/caramel-stripe-sill.webp",
      "Rose": "/images/ahava/variants/rose-sill.webp",
      "Noir": "/images/ahava/variants/noir-sill.webp",
      "Root Beer Float": "/images/ahava/variants/root-beer-float-sill.webp",
      "Tutti Frutti": "/images/ahava/variants/tutti-frutti-sill.webp",
    },
    /* The house prices this one highest and photographs it first; the plate below is its front-on frame. */
    heroColorway: "Noir",
    model: "/models/houses/ahava-ahava-noir.glb",
    /* Was the house plate, which is a photograph of the frame - the object
       standing behind the object. This is the room with nothing in it,
       which is what a turntable's ground is for. */
    ground: "/images/ahava/campaign/vibe-dust-in-window-light.webp",
    lifestyle: "/images/ahava/campaign/worn-aria-reading-chair-night.webp",
    campaign: {
      place: "Paris. A sixth floor, before the street is awake.",
      line: "Nothing in the room competes with it.",
      world: "/images/ahava/campaign/wide-grand-salon-full-depth.webp",
      worn: [
        "/images/ahava/campaign/worn-aria-reading-chair.webp",
        "/images/ahava/campaign/worn-noir-enfilade-door.webp",
      ],
      macro: "/images/ahava/campaign/macro-lens-coffee-cup.webp",
    },
    note: "The house's most considered frame, and the one it prices highest.",
  },
  {
    name: "MATRIARCA",
    slug: "matriarca",
    href: "/matriarca",
    index: "04",
    material: "Acetate · Wood",
    models: 1,
    /* Black Wood is in the catalogue and not in the 3D set — it is out of
       the workshop, so there is nothing on the bench to model. Listed here
       because the house sells it; absent from `3d models/` for the same
       reason it is absent from the shelf. */
    colorwayNames: ["Midnight Noir", "Brown", "Black Wood"],
    from: 150,
    /* The hero acetate from the house's own shoot, in portrait. See AHAVA. */
    plate: "/images/matriarca/cover/square.webp",
    /* ---- the colourway shoot ----
       The campaign's own frame of each acetate, one composition for the whole
       run. This REPLACED the storefront's product stills: the house is shot as
       its own world now, and a page that mixed the two put a frame on a white
       ledge directly above the same frame in a room. Imported by
       scripts/import-campaign-photography.mjs; regenerate rather than
       hand-edit. */
    colorwayPlates: {
      "Brown": "/images/matriarca/variants/brown-tall.webp",
      "Midnight Noir": "/images/matriarca/variants/midnight-noir-tall.webp",
    },
    /* The portrait frame of this acetate, which is what the column opens on.
       `galleryFor` closes every colourway scroll with that colourway's sill, so
       the landscape below is not listed here as well. */
    colorwayGallery: {
      "Brown": ["/images/matriarca/variants/brown-tall.webp"],
      "Midnight Noir": ["/images/matriarca/variants/midnight-noir-tall.webp"],
    },
    /* The same setup in landscape, held across the whole run: the picker
       moves and only the colour of the frame changes. */
    colorwaySills: {
      "Brown": "/images/matriarca/variants/brown-sill.webp",
      "Midnight Noir": "/images/matriarca/variants/midnight-noir-sill.webp",
    },
    /* The polished black is the frame the house leads with, and the only one of the three with a full set. */
    heroColorway: "Midnight Noir",
    model: "/models/houses/matriarca-midnight-noir.glb",
    /* Was the house plate, which is a photograph of the frame. This is
       window light across bare stone: no subject, which is what a turning
       frame needs behind it. */
    ground: "/images/matriarca/campaign/vibe-vibe-01-window-shadows.webp",
    lifestyle: "/images/matriarca/campaign/worn-aria-obelisk-courtyard.webp",
    campaign: {
      place: "Karnak. Abu Simbel. Giza.",
      line: "The monuments are enormous. The object is not.",
      world: "/images/matriarca/campaign/wide-aria-solo-wide-02-giza-dune-panoramic.webp",
      worn: [
        "/images/matriarca/campaign/worn-aria-closeup-02-profile-golden.webp",
        "/images/matriarca/campaign/worn-noir-closeup-01-stone-archway.webp",
      ],
      macro: "/images/matriarca/campaign/macro-macro-01-bridge-relief.webp",
    },
    note: "Midnight Noir, Black Wood, Brown. The Black Wood is currently out of the workshop.",
  },
  {
    name: "PATRIARCA",
    slug: "patriarca",
    href: "/patriarca",
    index: "05",
    material: "Acetate · Polished",
    models: 1,
    colorwayNames: ["Midnight Noir", "Black", "Brown"],
    from: 175,
    /* The hero acetate from the house's own shoot, in portrait. See AHAVA. */
    plate: "/images/patriarca/cover/square.webp",
    /* ---- the colourway shoot ----
       The campaign's own frame of each acetate, one composition for the whole
       run. This REPLACED the storefront's product stills: the house is shot as
       its own world now, and a page that mixed the two put a frame on a white
       ledge directly above the same frame in a room. Imported by
       scripts/import-campaign-photography.mjs; regenerate rather than
       hand-edit. */
    colorwayPlates: {
      "Black": "/images/patriarca/variants/black-tall.webp",
      "Brown": "/images/patriarca/variants/brown-tall.webp",
      "Midnight Noir": "/images/patriarca/variants/midnight-noir-tall.webp",
    },
    /* The portrait frame of this acetate, which is what the column opens on.
       `galleryFor` closes every colourway scroll with that colourway's sill, so
       the landscape below is not listed here as well. */
    colorwayGallery: {
      "Black": ["/images/patriarca/variants/black-tall.webp"],
      "Brown": ["/images/patriarca/variants/brown-tall.webp"],
      "Midnight Noir": ["/images/patriarca/variants/midnight-noir-tall.webp"],
    },
    /* The same setup in landscape, held across the whole run: the picker
       moves and only the colour of the frame changes. */
    colorwaySills: {
      "Black": "/images/patriarca/variants/black-sill.webp",
      "Brown": "/images/patriarca/variants/brown-sill.webp",
      "Midnight Noir": "/images/patriarca/variants/midnight-noir-sill.webp",
    },
    /* Same rule as MATRIARCA: the polished black leads, and it carries the longest set. */
    heroColorway: "Midnight Noir",
    model: "/models/houses/patriarca-midnight-noir.glb",
    /* Was the house plate. This is a corridor with light coming down it
       and nobody in it, which is the ground a turntable wants. */
    ground: "/images/patriarca/campaign/vibe-vibe-04-corridor-light.webp",
    lifestyle: "/images/patriarca/campaign/worn-aria-marble-staircase.webp",
    campaign: {
      place: "Rome. Marble, and the last hour of the light.",
      line: "Worn like something issued rather than bought.",
      world: "/images/patriarca/campaign/wide-basilica-interior.webp",
      worn: [
        "/images/patriarca/campaign/worn-aria-among-columns.webp",
        "/images/patriarca/campaign/worn-noir-marble-staircase.webp",
      ],
      macro: "/images/patriarca/campaign/macro-macro-02-hinge-column.webp",
    },
    note: "The widest frame the house cuts, in three finishes and no more.",
  },
  {
    name: "MONARCA",
    slug: "monarca",
    href: "/monarca",
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
    /* Was null, and the index drew this house as a flat swatch because of
       it. Its own listing had photography after all — this is the Noir
       front, the same frame `heroColorway` opens the buy page on. */
    /* The hero acetate from the house's own shoot. Landscape, because this
       is the one house whose colourway set was shot 16:9 only. */
    plate: "/images/monarca/cover/square.webp",
    /* ---- the colourway shoot ----
       The campaign's own frame of each acetate, one composition for the whole
       run. This REPLACED the storefront's product stills: the house is shot as
       its own world now, and a page that mixed the two put a frame on a white
       ledge directly above the same frame in a room. Imported by
       scripts/import-campaign-photography.mjs; regenerate rather than
       hand-edit. */
    colorwayPlates: {
      "Caramel Stripe": "/images/monarca/variants/caramel-stripe-sill.webp",
      "Dark Tortoise": "/images/monarca/variants/dark-tortoise-sill.webp",
      "Dreamy Rose": "/images/monarca/variants/dreamy-rose-sill.webp",
      "Noir": "/images/monarca/variants/noir-sill.webp",
      "Pixie Dust": "/images/monarca/variants/pixie-dust-sill.webp",
      "Tutti Frutti": "/images/monarca/variants/tutti-frutti-sill.webp",
      "Velvet Rose": "/images/monarca/variants/velvet-rose-sill.webp",
    },
    /* The same setup in landscape, held across the whole run: the picker
       moves and only the colour of the frame changes. */
    colorwaySills: {
      "Caramel Stripe": "/images/monarca/variants/caramel-stripe-sill.webp",
      "Dark Tortoise": "/images/monarca/variants/dark-tortoise-sill.webp",
      "Dreamy Rose": "/images/monarca/variants/dreamy-rose-sill.webp",
      "Noir": "/images/monarca/variants/noir-sill.webp",
      "Pixie Dust": "/images/monarca/variants/pixie-dust-sill.webp",
      "Tutti Frutti": "/images/monarca/variants/tutti-frutti-sill.webp",
      "Velvet Rose": "/images/monarca/variants/velvet-rose-sill.webp",
    },
    /* The house had no photograph at all until this run; Noir is where its own listing starts. */
    heroColorway: "Noir",
    swatch: "#8d5b6a",
    model: "/models/houses/monarca-monarca-noir.glb",
    /* No longer borrowed from ARCA I. The campaign shot this house's own
       rooms empty, so the quiet ground it needed is now a MONARCA
       photograph with no frame in it: still water, and the far side of a
       canal. */
    ground: "/images/monarca/campaign/wide-canal-still-water.webp",
    lifestyle: "/images/monarca/campaign/worn-aria-lantern-bridge.webp",
    campaign: {
      place: "A palazzo out of season. Canals, lantern light, rain.",
      line: "Nobody says what happened in the room before.",
      world: "/images/monarca/campaign/wide-vaulted-gallery-hall.webp",
      worn: [
        "/images/monarca/campaign/worn-aria-mirror-reflection.webp",
        "/images/monarca/campaign/worn-noir-water-reflection.webp",
      ],
      macro: "/images/monarca/campaign/macro-lens-bevel-water-reflection.webp",
    },
    note: "Seven colourways, including the Velvet Rose the house prices as a premium acetate.",
  },
];

/** The houses on show. Everything that renders a list reads this. */
export const houses: readonly House[] = allHouses.filter((house) =>
  VISIBLE_SLUGS.has(house.slug),
);

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/**
 * How many houses are on show, in words, ready to be read aloud.
 *
 * Copy that counts the catalogue has been wrong on this site three times
 * now, in both directions: the home page said three houses when the bench
 * cut six, then said six while VISIBLE_SLUGS was holding it to two, and
 * the eyewear title had to be hand-corrected from six to two for the same
 * reason. Every one of those was a sentence restating a fact the catalogue
 * already held.
 *
 * So the sentence asks. Widen VISIBLE_SLUGS and every heading that counts
 * follows on the same commit, which is the only arrangement in which they
 * cannot disagree.
 */
export function housesOnShow(): string {
  const n = houses.length;
  const word = WORDS[n] ?? String(n);
  return `${word} ${n === 1 ? "house" : "houses"}`;
}

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
      /* Every house on show, in catalogue order — its story where it has
         one, its buy page where it does not. Buy pages used to be kept out
         of the footer on the argument that the shop sits after the story;
         with all six houses open and only two stories written, that rule
         would hide four of them from the one list that is meant to be
         complete. */
      ...houses.map((house) => ({
        label: house.name,
        href: house.href ?? shopPath(house),
      })),
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About", href: "/house/about" },
      { label: "The Process", href: "/house/process" },
      { label: "Lookbook SS26", href: "/lookbook/ss26" },
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
      { label: "The Bag", href: "/bag" },
      { label: "Held", href: "/held" },
      { label: "The Desk", href: "/desk" },
      { label: "Access", href: "/access" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/policies/terms" },
      { label: "Privacy", href: "/policies/privacy" },
      { label: "All pages", href: "/sitemap" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   THE ARCHITECTURE
   ═══════════════════════════════════════════════════════════════════

   Every route this site answers on, in one array, with what it is for.

   ---- Why this exists next to `sitemap` above ----

   They are different documents. `sitemap` is the FOOTER: grouped by why
   someone is looking, edited for length, and it leaves things out on
   purpose. This one leaves nothing out — including the pages nobody is
   meant to arrive at cold, and the tool pages that only exist in
   development. It is the index a designer navigates by, and it is what
   `/sitemap` renders.

   Anything dynamic is generated rather than listed, so a new house or a
   new policy appears here without an edit.
   ═══════════════════════════════════════════════════════════════════ */

export type RouteKind =
  /** Being designed. */
  | "designed"
  /** Built and answering, not yet designed. */
  | "built"
  /** A person's own page: their bag, their desk. Not indexed. */
  | "private"
  /** A workshop tool, not a surface. */
  | "tool";

export type Route = {
  label: string;
  href: string;
  /** One line on what the page is for. Shown beside it. */
  note: string;
  kind: RouteKind;
};

export type RouteGroup = {
  title: string;
  /** One line on what the whole group is for. */
  note: string;
  routes: readonly Route[];
};

export const architecture: readonly RouteGroup[] = [
  {
    title: "The door",
    note: "Where a visit starts, and the chrome that is on every page after it.",
    routes: [
      {
        label: "Home",
        href: "/",
        note: "The opening. Carries the whole house in one scroll and closes on the shop.",
        kind: "designed",
      },
      {
        label: "All pages",
        href: "/sitemap",
        note: "This page. Every route, linked, with nothing held back.",
        kind: "tool",
      },
    ],
  },
  {
    title: "The frames",
    note: "The index, then a story where one has been written, then the counter.",
    routes: [
      {
        label: "Eyewear",
        href: "/eyewear",
        note: `The index. ${housesOnShow()}, with a turntable above the grid.`,
        kind: "designed",
      },
      ...allHouses.flatMap((house): Route[] => [
        ...(house.href
          ? [
              {
                label: `${house.name} — the story`,
                href: house.href,
                note: house.note,
                kind: "designed" as const,
              },
            ]
          : []),
        {
          label: `${house.name} — buy`,
          href: shopPath(house),
          note: `${colorwayCount(house)} colourways, ${house.material.toLowerCase()}.${
            VISIBLE_SLUGS.has(house.slug) ? "" : " Not on show — this route 404s."
          }`,
          kind: house.href ? "designed" : "built",
        },
      ]),
    ],
  },
  {
    title: "The house",
    note: "Who cut the frames, and how.",
    routes: [
      {
        label: "The House",
        href: "/house/about",
        note: "The brand, the company, the vision.",
        kind: "designed",
      },
      {
        label: "The Process",
        href: "/house/process",
        note: "How a frame is made. Was reachable only from inside The House; now on the menu.",
        kind: "built",
      },
      {
        label: "Lookbook SS26",
        href: "/lookbook/ss26",
        note: "The season, shot.",
        kind: "designed",
      },
      {
        label: "Contact",
        href: "/contact",
        note: "The desk a question goes to.",
        kind: "designed",
      },
    ],
  },
  {
    title: "The transaction",
    note: "Everything after the reader has decided. The card itself is the account host's.",
    routes: [
      {
        label: "The Bag",
        href: "/bag",
        note: "The list, then three folding questions, then out to the secure checkout.",
        kind: "private",
      },
      {
        label: "Held",
        href: "/held",
        note: "Saved, not bought. Lives in this browser and says so.",
        kind: "private",
      },
      {
        label: "The Desk",
        href: "/desk",
        note: "Orders, Held and Profile, one view at a time. The view is in the hash.",
        kind: "private",
      },
      {
        label: "Access",
        href: "/access",
        note: "The branded door. Hands off to the account host.",
        kind: "built",
      },
      {
        label: "Cart",
        href: "/cart",
        note: "The old route. Kept so an old link still lands somewhere.",
        kind: "built",
      },
    ],
  },
  {
    title: "The small print",
    note: "The pages people go looking for rather than browse into.",
    routes: [
      {
        label: "Fit & Care",
        href: "/care",
        note: "Adjustable at five points. The answer to most of what a return would be.",
        kind: "built",
      },
      /* From the policies themselves, so one added there appears here
         without an edit. `policies.ts` imports nothing from this file at
         runtime — its one import is a type — so there is no cycle. */
      ...policies.map(
        (policy): Route => ({
          label: policy.title,
          href: `/policies/${policy.slug}`,
          note: "Policy.",
          kind: "built",
        }),
      ),
    ],
  },
  {
    title: "The workshop",
    note: "Tools, not surfaces. Nothing here is customer-facing.",
    routes: [
      {
        label: "Poster kitchen",
        href: "/poster",
        note: "Renders a still of every turntable. Writes files, so it only writes under next dev.",
        kind: "tool",
      },
      {
        label: "404",
        href: "/does-not-exist",
        note: "The not-found page, reached by asking for anything that is not here.",
        kind: "built",
      },
    ],
  },
];

/** How many routes the architecture describes. For the page's own count. */
export function routeCount() {
  return architecture.reduce((n, group) => n + group.routes.length, 0);
}
