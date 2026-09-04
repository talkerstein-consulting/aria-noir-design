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
  alt: "ARCA I, amber-lit portrait, layered foreground",
  video: "/video/arca-i-hero.mp4",
  /** Frame 0 of the film above, so the still and the first frame of the
   *  footage are the same picture. */
  poster: `${P}/hero-poster.jpg`,
};

export const structure: Opening = {
  preheader: "The Structure",
  heading: "This building settled its argument with light decades ago.",
  body: [
    "We worked inside that decision. Poured once, never dressed after.",
    "A house called Noir belongs in a building that already knew.",
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
    "Hers is Aria. A single voice, unaccompanied, asked to hold a room alone. His is Noir. The colour a shadow keeps at noon.",
    "The house gave them the names. They wear them as fact.",
  ],
  images: [
    { src: `${P}/aria.jpg`, alt: "Aria in a black sleeveless dress against poured concrete" },
    { src: `${P}/noir.jpg`, alt: "Noir looking down, portrait" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Shoot",
  heading: "We shot at the hour the concrete does its best work.",
  body: [
    "Early, while the shadows still hold an edge. The building cuts the light into bars on its own.",
    "The lens bends the architecture and leaves their faces the sharpest thing in the frame. We kept it.",
  ],
  images: [
    { src: `${P}/shoot-fisheye-face.jpg`, alt: "Face through the fisheye lens" },
    { src: `${P}/shoot-zoom-fisheye.jpg`, alt: "Zoomed fisheye, architecture bending around the subject" },
  ],
  note: {
    label: "A note on stillness",
    body: "A face can hold a frame without performing for it.",
  },
};

export const meaning: Meaning = {
  image: `${P}/meaning-longcoat.jpg`,
  alt: "Long coat, bespoke shot at the building's door",
  eyebrow: "Arca",
  heading: "Latin. The chest built to carry what must survive the water.",
  body:
    "The first name in the house's bloodline. Before a sovereign, a mother, or a father, there was only the vessel that got everyone there.",
};

export const detail: Detail = {
  image: `${P}/detail-ribbon-dress.jpg`,
  alt: "Black ribbon dress portrait, close",
};

export const spec: Spec = {
  preheader: "The Specs",
  heading: "What it's made of.",
  rows: [
    {
      term: "Frame",
      summary: "Hand-cut cellulose acetate",
      detail:
        "Layered and polished in five stages rather than moulded in one. Acetate warms to the skin and softens its grip through the day.",
    },
    {
      term: "Hinge",
      summary: "Five-barrel spring hinge",
      detail:
        "Flexes past the temple's resting point and returns to true. Rated for tens of thousands of cycles.",
    },
    {
      term: "Lens",
      summary: "UV400-rated, scratch-resistant optical glass",
      detail:
        "Full-spectrum UV protection with genuine optical clarity. Cuts glare without dulling what is in front of you.",
    },
    {
      term: "Bridge",
      summary: "Keyhole fit",
      detail: "Sits on the nose without slipping and without hardware. Fewer parts, fewer points of failure.",
    },
    {
      term: "Finish",
      summary: "Hand-polished, not stamped",
      detail:
        "Every edge finished by hand after cutting. Slower, and the only way the edge looks the way acetate should.",
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

/* The buy page with one acetate already chosen. Used by the turntable's
   squares and by the colourway data below it, so both hand the reader the
   same link — and declared up here because `const` does not hoist and the
   offering now reads it. */
const buyColour = (name: string) =>
  `/shop/arca-i?colourway=${encodeURIComponent(name)}`;

/* The walk in to the object: the film, then a face, then the frame itself
   — see ProductApproach for why it is in that order and why neither stage
   carries a word.

   The film is the campaign film, the same one the hero opens on. That is a
   REPEAT and it is knowing: there is one reel for this cut, and a mood
   stage with nothing in it would be worse than the reel a second time.
   Point this at its own footage the day the house cuts some.

   The face is `worn-12` — the only close portrait in the set that is a
   face and not a figure, which is exactly what this step needs: the frame
   at the distance a person is actually seen at, between the wide film and
   the object alone on its stage. */
export const approach: Approach = {
  film: {
    src: "/video/arca-i-hero.mp4",
    poster: `${P}/hero-poster.jpg`,
    alt: "The campaign film for ARCA I",
  },
  face: { src: `${P}/worn-12.jpg`, alt: "Closeup face, bokeh, wearing ARCA I" },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA I",
  cta: "Enter the Registry",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  /* The Draco export, the same one the buy page turns.
  
     This used to point at `/models/arca-i-k-black.glb` on the reasoning
     that "this page is where someone is deciding, so it gets the heavier
     file rather than the index's export". The premise was wrong in both
     halves. Measured: the heavy file is 10.20MB with 343,706 triangles and
     no compression; the export below is 1.56MB with 806,858 — denser
     geometry at a sixth of the bytes, because Draco compresses geometry
     rather than throwing it away. The reader deciding was being sent eight
     and a half megabytes to see LESS of the frame. */
  view: {
    kind: "model",
    src: "/models/houses/arca-i-k-black.glb",
    /* The four acetates, as squares under the frame. This is what stands
       in for the deleted Variations stage: the same four colours, on the
       object itself rather than on four photographs of it, and each one
       carrying the buy link it used to carry down there.

       `src` is the per-colourway export — scripts/export-models.mjs runs
       the whole `3d models/` set, so every acetate has had its own glb in
       public/models/houses all along. The hexes are the same ones the
       plates used; they are stand-ins for measured acetate, see SWATCHES
       in lib/shop. */
    colorways: [
      {
        name: "K Black",
        swatch: "#0b0b0c",
        src: "/models/houses/arca-i-k-black.glb",
        href: buyColour("K Black"),
      },
      {
        name: "Z White",
        swatch: "#e8e5df",
        src: "/models/houses/arca-i-z-white.glb",
        href: buyColour("Z White"),
      },
      {
        name: "Proceso Brown",
        swatch: "#4a3626",
        src: "/models/houses/arca-i-proceso-brown.glb",
        href: buyColour("Proceso Brown"),
      },
      {
        name: "309 Blue",
        swatch: "#1f2c3d",
        src: "/models/houses/arca-i-309-blue.glb",
        href: buyColour("309 Blue"),
      },
    ],
  },
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
  body: "The first door into the house. There are others.",
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
