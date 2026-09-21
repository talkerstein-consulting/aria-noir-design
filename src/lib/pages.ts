/**
 * Copy and plate assignments for the section pages.
 *
 * Where a line came off arianoir.com it is kept as the house wrote it —
 * the brand/company/vision triptych, the care instructions, the shipping
 * windows. Where the live store had no page at all (the process) the copy is
 * written to the same voice, so it reads as the house and can be replaced
 * without hunting for it — but never where the copy would make a claim
 * about the product itself, which is why the fit guide that used to sit on
 * /care is gone rather than rewritten.
 *
 * Same bargain as lib/content.ts and lib/arca-i.ts: swap the strings, the
 * layout never needs touching.
 */


const P = "/images/arca-i";

/* ── The House · About ────────────────────────────────────────────── */

export const about = {
  hero: {
    eyebrow: "The House",
    title: "Eyewear by designers, for visionaries.",
    line: [
      { text: "Symmetry, style,", italic: true },
      { text: "AND SOUL.", italic: false },
    ],
    /* ---- The house's own photography, and only that ----
    
       Every plate on this page used to be a `plate-NN-*.webp` — the stock
       set the build was scaffolded on: a couple in a convertible behind
       the masthead, two headshots on white studio paper under The Brand,
       and masked dancers who appear nowhere else in the house's world.
       None of it came from the shoot, and a page arguing that this house
       designs with intention cannot be illustrated with pictures it did
       not take.
    
       These are all from the delivered run — see
       scripts/import-campaign-photography — and they span the houses
       rather than sitting in one, because the page is about the house and
       not about a frame. */
    plate: "/images/monarca/campaign/wide-great-ballroom.webp",
    alt: "Two figures in the great ballroom",
  },
  /** The live store's About page, in its three named parts. */
  opening: {
    preheader: "The Brand",
    heading: "We design with intention.",
    body: [
      "Aria Noir crafts frames that balance artistry and function — where timeless elegance meets bold innovation. Each piece is a reflection of symmetry, style, and soul.",
      "Our work is driven by a deep passion for design and craftsmanship. We pursue the perfect harmony of form and vision, creating eyewear that is not only a statement but an experience.",
    ],
    /* Two houses, two worlds, both worn — the claim is about the whole
       catalogue, so the evidence cannot be one frame twice. */
    images: [
      { src: "/images/patriarca/campaign/worn-aria-among-columns.webp", alt: "PATRIARCA among the columns" },
      { src: "/images/ahava/campaign/worn-noir-reading-chair.webp", alt: "AHAVA in the reading chair" },
    ],
  },
  /* `vision` used to sit here: a second TextPair with its own heading,
     body and two plates, which nothing has rendered since the sticky
     study replaced it. Dead data is worse than dead code — it reads as
     content the page is failing to show, and its two plates were the
     last references to the stock masked-dancer shots. */
  band: {
    /* The line is about frames made to last years. A macro of the temple
       — the woodgrain in the acetate, the gold at the hinge — is the one
       picture on the page that can evidence it. */
    image: "/images/patriarca/campaign/macro-macro-04-temple-woodgrain.webp",
    alt: "The temple's woodgrain acetate and gold hinge, close",
    line: "Aria Noir does not produce disposable objects. Each frame is made with the expectation of years — not seasons.",
  },

  /**
   * The home page's sticky-left study, carrying the house's own argument.
   *
   * This page had two TextPairs and a band, which is three ways of saying
   * "here is a paragraph beside a picture" — the reader scrolls past all of
   * it at the same speed and remembers none of it. The sticky plate is the
   * one section shape on the site that makes a reader hold still, and the
   * question "who is this house" is the one place worth spending it.
   *
   * The plate is a figure wearing the frame, not the founders' studio
   * portrait it used to be — that shot was stock, and it was ALSO the
   * hero and the first plate of the opening, so the page showed the same
   * two pictures three times before the reader reached the quote.
   */
  study: {
    preheader: "The House",
    heading: [
      { text: "By designers,", italic: true },
      { text: "FOR VISIONARIES.", italic: false },
    ],
    stickyImage: "/images/matriarca/campaign/worn-aria-obelisk-courtyard.webp",
    stickyAlt: "MATRIARCA in the obelisk courtyard",
    /* Two staircases, two houses: the same gesture photographed in Rome
       and in a palazzo, which is the section's argument about one hand
       across six houses said in pictures. */
    pairOne: [
      "/images/monarca/campaign/worn-aria-grand-staircase.webp",
      "/images/patriarca/campaign/worn-noir-marble-staircase.webp",
    ],
    feature: {
      heading: "Limited by intent.",
      body: "Aria Noir lives in a space of limited-edition collections, where each pair speaks through exceptional materials, elevated design, and undeniable authenticity. Six houses, nine frames, and no intention of making a tenth until it earns the name.",
      /* Was "See the process" → /house/process, a page that no longer
         exists. The gallery is the nearest true answer to a claim about
         restraint: the frames in their rooms, and no prices. */
      cta: "See the rooms",
      href: "/gallery",
    },
    /* Two light studies and no product in either. After the feature's
       claim about restraint, a pair of rooms says it better than a pair
       of frames would. */
    pairTwo: [
      "/images/ahava/campaign/vibe-dust-in-window-light.webp",
      "/images/patriarca/campaign/vibe-vibe-01-lattice-shadows.webp",
    ],
    quote: "A frame should disappear on the face and survive the century.",
    quoteAttribution: "Aria Noir, founding note",
  },
  close: {
    heading: "Nine frames, and the reasons for each.",
    body: "The houses are where the thinking ends up. Start there, or read how a block of acetate becomes one of them.",
    cta: "See the frames",
    href: "/eyewear",
  },
} as const;

