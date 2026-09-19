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
  eyebrow: "ARCA I",
  /* The deck's H1 is a sentence rather than the product name. The name is
     the preheader above it now, so the page states what it is once and
     then says something. HeroName sets whatever it is given at hero scale;
     it was never required to be the noun. */
  name: "Built from the shadows.",
  line: "An architectural frame defined by hard lines, deep structure, and a quiet gold detail.",
  image: `${P}/hero-arca.webp`,
  alt: "ARCA I, amber-lit portrait, layered foreground",
  video: "/video/arca-i-hero.mp4",
  /** Frame 0 of the film above, so the still and the first frame of the
   *  footage are the same picture. */
  poster: `${P}/hero-poster.webp`,
};

export const structure: Opening = {
  preheader: "The Form",
  heading: "Geometry, reduced.",
  body: [
    "ARCA I strips eyewear back to its essential forms. Precise lines, considered proportions, and a sculptural silhouette create a frame that feels as deliberate as the architecture around it.",
  ],
  images: [
    { src: `${P}/structure-door.webp`, alt: "Bust portrait at a concrete doorway, bokeh, desaturated" },
    { src: `${P}/structure-negative-space.webp`, alt: "Portrait against dark negative space, medium shot" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "The Silhouette",
  heading: "Made to disappear.",
  body: [
    "A strong, understated profile designed to sit close to the face. Charcoal tones and defined geometry create a silhouette that feels composed, severe, and unmistakably ARCA.",
  ],
  /* The two plates the Aria / Noir block ran. They are the set's only pair
     of straight profiles, which is what this beat is now about. */
  images: [
    { src: `${P}/aria.webp`, alt: "Profile in a black sleeveless dress against poured concrete" },
    { src: `${P}/noir.webp`, alt: "Profile looking down, ARCA I close to the face" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Architecture",
  heading: "Form follows restraint.",
  body: [
    "ARCA I belongs to spaces defined by concrete, shadow, and proportion. Its structure echoes the same language: solid, minimal, and without unnecessary detail.",
  ],
  images: [
    { src: `${P}/shoot-fisheye-face.webp`, alt: "Face through the fisheye lens" },
    { src: `${P}/shoot-zoom-fisheye.webp`, alt: "Zoomed fisheye, architecture bending around the subject" },
  ],
  /* No note. The deck carries none, and a disclosure with copy written to
     fill it is the section explaining itself. See Shoot in lib/product. */
};

export const meaning: Meaning = {
  image: `${P}/meaning-longcoat.webp`,
  alt: "Long coat, bespoke shot at the building's door",
  eyebrow: "The Bridge",
  heading: "Gold, against the grey.",
  body:
    "A restrained gold bridge breaks through the monochrome structure. Nothing excess. Just one warm detail, made more pronounced by everything around it.",
};

export const detail: Detail = {
  image: `${P}/detail-ribbon-dress.webp`,
  alt: "Black ribbon dress portrait, close",
};

/* The sheet is NUMBERED rather than termed. The deck names each line "01
   Architectural Silhouette" and follows it with a paragraph, which is the
   row's summary and detail already written; the number is what goes in the
   small caps slot the material name used to hold. */
export const spec: Spec = {
  preheader: "The Construction",
  heading: "Engineered with intention.",
  rows: [
    {
      term: "01",
      summary: "Architectural Silhouette",
      detail:
        "A defined, structured profile with clean geometry and a strong presence on the face.",
    },
    {
      term: "02",
      summary: "Signature Gold Bridge",
      detail:
        "A precise gold element introduces a controlled warmth to the otherwise monochromatic frame.",
    },
    {
      term: "03",
      summary: "Sculpted Frame",
      detail:
        "Angular surfaces and considered proportions give ARCA I its distinctly architectural character.",
    },
    {
      term: "04",
      summary: "Charcoal Finish",
      detail:
        "A deep, desaturated tone keeps the frame understated while emphasizing its form and construction.",
    },
    {
      term: "05",
      summary: "Balanced Fit",
      detail:
        "Designed around proportion and wearability, with a considered shape that sits naturally against the face.",
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
    { src: `${P}/spec-macro-keyhole.webp`, alt: "Macro of the keyhole bridge, artsy light" },
    { src: `${P}/spec-macro-inner-left.webp`, alt: "Macro of the inner left temple detail" },
    { src: `${P}/spec-macro-inner-right.webp`, alt: "Macro of the inner right temple: the hinge, the house mark and the CE stamp" },
    { src: `${P}/spec-macro-nose.webp`, alt: "Macro of the bridge at nose level, front on" },
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
    poster: `${P}/hero-poster.webp`,
    alt: "The campaign film for ARCA I",
  },
  face: { src: `${P}/worn-12.webp`, alt: "Closeup face, bokeh, wearing ARCA I" },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA I",
  cta: "Explore ARCA I",
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
  preheader: "ARCA I",
  heading: "Enter the structure.",
  cta: "Explore ARCA I",
  columns: [
    [
      { src: `${P}/worn-01.webp`, alt: "The building's environment, with Aria" },
      { src: `${P}/worn-02.webp`, alt: "Standing at the concrete door" },
      { src: `${P}/worn-03.webp`, alt: "Aria and Noir wearing ARCA I, portrait" },
      { src: `${P}/worn-04.webp`, alt: "Layered foreground portrait" },
      { src: `${P}/worn-05.webp`, alt: "Noir looking down, in the building" },
    ],
    [
      { src: `${P}/worn-06.webp`, alt: "Aria and Noir wearing ARCA I" },
      { src: `${P}/worn-07.webp`, alt: "Bust turtleneck closeup" },
      { src: `${P}/worn-08.webp`, alt: "Glasses portrait" },
      { src: `${P}/worn-09.webp`, alt: "Low-angle perspective" },
      { src: `${P}/worn-10.webp`, alt: "Mirror shot" },
    ],
    [
      { src: `${P}/worn-11.webp`, alt: "Subject on the stairway" },
      { src: `${P}/worn-12.webp`, alt: "Closeup face, bokeh" },
      { src: `${P}/worn-13.webp`, alt: "Noir looking down, variation" },
      { src: `${P}/worn-14.webp`, alt: "Black sleeveless mirror portrait" },
      { src: `${P}/worn-15.webp`, alt: "Closeup" },
    ],
  ],
};

export const close: Close = {
  /* No eyebrow, no heading, no body. The gallery above says "ARCA I /
     Enter the structure" and the reader is standing at the counter by the
     time they are here; saying it twice, a screen apart, is the page
     clearing its throat. What is left is the offer. */
  cta: "Explore ARCA I",
  trail: [
    `${P}/close-dropframes.webp`,
    `${P}/worn-03.webp`,
    `${P}/meaning-longcoat.webp`,
    `${P}/worn-08.webp`,
    `${P}/detail-ribbon-dress.webp`,
    `${P}/worn-10.webp`,
    `${P}/offering-front.webp`,
    `${P}/worn-13.webp`,
    `${P}/worn-04.webp`,
  ],
};
