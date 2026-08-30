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
  /* Seven entries: six destinations and the bag. The count above finally
     matches the list — it said seven while this held six.

     ARCA I is deliberately not among them. It is a frame, not a section —
     putting the one house that happens to have a page beside Eyewear and
     The House would tell a reader it is a peer of those, and would look
     stranger still the day a second house ships. It lives where its five
     siblings live: on the eyewear index. */
  primary: [
    { label: "Home", href: "/" },
    { label: "Eyewear", href: "/eyewear" },
    { label: "Lookbook", href: "/lookbook/ss26" },
    { label: "The House", href: "/house/about" },
    { label: "Process", href: "/house/process" },
    { label: "Contact", href: "/contact" },
    /* The bag, and the only reason the menu carries a utility beside six
       destinations: this site deliberately has no cart control in its
       header, so without this line the only route to the bag is a footer
       link under "Client" — which is where someone looks for a policy, not
       for the thing they are holding. */
    { label: "Bag", href: "/bag" },
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
    /* The house's card picture is the K Black still from the colourway
       shoot, which is the most recent and best-lit frame in the pool — the
       old object-front plate predates it. */
    plate: "/images/arca-i/variants/k-black-main.jpg",
    colorwayPlates: {
      "Z White": "/images/arca-i/variants/z-white-main.jpg",
      "K Black": "/images/arca-i/variants/k-black-main.jpg",
      "Proceso Brown": "/images/arca-i/variants/proceso-brown-main.jpg",
      "309 Blue": "/images/arca-i/variants/309-blue-main.jpg",
    },
    /* The only house with a colourway shoot, so the only one whose left
       column re-shoots itself when the picker moves. Each entry is that
       acetate front-on then in profile; the house set below carries the
       distances no single colourway owns. */
    colorwayGallery: {
      "Z White": [
        "/images/arca-i/variants/z-white-main.jpg",
        "/images/arca-i/variants/z-white-side.jpg",
        "/images/arca-i/variants/z-white-side-zoom.jpg",
      ],
      /* Six, where the other three cuts have two: the ARCA I story page's
         macro shoot is all of THIS frame — matte black, gold bridge — so
         those photographs belong to this colourway rather than to the
         house. The studio renders on pure black are deliberately not here;
         they are a different object from the shoot. `spec-macro-bridge` is
         excluded by instruction. */
      "K Black": [
        "/images/arca-i/variants/k-black-main.jpg",
        "/images/arca-i/variants/k-black-side-macro.jpg",
        "/images/arca-i/spec-macro-keyhole.jpg",
        "/images/arca-i/spec-macro-nose.jpg",
        "/images/arca-i/spec-macro-inner-left.jpg",
        "/images/arca-i/spec-macro-inner-right.jpg",
      ],
      "Proceso Brown": [
        "/images/arca-i/variants/proceso-brown-main.jpg",
        "/images/arca-i/variants/proceso-brown-side.jpg",
      ],
      "309 Blue": [
        "/images/arca-i/variants/309-blue-main.jpg",
        "/images/arca-i/variants/309-blue-side.jpg",
      ],
    },
    /* Supplied crops, not crops computed here. These are 234px squares cut
       at the bridge — the one place on this frame where the acetate is a
       broad unbroken field — so they carry no `position`: nothing needs
       aiming, and the picker renders them at their own scale.
       `green.png` is 309 Blue. The file is named for what the acetate
       looks like and the colourway is named for its reference number; the
       four files map one-to-one onto the four cuts. */
    colorwayMacros: {
      "Z White": { src: "/images/arca-i/thumbnails/white.png" },
      "K Black": { src: "/images/arca-i/thumbnails/black.png" },
      "Proceso Brown": { src: "/images/arca-i/thumbnails/brown.png" },
      "309 Blue": { src: "/images/arca-i/thumbnails/green.png" },
    },
    /* Held by the house rather than by a colourway: a hinge macro and a
       frame on concrete are true of all four cuts. */
    gallery: [
      "/images/arca-i/object-lowangle.jpg",
      "/images/arca-i/spec-macro-keyhole.jpg",
      "/images/arca-i/worn-close.jpg",
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
    videoPoster: "/images/arca-i/hero-poster.jpg",
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
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      "Caramel Stripe": "/images/arca-ii/variants/caramel-stripe-01.jpg",
      "Dark Tortoise": "/images/arca-ii/variants/dark-tortoise-01.jpg",
      "Dreamy Rose": "/images/arca-ii/variants/dreamy-rose-01.jpg",
      Noir: "/images/arca-ii/variants/noir-01.jpg",
      "Pixie Dust": "/images/arca-ii/variants/pixie-dust-01.jpg",
      "Root Beer Float": "/images/arca-ii/variants/root-beer-float-01.jpg",
      "Tutti Frutti": "/images/arca-ii/variants/tutti-frutti-01.jpg",
      "Velvet Rose": "/images/arca-ii/variants/velvet-rose-01.jpg",
    },
    colorwayGallery: {
      "Caramel Stripe": [
        "/images/arca-ii/variants/caramel-stripe-01.jpg",
        "/images/arca-ii/variants/caramel-stripe-02.jpg",
        "/images/arca-ii/variants/caramel-stripe-03.jpg",
      ],
      "Dark Tortoise": [
        "/images/arca-ii/variants/dark-tortoise-01.jpg",
        "/images/arca-ii/variants/dark-tortoise-02.jpg",
        "/images/arca-ii/variants/dark-tortoise-03.jpg",
        "/images/arca-ii/variants/dark-tortoise-04.jpg",
      ],
      "Dreamy Rose": [
        "/images/arca-ii/variants/dreamy-rose-01.jpg",
        "/images/arca-ii/variants/dreamy-rose-02.jpg",
        "/images/arca-ii/variants/dreamy-rose-03.jpg",
      ],
      Noir: [
        "/images/arca-ii/variants/noir-01.jpg",
        "/images/arca-ii/variants/noir-02.jpg",
        "/images/arca-ii/variants/noir-03.jpg",
        "/images/arca-ii/variants/noir-04.jpg",
      ],
      "Pixie Dust": [
        "/images/arca-ii/variants/pixie-dust-01.jpg",
        "/images/arca-ii/variants/pixie-dust-02.jpg",
        "/images/arca-ii/variants/pixie-dust-03.jpg",
      ],
      "Root Beer Float": [
        "/images/arca-ii/variants/root-beer-float-01.jpg",
        "/images/arca-ii/variants/root-beer-float-02.jpg",
        "/images/arca-ii/variants/root-beer-float-03.jpg",
      ],
      "Tutti Frutti": [
        "/images/arca-ii/variants/tutti-frutti-01.jpg",
        "/images/arca-ii/variants/tutti-frutti-02.jpg",
        "/images/arca-ii/variants/tutti-frutti-03.jpg",
      ],
      "Velvet Rose": [
        "/images/arca-ii/variants/velvet-rose-01.jpg",
        "/images/arca-ii/variants/velvet-rose-02.jpg",
        "/images/arca-ii/variants/velvet-rose-03.jpg",
      ],
    },
    /* The plate, and the only cut of this house the campaign has shot. */
    heroColorway: "Noir",
    /* House-level, and still house-level: these are the campaign's own
       frames of the Noir, true of the cut rather than of an acetate. They
       sit UNDER the colourway set above, which is what a reader sees when
       the picker moves. */
    gallery: [
      "/images/arca-ii/object-front.jpg",
      "/images/arca-ii/spec-macro-eye.jpg",
      "/images/arca-ii/spec-macro-temple.jpg",
      "/images/arca-ii/worn-noir-front.jpg",
    ],
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
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      "Caramel Stripe": "/images/ahava/variants/caramel-stripe-01.jpg",
      "Dark Tortoise": "/images/ahava/variants/dark-tortoise-01.jpg",
      Noir: "/images/ahava/variants/noir-01.jpg",
      "Root Beer Float": "/images/ahava/variants/root-beer-float-01.jpg",
      Rose: "/images/ahava/variants/rose-01.jpg",
      "Tutti Frutti": "/images/ahava/variants/tutti-frutti-01.jpg",
    },
    colorwayGallery: {
      "Caramel Stripe": [
        "/images/ahava/variants/caramel-stripe-01.jpg",
        "/images/ahava/variants/caramel-stripe-02.jpg",
        "/images/ahava/variants/caramel-stripe-03.jpg",
      ],
      "Dark Tortoise": [
        "/images/ahava/variants/dark-tortoise-01.jpg",
        "/images/ahava/variants/dark-tortoise-02.jpg",
        "/images/ahava/variants/dark-tortoise-03.jpg",
      ],
      Noir: [
        "/images/ahava/variants/noir-01.jpg",
        "/images/ahava/variants/noir-02.jpg",
        "/images/ahava/variants/noir-03.jpg",
        "/images/ahava/variants/noir-04.jpg",
      ],
      "Root Beer Float": [
        "/images/ahava/variants/root-beer-float-01.jpg",
        "/images/ahava/variants/root-beer-float-02.jpg",
        "/images/ahava/variants/root-beer-float-03.jpg",
      ],
      Rose: [
        "/images/ahava/variants/rose-01.jpg",
        "/images/ahava/variants/rose-02.jpg",
        "/images/ahava/variants/rose-03.jpg",
        "/images/ahava/variants/rose-04.jpg",
        "/images/ahava/variants/rose-05.jpg",
        "/images/ahava/variants/rose-06.jpg",
      ],
      "Tutti Frutti": [
        "/images/ahava/variants/tutti-frutti-01.jpg",
        "/images/ahava/variants/tutti-frutti-02.jpg",
        "/images/ahava/variants/tutti-frutti-03.jpg",
      ],
    },
    /* The house prices this one highest and photographs it first; the plate below is its front-on frame. */
    heroColorway: "Noir",
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
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      "Black Wood": "/images/matriarca/variants/black-wood-01.jpg",
      Brown: "/images/matriarca/variants/brown-01.jpg",
      "Midnight Noir": "/images/matriarca/variants/midnight-noir-01.jpg",
    },
    colorwayGallery: {
      "Black Wood": [
        "/images/matriarca/variants/black-wood-01.jpg",
        "/images/matriarca/variants/black-wood-02.jpg",
      ],
      Brown: [
        "/images/matriarca/variants/brown-01.jpg",
        "/images/matriarca/variants/brown-02.jpg",
        "/images/matriarca/variants/brown-03.jpg",
        "/images/matriarca/variants/brown-04.jpg",
      ],
      "Midnight Noir": [
        "/images/matriarca/variants/midnight-noir-01.jpg",
        "/images/matriarca/variants/midnight-noir-02.jpg",
        "/images/matriarca/variants/midnight-noir-03.jpg",
        "/images/matriarca/variants/midnight-noir-04.jpg",
        "/images/matriarca/variants/midnight-noir-05.jpg",
        "/images/matriarca/variants/midnight-noir-06.jpg",
      ],
    },
    /* The polished black is the frame the house leads with, and the only one of the three with a full set. */
    heroColorway: "Midnight Noir",
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
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      Black: "/images/patriarca/variants/black-01.jpg",
      Brown: "/images/patriarca/variants/brown-01.jpg",
      "Midnight Noir": "/images/patriarca/variants/midnight-noir-01.jpg",
    },
    colorwayGallery: {
      Black: [
        "/images/patriarca/variants/black-01.jpg",
        "/images/patriarca/variants/black-02.jpg",
        "/images/patriarca/variants/black-03.jpg",
        "/images/patriarca/variants/black-04.jpg",
        "/images/patriarca/variants/black-05.jpg",
      ],
      Brown: [
        "/images/patriarca/variants/brown-01.jpg",
        "/images/patriarca/variants/brown-02.jpg",
        "/images/patriarca/variants/brown-03.jpg",
        "/images/patriarca/variants/brown-04.jpg",
        "/images/patriarca/variants/brown-05.jpg",
      ],
      "Midnight Noir": [
        "/images/patriarca/variants/midnight-noir-01.jpg",
        "/images/patriarca/variants/midnight-noir-02.jpg",
        "/images/patriarca/variants/midnight-noir-03.jpg",
        "/images/patriarca/variants/midnight-noir-04.jpg",
        "/images/patriarca/variants/midnight-noir-05.jpg",
        "/images/patriarca/variants/midnight-noir-06.jpg",
      ],
    },
    /* Same rule as MATRIARCA: the polished black leads, and it carries the longest set. */
    heroColorway: "Midnight Noir",
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
    /* Was null, and the index drew this house as a flat swatch because of
       it. Its own listing had photography after all — this is the Noir
       front, the same frame `heroColorway` opens the buy page on. */
    plate: "/images/monarca/variants/noir-01.jpg",
    /* ---- the colourway shoot ----
       Imported from the storefront's own per-colourway set by
       scripts/import-colourway-photography.mjs. The numbers are the
       SHOP's display order, not angle names: `-02` means the second
       picture the store shows, which is the only ordering the source
       carries. Regenerate rather than hand-edit. */
    colorwayPlates: {
      "Caramel Stripe": "/images/monarca/variants/caramel-stripe-01.jpg",
      "Dark Tortoise": "/images/monarca/variants/dark-tortoise-01.jpg",
      "Dreamy Rose": "/images/monarca/variants/dreamy-rose-01.jpg",
      Noir: "/images/monarca/variants/noir-01.jpg",
      "Pixie Dust": "/images/monarca/variants/pixie-dust-01.jpg",
      "Tutti Frutti": "/images/monarca/variants/tutti-frutti-01.jpg",
      "Velvet Rose": "/images/monarca/variants/velvet-rose-01.jpg",
    },
    colorwayGallery: {
      "Caramel Stripe": [
        "/images/monarca/variants/caramel-stripe-01.jpg",
        "/images/monarca/variants/caramel-stripe-02.jpg",
        "/images/monarca/variants/caramel-stripe-03.jpg",
      ],
      "Dark Tortoise": [
        "/images/monarca/variants/dark-tortoise-01.jpg",
        "/images/monarca/variants/dark-tortoise-02.jpg",
        "/images/monarca/variants/dark-tortoise-03.jpg",
      ],
      "Dreamy Rose": [
        "/images/monarca/variants/dreamy-rose-01.jpg",
        "/images/monarca/variants/dreamy-rose-02.jpg",
        "/images/monarca/variants/dreamy-rose-03.jpg",
      ],
      Noir: [
        "/images/monarca/variants/noir-01.jpg",
        "/images/monarca/variants/noir-02.jpg",
        "/images/monarca/variants/noir-03.jpg",
      ],
      "Pixie Dust": [
        "/images/monarca/variants/pixie-dust-01.jpg",
        "/images/monarca/variants/pixie-dust-02.jpg",
        "/images/monarca/variants/pixie-dust-03.jpg",
      ],
      "Tutti Frutti": [
        "/images/monarca/variants/tutti-frutti-01.jpg",
        "/images/monarca/variants/tutti-frutti-02.jpg",
        "/images/monarca/variants/tutti-frutti-03.jpg",
      ],
      "Velvet Rose": [
        "/images/monarca/variants/velvet-rose-01.jpg",
        "/images/monarca/variants/velvet-rose-02.jpg",
        "/images/monarca/variants/velvet-rose-03.jpg",
      ],
    },
    /* The house had no photograph at all until this run; Noir is where its own listing starts. */
    heroColorway: "Noir",
    swatch: "#8d5b6a",
    model: "/models/houses/monarca-monarca-noir.glb",
    /* Borrowed from ARCA I while this house had no pictures of its own,
       and kept on purpose now that it does: `ground` wants a quiet room
       behind a turning frame, and every MONARCA photograph is a frame —
       putting one back there is two pairs of glasses on one square. */
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
