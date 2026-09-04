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
import { swatchFor } from "./shop";

const P = "/images/arca-ii";
/* The colourway run, one plate per acetate. See build-arca-ii-images.mjs. */
const V = `${P}/variants`;

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
    { text: "In praise of shadows.", italic: true },
    { text: "NINETY-SEVEN PARTS DARK, THREE PARTS GOLD.", italic: false },
  ],
  image: `${P}/hero-poster.jpg`,
  alt: "Aria and Noir in the dark in ARCA II, the room glowing behind them",
  video: "/video/arca-ii-hero.mp4",
  poster: `${P}/hero-poster.jpg`,
};

export const structure: Opening = {
  preheader: "The Structure",
  heading: "We built the room before we built a single frame in it.",
  body: [
    "Not a set. A place, with its own stairwell and its own far door, so that every shot taken afterwards was taken somewhere rather than against something. The brutalist bones are the same ones ARCA I stood in — two cuts from one house should not arrive from two different worlds.",
    "What changed is the light. ARCA I was lit from outside, and the concrete answered coldly. This room glows from within, and the Art Deco lines inlaid into that concrete only appear where the glow happens to reach them.",
  ],
  images: [
    { src: `${P}/structure-stair.jpg`, alt: "A stone stair rising out of a dark passage towards one lit window" },
    { src: `${P}/structure-door.jpg`, alt: "An empty vaulted corridor, a single window burning at the far end of it" },
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
    { src: `${P}/aria.jpg`, alt: "Aria front on beneath carved stone, the lenses filling the frame" },
    { src: `${P}/noir.jpg`, alt: "Noir front on under a carved stone arch, amber lenses" },
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
    { src: `${P}/shoot-pair-door.jpg`, alt: "Aria and Noir at distance in a cloister colonnade, the arcade running away behind them" },
    { src: `${P}/shoot-pair-bands.jpg`, alt: "Aria and Noir together in a stone room, the light coming from one side" },
  ],
  note: {
    label: "A note on shadow",
    body:
      "Tanizaki's question, borrowed rather than cited: does the thing grow more beautiful as the room grows darker. Everything on this page was made to answer yes.",
  },
};

export const meaning: Meaning = {
  image: `${P}/meaning-aria-deco.jpg`,
  alt: "Aria in ARCA II, close, black leather, lit out of the dark",
  eyebrow: "L'Éloge de l'Ombre",
  heading: "In praise of shadows: the argument that a thing is not revealed by light so much as spent by it.",
  body:
    "Lacquer was made for candlelight. Gold leaf was made for a room with one lamp in it. Set either under a bright even source and you get an accurate photograph of an object that has stopped doing the one thing it was made to do. ARCA II is cut for the darker room, and asks to be met there.",
  /* The new plate is a centred close portrait rather than the wide it
     replaces, so there is nothing to push out from under the text column —
     any crop off centre now cuts her face. */
  objectPosition: "50% 35%",
};

export const detail: Detail = {
  image: `${P}/detail-lightfall.jpg`,
  alt: "An empty hall with window light laid in long bars across the floor",
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
    { src: `${P}/spec-macro-eye-gold.jpg`, alt: "Half a face, the gold temple plaque beside the eye behind an amber lens" },
    { src: `${P}/spec-macro-temple.jpg`, alt: "The temple engraved ARCA-00003NFT-NR, 54â21â140, in tortoise acetate" },
    { src: `${P}/spec-macro-eye.jpg`, alt: "Macro of the gold bridge plaque, its Deco fan cut into the acetate" },
    { src: `${P}/object-front.jpg`, alt: "ARCA II on a stone sill, amber lenses catching the window" },
  ],
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "ARCA II",
  cta: "Enter the Registry",
  registryNote:
    "Every acquisition is registered as an OFFICIAL NFT, your piece is only yours, forever.",
  /* The Noir, turning. This cut HAS an export — scripts/export-models.mjs
     ran the whole `3d models/` set, and arca-ii-noir.glb has been sitting
     in public/models/houses since — the page just never asked for it and
     showed a still life instead. */
  view: { kind: "model", src: "/models/houses/arca-ii-noir.glb" },
};

/** Every colourway lands on the buy page with that acetate already chosen
 *  — the same handover ARCA I makes. A colour named at full bleed that
 *  drops the reader on the house's default is a colour they then have to
 *  find again by hand. */
const buyColour = (name: string) =>
  `/shop/arca-ii?colourway=${encodeURIComponent(name)}`;

export const variations: Variations = {
  preheader: "The Variations",
  heading: "Eight colourways, and one room dark enough that the difference between them is a matter of how each one gives light back.",
  /* Every acetate now has its own photograph — the campaign shot the run
     one frame at a time on the same window sill, so the panels differ by
     the material rather than by the light. They live under
     `variants/<slug>-sill.jpg`, apart from the storefront's numbered set,
     because two sources writing one namespace is how a campaign frame gets
     silently replaced by a catalogue thumbnail.

     The hexes stay: they come from SWATCHES in lib/shop, they are what the
     picker paints, and this page and the buy page must not show one acetate
     in two colours. */
  colorways: [
    { name: "Noir", swatch: swatchFor("Noir"), image: `${V}/noir-sill.jpg`, alt: "Noir — on the window sill, lenses to the light", href: buyColour("Noir"), cta: "Acquire Noir" },
    { name: "Dark Tortoise", swatch: swatchFor("Dark Tortoise"), image: `${V}/dark-tortoise-sill.jpg`, alt: "Dark Tortoise — on the window sill, lenses to the light", href: buyColour("Dark Tortoise"), cta: "Acquire Dark Tortoise" },
    { name: "Caramel Stripe", swatch: swatchFor("Caramel Stripe"), image: `${V}/caramel-stripe-sill.jpg`, alt: "Caramel Stripe — on the window sill, lenses to the light", href: buyColour("Caramel Stripe"), cta: "Acquire Caramel Stripe" },
    { name: "Root Beer Float", swatch: swatchFor("Root Beer Float"), image: `${V}/root-beer-float-sill.jpg`, alt: "Root Beer Float — on the window sill, lenses to the light", href: buyColour("Root Beer Float"), cta: "Acquire Root Beer Float" },
    { name: "Tutti Frutti", swatch: swatchFor("Tutti Frutti"), image: `${V}/tutti-frutti-sill.jpg`, alt: "Tutti Frutti — on the window sill, lenses to the light", href: buyColour("Tutti Frutti"), cta: "Acquire Tutti Frutti" },
    { name: "Dreamy Rose", swatch: swatchFor("Dreamy Rose"), image: `${V}/dreamy-rose-sill.jpg`, alt: "Dreamy Rose — on the window sill, lenses to the light", href: buyColour("Dreamy Rose"), cta: "Acquire Dreamy Rose" },
    { name: "Velvet Rose", swatch: swatchFor("Velvet Rose"), image: `${V}/velvet-rose-sill.jpg`, alt: "Velvet Rose — on the window sill, lenses to the light", href: buyColour("Velvet Rose"), cta: "Acquire Velvet Rose" },
    { name: "Pixie Dust", swatch: swatchFor("Pixie Dust"), image: `${V}/pixie-dust-sill.jpg`, alt: "Pixie Dust — on the window sill, lenses to the light", href: buyColour("Pixie Dust"), cta: "Acquire Pixie Dust" },
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
