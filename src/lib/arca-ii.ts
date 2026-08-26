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

import type {
  AriaNoir,
  Close,
  Detail,
  Hero,
  Meaning,
  Offering,
  Opening,
  References,
  Shoot,
  Spec,
  Variations,
  Worn,
} from "./product";

const P = "/images/arca-ii";

/* No campaign film for this cut — the hero renders the still alone, and the
   type keeps the same one-second hold it observes on ARCA I. */
export const hero: Hero = {
  eyebrow: "The Second Cut",
  name: "ARCA II",
  line: [
    { text: "In praise of shadows.", italic: true },
    { text: "NINETY-SEVEN PARTS DARK, THREE PARTS GOLD.", italic: false },
  ],
  image: `${P}/hero-arca.jpg`,
  alt: "Aria and Noir wearing ARCA II, a concrete corridor running away behind them",
};

export const structure: Opening = {
  preheader: "The Structure",
  heading: "We built the room before we built a single frame in it.",
  body: [
    "Not a set. A place, with its own stairwell and its own far door, so that every shot taken afterwards was taken somewhere rather than against something. The brutalist bones are the same ones ARCA I stood in — two cuts from one house should not arrive from two different worlds.",
    "What changed is the light. ARCA I was lit from outside, and the concrete answered coldly. This room glows from within, and the Art Deco lines inlaid into that concrete only appear where the glow happens to reach them.",
  ],
  images: [
    { src: `${P}/structure-stair.jpg`, alt: "A stairwell falling away into the dark, a single light at the head of it" },
    { src: `${P}/structure-door.jpg`, alt: "An empty concrete hall with one lit doorway at the far end" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "Aria / Noir",
  heading: [
    { text: "The same two faces, asked to stand in far less light", italic: true },
    { text: "AND GIVE AWAY JUST AS MUCH.", italic: false },
  ],
  body: [
    "A house's names have to survive a change of weather. Aria is still a single voice holding a room alone; Noir is still the colour a shadow keeps at noon. Neither of them was softened to suit a warmer room.",
    "What the room did instead was take things away — a jawline, a shoulder, half a coat — and leave the frame as the one object it never lets go of.",
  ],
  images: [
    { src: `${P}/aria.jpg`, alt: "Aria in ARCA II, front on, the gold temple plaque catching the only light in frame" },
    { src: `${P}/noir.jpg`, alt: "Noir in ARCA II against an Art Deco panelled wall, amber lenses" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Shoot",
  heading: "Almost too dark, and held there on purpose.",
  body: [
    "Every instinct in the process wanted to light this evenly. Even light is what a product shot does, and a product shot is precisely what this could not become — so the exposure was set once, low, and defended frame by frame against its own drift back toward normal.",
    "The gold was the harder half of that. It had to catch light without ever being fully lit, which is a thing to ask of any camera: show me this, but do not show me all of it. Drop frames, split bands, a fisheye that admits what it is — the flourishes are here because the shadow needed something to happen inside it.",
  ],
  images: [
    { src: `${P}/shoot-pair-door.jpg`, alt: "Split band frame — Aria and Noir at the timber door, cropped to the eyeline" },
    { src: `${P}/shoot-pair-bands.jpg`, alt: "Aria and Noir back to back, high contrast monochrome, lenses lit from within" },
  ],
  note: {
    label: "A note on shadow",
    body:
      "Tanizaki's question, borrowed rather than cited: does the thing grow more beautiful as the room grows darker. Everything on this page was made to answer yes.",
  },
};

export const meaning: Meaning = {
  image: `${P}/meaning-aria-deco.jpg`,
  alt: "Aria in ARCA II against concrete etched with Art Deco geometry",
  eyebrow: "L'Éloge de l'Ombre",
  heading: "In praise of shadows: the argument that a thing is not revealed by light so much as spent by it.",
  body:
    "Lacquer was made for candlelight. Gold leaf was made for a room with one lamp in it. Set either under a bright even source and you get an accurate photograph of an object that has stopped doing the one thing it was made to do. ARCA II is cut for the darker room, and asks to be met there.",
  /* Plate 15 sits Aria left of centre and high; the text column owns the
     left half from `sm` up, so the crop is pushed right and lifted to keep
     her clear of it. */
  objectPosition: "68% 30%",
};

export const detail: Detail = {
  image: `${P}/detail-lightfall.jpg`,
  alt: "ARCA II laid on raw concrete, a single shaft of warm light falling across it",
  line: "Three percent of this frame is gold. It is the only part of it that ever moves.",
};

export const spec: Spec = {
  preheader: "The Specs",
  heading: "What it's made of.",
  rows: [
    {
      term: "Frame",
      summary: "Hand-cut block acetate, single cut",
      detail:
        "One shape, held in eight colourways — the opposite bet from ARCA I, which took four shapes and four colours. A house that cuts once has to get the cut right, so the profile here is wider through the browline and squarer at the corner than the founding model, and it does not vary.",
    },
    {
      term: "Temple",
      summary: "Inlaid gold plaque, set into stone-cut detailing",
      detail:
        "The three percent. A geometric Deco plaque let into the temple face, sitting proud of a stone-textured field cut around it. It is the only element on the frame finished to catch light rather than absorb it, which is why it is small and why it is placed where a turn of the head will find it.",
    },
    {
      term: "Hinge",
      summary: "Five-barrel spring hinge",
      detail:
        "Built to flex outward past the temple's resting point and return to true, rated for tens of thousands of open-close cycles without loosening. Carried over from ARCA I unchanged, because it was already the part of that frame worth keeping.",
    },
    {
      term: "Lens",
      summary: "UV400-rated, scratch-resistant optical glass",
      detail:
        "Full-spectrum UV protection paired with genuine optical clarity. Held here in a warmer tint than the founding model takes — the amber is what lets the lens read as lit from inside rather than as a dark panel.",
    },
    {
      term: "Bridge",
      summary: "Flat keyhole, double bar",
      detail:
        "The keyhole shape ARCA I established, squared off and carried on a second bar across the top of the frame. Fewer points of failure than a hardware bridge, and the bar is what gives this cut its brow.",
    },
    {
      term: "Finish",
      summary: "Hand-polished, lacquer depth",
      detail:
        "Every edge finished by hand after cutting, then polished past the point where acetate merely looks clean and into the point where it holds a reflection. That depth is the whole reason the frame survives a dark room instead of disappearing into one.",
    },
  ],
  macro: [
    { src: `${P}/spec-macro-eye-gold.jpg`, alt: "Macro of the gold temple plaque against skin, the eye behind an amber lens" },
    { src: `${P}/spec-macro-temple.jpg`, alt: "Monochrome macro of the temple's stone-cut detailing" },
    { src: `${P}/spec-macro-eye.jpg`, alt: "Close crop through the lens, the plaque at the top corner of frame" },
    { src: `${P}/object-front.jpg`, alt: "ARCA II front on, laid flat on concrete" },
  ],
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA II",
  tagline: "The second cut. One shape, and the widest colour run the house holds.",
  price: "$125",
  /* NOTE: Noir and Pixie Dust are the two names the catalogue records
     (lib/navigation.ts). The other six are placeholders standing in until
     the house confirms the run — swap the strings here and the swatches in
     `variations` below, and nothing else needs touching. */
  colorways: [
    "Noir",
    "Cognac",
    "Havana",
    "Smoke",
    "Ash",
    "Bordeaux",
    "Ivory",
    "Pixie Dust",
  ],
  cta: "Enter the Registry",
  registryNote:
    "Every acquisition is registered as an OFFICIAL NFT, your piece is only yours, forever. This is where your house record begins.",
  /* No turntable for this cut — the still life stands in. */
  view: {
    kind: "plate",
    image: `${P}/offering-frame.jpg`,
    alt: "ARCA II, three-quarter still life on concrete",
  },
};

export const variations: Variations = {
  preheader: "The Variations",
  heading: "Eight colourways, and one room dark enough that the difference between them is a matter of how each one gives light back.",
  /* Only the Noir has a still in the pool; the rest carry a swatch and a
     name, the same treatment the eyewear index uses for houses whose
     photography has not landed. See the NOTE in `offering` — six of these
     names are placeholders. */
  colorways: [
    { name: "Noir", swatch: "#0b0b0c", image: `${P}/object-front.jpg`, alt: "Noir — laid on concrete, front on" },
    { name: "Cognac", swatch: "#6b4a2f" },
    { name: "Havana", swatch: "#4a3120" },
    { name: "Smoke", swatch: "#3b3a38" },
    { name: "Ash", swatch: "#6e6c67" },
    { name: "Bordeaux", swatch: "#3d1d24" },
    { name: "Ivory", swatch: "#ded8cb" },
    { name: "Pixie Dust", swatch: "#b9a48f" },
  ],
};

export const references: References = {
  label: "References",
  names: [
    "Tanizaki",
    "Horst",
    "Sugimoto",
    "Dunand",
    "Only Lovers Left Alive",
    "In the Mood for Love",
  ],
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
      { src: `${P}/worn-noir-front.jpg`, alt: "Noir front on, leather, against Deco-etched concrete" },
      { src: `${P}/worn-aria-doorway.jpg`, alt: "Aria at a doorway, warm bokeh behind her" },
      { src: `${P}/worn-noir-profile.jpg`, alt: "Noir in profile, monochrome, coat turned to the light" },
      { src: `${P}/worn-aria-panel.jpg`, alt: "Aria, panel crop, lenses catching the room" },
    ],
    [
      { src: `${P}/worn-pair-corridor.jpg`, alt: "Aria and Noir together in the corridor" },
      { src: `${P}/worn-aria-concrete.jpg`, alt: "Aria turning over her shoulder against poured concrete" },
      { src: `${P}/worn-noir-edge.jpg`, alt: "Noir at a concrete edge, two lights burning out of focus behind him" },
      { src: `${P}/aria.jpg`, alt: "Aria front on, the gold plaque the brightest thing in frame" },
    ],
    [
      { src: `${P}/worn-aria-trench.jpg`, alt: "Aria in a trench coat, monochrome, back three-quarters" },
      { src: `${P}/worn-noir-panel.jpg`, alt: "Noir, panel crop, high collar" },
      { src: `${P}/noir.jpg`, alt: "Noir against the Deco wall, amber lenses" },
      { src: `${P}/meaning-aria-deco.jpg`, alt: "Aria against etched concrete" },
    ],
  ],
};

export const close: Close = {
  heading: "Best seen in the last light of the room.",
  body: "This is the second door into the house. There are others.",
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