/* ── Client · Care ───────────────────────────────────────────────── */

/**
 * Every line on this page is arianoir.com's own.
 *
 * This section used to open with a five-point fit guide — bridge, nose,
 * temples, keyhole, brow line. The live store has no fit page and no fit
 * copy anywhere: not on the warranty page, not in the policies, not in a
 * single one of the thirty-six product descriptions. That guide was
 * written to the house's voice rather than taken from it, and one of its
 * rows made a claim about the product (an integrated cut nose rather than
 * wire pads) that nothing on the live site supports. Voice can be
 * imitated; a specification cannot.
 *
 * So the page is now what the house actually publishes: the warranty
 * page's CARE & RESPONSIBLE OWNERSHIP recommendations, each one paired
 * with the exclusion from the same document that explains why it matters,
 * and the brand commitment statement to close. If a fit guide is wanted,
 * the copy has to come from the bench, not from here.
 */

export const care = {
  hero: {
    eyebrow: "Care",
    title: "Designed with intention. Made to endure.",
    line: [
      { text: "Designed for longevity,", italic: true },
      { text: "NOT INDESTRUCTIBILITY.", italic: false },
    ],
    plate: `${P}/object-shadow.webp`,
    alt: "The object, raking shadow",
  },
  /**
   * The four live care recommendations, plus the service route. Each
   * `detail` is the matching line from the warranty's own exclusions —
   * the recommendation says what to do, the exclusion says what happens
   * if you don't.
   */
  keeping: {
    preheader: "Care Recommendations",
    heading: "To preserve the integrity and appearance of your Aria Noir eyewear.",
    rows: [
      {
        term: "The case",
        summary: "Store frames in their protective case when not in use.",
        detail:
          "Damage caused by impact, accident, misuse, or improper handling is not covered by the warranty. Aria Noir eyewear is designed for longevity, not indestructibility.",
      },
      {
        term: "The lenses",
        summary: "Clean lenses only with a microfiber cloth and approved solutions.",
        detail:
          "Scratches or surface wear to lenses are excluded from the warranty, as is damage from chemicals and solvents.",
      },
      {
        term: "Lens-down",
        summary: "Avoid placing frames lens-down on hard surfaces.",
        detail:
          "Normal wear, aging, or patina resulting from use is excluded from the warranty.",
      },
      {
        term: "Heat and light",
        summary:
          "Do not expose eyewear to excessive heat or prolonged sunlight in enclosed spaces.",
        detail:
          "Exposure to extreme heat, chemicals, solvents, saltwater, or corrosive environments is excluded from the warranty.",
      },
      {
        term: "Repairs",
        summary:
          "All evaluations are conducted by Aria Noir or its authorized service partners.",
        detail:
          "Unauthorized repairs, adjustments, or modifications are excluded from the warranty. Contact support@arianoir.com with proof of purchase and clear images of the issue, and our team will review and advise on next steps.",
      },
    ],
    plates: [
      { src: `${P}/spec-macro-nose.webp`, alt: "Macro: the nose" },
      { src: `${P}/spec-macro-keyhole-wear.webp`, alt: "Macro: the keyhole, worn" },
      { src: `${P}/spec-macro-inner-left-2.webp`, alt: "Macro: inner left temple, second study" },
      { src: `${P}/spec-macro-inner-right.webp`, alt: "Macro: inner right temple" },
      { src: `${P}/spec-macro-inner-right-2.webp`, alt: "Macro: inner right temple, second study" },
    ],
  },
  /** Verbatim: the warranty page's brand commitment statement. */
  ownership: {
    preheader: "Responsible Ownership",
    heading: "Proper care ensures longevity and preserves the architectural balance of the frame.",
    body: [
      "Aria Noir does not produce disposable objects. Each frame is made with the expectation of years — not seasons.",
      "This warranty exists not as a promise of replacement, but as confidence in what we build.",
    ],
    images: [
      { src: `${P}/object-front.webp`, alt: "The object, front elevation" },
      { src: `${P}/object-rain.webp`, alt: "The object in rain" },
    ],
  },
  close: {
    heading: "Two-year international limited warranty.",
    body: "Aria Noir eyewear is covered by a Two-Year International Limited Warranty against manufacturing defects, valid on authentic products purchased through authorized channels.",
    cta: "Contact the studio",
    href: "/contact",
  },
} as const;

