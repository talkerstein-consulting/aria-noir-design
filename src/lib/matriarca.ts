/**
 * MATRIARCA — product page copy and plate assignments.
 *
 * The house's approved copy deck, in the shape lib/product.ts sets and
 * components/product/story-page.tsx renders. Placeholder teaser films
 * (see the note at `hero`), one turntable
 * export; the approach runs face-only and the offering turns a single glb.
 *
 * The run is three acetates and one of them, Black Wood, is out of the
 * workshop. Nothing in this file says so: the palette band is built from
 * the catalogue and the counter at the foot of the page refuses the sale
 * exactly when Shopify would. A sentence here claiming stock would be a
 * second answer to a question the feed already answers.
 *
 * Plates live in public/images/matriarca/. Karnak, Abu Simbel, Giza.
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

const C = "/images/matriarca/campaign";
/** The closeup pass — see scripts/import-closeup-photography. */
const CU = "/images/matriarca/closeup";
const V = "/images/matriarca/variants";

export const hero: Hero = {
  eyebrow: "MATRIARCA",
  name: "Made for monumental scale.",
  line: "A sculptural frame where precise gold hardware meets the enduring language of ancient architecture.",
  image: "/images/matriarca/cover/desktop.webp",
  imagePortrait: "/images/matriarca/cover/mobile.webp",
  /* The frame runs to the left edge of the wide plate, so on a squarer
     monitor the crop has to come off the right. See Hero.focus. The
     portrait plate was re-cut with the frame centred and needs nothing. */
  focus: "38% 30%",
  alt: "MATRIARCA, the bridge against stone",
  /* ---- Placeholder teasers, Sep 2026 ----
     Three Kling cuts stand in until the house films the campaign: the
     hero above the title, the establishing shot at the approach, the
     closing shot beside the buy page's detail tabs (lib/navigation).
     Each poster is frame 0 of its own film, so the handover is invisible
     (see the `poster` note in lib/product.ts). Swap the files under
     public/video/matriarca/ and the page needs nothing else. */
  video: "/video/matriarca/hero.mp4",
  poster: "/video/matriarca/hero-poster.webp",
};

