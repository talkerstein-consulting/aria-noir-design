// Placeholder copy — swap freely, layout never needs touching to revise text.

export const opening = {
  stackA: ["AN OBJECT MADE", "TO BE WORN"],
  stackB: ["A GAZE MADE", "TO LAST"],
};

export const nav = {
  left: "Menu",
  /* "Access", not "Log in". The account surface is a door the house opens
     for people who already own something; "log in" is what a dashboard
     says. */
  right: "Access",
  /* The same control, once the reader has been through the door. Shorter
     than ACCESS, which the header's fixed column count is fine with — the
     three columns are sized by the grid, not by this word. */
  bag: "Bag",
};

export const sectionTwo = {
  heading: "Every frame begins with a single face.",
  /** Two columns, sitting under the heading during its hang. */
  body: [
    "No two faces share a bridge, a temple length, or a line of brow. We measure all three before a single blank is cut, so the frame is drawn to one head and no other.",
    "What follows is slow. Eleven days at the bench, forty-two operations, none of them automated — because the last half-millimetre is the only part anyone actually feels.",
  ],
};

export const product = {
  heading: "ARCA I",
  subheading: "Acetate · Signature",
  body:
    "Cut from a solid block of Italian acetate and finished by hand in solid gold. Forty-two separate operations, none of them automated, across eleven days at the bench.",
  cta: "Acquire ARCA I",
};

export const atelier = {
  preheader: "Inside the Atelier",
  /** Mixed treatment: italic lowercase against roman caps. */
  heading: [
    { text: "Made slowly,", italic: true },
    { text: "ON PURPOSE.", italic: false },
  ],
  stickyImage: "/images/plate-12-founders.jpg",
  pairOne: [
    "/images/plate-16-masked-dancers-02.jpg",
    "/images/plate-05-macro.jpg",
  ],
  feature: {
    heading: "Cut, not moulded.",
    body:
      "Every Aria Noir frame begins as a solid block. We mill it down rather than pour it out, which is why the acetate holds an edge that injection moulding can only imitate. The gold is set by hand, last, once the shape has already earned it.",
    cta: "See the process",
  },
  pairTwo: [
    "/images/plate-13-studio-shadow.jpg",
    "/images/plate-00-masked-dancers.jpg",
  ],
  quote: "A frame should disappear on the face and survive the century.",
  quoteAttribution: "Aria Noir, founding note",
};

export const collections = {
  preheader: "The Collections",
  heading: [
    { text: "Six houses,", italic: true },
    { text: "ONE HAND.", italic: false },
  ],
  /**
   * The panels themselves are built from `houses` in lib/navigation — see
   * collections-section.tsx. ALL SIX of them, in the order they were cut.
   *
   * They used to be three hand-written objects here, and they had drifted
   * badly: the heading said three houses when the bench cuts six,
   * PATRIARCA was labelled "Titanium" and AHAVA "Solid gold". Neither is
   * true — every house is acetate, and the gold is the hardware set into
   * it. That is not a typo, it is the home page describing a different
   * company's catalogue on the one screen most readers will ever see.
   *
   * Copy that restates a fact the catalogue already holds will always end
   * up disagreeing with it, so the names, the materials and the
   * destinations are read rather than written. Nothing about the set is
   * decided here any more, which is why there is no list left in this
   * file: "six houses" is not an editorial choice, it is how many there
   * are.
   */
};

export const gallery = {
  preheader: "Selected Work",
  heading: [
    { text: "Every pair,", italic: true },
    { text: "ITS OWN FACE.", italic: false },
  ],
  cta: "Explore the gallery",
  /** Three columns × three rows, EQUAL photo counts so the grid always rests
   *  aligned — the only difference between columns is fall velocity. Every
   *  slot is a distinct plate: the previous four-column version needed
   *  sixteen and there are only nine, so half the grid was the same photo
   *  twice and the repeats were the first thing the eye found. */
  columns: [
    [
      "/images/plate-17-founders-duo.jpg",
      "/images/plate-13-studio-shadow.jpg",
      "/images/plate-00-masked-dancers.jpg",
    ],
    [
      "/images/plate-05-macro.jpg",
      "/images/plate-10-ahava.jpg",
      "/images/plate-12-founders.jpg",
    ],
    [
      "/images/plate-16-masked-dancers-02.jpg",
      "/images/plate-09-patriarca.jpg",
      "/images/plate-08-matriarca.jpg",
    ],
  ],
};

export const finale = {
  lines: [
    "WE MAKE ONE THING",
    "AND WE MAKE IT",
    "TO OUTLAST THE FACE",
    "THAT WORE IT FIRST",
  ],
  attribution: "Aria Noir — founding note",
  /** Pulled by the pointer trail. */
  trail: [
    "/images/plate-08-matriarca.jpg",
    "/images/plate-05-macro.jpg",
    "/images/plate-16-masked-dancers-02.jpg",
    "/images/plate-09-patriarca.jpg",
    "/images/plate-12-founders.jpg",
    "/images/plate-10-ahava.jpg",
    "/images/plate-13-studio-shadow.jpg",
    "/images/plate-17-founders-duo.jpg",
    "/images/plate-00-masked-dancers.jpg",
  ],
};

/**
 * The closing block, which used to be a commission pitch — "Commission a
 * frame that outlives you", a private fitting, eleven days on the bench.
 *
 * It is a newsletter intake now. The commission argument is made properly
 * on /contact, where there is a form that can actually take it; repeating
 * the offer at the foot of the home page asked for a decision from a reader
 * who has just finished looking rather than started. An address is the
 * smaller, likelier thing to ask for at the end of a page.
 */
export const newsletter = {
  heading: "Word from the bench.",
  body:
    "One letter when a house is finished, a run opens, or a date is set for the bench. Nothing else, and never often.",
  label: "Email address",
  cta: "Subscribe",
  note: "A few times a year. Leave whenever you like.",
};

/**
 * The private-access module: one frame in the dark, under a lamp that
 * crosses it as the reader scrolls.
 *
 * It sits after the gallery and before the dark-to-light handoff, which is
 * the last stretch of black on the page — the right ground for the one
 * offer the house makes that is not for everybody.
 */
export const privateAccess = {
  heading: "The next edition isn't for everyone.",
  body:
    "Private access to unreleased frames, limited editions, and first releases — before they enter the collection.",
  cta: "Request private access",
  href: "/contact",
  /** The model the section lights. The house has no story page yet, so
   *  nothing on the site contradicts a frame that is not released. */
  model: "/models/houses/monarca-monarca-noir.glb",
};

export const footer = {
  /* The link columns used to live here as bare strings, all rendered with
     `href="#"`. They are routes, not copy, so they moved to lib/navigation
     as `sitemap` — where a link has somewhere to go. */
  newsletterLabel: "Stay in touch with the studio",
  newsletterPlaceholder: "Email address",
  /* One, because one is what the house has. Pinterest and LinkedIn were
     here as `href="#"` alongside it — the same furniture the link columns
     were, and just as dead. Add them back the day there is an account to
     point at. */
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/ARIANOIR_OFFICIAL/",
    },
  ],
  legal: "© 2026 Aria Noir. All rights reserved.",
  legalLinks: [
    { label: "Privacy", href: "/policies/privacy" },
    { label: "Terms", href: "/policies/terms" },
    /* No cookie page exists, and the site sets no cookies to write one
       about. It was in this list because footers usually have three. */
  ],
};