/* The `process` and `lookbook` page data used to sit here — two full
   page objects, heroes, bands and grids, for /house/process and
   /lookbook/ss26. Both routes have been removed from the site, so the
   copy went with them rather than being left as content nothing can
   reach. */

/* ── Gallery ──────────────────────────────────────────────────────── */

/**
 * One plate: where it is, what is in it, and how much of the row it takes.
 *
 * `wide` is a 16:9 across the whole row; `half` the same proportion at
 * half the row; `tall` a 4:5 at a third. Three shapes, so a room can be
 * laid out as a page of a book rather than as a grid of thumbnails, and
 * no more than three, so the rooms read as one gallery.
 */
export type GalleryPlate = {
  src: string;
  alt: string;
  shape: "wide" | "half" | "tall";
};

export type GalleryRoom = {
  /** The house. */
  eyebrow: string;
  /** Where it was shot. Stated once. */
  heading: string;
  line: string;
  href: string;
  cta: string;
  plates: readonly GalleryPlate[];
};

/**
 * The campaigns, one room per house.
 *
 * Six houses, six worlds: ARCA I in a concrete corridor, ARCA II in a
 * cloister, AHAVA in a Paris apartment, MONARCA in a palazzo out of
 * season, PATRIARCA in Rome, MATRIARCA in Egypt. The buy page carries
 * three plates of each and the lookbook carries one season; this is the
 * only page that walks all six.
 *
 * Eight plates a room, curated rather than the folder: the full sets run
 * to forty-eight, and a gallery that shows everything is a contact sheet.
 * The order inside a room is the order someone walks into it: the place
 * wide, then the frame worn, then the object close.
 */