export const structure: Opening = {
  preheader: "The Form",
  heading: "Built like a gateway.",
  body: [
    "MATRIARCA takes its character from monumental architecture. The bold frame is defined by strong geometry, while the gold temple and pylon-like bridge create a distinctive architectural signature.",
  ],
  images: [
    { src: `${V}/midnight-noir-tall.webp`, alt: "MATRIARCA in Midnight Noir, upright" },
    { src: `${C}/wide-hypostyle-hall.webp`, alt: "The hypostyle hall" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "The Scale",
  heading: "Small against something timeless.",
  body: [
    "MATRIARCA was designed to hold its presence against monumental surroundings. Its structured silhouette remains unmistakable whether seen against the horizon or in close detail.",
  ],
  /* The two golden-hour profiles: one subject each, the frame read at the
     distance a face is actually seen at, with the monument behind it. */
  images: [
    { src: `${C}/worn-aria-closeup-02-profile-golden.webp`, alt: "Aria in profile, golden hour" },
    { src: `${C}/worn-noir-closeup-02-profile-golden.webp`, alt: "Noir in profile, golden hour" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Setting",
  heading: "Ancient scale. Modern form.",
  body: [
    "From monumental gateways to vast stone structures, the architecture gives MATRIARCA its sense of scale. The frame answers with a contemporary silhouette, creating a dialogue between two very different eras.",
  ],
  images: [
    { src: `${C}/wide-aria-solo-wide-02-giza-dune-panoramic.webp`, alt: "Giza, from the dune" },
    { src: `${C}/wide-temple-ruins-golden-hour.webp`, alt: "The temple ruins, last light" },
  ],
};

export const meaning: Meaning = {
  image: `${C}/macro-macro-01-bridge-relief.webp`,
  alt: "The gold bridge, close, against relief",
  eyebrow: "The Gold",
  heading: "The detail that draws the eye.",
  body:
    "Gold hardware cuts through the dark frame with deliberate precision. Like a gateway against stone, it creates a clear point of focus without disrupting the strength of the whole.",
};

/* The breather: a statue on its side, and nobody there. */
export const detail: Detail = {
  image: `${C}/vibe-vibe-02-fallen-statue.webp`,
  alt: "The fallen statue",
};

export const spec: Spec = {
  preheader: "The Construction",
  heading: "Precision at every scale.",
  rows: [
    {
      term: "01",
      summary: "Sculptural Frame",
      detail:
        "A bold, structured silhouette gives MATRIARCA a strong architectural presence from every angle.",
    },
    {
      term: "02",
      summary: "Signature Gold Temple",
      detail:
        "Gold hardware extends along the temple, creating a refined metallic contrast against the darker frame.",
    },
    {
      term: "03",
      summary: "Pylon-Inspired Bridge",
      detail:
        "The distinctive bridge takes visual cues from monumental gateways, giving the front of the frame its defining character.",
    },
    {
      term: "04",
      summary: "Strong Geometric Profile",
      detail:
        "Clean lines and deliberate proportions create a silhouette that feels substantial without unnecessary ornament.",
    },
    {
      term: "05",
      summary: "Contemporary Construction",
      detail:
        "Modern materials and a considered fit bring the monumental concept into an everyday, wearable form.",
    },
  ],
  /* The CLOSEUP pass, not the sill stills that were here.
  
     Every claim on this sheet is about something you have to be close to
     see — the bridge relief, the profile, the proportion at the temple —
     and the evidence beside it was the whole frame on a windowsill, four
     times, at a distance where none of those readings are available. The
     shoot delivered a closeup pass for exactly this and nothing was
     reading it; see scripts/import-closeup-photography.
  
     Both figures, because the sheet describes one object and the two
     passes are the same object in two lights. */
  macro: [
    { src: `${CU}/aria-closeup-01-stone-archway.webp`, alt: "MATRIARCA at the stone archway, close" },
    { src: `${CU}/noir-closeup-02-profile-golden.webp`, alt: "The frame in profile, golden light" },
    { src: `${CU}/noir-closeup-01-stone-archway.webp`, alt: "MATRIARCA at the stone archway, close" },
    { src: `${CU}/aria-closeup-02-profile-golden.webp`, alt: "The frame in profile, golden light" },
  ],
};

export const approach: Approach = {
  /* The establishing teaser, a different cut from the hero's. */
  film: {
    src: "/video/matriarca/establishing.mp4",
    poster: "/video/matriarca/establishing-poster.webp",
    alt: "The teaser film for MATRIARCA",
  },
  face: {
    src: `${C}/worn-noir-closeup-01-stone-archway.webp`,
    alt: "Noir, close, in the stone archway",
  },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "MATRIARCA",
  cta: "Discover MATRIARCA",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  view: {
    kind: "model",
    src: "/models/houses/matriarca-midnight-noir.glb",
  },
};

export const worn: Worn = {
  preheader: "MATRIARCA",
  heading: "Wear the monumental.",
  cta: "Discover MATRIARCA",
  columns: [
    [
      { src: `${C}/worn-aria-obelisk-courtyard.webp`, alt: "Aria in the obelisk courtyard" },
      { src: `${C}/duo-duo-wide-01-giza-sphinx-pyramid.webp`, alt: "Both, at the sphinx" },
      { src: `${C}/worn-noir-closeup-01-stone-archway.webp`, alt: "Noir in the stone archway" },
      { src: `${C}/vibe-vibe-01-window-shadows.webp`, alt: "Window shadows across stone" },
    ],
    [
      { src: `${C}/worn-aria-closeup-01-stone-archway.webp`, alt: "Aria in the stone archway" },
      { src: `${C}/wide-noir-solo-wide-01-karnak-hypostyle-hall.webp`, alt: "Noir in the hypostyle hall" },
      { src: `${C}/duo-duo-wide-03-abu-simbel.webp`, alt: "Both, at Abu Simbel" },
      { src: `${C}/wide-aria-solo-wide-01-abu-simbel.webp`, alt: "Aria at Abu Simbel" },
    ],
    [
      { src: `${C}/duo-duo-wide-02-karnak-hypostyle-hall.webp`, alt: "Both, in the hypostyle hall" },
      { src: `${C}/wide-noir-solo-wide-02-giza-sphinx-pyramid.webp`, alt: "Noir at the sphinx" },
      { src: `${C}/wide-aria-solo-wide-01-hypostyle-hall-panoramic.webp`, alt: "Aria, hypostyle hall, panoramic" },
      { src: `${C}/wide-noir-solo-wide-01-abu-simbel-panoramic.webp`, alt: "Noir at Abu Simbel, panoramic" },
    ],
  ],
};

export const close: Close = {
  cta: "Discover MATRIARCA",
  trail: [
    `${V}/midnight-noir-tall.webp`,
    `${C}/worn-aria-obelisk-courtyard.webp`,
    `${C}/macro-macro-01-bridge-relief.webp`,
    `${V}/brown-tall.webp`,
    `${C}/duo-duo-wide-03-abu-simbel.webp`,
    `${V}/black-wood-01.webp`,
    `${C}/vibe-vibe-02-fallen-statue.webp`,
    `${C}/wide-temple-ruins-golden-hour.webp`,
    `${V}/midnight-noir-03.webp`,
  ],
};
