/**
 * The home page's words.
 *
 * Governed by COPY.md, which is the house's master prompt and the copy of
 * record. Read it before changing anything here. The rules that bite most
 * often on this page: no em-dashes, nothing explained that can be simply
 * stated, and the tagline is never unpacked.
 *
 * Layout never needs touching to revise text.
 */

import { housesOnShow } from "./navigation";

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
  /* The way out of the opening. This block used to be the end of the
     choreography and nothing else: the reader arrived at a heading, read
     two columns, and had to keep scrolling on faith. It is the first
     sentence on the page that names the product, so it is the first place
     that should offer the frames. */
  cta: "See the frames",
  href: "/eyewear",
  /** Two columns, sitting under the heading during its hang. */
  body: [
    "No two faces share a bridge, a temple length, or a line of brow. We measure all three before a single blank is cut.",
    "What follows is slow. Eleven days at the bench, forty-two operations, and the last half-millimetre done by hand.",
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
  /**
   * Mixed treatment: italic lowercase against roman caps.
   *
   * This said "Made slowly, ON PURPOSE." for a long time, and it was the
   * weakest line on the page. Every workshop in the world says it, it
   * apologises for the slowness in the same breath as claiming it, and
   * "on purpose" is an explanation bolted onto a fact that did not need
   * one. The section is about SUBTRACTION: a frame here is what is left
   * of a block after eleven days of removing. So the heading states the
   * one fact that makes that true, and withholds how.
   */
  heading: [
    { text: "Nothing here is", italic: true },
    { text: "MOULDED.", italic: false },
  ],
  /* ---- worn, not macro ----

     This beat ran on the object alone: the frame against poured concrete,
     the Deco plate, the frame on a windowsill. Every plate here is the
     frame being worn now. Five masters no other page uses, so nothing on
     the site is showing the same photograph twice.

     The sticky column is the Together Shot: the two of them in one frame,
     which is what this column is for. It is a 16:9 master in a slot the
     height of the viewport, so object-cover holds the centre and loses
     the sides. The pair sit centre, which is what makes that survivable
     rather than a crop through somebody's face. See the note on this
     entry in scripts/import-arca-photography.mjs. */
  stickyImage: "/images/arca-ii/home/pair-lit-dark.jpg",
  stickyAlt: "Aria and Noir together, both wearing ARCA II",
  pairOne: [
    "/images/arca-i/home/noir-corridor-stand.jpg",
    "/images/arca-ii/home/aria-cloister-full.jpg",
  ],
  feature: {
    heading: "The block comes first.",
    body:
      "Italian acetate, milled down rather than poured out. The gold is set by hand, into a shape that has already earned it.",
    cta: "See the process",
  },
  pairTwo: [
    "/images/arca-i/home/aria-layered.jpg",
    "/images/arca-ii/home/aria-cloister-turn.jpg",
  ],
  quote: "A frame should disappear on the face and survive the century.",
  quoteAttribution: "Aria Noir, founding note",
};