export const gallery = {
  hero: {
    eyebrow: "Gallery",
    title: "Six houses, six rooms.",
    line: [
      { text: "Where each frame", italic: true },
      { text: "WAS TAKEN.", italic: false },
    ],
    plate: "/images/monarca/campaign/wide-vaulted-gallery-hall.webp",
    alt: "A vaulted gallery hall, empty",
  },
  rooms: [
    {
      eyebrow: "ARCA I",
      heading: "Concrete, and one shaft of light.",
      line: "The first vessel, in the building it was cut in.",
      href: "/arca-i",
      cta: "See ARCA I",
      plates: [
        { src: `${P}/hero-wide.webp`, alt: "ARCA I, wide frame", shape: "wide" },
        { src: `${P}/worn-corridor.webp`, alt: "ARCA I worn, in a corridor", shape: "tall" },
        { src: `${P}/worn-threshold.webp`, alt: "ARCA I worn, at a threshold", shape: "tall" },
        { src: `${P}/worn-backlit.webp`, alt: "ARCA I worn, backlit", shape: "tall" },
        { src: `${P}/object-lightshaft.webp`, alt: "ARCA I, in a shaft of light", shape: "half" },
        { src: `${P}/pair-corridor.webp`, alt: "Two frames, one corridor", shape: "half" },
        { src: `${P}/structure-negative-space.webp`, alt: "Concrete, negative space", shape: "tall" },
        /* A lifestyle frame, not the bridge macro that was here. The
           gallery is the houses in their worlds — eight plates of rooms
           and figures with one bench macro dropped in the middle of them,
           which read as a spec sheet gatecrashing a lookbook. */
        { src: `${P}/worn-passage.webp`, alt: "ARCA I worn, in the passage", shape: "tall" },
        { src: `${P}/worn-lanterns.webp`, alt: "ARCA I worn, lanterns behind", shape: "tall" },
      ],
    },
    {
      eyebrow: "ARCA II",
      heading: "A cloister, after the light has gone.",
      line: "The second vessel. Quieter, and cut closer.",
      href: "/arca-ii",
      cta: "See ARCA II",
      plates: [
        { src: "/images/arca-ii/hero-arca.webp", alt: "ARCA II, wide frame", shape: "wide" },
        { src: "/images/arca-ii/lifestyle/noir-cloister.webp", alt: "ARCA II Noir, in the cloister", shape: "tall" },
        { src: "/images/arca-ii/worn-aria-doorway.webp", alt: "ARCA II worn, in a doorway", shape: "tall" },
        { src: "/images/arca-ii/worn-noir-profile.webp", alt: "ARCA II Noir worn, in profile", shape: "tall" },
        { src: "/images/arca-ii/lifestyle/pair-doorway.webp", alt: "Two frames, one doorway", shape: "half" },
        { src: "/images/arca-ii/structure-stair.webp", alt: "A stair in the cloister", shape: "half" },
        { src: "/images/arca-ii/worn-aria-trench.webp", alt: "ARCA II worn, trench coat", shape: "tall" },
        { src: "/images/arca-ii/spec-macro-eye-gold.webp", alt: "The eye, gold hardware", shape: "tall" },
        { src: "/images/arca-ii/worn-noir-edge.webp", alt: "ARCA II Noir worn, at the edge", shape: "tall" },
      ],
    },
    {
      eyebrow: "AHAVA",
      heading: "Paris. A sixth floor, before the street is awake.",
      line: "Nothing in the room competes with it.",
      href: "/shop/ahava",
      cta: "Acquire AHAVA",
      plates: [
        { src: "/images/ahava/campaign/wide-grand-salon-full-depth.webp", alt: "A grand salon, full depth", shape: "wide" },
        { src: "/images/ahava/campaign/worn-aria-reading-chair.webp", alt: "AHAVA worn, reading chair", shape: "tall" },
        { src: "/images/ahava/campaign/worn-noir-enfilade-door.webp", alt: "AHAVA Noir worn, enfilade door", shape: "tall" },
        { src: "/images/ahava/campaign/worn-aria-herringbone-floor.webp", alt: "AHAVA worn, herringbone floor", shape: "tall" },
        { src: "/images/ahava/campaign/wide-haussmannian-facade-morning.webp", alt: "A Haussmannian facade, morning", shape: "half" },
        { src: "/images/ahava/campaign/vibe-dust-in-window-light.webp", alt: "Dust in window light", shape: "half" },
        { src: "/images/ahava/campaign/creative-noir-gilt-mirror-reflection.webp", alt: "AHAVA Noir in a gilt mirror", shape: "tall" },
        { src: "/images/ahava/campaign/macro-lens-coffee-cup.webp", alt: "The lens, beside a coffee cup", shape: "tall" },
        { src: "/images/ahava/campaign/duo-facade-morning-street.webp", alt: "Two, on the morning street", shape: "tall" },
      ],
    },
    {
      eyebrow: "MONARCA",
      heading: "A palazzo out of season. Canals, lantern light, rain.",
      line: "The sovereign, and the water it looks over.",
      href: "/shop/monarca",
      cta: "Acquire MONARCA",
      plates: [
        { src: "/images/monarca/campaign/wide-canal-still-water.webp", alt: "A canal, still water", shape: "wide" },
        { src: "/images/monarca/campaign/worn-aria-lantern-bridge.webp", alt: "MONARCA worn, lantern bridge", shape: "tall" },
        { src: "/images/monarca/campaign/worn-noir-grand-staircase.webp", alt: "MONARCA Noir worn, grand staircase", shape: "tall" },
        { src: "/images/monarca/campaign/worn-aria-doorway-between-rooms.webp", alt: "MONARCA worn, between rooms", shape: "tall" },
        { src: "/images/monarca/campaign/wide-great-ballroom.webp", alt: "The great ballroom", shape: "half" },
        { src: "/images/monarca/campaign/wide-long-alley-rain.webp", alt: "A long alley in the rain", shape: "half" },
        { src: "/images/monarca/campaign/creative-noir-rain-window.webp", alt: "MONARCA Noir, rain on the window", shape: "tall" },
        { src: "/images/monarca/campaign/macro-lens-bevel-water-reflection.webp", alt: "The lens bevel, water reflected", shape: "tall" },
        { src: "/images/monarca/campaign/worn-noir-water-reflection.webp", alt: "MONARCA Noir worn, reflected in water", shape: "tall" },
      ],
    },
    {
      eyebrow: "PATRIARCA",
      heading: "Rome. Marble, and the last hour of the light.",
      line: "Worn like something issued rather than bought.",
      href: "/shop/patriarca",
      cta: "Acquire PATRIARCA",
      plates: [
        { src: "/images/patriarca/campaign/wide-basilica-interior.webp", alt: "A basilica interior", shape: "wide" },
        { src: "/images/patriarca/campaign/worn-aria-marble-staircase.webp", alt: "PATRIARCA worn, marble staircase", shape: "tall" },
        { src: "/images/patriarca/campaign/worn-noir-among-columns.webp", alt: "PATRIARCA Noir worn, among columns", shape: "tall" },
        { src: "/images/patriarca/campaign/worn-aria-arched-doorway.webp", alt: "PATRIARCA worn, arched doorway", shape: "tall" },
        { src: "/images/patriarca/campaign/wide-bathhouse-oculus.webp", alt: "A bathhouse oculus", shape: "half" },
        { src: "/images/patriarca/campaign/wide-ruins-golden-hour.webp", alt: "Ruins at golden hour", shape: "half" },
        { src: "/images/patriarca/campaign/creative-noir-creative-04-doorway-silhouette.webp", alt: "PATRIARCA Noir, doorway silhouette", shape: "tall" },
        { src: "/images/patriarca/campaign/macro-macro-02-hinge-column.webp", alt: "The hinge, against a column", shape: "tall" },
        { src: "/images/patriarca/campaign/duo-duo-roman-steps.webp", alt: "Two, on Roman steps", shape: "tall" },
      ],
    },
    {
      eyebrow: "MATRIARCA",
      heading: "Karnak. Abu Simbel. Giza.",
      line: "The monuments are enormous. The object is not.",
      href: "/shop/matriarca",
      cta: "Acquire MATRIARCA",
      plates: [
        { src: "/images/matriarca/campaign/wide-aria-solo-wide-02-giza-dune-panoramic.webp", alt: "Giza, from the dunes", shape: "wide" },
        { src: "/images/matriarca/campaign/worn-aria-closeup-02-profile-golden.webp", alt: "MATRIARCA worn, profile in golden light", shape: "tall" },
        { src: "/images/matriarca/campaign/worn-noir-closeup-01-stone-archway.webp", alt: "MATRIARCA Noir worn, stone archway", shape: "tall" },
        { src: "/images/matriarca/campaign/worn-aria-obelisk-courtyard.webp", alt: "MATRIARCA worn, obelisk courtyard", shape: "tall" },
        { src: "/images/matriarca/campaign/wide-hypostyle-hall.webp", alt: "The hypostyle hall", shape: "half" },
        { src: "/images/matriarca/campaign/wide-temple-ruins-golden-hour.webp", alt: "Temple ruins at golden hour", shape: "half" },
        { src: "/images/matriarca/campaign/vibe-vibe-02-fallen-statue.webp", alt: "A fallen statue", shape: "tall" },
        { src: "/images/matriarca/campaign/macro-macro-01-bridge-relief.webp", alt: "The bridge, relief", shape: "tall" },
        { src: "/images/matriarca/campaign/duo-duo-wide-03-abu-simbel.webp", alt: "Two, at Abu Simbel", shape: "tall" },
      ],
    },
  ] satisfies readonly GalleryRoom[],
  close: {
    heading: "The rooms are where the thinking ends up.",
    body: "Every plate here was taken with a frame from the bench. Find the one cut for your face.",
    cta: "Shop all",
    href: "/shop",
  },
} as const;

