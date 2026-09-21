/**
 * AHAVA — product page copy and plate assignments.
 *
 * Sourced from the house's approved copy deck for this page. The same
 * shape ARCA I and ARCA II are written in — see lib/product.ts — which is
 * why this file is the whole of the work: the sections, their order and
 * the closing counter all live in components/product/story-page.tsx and
 * are not restated here.
 *
 * ---- What this house has, and what it does not ----
 *
 * AHAVA has been shot as its own world (a Paris apartment, early) and has
 * one turntable export between its six acetates. Its films are placeholder
 * teasers until the campaign is cut (see the note at `hero`); the approach
 * walks in film to face, and the offering turns the house's glb
 * with no squares under it. The palette band still paints the full run:
 * StoryPage builds it from `colorwayNames` in lib/navigation, so the six
 * colours are declared once and the buy page sells the same six.
 *
 * Plates live in public/images/ahava/, imported by
 * scripts/import-campaign-photography.mjs. Named for what they show.
 */

import type { Approach } from "@/components/product/product-approach";
import type {
  AriaNoir,
  Close,
  Detail,
  Hero,
  Meaning,
  Offering,
  Opening,
  Shoot,
  Spec,
  Worn,
} from "./product";

const C = "/images/ahava/campaign";
const V = "/images/ahava/variants";

export const hero: Hero = {
  eyebrow: "AHAVA",
  /* The deck's H1, which is a sentence and not the product name. The name
     is the preheader above it. */
  name: "Nothing louder than stillness.",
  line: "A sculptural frame designed for quiet mornings, soft light, and moments entirely your own.",
  image: "/images/ahava/cover/desktop.webp",
  imagePortrait: "/images/ahava/cover/mobile.webp",
  alt: "AHAVA, front on, in early window light",
  /* ---- Placeholder teasers, Sep 2026 ----
     Three Kling cuts stand in until the house films the campaign. This
     set is the odd one: its "hero" cut was rendered 9:16, so the wide
     establishing shot carries the hero here and the portrait cut takes
     over on a phone, where it shows the whole frame at the same zoom —
     the same split `imagePortrait` makes for the stills. The closing
     shot runs at the approach and again beside the buy page's detail
     tabs (lib/navigation). Each poster is frame 0 of its own film. Swap
     the files under public/video/ahava/ and the page needs nothing else. */
  video: "/video/ahava/establishing.mp4",
  videoPortrait: "/video/ahava/hero.mp4",
  poster: "/video/ahava/establishing-poster.webp",
  posterPortrait: "/video/ahava/hero-poster.webp",
};

