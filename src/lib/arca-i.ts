/**
 * ARCA I — product page copy and plate assignments.
 *
 * Sourced from "ARCA I - Product Page Story with Photo File Names" — the
 * house's approved copy deck for this page. Kept apart from lib/content.ts
 * (the home page) so a product can be revised without touching the landing
 * narrative. Plates live in public/images/arca-i/ and are named for what
 * they show, not for where they sit, so a section can be re-ordered without
 * renaming files.
 *
 * The exports here are typed against lib/product.ts — the shape every
 * product page reads. That file is what lets ARCA II reuse these sections
 * rather than fork them.
 */

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
  Variations,
  Worn,
} from "./product";

const P = "/images/arca-i";

export const hero: Hero = {
  eyebrow: "The First Vessel",
  name: "ARCA I",
  /** Mixed treatment, matching the atelier masthead: italic lowercase
   *  against roman caps. */
  line: [
    { text: "The ark. The vessel.", italic: true },
    { text: "THE FIRST NAME IN THE HOUSE'S BLOODLINE.", italic: false },
  ],
  image: `${P}/hero-arca.jpg`,
  alt: "ARCA I, amber-lit portrait, layered foreground — the campaign's climax frame",
  video: "/video/arca-i-hero.mp4",
  /** Frame 0 of the film above, so the still and the first frame of the
   *  footage are the same picture. */
  poster: `${P}/hero-poster.jpg`,
};

