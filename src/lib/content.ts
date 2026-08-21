// Placeholder copy — swap freely, layout never needs touching to revise text.

export const opening = {
  stackA: ["AN OBJECT MADE", "TO BE WORN"],
  stackB: ["A GAZE MADE", "TO LAST"],
};

export const nav = {
  left: "Menu",
  right: "Log in",
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
    { text: "Three houses,", italic: true },
    { text: "ONE HAND.", italic: false },
  ],
  items: [
    {
      name: "ARCA I",
      meta: "01 — Block acetate",
      image: "/images/arca-i/object-front.jpg",
      /** The only collection panel with a page of its own, so far. */
      href: "/arca-i",
      cta: "View ARCA I",
    },
    {
      name: "PATRIARCA",
      meta: "02 — Titanium",
      image: "/images/plate-09-patriarca.jpg",
    },
    {
      name: "AHAVA",
      meta: "03 — Solid gold",
      image: "/images/plate-10-ahava.jpg",
    },
  ],
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

export const typo = {
  heading: "Commission a frame that outlives you.",
  body:
    "Every commission begins with a private fitting. We measure the face, discuss the house, and hold the bench for eleven days. Nothing leaves the studio until it is right.",
  cta: "Begin a commission",
};

export const footer = {
  columns: [
    {
      title: "Collections",
      links: ["Matriarca", "Patriarca", "Ahava", "The Archive"],
    },
    { title: "Studio", links: ["About", "Atelier", "Journal", "Contact"] },
    {
      title: "Client",
      links: ["Book a fitting", "Repairs", "Shipping", "Returns"],
    },
  ],
  newsletterLabel: "Stay in touch with the studio",
  newsletterPlaceholder: "Email address",
  socials: ["Instagram", "Pinterest", "LinkedIn"],
  legal: "© 2026 Aria Noir. All rights reserved.",
  legalLinks: ["Privacy", "Terms", "Cookies"],
};
