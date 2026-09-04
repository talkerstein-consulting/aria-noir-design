/**
 * ARCA II — product page copy and plate assignments.
 *
 * Sourced from the "ARIA NOIR ARCA II" editorial deck (Franky Arrocena) and
 * the catalogue figures already held in lib/navigation.ts: one cut, eight
 * colourways, from $125. Same bargain as lib/arca-i.ts — this file is the
 * whole page; the sections in components/product/ carry none of it.
 *
 * The house direction for this cut is L'Éloge de l'Ombre, and the deck
 * states it as a ratio rather than a mood: 97% shadow, 3% gold. That is the
 * single fact every choice below answers to. Where ARCA I was cool, hard
 * and lit from outside, this one is warm, glimpsed, and lit from within —
 * same brutalist bones, inlaid with Art Deco lines.
 *
 * Plates live in public/images/arca-ii/ and are named for what they show,
 * so a section can be re-ordered without renaming files.
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
import { swatchFor } from "./shop";

const P = "/images/arca-ii";
/* The colourway run, one plate per acetate. See build-arca-ii-images.mjs. */

/* The campaign film opens this cut, as it opens ARCA I. It replaces the
   still that stood here: a hero that holds for a second before the type
   arrives is holding for a reason now.

   `image` and `poster` are the same picture, and that picture is frame 0
   of the film. There is no moment where the reader sees one image and then
   sees a different one take its place. */
export const hero: Hero = {
  eyebrow: "The Second Cut",
  name: "ARCA II",
  line: [
    { text: "Cut for the darker room.", italic: true },
    { text: "NINETY-SEVEN PARTS DARK, THREE PARTS GOLD.", italic: false },
  ],
  image: `${P}/hero-poster.jpg`,
  alt: "Aria and Noir in the dark in ARCA II, the room glowing behind them",
  video: "/video/arca-ii-hero.mp4",
  poster: `${P}/hero-poster.jpg`,
};