export const collections = {
  preheader: "The Collections",
  /* The count is read from the catalogue, not typed. It said "Six houses"
     while VISIBLE_SLUGS was holding the index to two, so the heading was
     promising four panels that do not exist on this page. See
     `housesOnShow` in lib/navigation. */
  heading: [
    { text: `${housesOnShow()},`, italic: true },
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
  cta: "See the gallery",
  /** Three columns × three rows, EQUAL photo counts so the grid always rests
   *  aligned — the only difference between columns is fall velocity. Every
   *  slot is a distinct plate: the previous four-column version needed
   *  sixteen and there are only nine, so half the grid was the same photo
   *  twice and the repeats were the first thing the eye found. */
  /* Read left to right, the curtain runs from the first cut to the second:
     column one is ARCA I on the model, column two is the frame close
     enough to read, column three is ARCA II in the dark. Nobody will
     notice, and it is why the three columns do not look like one bag of
     photographs shaken out. */
  columns: [
    [
      "/images/arca-i/home/aria-doorway-coat.jpg",
      "/images/arca-i/home/noir-doorway-coat.jpg",
      "/images/arca-i/home/aria-striped-light.jpg",
    ],
    [
      "/images/arca-i/home/aria-fisheye-close.jpg",
      "/images/arca-i/home/noir-bust-close.jpg",
      "/images/arca-i/home/frame-portrait.jpg",
    ],
    [
      "/images/arca-ii/home/noir-vaulted.jpg",
      "/images/arca-ii/home/aria-cloister.jpg",
      "/images/arca-ii/home/aria-close-dark.jpg",
    ],
  ],
};

/**
 * The close.
 *
 * ---- What was here ----
 *
 * "WE MAKE ONE THING / AND WE MAKE IT / TO OUTLAST THE FACE / THAT WORE IT
 * FIRST". Four lines to carry one idea, and the first of them was not true:
 * the bench cuts six houses and knits a sweater, and the section directly
 * above this one says so in its own heading. A page cannot close on a claim
 * it spent its middle contradicting.
 *
 * ---- Why the tagline, and why nothing else ----
 *
 * COPY.md holds "Frame your mind" as the house tagline and says it must be
 * able to appear completely alone, on a box or at the end of a film or on a
 * blank page, and do its whole job with no supporting text. It appeared
 * nowhere on this site. This is the end of the page, in the only white the
 * page has, at the largest type it owns, with the photographs passing over
 * the letters. There is no better place for it, and putting a sentence
 * beside it would be the supporting text the line is not allowed to need.
 *
 * The attribution went with it. A tagline is not a quotation, and signing
 * it would be the first step toward explaining it.
 */
export const finale = {
  lines: ["FRAME YOUR", "MIND."],
  /** Pulled by the pointer trail. Nine, from both cuts: the frame at macro
   *  range, and the faces wearing it. */
  trail: [
    "/images/arca-i/home/aria-bokeh-close.jpg",
    "/images/arca-i/home/aria-face-fisheye.jpg",
    "/images/arca-i/home/noir-fisheye-desat.jpg",
    "/images/arca-i/home/noir-door-bokeh.jpg",
    "/images/arca-i/home/frame-macro-concrete.jpg",
    "/images/arca-i/home/macro-nose-front.jpg",
    "/images/arca-i/home/stairwell-spiral.jpg",
    "/images/arca-ii/home/eye-macro.jpg",
    "/images/arca-ii/home/aria-dark-coat.jpg",
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
    "Unreleased frames, before they enter the collection.",
  cta: "Request private access",
  /* Unused by the section, which opens the modal instead of navigating.
     Kept because it is the destination should the panel ever come out,
     and because /contact still exists and still answers even though
     nothing advertises it. */
  href: "/contact",
  /** The model the section lights. The house has no story page yet, so
   *  nothing on the site contradicts a frame that is not released. */
  model: "/models/houses/monarca-monarca-noir.glb",
};

/**
 * The private-access sign-up, as asked in the modal.
 *
 * The section above it has already made the offer and already said who it
 * is not for. So this panel does not sell it again: it states the ask, in
 * one clause, and gets out of the way. The one thing withheld is WHEN,
 * because the house does not know yet and a date it cannot keep is worse
 * than no date.
 *
 * "Noted." is the whole confirmation. A house that has just been asked for
 * an address and got one does not need a paragraph about how pleased it is.
 */
export const preorderModal = {
  eyebrow: "Private Access",
  heading: "Leave an address.",
  body:
    "The next edition is shown to this list before it enters the collection.",
  label: "Email address",
  cta: "Request access",
  note: "One letter, when there is something to see.",
  close: "Close",
  done: {
    heading: "Noted.",
    body: "You will hear before the collection does.",
  },
};

export const footer = {
  /* The link columns used to live here as bare strings, all rendered with
     `href="#"`. They are routes, not copy, so they moved to lib/navigation
     as `sitemap` — where a link has somewhere to go. */
  /* Not "Word from the bench" — that is the finale's heading, one screen
     above this, and the page was saying the same four words twice in its
     last two blocks. This is the label on a field, so it names the thing
     rather than announcing it. */
  newsletterLabel: "The house letter",
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