export const structure: Opening = {
  preheader: "The Form",
  heading: "Quietly distinctive.",
  body: [
    "AHAVA finds its character in restraint. A sculptural silhouette and defined black-and-gold bridge create a presence that feels considered rather than demanding.",
  ],
  images: [
    { src: `${V}/noir-tall.webp`, alt: "AHAVA in Noir, upright on the sill" },
    {
      src: `${C}/creative-noir-gilt-mirror-reflection.webp`,
      alt: "The frame caught in a gilt mirror",
    },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "The Silhouette",
  heading: "Made for close moments.",
  body: [
    "AHAVA is designed to feel natural at close range. Its proportions and clean lines create a refined silhouette that reveals more the longer you look.",
  ],
  /* The two reading-chair frames, which are the set's closest pair: one
     subject, one seat, the frame at conversational distance. */
  images: [
    { src: `${C}/worn-aria-reading-chair.webp`, alt: "Aria in the reading chair, wearing AHAVA" },
    { src: `${C}/worn-noir-reading-chair.webp`, alt: "Noir in the reading chair, wearing AHAVA" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Setting",
  heading: "At home with yourself.",
  body: [
    "Soft morning light, tall windows, quiet rooms, and the warmth of lived-in spaces give AHAVA its world. Nothing feels staged. The frame simply belongs there.",
  ],
  images: [
    { src: `${C}/wide-haussmannian-facade-morning.webp`, alt: "The facade, before the street is awake" },
    { src: `${C}/wide-grand-salon-full-depth.webp`, alt: "The salon, full depth, morning" },
  ],
};

export const meaning: Meaning = {
  image: `${C}/creative-noir-fisheye-closeup.webp`,
  alt: "The bridge, close, through the fisheye",
  eyebrow: "The Bridge",
  heading: "One detail changes everything.",
  body:
    "The black-and-gold bridge becomes the focal point against an otherwise understated frame. Precise, sculptural, and deliberately visible.",
};

/* The breather. Dust turning in window light and nothing in the room,
   which is the one frame in this set that is entirely the house's weather
   and none of its product. No line laid over it: the section's job here is
   to stop talking for a screen. */
export const detail: Detail = {
  image: `${C}/vibe-dust-in-window-light.webp`,
  alt: "Dust turning in the window light",
};

/* Numbered rather than termed, as ARCA I is: the deck writes each line as
   "01 Sculptural Black Frame" and follows it with a sentence, which is the
   row's summary and its detail already written. */
export const spec: Spec = {
  preheader: "The Construction",
  heading: "Refined down to the detail.",
  rows: [
    {
      term: "01",
      summary: "Sculptural Black Frame",
      detail:
        "A defined black silhouette provides the quiet foundation for AHAVA's more distinctive details.",
    },
    {
      term: "02",
      summary: "Signature Gold Bridge",
      detail:
        "A sculptural gold element introduces warmth and becomes the frame's most expressive visual detail.",
    },
    {
      term: "03",
      summary: "Clean Geometry",
      detail:
        "Considered lines and proportions keep the silhouette refined without making it feel overly severe.",
    },
    {
      term: "04",
      summary: "Balanced Proportions",
      detail:
        "The frame is shaped to create a natural relationship between structure, presence, and wearability.",
    },
    {
      term: "05",
      summary: "Quiet Luxury",
      detail:
        "Every element is deliberately restrained, creating a frame whose character reveals itself through closer attention.",
    },
  ],
  /* The house has no macro set of its own hardware, so the sheet is
     answered with the object itself across four acetates, all shot on the
     same sill at the same hour: the colour changes and nothing else does,
     which is the closest thing this house has to a specification plate.
     The lens through the coffee cup closes it — the only frame in the set
     that is optics rather than styling. */
  macro: [
    { src: `${V}/noir-sill.webp`, alt: "AHAVA in Noir, on the sill" },
    { src: `${V}/dark-tortoise-sill.webp`, alt: "AHAVA in Dark Tortoise, on the sill" },
    { src: `${V}/caramel-stripe-sill.webp`, alt: "AHAVA in Caramel Stripe, on the sill" },
    { src: `${C}/macro-lens-coffee-cup.webp`, alt: "The lens against the rim of a coffee cup" },
  ],
};

/* The closing teaser, a different cut from the hero's. Its own footage
   and not another house's: see Approach in product-approach.tsx. */
export const approach: Approach = {
  film: {
    src: "/video/ahava/closing.mp4",
    poster: "/video/ahava/closing-poster.webp",
    alt: "The teaser film for AHAVA",
  },
  face: {
    src: `${C}/creative-aria-fisheye-closeup.webp`,
    alt: "Aria, close, wearing AHAVA",
  },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "AHAVA",
  cta: "Discover AHAVA",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  /* One export for the house, which is what the bench cut. No `colorways`:
     the squares swap the mesh, and six squares all loading the Noir glb
     would be a picker that does nothing. The six acetates are painted by
     the palette band above and sold by the picker at the foot of the
     page. */
  view: {
    kind: "model",
    src: "/models/houses/ahava-noir.glb",
  },
};

export const worn: Worn = {
  preheader: "AHAVA",
  heading: "Keep the moment to yourself.",
  cta: "Discover AHAVA",
  columns: [
    [
      { src: `${C}/worn-aria-enfilade-door.webp`, alt: "Aria in the enfilade door" },
      { src: `${C}/worn-noir-herringbone-floor-couture.webp`, alt: "Noir on the herringbone floor" },
      { src: `${C}/duo-duo-window-light.webp`, alt: "Both, in the window light" },
      { src: `${C}/vibe-breathing-curtain.webp`, alt: "The curtain, breathing" },
      { src: `${C}/worn-aria-reading-chair-night.webp`, alt: "Aria in the reading chair, night" },
    ],
    [
      { src: `${C}/worn-noir-enfilade-door.webp`, alt: "Noir in the enfilade door" },
      { src: `${C}/creative-aria-birdseye-herringbone.webp`, alt: "Aria from above, herringbone" },
      { src: `${C}/wide-library-corner-books-light.webp`, alt: "The library corner" },
      { src: `${C}/worn-noir-reading-chair-couture.webp`, alt: "Noir in the reading chair, couture" },
      { src: `${C}/vibe-coffee-cup-steam-rising.webp`, alt: "Steam off the cup" },
    ],
    [
      { src: `${C}/duo-aria-long-salon.webp`, alt: "Aria down the long salon" },
      { src: `${C}/worn-aria-herringbone-floor.webp`, alt: "Aria on the herringbone floor" },
      { src: `${C}/creative-noir-dutch-angle-corridor.webp`, alt: "The corridor, on the tilt" },
      { src: `${C}/wide-zinc-rooftops-afternoon.webp`, alt: "Zinc rooftops, afternoon" },
      { src: `${C}/worn-noir-reading-chair-night.webp`, alt: "Noir in the reading chair, night" },
    ],
  ],
};

export const close: Close = {
  /* No eyebrow, no heading, no body: the gallery above has just said
     "AHAVA / Keep the moment to yourself" and the reader is standing at
     the counter. Saying it twice, a screen apart, is the page clearing its
     throat. See ARCA I, which closes the same way. */
  cta: "Discover AHAVA",
  trail: [
    `${V}/noir-tall.webp`,
    `${C}/worn-aria-reading-chair.webp`,
    `${C}/creative-noir-gilt-mirror-reflection.webp`,
    `${V}/rose-tall.webp`,
    `${C}/duo-facade-morning-street.webp`,
    `${V}/caramel-stripe-tall.webp`,
    `${C}/worn-noir-enfilade-door-couture.webp`,
    `${C}/vibe-open-book-pressed-flower.webp`,
    `${V}/tutti-frutti-tall.webp`,
  ],
};
