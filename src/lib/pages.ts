/**
 * Copy and plate assignments for the section pages.
 *
 * Where a line came off arianoir.com it is kept as the house wrote it —
 * the brand/company/vision triptych, the care instructions, the shipping
 * windows. Where the live store had no page at all (the process, the fit
 * guide) the copy is written to the same voice, so it reads as the house
 * and can be replaced without hunting for it.
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
    plate: "/images/plate-12-founders.jpg",
    alt: "The founders, studio portrait",
  },
  /** The live store's About page, in its three named parts. */
  opening: {
    preheader: "The Brand",
    heading: "We design with intention.",
    body: [
      "Aria Noir crafts frames that balance artistry and function — where timeless elegance meets bold innovation. Each piece is a reflection of symmetry, style, and soul.",
      "Our work is driven by a deep passion for design and craftsmanship. We pursue the perfect harmony of form and vision, creating eyewear that is not only a statement but an experience.",
    ],
    images: [
      { src: "/images/plate-17-founders-duo.jpg", alt: "The founders, paired portrait" },
      { src: "/images/plate-13-studio-shadow.jpg", alt: "The studio in shadow" },
    ],
  },
  vision: {
    preheader: "The Vision",
    heading: "Less, and then less again.",
    body: [
      "With a focus on thoughtful design and refined minimalism, we embrace a less-is-more philosophy. Aria Noir lives in a space of limited-edition collections, where each pair speaks through exceptional materials, elevated design, and undeniable authenticity.",
      "Every frame is the result of curated talent and a relentless dedication to detail. Six houses, nine frames, and no intention of making a tenth until it earns the name.",
    ],
    images: [
      { src: "/images/plate-00-masked-dancers.jpg", alt: "Campaign plate, masked figures" },
      { src: "/images/plate-16-masked-dancers-02.jpg", alt: "Campaign plate, masked figures, second frame" },
    ],
  },
  band: {
    image: "/images/plate-05-macro.jpg",
    alt: "Macro study of an acetate edge",
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
   * The plate is the founders. It is the correct image for the section
   * precisely because it is the only claim on the page that a photograph
   * can actually evidence.
   */
  study: {
    preheader: "The House",
    heading: [
      { text: "By designers,", italic: true },
      { text: "FOR VISIONARIES.", italic: false },
    ],
    stickyImage: "/images/plate-12-founders.jpg",
    stickyAlt: "The founders",
    pairOne: [
      "/images/plate-17-founders-duo.jpg",
      "/images/plate-13-studio-shadow.jpg",
    ],
    feature: {
      heading: "Limited by intent.",
      body: "Aria Noir lives in a space of limited-edition collections, where each pair speaks through exceptional materials, elevated design, and undeniable authenticity. Six houses, nine frames, and no intention of making a tenth until it earns the name.",
      cta: "See the process",
      href: "/house/process",
    },
    pairTwo: [
      "/images/plate-00-masked-dancers.jpg",
      "/images/plate-16-masked-dancers-02.jpg",
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

/* ── The House · Process ──────────────────────────────────────────── */

export const process = {
  hero: {
    eyebrow: "Inside the Atelier",
    title: "Twenty-four steps, none of them automated.",
    line: [
      { text: "Cut, not moulded —", italic: true },
      { text: "AND FINISHED BY HAND.", italic: false },
    ],
    plate: `${P}/macro-lens.jpg`,
    alt: "Macro study of a lens edge",
  },
  study: {
    preheader: "The Bench",
    heading: "What twenty-four steps actually means.",
    /** Numbered because this genuinely is a sequence — the order is the
     *  information, not decoration on it. */
    rows: [
      {
        term: "01 — The block",
        summary: "A solid sheet of Italian acetate, chosen for its figure.",
        detail:
          "The pattern runs through the material rather than across its surface, which is why a cut frame holds colour at the edge where a moulded one shows a seam.",
      },
      {
        term: "02 — Milling",
        summary: "The front is cut down from the block, never poured into it.",
        detail:
          "Milling removes most of the sheet's mass. What is left is the only part that was ever going to be the frame.",
      },
      {
        term: "03 — The bridge",
        summary: "Cut last of the front's geometry, and cut to a face.",
        detail:
          "No two faces share a bridge, a temple length, or a line of brow. The bridge is where a frame either sits or does not, so it is the measurement everything else is taken from.",
      },
      {
        term: "04 — Hinges",
        summary: "Set into the acetate, not screwed onto it.",
        detail:
          "The hinge is heated into a seat cut for it, so the joint is carried by the frame's own architecture. It is the part a warranty claim is usually about, and the part that takes the most bench time.",
      },
      {
        term: "05 — Tumbling",
        summary: "Days, not hours, in progressively finer media.",
        detail:
          "The step that cannot be hurried and cannot be faked. The gloss on a finished front is abrasion, not lacquer, which is why it does not cloud with age.",
      },
      {
        term: "06 — Hand finishing",
        summary: "The last half-millimetre, by eye and by thumb.",
        detail:
          "Every frame is dressed by hand at the end. It is the only part anyone actually feels, and the reason two frames from the same run are never quite identical.",
      },
    ],
    plates: [
      { src: `${P}/spec-macro-bridge.jpg`, alt: "Macro: the bridge" },
      { src: `${P}/spec-macro-inner-left.jpg`, alt: "Macro: inner left temple" },
      { src: `${P}/spec-macro-keyhole.jpg`, alt: "Macro: the keyhole" },
      { src: `${P}/spec-macro-ltemple.jpg`, alt: "Macro: left temple" },
      { src: `${P}/spec-macro-rtemple.jpg`, alt: "Macro: right temple" },
      { src: `${P}/spec-macro-inner-right-full.jpg`, alt: "Macro: inner right temple, full" },
    ],
  },
  band: {
    image: `${P}/object-lightshaft.jpg`,
    alt: "The object in a shaft of light",
    line: "A frame should disappear on the face and survive the century.",
  },
  close: {
    heading: "Made slowly, on purpose.",
    body: "Two years of international warranty is not a promise of replacement. It is confidence in what comes off the bench.",
    cta: "Read the warranty",
    href: "/policies/warranty",
  },
} as const;

/* ── Client · Fit & Care ──────────────────────────────────────────── */

export const care = {
  hero: {
    eyebrow: "Fit & Care",
    title: "Where a frame meets a face.",
    line: [
      { text: "Five contact points.", italic: true },
      { text: "ALL FIVE HAVE TO AGREE.", italic: false },
    ],
    plate: `${P}/object-shadow.jpg`,
    alt: "The object, raking shadow",
  },
  fit: {
    preheader: "The Fit",
    heading: "Five points, and what each one tells you.",
    rows: [
      {
        term: "The bridge",
        summary: "It should rest, not grip.",
        detail:
          "A bridge that pinches leaves a mark within the hour. A bridge that slides is too wide, and no amount of temple adjustment will fix it — the frame is carrying its weight in the wrong place.",
      },
      {
        term: "The nose",
        summary: "Weight spread across the pads, never on a single edge.",
        detail:
          "Our fronts are cut with an integrated nose rather than fitted with wire pads, so the surface carrying the frame is acetate shaped to a face. It can be warmed and adjusted; it cannot be swapped.",
      },
      {
        term: "The temples",
        summary: "Straight to the ear, then down — not down from the hinge.",
        detail:
          "A temple that begins to curve at the hinge is squeezing the sides of the head to stay on. Set correctly, the frame is held by the ear and the bridge, and the temples touch almost nothing in between.",
      },
      {
        term: "The keyhole",
        summary: "The gap under the bridge should be visible, and even.",
        detail:
          "Uneven light through the keyhole is the fastest read on whether a frame is sitting square. It is the first thing we check on the bench and the easiest thing to check in a mirror.",
      },
      {
        term: "The brow line",
        summary: "The top of the frame should follow the brow, not cross it.",
        detail:
          "The only one of the five that is aesthetic rather than structural, and the only one that cannot be adjusted after the fact — it is decided by which house you choose.",
      },
    ],
    plates: [
      { src: `${P}/spec-macro-nose.jpg`, alt: "Macro: the nose" },
      { src: `${P}/spec-macro-keyhole-wear.jpg`, alt: "Macro: the keyhole, worn" },
      { src: `${P}/spec-macro-inner-left-2.jpg`, alt: "Macro: inner left temple, second study" },
      { src: `${P}/spec-macro-inner-right.jpg`, alt: "Macro: inner right temple" },
      { src: `${P}/spec-macro-inner-right-2.jpg`, alt: "Macro: inner right temple, second study" },
    ],
  },
  /** Verbatim from the live warranty page's care section. */
  keeping: {
    preheader: "Care",
    heading: "Proper care preserves the architectural balance of the frame.",
    body: [
      "Store frames in their protective case when not in use. Clean lenses only with a microfiber cloth and approved solutions.",
      "Avoid placing frames lens-down on hard surfaces, and do not expose eyewear to excessive heat or prolonged sunlight in enclosed spaces — a dashboard in summer will do more damage in an afternoon than a year of wear.",
    ],
    images: [
      { src: `${P}/object-front.jpg`, alt: "The object, front elevation" },
      { src: `${P}/object-rain.jpg`, alt: "The object in rain" },
    ],
  },
  close: {
    heading: "Something not sitting right?",
    body: "Adjustments are part of owning the frame, not a fault in it. Send us a photograph straight on and we will tell you what to change.",
    cta: "Contact the studio",
    href: "/contact",
  },
} as const;

/* ── Lookbook SS26 ────────────────────────────────────────────────── */

export const lookbook = {
  hero: {
    eyebrow: "Aria Noir — SS26",
    title: "Every pair, its own face.",
    line: [
      { text: "Conceived in shadow,", italic: true },
      { text: "REFINED TO THE ESSENTIAL LINE.", italic: false },
    ],
    plate: `${P}/hero-wide.jpg`,
    alt: "SS26 campaign, wide frame",
  },
  grid: {
    preheader: "Selected Work",
    heading: "SS26",
    cta: "Shop the collection",
    /** Three columns, equal counts, so the curtain always rests aligned —
     *  the same rule the home gallery is built on. */
    columns: [
      [`${P}/worn-01.jpg`, `${P}/worn-04.jpg`, `${P}/worn-07.jpg`, `${P}/worn-10.jpg`],
      [`${P}/worn-02.jpg`, `${P}/worn-05.jpg`, `${P}/worn-08.jpg`, `${P}/worn-11.jpg`],
      [`${P}/worn-03.jpg`, `${P}/worn-06.jpg`, `${P}/worn-09.jpg`, `${P}/worn-12.jpg`],
    ],
  },
  /**
   * The book, as an actual book.
   *
   * Six leaves, each with a front and a back, riffled by the pointer. This
   * is the one page on the site where a page-turn is not a metaphor being
   * imposed on a grid — a lookbook IS a bound object, and the falling
   * curtain below it is the same twelve plates laid flat for anyone who
   * would rather scan than leaf.
   */
  book: {
    preheader: "The Book",
    heading: "SS26, bound.",
    note: "Six leaves. Move the pointer across the spine.",
    leaves: [
      { front: `${P}/worn-01.jpg`, back: `${P}/worn-02.jpg` },
      { front: `${P}/worn-03.jpg`, back: `${P}/worn-04.jpg` },
      { front: `${P}/worn-05.jpg`, back: `${P}/worn-06.jpg` },
      { front: `${P}/worn-07.jpg`, back: `${P}/worn-08.jpg` },
      { front: `${P}/worn-09.jpg`, back: `${P}/worn-10.jpg` },
      { front: `${P}/worn-11.jpg`, back: `${P}/worn-12.jpg` },
    ],
  },
  band: {
    image: `${P}/pair-corridor.jpg`,
    alt: "SS26 campaign, pair in a corridor",
    line: "Los Angeles, 2026. Front row, FW26.",
  },
  close: {
    heading: "The season, in six houses.",
    body: "Every frame in this book comes off the same bench in the same building. Find the one cut for your face.",
    cta: "See the frames",
    href: "/eyewear",
  },
} as const;

/* ── Eyewear index ────────────────────────────────────────────────── */

export const eyewear = {
  hero: {
    eyebrow: "The Collections",
    title: "Six houses, one hand.",
    line: [
      { text: "Nine frames.", italic: true },
      { text: "NOTHING MADE TWICE.", italic: false },
    ],
    plate: "/images/arca-showroom.png",
    alt: "The showroom",
  },
  intro:
    "Each house is a single cut, held in the colourways it earns. ARCA I is the exception — the founding model, and the only one the bench has taken in four directions.",

  /** The stage is the hero, so this is the line under the page title —
   *  it turntables away with it as the first frame forms. */
  stage: {
    sub: "Six houses · MMXXVI",
  },
} as const;

/* ── Contact ──────────────────────────────────────────────────────── */

export const contact = {
  hero: {
    eyebrow: "Contact",
    title: "Talk to the studio.",
    plate: "/images/plate-13-studio-shadow.jpg",
    alt: "The studio in shadow",
  },
  intro:
    "If you need help with a purchase, an adjustment, or a warranty claim, write to us directly. We answer from the bench, not from a queue.",
  /** The live contact form, minus the fields nobody completes. */
  form: {
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    message: "How can we help?",
    submit: "Send",
    note: "We reply within two business days.",
  },
  desks: [
    { label: "Support & adjustments", value: "support@arianoir.com" },
    { label: "Returns", value: "returns@arianoir.com" },
    { label: "Warranty & press", value: "admin@arianoir.com" },
  ],
  studio: { label: "Studio", value: "Los Angeles, California" },

  /**
   * The routes block — the registry's contact-12, in the house's words.
   *
   * Six of them because the block is a three-column grid and five leaves a
   * hole, and every one has to be a place a real message actually lands.
   * The stock copy was demos, seats and an on-call engineer; a frame shop
   * has adjustments, returns and a warranty claim, and pretending otherwise
   * would be the page describing a company that does not exist.
   */
  routes: {
    eyebrow: "The Desks",
    heading: "Every question has one address.",
    body: "There is no ticket queue behind any of these. The house is small enough that the person who answers is the person who can fix it.",
    figure: "Two days",
    figureNote: "Median first reply, and we count weekends out.",
    items: [
      {
        index: "01",
        title: "Fit & adjustments",
        description:
          "A frame that sits wrong is usually four minutes at a bench, not a return. Tell us where it bites and we will tell you which of the five points to move.",
        cta: "Write to support",
        href: "mailto:support@arianoir.com",
      },
      {
        index: "02",
        title: "Returns",
        description:
          "Thirty days, unworn, in the case it came in. Start it here and the label comes back the same day.",
        cta: "Open a return",
        href: "mailto:returns@arianoir.com",
      },
      {
        index: "03",
        title: "Warranty",
        description:
          "Two years on the hinge and the front. Most claims are a hinge seat, which is a repair rather than a replacement — send a photograph first.",
        cta: "Make a claim",
        href: "mailto:admin@arianoir.com",
      },
      {
        index: "04",
        title: "Commissions",
        description:
          "A private fitting, a house, and eleven days on the bench. Nothing leaves the studio until the bridge is right.",
        cta: "Begin a commission",
        href: "mailto:support@arianoir.com",
      },
      {
        index: "05",
        title: "Press & stockists",
        description:
          "Lookbooks, plates at print resolution, and the terms we wholesale on. One address for both.",
        cta: "Contact the studio",
        href: "mailto:admin@arianoir.com",
      },
      {
        index: "06",
        title: "Your account",
        description:
          "Orders, addresses and anything already paid for. The shop side lives on its own surface.",
        cta: "Sign in",
        href: "/access",
      },
    ],
  },
} as const;

/* ── 404 ──────────────────────────────────────────────────────────── */

export const notFound = {
  code: "404",
  heading: "Nothing here.",
  body: "The page you asked for has been moved, retired, or was never cut in the first place.",
  cta: "Back to the house",
  href: "/",
} as const;