export const structure: Opening = {
  preheader: "The Structure",
  heading: "We built the room before the frame that stands in it.",
  body: [
    "Not a set. A place, with its own stairwell and its own far door.",
    "ARCA I was lit from outside. This room glows from within, and the lines cut into it appear only where the glow reaches.",
  ],
  images: [
    { src: `${P}/structure-stair.jpg`, alt: "A stone stair rising out of a dark passage towards one lit window" },
    { src: `${P}/structure-door.jpg`, alt: "An empty vaulted corridor, a single window burning at the far end of it" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "Aria / Noir",
  heading: [
    { text: "The same two faces, in far less light", italic: true },
    { text: "AND GIVING AWAY JUST AS MUCH.", italic: false },
  ],
  body: [
    "A house's names have to survive a change of weather. Aria still holds a room alone. Noir is still the colour a shadow keeps at noon.",
    "The room took a jawline, a shoulder, half a coat. It never took the frame.",
  ],
  images: [
    { src: `${P}/aria.jpg`, alt: "Aria front on beneath carved stone, the lenses filling the frame" },
    { src: `${P}/noir.jpg`, alt: "Noir front on under a carved stone arch, amber lenses" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Shoot",
  heading: "Almost too dark, and held there.",
  body: [
    "Even light is what a product shot does. The exposure was set once, low, and defended frame by frame.",
    "The gold was the harder half. It had to catch light without ever being fully lit.",
  ],
  images: [
    { src: `${P}/shoot-pair-door.jpg`, alt: "Aria and Noir at distance in a cloister colonnade, the arcade running away behind them" },
    { src: `${P}/shoot-pair-bands.jpg`, alt: "Aria and Noir together in a stone room, the light coming from one side" },
  ],
  note: {
    label: "A note on shadow",
    body: "The room was never fully lit. Neither was the frame.",
  },
};

export const meaning: Meaning = {
  image: `${P}/meaning-aria-deco.jpg`,
  alt: "Aria in ARCA II, close, black leather, lit out of the dark",
  eyebrow: "The Darker Room",
  heading: "A thing is not revealed by light so much as spent by it.",
  body:
    "Lacquer was made for candlelight. Gold leaf for a room with one lamp. ARCA II is cut for the same hour.",
  /* The new plate is a centred close portrait rather than the wide it
     replaces, so there is nothing to push out from under the text column —
     any crop off centre now cuts her face. */
  objectPosition: "50% 35%",
};

export const detail: Detail = {
  image: `${P}/detail-lightfall.jpg`,
  alt: "An empty hall with window light laid in long bars across the floor",
};

export const spec: Spec = {
  preheader: "The Specs",
  heading: "What it's made of.",
  rows: [
    {
      term: "Frame",
      summary: "Hand-cut block acetate, single cut",
      detail:
        "One shape, held in eight colourways. Wider through the brow and squarer at the corner than the founding model.",
    },
    {
      term: "Temple",
      summary: "Inlaid gold plaque, set into stone-cut detailing",
      detail:
        "The three percent. Let into the temple face, proud of a stone-cut field. The only part finished to catch light rather than absorb it. Placed where a turn of the head will find it.",
    },
    {
      term: "Hinge",
      summary: "Five-barrel spring hinge",
      detail:
        "Flexes past the temple's resting point and returns to true. Rated for tens of thousands of cycles. Carried over from ARCA I unchanged.",
    },
    {
      term: "Lens",
      summary: "UV400-rated, scratch-resistant optical glass",
      detail:
        "Full-spectrum UV protection, genuine optical clarity. Warmer than the founding model takes. The amber is what makes the lens read as lit from inside.",
    },
    {
      term: "Bridge",
      summary: "Flat keyhole, double bar",
      detail:
        "The keyhole ARCA I established, squared off and carried on a second bar. The bar is what gives this cut its brow.",
    },
    {
      term: "Finish",
      summary: "Hand-polished, lacquer depth",
      detail:
        "Every edge finished by hand after cutting, then polished until the acetate holds a reflection. It survives a dark room instead of disappearing into one.",
    },
  ],
  macro: [
    { src: `${P}/spec-macro-eye-gold.jpg`, alt: "Half a face, the gold temple plaque beside the eye behind an amber lens" },
    { src: `${P}/spec-macro-temple.jpg`, alt: "The temple engraved ARCA-00003NFT-NR, 54â21â140, in tortoise acetate" },
    { src: `${P}/spec-macro-eye.jpg`, alt: "Macro of the gold bridge plaque, its Deco fan cut into the acetate" },
    { src: `${P}/object-front.jpg`, alt: "ARCA II on a stone sill, amber lenses catching the window" },
  ],
};

/* The buy page with one acetate already chosen. Read by the turntable's
   squares and by the colourway data further down, so the two never hand
   the reader different links for the same colour — and declared up here
   because `const` does not hoist and the offering now reads it. */
const buyColour = (name: string) =>
  `/shop/arca-ii?colourway=${encodeURIComponent(name)}`;

/* The walk in to the object: the film, then a face, then the frame — see
   ProductApproach.

   Same knowing repeat as ARCA I: the film here is this cut's campaign
   reel, which the hero also runs. One reel exists. Replace it with its own
   footage when there is some.

   The face is `noir` — front on, close, the amber lenses reading at size.
   In a cut whose whole argument is that the gold only appears where the
   light reaches it, a portrait that shows the lenses lit is the right
   thing to put between the film and the object. */
export const approach: Approach = {
  film: {
    src: "/video/arca-ii-hero.mp4",
    poster: `${P}/hero-poster.jpg`,
    alt: "The campaign film for ARCA II",
  },
  face: {
    src: `${P}/noir.jpg`,
    alt: "Noir front on under a carved stone arch, amber lenses",
  },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA II",
  cta: "Enter the Registry",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  moreNote: "Three of eight. The rest are in the registry.",
  /* The Noir, turning. This cut HAS an export — scripts/export-models.mjs
     ran the whole `3d models/` set, and arca-ii-noir.glb has been sitting
     in public/models/houses since — the page just never asked for it and
     showed a still life instead. */
  view: {
    kind: "model",
    src: "/models/houses/arca-ii-noir.glb",
    /* All eight, on the object itself.

       This is what replaced "The Variations" on this page, and it is the
       cut where the replacement earns the most: eight full-screen panels
       was eight screens of scroll to see one shape change colour, and the
       reader could not compare any two of them without scrolling back. As
       squares they are all in view at once, on the frame, at whatever
       angle the reader has turned it to.

       Every acetate has its own export — scripts/export-models.mjs ran
       the whole `3d models/Arca II` set, and the eight glbs are in
       public/models/houses. The hexes come from SWATCHES via swatchFor,
       which is what the buy page's picker paints: one acetate must not be
       two colours across two surfaces. */
    /* The turntable loads the first THREE of these. See `turned` below,
       and the note on it in lib/product.ts.

       The order is therefore load-bearing in a way it was not before: the
       three at the top are the three a reader can turn, so they are one
       per family rather than the first three of a list. Noir is the house
       black and the acetate this cut opens on. Dark Tortoise is the brown.
       Dreamy Rose is the light end of the run. A reader who turns those
       three has seen what this shape does across the whole set.

       The other five stay here in full: the palette band under the opening
       paints all eight, the buy page sells all eight, and this is the list
       both of those read. */
    turned: 3,
    colorways: [
      { name: "Noir", swatch: swatchFor("Noir"), src: "/models/houses/arca-ii-noir.glb", href: buyColour("Noir") },
      { name: "Dark Tortoise", swatch: swatchFor("Dark Tortoise"), src: "/models/houses/arca-ii-dark-tortoise.glb", href: buyColour("Dark Tortoise") },
      { name: "Dreamy Rose", swatch: swatchFor("Dreamy Rose"), src: "/models/houses/arca-ii-dreamy-rose.glb", href: buyColour("Dreamy Rose") },
      { name: "Caramel Stripe", swatch: swatchFor("Caramel Stripe"), src: "/models/houses/arca-ii-caramel-stripe.glb", href: buyColour("Caramel Stripe") },
      { name: "Root Beer Float", swatch: swatchFor("Root Beer Float"), src: "/models/houses/arca-ii-root-beer-float.glb", href: buyColour("Root Beer Float") },
      { name: "Tutti Frutti", swatch: swatchFor("Tutti Frutti"), src: "/models/houses/arca-ii-tutti-frutti.glb", href: buyColour("Tutti Frutti") },
      { name: "Velvet Rose", swatch: swatchFor("Velvet Rose"), src: "/models/houses/arca-ii-velvet-rose.glb", href: buyColour("Velvet Rose") },
      { name: "Pixie Dust", swatch: swatchFor("Pixie Dust"), src: "/models/houses/arca-ii-pixie-dust.glb", href: buyColour("Pixie Dust") },
    ],
  },
};



export const worn: Worn = {
  preheader: "Worn",
  heading: [
    { text: "Every shadow", italic: true },
    { text: "NEEDS SOMEONE IN IT.", italic: false },
  ],
  cta: "Enter the Registry",
  columns: [
    [
      { src: `${P}/worn-noir-front.jpg`, alt: "Noir full length in a vaulted stone hall" },
      { src: `${P}/worn-aria-doorway.jpg`, alt: "Aria in a cloister, window light falling across her" },
      { src: `${P}/worn-noir-profile.jpg`, alt: "Noir in profile, turned out of the dark" },
      { src: `${P}/worn-aria-panel.jpg`, alt: "Aria turning, coat swinging, against black" },
    ],
    [
      { src: `${P}/worn-pair-corridor.jpg`, alt: "Aria and Noir far down a cloister colonnade" },
      { src: `${P}/worn-aria-concrete.jpg`, alt: "Aria in a black dress in the cloister, stone arches behind her" },
      { src: `${P}/worn-noir-edge.jpg`, alt: "Noir out of the dark, two lights burning out of focus behind him" },
      { src: `${P}/aria.jpg`, alt: "Aria front on beneath carved stone, the lenses filling the frame" },
    ],
    [
      { src: `${P}/worn-aria-trench.jpg`, alt: "Aria full length in the vaulted hall, the coat to the floor" },
      { src: `${P}/worn-noir-panel.jpg`, alt: "Noir leaning in a stone window, the cloister bright behind him" },
      { src: `${P}/noir.jpg`, alt: "Noir front on under a carved stone arch, amber lenses" },
      { src: `${P}/meaning-aria-deco.jpg`, alt: "Aria close, black leather, lit out of the dark" },
    ],
  ],
};

export const close: Close = {
  heading: "Best seen in the last light of the room.",
  body: "The second door into the house. There are others.",
  cta: "Enter the Registry",
  trail: [
    `${P}/hero-arca.jpg`,
    `${P}/worn-noir-front.jpg`,
    `${P}/meaning-aria-deco.jpg`,
    `${P}/worn-noir-edge.jpg`,
    `${P}/worn-aria-doorway.jpg`,
    `${P}/worn-aria-concrete.jpg`,
    `${P}/detail-lightfall.jpg`,
    `${P}/worn-pair-corridor.jpg`,
    `${P}/worn-noir-profile.jpg`,
  ],
};