export const structure: Opening = {
  preheader: "The Structure",
  heading: "This building decided, decades ago, exactly how it feels about light.",
  body: [
    "We worked inside that decision. Its architect goes unnamed here on purpose. The concrete speaks for itself — raw, poured once, never dressed up after the fact.",
    "A house called Noir belongs in a building that already understood the assignment.",
  ],
  images: [
    { src: `${P}/structure-door.jpg`, alt: "Bust portrait at a concrete doorway, bokeh, desaturated" },
    { src: `${P}/structure-negative-space.jpg`, alt: "Portrait against dark negative space, medium shot" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "Aria / Noir",
  /** Mixed treatment, matching the atelier masthead: italic lowercase
   *  against roman caps. */
  heading: [
    { text: "Every house needs two people to carry it", italic: true },
    { text: "BEFORE IT CAN CARRY ANYTHING ELSE.", italic: false },
  ],
  body: [
    "Hers is Aria — a single voice, unaccompanied, asked to hold a room's attention alone. His is Noir — the color a shadow keeps even at noon, in a hallway the sun never fully reaches.",
    "The house gave them these names, and they carry them exactly the way this building carries its concrete — as fact, not costume.",
  ],
  images: [
    { src: `${P}/aria.jpg`, alt: "Aria — black sleeveless portrait against poured concrete" },
    { src: `${P}/noir.jpg`, alt: "Noir — looking down, portrait" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Shoot",
  heading: "We shot at the hour the concrete does its best work.",
  body: [
    "Early enough that shadows still hold their edges. The building's own grilles cut the light into hard bars long before we arrived — Melville's venetian blinds, poured in concrete instead of hung in a window. We simply pointed the camera at what was already true.",
    "Where the lens bends the architecture around them and leaves their faces the sharpest thing in frame, we kept it that way. A tool that admits what it is earns more trust than one pretending to be invisible.",
  ],
  images: [
    { src: `${P}/shoot-fisheye-face.jpg`, alt: "Face through the fisheye lens" },
    { src: `${P}/shoot-zoom-fisheye.jpg`, alt: "Zoomed fisheye, architecture bending around the subject" },
  ],
  note: {
    label: "A note on stillness",
    body:
      "A reference point, not a citation — the same restraint that lets a face hold a frame without needing to perform for it.",
  },
};

export const meaning: Meaning = {
  image: `${P}/meaning-longcoat.jpg`,
  alt: "Long coat, bespoke shot at the building's door",
  eyebrow: "Arca",
  heading: "Latin, before it was anything else: the ark, the vessel, the chest built to carry what must survive the water.",
  body:
    "It is the first name in the house's bloodline. Ahava, Monarca, Matriarca, Patriarca — all descend from this root. Before a sovereign, a mother, or a father, there was only the vessel that got everyone there.",
};

export const detail: Detail = {
  image: `${P}/detail-ribbon-dress.jpg`,
  alt: "Black ribbon dress portrait, close",
  line: "Acetate, cut and polished the way concrete is poured and finished — one material, shaped once, standing on its own terms.",
};

export const spec: Spec = {
  preheader: "The Specs",
  heading: "What it's made of.",
  rows: [
    {
      term: "Frame",
      summary: "Hand-cut cellulose acetate",
      detail:
        "Layered and polished in five separate stages rather than molded in one, the same lamination technique used in fine cathedral glass, applied here to something people touch every day. Acetate breathes slightly with body heat, softening its grip through the day rather than staying rigid against the skin.",
    },
    {
      term: "Hinge",
      summary: "Five-barrel spring hinge",
      detail:
        "Built to flex outward past the temple's resting point and return to true, rated for tens of thousands of open-close cycles without loosening. The difference between a frame that lasts a season and one that lasts a decade usually comes down to this one small part.",
    },
    {
      term: "Lens",
      summary: "UV400-rated, scratch-resistant optical glass",
      detail:
        "Full-spectrum UV protection paired with genuine optical clarity — the kind of lens that cuts glare without dulling what's actually in front of you.",
    },
    {
      term: "Bridge",
      summary: "Keyhole fit",
      detail: "Shaped to sit on the nose without slipping and without hardware. Fewer parts, fewer points of failure.",
    },
    {
      term: "Finish",
      summary: "Hand-polished, not stamped",
      detail:
        "Every edge is finished by hand after cutting. It's slower. It's also the only way the edge actually looks the way acetate is supposed to look.",
    },
  ],
  /* Four plates only, one per subject — bridge, temple hinge, temple face,
     nose. The fuller macro set doubled up on the same detail from adjacent
     angles (inner-left / inner-left-2, inner-right / -2 / -full), which read
     as a contact sheet rather than a specification. spec-macro-bridge,
     spec-macro-rtemple and spec-macro-ltemple are all deliberately out:
     each repeats a subject already covered here. The temple is carried by
     the inner-right frame, which is the one that shows the hinge — the
     part the sheet makes its longest claim about — with the house mark and
     the CE stamp on the arm behind it. */
  macro: [
    { src: `${P}/spec-macro-keyhole.jpg`, alt: "Macro of the keyhole bridge, artsy light" },
    { src: `${P}/spec-macro-inner-left.jpg`, alt: "Macro of the inner left temple detail" },
    { src: `${P}/spec-macro-inner-right.jpg`, alt: "Macro of the inner right temple: the hinge, the house mark and the CE stamp" },
    { src: `${P}/spec-macro-nose.jpg`, alt: "Macro of the bridge at nose level, front on" },
  ],
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA I",
  cta: "Enter the Registry",
  registryNote:
    "Every acquisition is registered as an OFFICIAL NFT, your piece is only yours, forever.",
  /* The house's own cut, at full mesh resolution — this page is where
     someone is deciding, so it gets the heavier file rather than the
     index's export. */
  view: { kind: "model", src: "/models/arca-i-k-black.glb" },
};

/** The colourway still-life set. Shot against the same brutalist ground as
 *  the campaign, so the four read as one series rather than four product
 *  shots. Each is now a full-bleed panel on the sticky stage, so it is one
 *  plate per colour rather than a card and a gallery behind it.
 *
 *  `href` is the buy page with the colourway already chosen — the whole
 *  point of naming a colour at full bleed is that the reader can act on
 *  THAT one, and landing them on the house's default acetate makes them
 *  find it again by hand.
 */
const V = `${P}/variants`;
/* The upright colourway plates, shot for the square the panel becomes on a
   phone. See Colorway.imageNarrow. */
const VT = `${V}/tall`;
const buyColour = (name: string) =>
  `/shop/arca-i?colourway=${encodeURIComponent(name)}`;

export const variations: Variations = {
  preheader: "The Variations",
  heading: "Four colorways. One building.",
  colorways: [
    {
      name: "K Black",
      swatch: "#0b0b0c",
      image: `${V}/k-black-main.jpg`,
      imageNarrow: `${VT}/k-black.jpg`,
      alt: "K Black — front on, against poured concrete",
      href: buyColour("K Black"),
      cta: "Acquire K Black",
    },
    {
      name: "Z White",
      swatch: "#e8e5df",
      image: `${V}/z-white-main.jpg`,
      imageNarrow: `${VT}/z-white.jpg`,
      alt: "Z White — front on, against poured concrete",
      href: buyColour("Z White"),
      cta: "Acquire Z White",
    },
    {
      name: "Proceso Brown",
      swatch: "#4a3626",
      image: `${V}/proceso-brown-main.jpg`,
      imageNarrow: `${VT}/proceso-brown.jpg`,
      alt: "Proceso Brown — front on, against poured concrete",
      href: buyColour("Proceso Brown"),
      cta: "Acquire Proceso Brown",
    },
    {
      name: "309 Blue",
      swatch: "#1f2c3d",
      image: `${V}/309-blue-main.jpg`,
      imageNarrow: `${VT}/309-blue.jpg`,
      alt: "309 Blue — front on, against poured concrete",
      href: buyColour("309 Blue"),
      cta: "Acquire 309 Blue",
    },
  ],
};

export const worn: Worn = {
  preheader: "Worn",
  heading: [
    { text: "Every house", italic: true },
    { text: "NEEDS WITNESSES.", italic: false },
  ],
  cta: "Enter the Registry",
  columns: [
    [
      { src: `${P}/worn-01.jpg`, alt: "The building's environment, with Aria" },
      { src: `${P}/worn-02.jpg`, alt: "Standing at the concrete door" },
      { src: `${P}/worn-03.jpg`, alt: "Aria and Noir wearing ARCA I, portrait" },
      { src: `${P}/worn-04.jpg`, alt: "Layered foreground portrait" },
      { src: `${P}/worn-05.jpg`, alt: "Noir looking down, in the building" },
    ],
    [
      { src: `${P}/worn-06.jpg`, alt: "Aria and Noir wearing ARCA I" },
      { src: `${P}/worn-07.jpg`, alt: "Bust turtleneck closeup" },
      { src: `${P}/worn-08.jpg`, alt: "Glasses portrait" },
      { src: `${P}/worn-09.jpg`, alt: "Low-angle perspective" },
      { src: `${P}/worn-10.jpg`, alt: "Mirror shot" },
    ],
    [
      { src: `${P}/worn-11.jpg`, alt: "Subject on the stairway" },
      { src: `${P}/worn-12.jpg`, alt: "Closeup face, bokeh" },
      { src: `${P}/worn-13.jpg`, alt: "Noir looking down, variation" },
      { src: `${P}/worn-14.jpg`, alt: "Black sleeveless mirror portrait" },
      { src: `${P}/worn-15.jpg`, alt: "Closeup" },
    ],
  ],
};

export const close: Close = {
  heading: "Worn by those the city never sees.",
  body: "This is the first door into the house. There are others.",
  cta: "Enter the Registry",
  trail: [
    `${P}/close-dropframes.jpg`,
    `${P}/worn-03.jpg`,
    `${P}/meaning-longcoat.jpg`,
    `${P}/worn-08.jpg`,
    `${P}/detail-ribbon-dress.jpg`,
    `${P}/worn-10.jpg`,
    `${P}/offering-front.jpg`,
    `${P}/worn-13.jpg`,
    `${P}/worn-04.jpg`,
  ],
};