/* ── Eyewear index ────────────────────────────────────────────────── */

export const eyewear = {
  hero: {
    eyebrow: "The Collections",
    /**
     * No count, deliberately.
     *
     * This read "Two houses, one hand.", and before that "Six houses" —
     * hand-corrected when VISIBLE_SLUGS narrowed the index, which is the
     * kind of edit that gets forgotten exactly once. An index does not
     * need to say how many things are in it; the things are directly
     * below, and the reader can see. What it can say is that there is
     * nothing else, which is the only promise an index makes.
     *
     * The count still appears, once, in the line under this one, where it
     * is read from the catalogue rather than typed.
     */
    title: "Every cut the house has made.",
    line: [
      { text: "Five frames.", italic: true },
      { text: "NOTHING MADE TWICE.", italic: false },
    ],
    plate: "/images/arca-showroom.webp",
    alt: "The showroom",
  },
  intro:
    "Each house is a single cut, held in the colourways it earns. ARCA I is the exception: the founding model, and the only one the bench has taken in four directions.",

} as const;

/* ── Contact ──────────────────────────────────────────────────────── */

export const contact = {
  hero: {
    eyebrow: "Contact",
    title: "Talk to the studio.",
    plate: "/images/contact/window-light.webp",
    platePortrait: "/images/contact/window-light-mobile.webp",
    alt: "Dust in a shaft of window light, in the studio",
  },
  /**
   * The intake, one question at a time.
   *
   * Three steps rather than one form: what it is about, who is asking,
   * and the message. The first answer picks the desk the mail goes to,
   * so nobody has to know which address is which. No backend yet; the
   * last step hands off to `mailto:` with everything filled in.
   */
  intake: {
    eyebrow: "Write to the bench",
    steps: ["What it is about", "Who is asking", "The message"],
    subjects: [
      { label: "An order", to: "support@arianoir.com" },
      { label: "Fit & adjustments", to: "support@arianoir.com" },
      { label: "A warranty claim", to: "support@arianoir.com" },
      { label: "Press", to: "press@arianoir.com" },
      { label: "Something else", to: "admin@arianoir.com" },
    ],
    back: "Back",
    next: "Continue",
    send: "Send",
    sent: "Opening your mail client.",
  },
  /* The live site's own line, and only its own addresses: support@ (the
     contact page and the warranty procedure), admin@ (service, on the
     warranty page) and press@ (the storefront). No phone, no street
     address, no returns desk: the storefront publishes none, so this page
     does not invent them. */
  intro:
    "If you need help with your purchase, or to find the information you require, write to us.",
  form: {
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    message: "How can we help?",
    submit: "Send",
    note: "We reply within two business days.",
  },
  desks: [
    { label: "Support & warranty", value: "support@arianoir.com" },
    { label: "Service", value: "admin@arianoir.com" },
    { label: "Press", value: "press@arianoir.com" },
  ],
} as const;

/* ── 404 ──────────────────────────────────────────────────────────── */

export const notFound = {
  code: "404",
  heading: "Nothing here.",
  body: "The page you asked for has been moved, retired, or was never cut in the first place.",
  cta: "Back to the house",
  href: "/",
} as const;
