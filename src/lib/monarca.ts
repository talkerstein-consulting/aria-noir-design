/**
 * MONARCA — product page copy and plate assignments.
 *
 * The house's approved copy deck, in the shape lib/product.ts sets and
 * components/product/story-page.tsx renders. One turntable export; the
 * films are placeholder teasers (see the note at `hero`) until the house
 * cuts its own, and the offering turns a single glb. The seven acetates are
 * painted by the palette band, which StoryPage builds from
 * `colorwayNames` in lib/navigation.
 *
 * Plates live in public/images/monarca/. A palazzo out of season, canals,
 * lantern light and rain.
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

const C = "/images/monarca/campaign";
/** The closeup pass — see scripts/import-closeup-photography. */
const CU = "/images/monarca/closeup";
const V = "/images/monarca/variants";

export const hero: Hero = {
  eyebrow: "MONARCA",
  name: "Some things are better left unseen.",
  line: "A cinematic frame shaped by shadow, reflection, and the quiet drama of forgotten places.",
  image: "/images/monarca/cover/desktop.webp",
  imagePortrait: "/images/monarca/cover/mobile.webp",
  alt: "MONARCA in Noir, low light",
  /* ---- Placeholder teasers, Sep 2026 ----
     Three Kling cuts stand in until the house films the campaign: the
     hero above the title, the establishing shot at the approach, the
     closing shot beside the buy page's detail tabs (lib/navigation).
     Each poster is frame 0 of its own film, so the handover is invisible
     (see the `poster` note in lib/product.ts). Swap the files under
     public/video/monarca/ and the page needs nothing else. */
  video: "/video/monarca/hero.mp4",
  poster: "/video/monarca/hero-poster.webp",
};

export const structure: Opening = {
  preheader: "The Form",
  heading: "A silhouette in the dark.",
  body: [
    "MONARCA carries a softer kind of authority. Sculptural lines and expressive finishes give the frame a distinct presence, shifting naturally between shadow, light, and reflection.",
  ],
  /* Worn, not shelved.
  
     This section is called The Form and its line is "a silhouette in the
     dark" — and it was illustrated by the frame at a second angle and the
     frame on a windowsill: two product stills, neither of which contains
     a silhouette or a person to cast one. The shoot delivered both figures
     standing in a doorway in exactly that light, and they were sitting
     unused. The claim is about presence, so the evidence has to have
     somebody in it. */
  images: [
    { src: `${C}/worn-noir-doorway-between-rooms.webp`, alt: "Noir in the doorway between two rooms" },
    { src: `${C}/worn-aria-alley-doorway.webp`, alt: "Aria in the alley doorway, lit from behind" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "The Presence",
  heading: "Seen. Then gone.",
  body: [
    "MONARCA plays with visibility. Its defined silhouette can emerge sharply from darkness or dissolve into the surrounding scene, creating a sense of movement even in stillness.",
  ],
  /* The two silhouette-through-blinds frames: the set's only pair where
     the subject is being taken away by the light rather than shown by
     it, which is the whole of this beat. */
  images: [
    { src: `${C}/creative-aria-silhouette-blinds.webp`, alt: "Aria against the blinds, in silhouette" },
    { src: `${C}/creative-noir-silhouette-blinds.webp`, alt: "Noir against the blinds, in silhouette" },
  ],
};

export const shoot: Shoot = {
  preheader: "The World",
  heading: "A story without an ending.",
  body: [
    "Worn stone, rain-slicked streets, distant lanterns, and empty rooms create the setting. MONARCA belongs somewhere between memory and fiction, where every reflection suggests there is more to the story.",
  ],
  images: [
    { src: `${C}/wide-long-alley-rain.webp`, alt: "The long alley, in rain" },
    { src: `${C}/wide-vaulted-gallery-hall.webp`, alt: "The vaulted gallery, empty" },
  ],
};

export const meaning: Meaning = {
  image: `${C}/macro-lens-bevel-water-reflection.webp`,
  alt: "The lens bevel, against water",
  eyebrow: "The Finish",
  heading: "Nothing stays quite the same.",
  body:
    "From DreamyRose to DarkTortoise, each finish changes its relationship with the light. Color emerges through shadow, reflection, and movement, revealing another side of the frame with every shift.",
};

/* The breather: still water and the far side of a canal, nobody in it. */
export const detail: Detail = {
  image: `${C}/wide-canal-still-water.webp`,
  alt: "Still water, and the far side of the canal",
};

export const spec: Spec = {
  preheader: "The Construction",
  heading: "Made for another kind of light.",
  rows: [
    {
      term: "01",
      summary: "Sculptural Silhouette",
      detail:
        "A considered profile gives MONARCA a strong identity while allowing its character to shift with the surroundings.",
    },
    {
      term: "02",
      summary: "Expressive Finishes",
      detail:
        "Distinct colorways, from DreamyRose to DarkTortoise, bring different depth and character to the frame.",
    },
    {
      term: "03",
      summary: "Defined Geometry",
      detail:
        "Clean structural lines provide contrast against the softer, atmospheric world surrounding the frame.",
    },
    {
      term: "04",
      summary: "Light-Catching Surfaces",
      detail:
        "Carefully considered surfaces interact with changing light, revealing subtle shifts in tone and form.",
    },
    {
      term: "05",
      summary: "Balanced Fit",
      detail:
        "A refined proportion keeps the frame wearable while preserving the distinctive presence of the MONARCA silhouette.",
    },
  ],
  /* The CLOSEUP pass, not the sill stills that were here.
  
     The sheet's longest claim is about how these acetates take light, and
     the evidence for it was the frame on a windowsill in three finishes —
     the material named three times at a distance that cannot show what it
     does. The extreme closeups are the claim: the same surface, worn, at
     the range where the shifts in tone are actually visible. The shoot
     delivered them and nothing was reading them; see
     scripts/import-closeup-photography. */
  macro: [
    { src: `${CU}/aria-extreme-closeup-eyewear.webp`, alt: "MONARCA at the eye, extreme close" },
    { src: `${CU}/noir-closeup-portrait.webp`, alt: "The frame worn, close" },
    { src: `${CU}/noir-extreme-closeup-eyewear.webp`, alt: "The acetate at the temple, extreme close" },
    { src: `${CU}/aria-closeup-portrait.webp`, alt: "The frame worn, close" },
  ],
};

export const approach: Approach = {
  /* The establishing teaser: wide, and a different cut from the hero's,
     so the approach is not the opening frame a second time. */
  film: {
    src: "/video/monarca/establishing.mp4",
    poster: "/video/monarca/establishing-poster.webp",
    alt: "The teaser film for MONARCA",
  },
  face: {
    src: `${C}/worn-noir-extreme-closeup-eyewear.webp`,
    alt: "Noir, extreme close, wearing MONARCA",
  },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "MONARCA",
  cta: "Discover MONARCA",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  view: {
    kind: "model",
    src: "/models/houses/monarca-noir.glb",
  },
};

export const worn: Worn = {
  preheader: "MONARCA",
  heading: "Leave something to the imagination.",
  cta: "Discover MONARCA",
  columns: [
    [
      { src: `${C}/worn-aria-lantern-bridge.webp`, alt: "Aria on the lantern bridge" },
      { src: `${C}/worn-noir-alley-doorway.webp`, alt: "Noir in the alley doorway" },
      { src: `${C}/wide-stairs-into-water.webp`, alt: "Stairs going into the water" },
      { src: `${C}/worn-aria-grand-staircase.webp`, alt: "Aria on the grand staircase" },
      { src: `${C}/creative-noir-rain-window.webp`, alt: "Noir behind the rain on the glass" },
    ],
    [
      { src: `${C}/worn-noir-water-reflection.webp`, alt: "Noir, reflected in the water" },
      { src: `${C}/duo-grand-hall-distant.webp`, alt: "Both, distant, in the grand hall" },
      { src: `${C}/worn-aria-doorway-between-rooms.webp`, alt: "Aria in the doorway between rooms" },
      { src: `${C}/wide-quay-empty.webp`, alt: "The quay, empty" },
      { src: `${C}/worn-noir-closeup-portrait.webp`, alt: "Noir, close portrait" },
    ],
    [
      { src: `${C}/worn-aria-mirror-reflection.webp`, alt: "Aria, in the mirror" },
      { src: `${C}/wide-arched-footbridge.webp`, alt: "The arched footbridge" },
      { src: `${C}/worn-noir-grand-staircase.webp`, alt: "Noir on the grand staircase" },
      { src: `${C}/duo-noir-long-alley-rain.webp`, alt: "Noir down the long alley, rain" },
      { src: `${C}/creative-aria-low-angle-dramatic.webp`, alt: "Aria, from low" },
    ],
  ],
};

export const close: Close = {
  cta: "Discover MONARCA",
  trail: [
    `${V}/noir-sill.webp`,
    `${C}/worn-aria-lantern-bridge.webp`,
    `${C}/wide-rooftops-silhouette.webp`,
    `${V}/dreamy-rose-sill.webp`,
    `${C}/duo-gallery-reflection.webp`,
    `${V}/pixie-dust-sill.webp`,
    `${C}/worn-noir-bust-portrait.webp`,
    `${C}/wide-great-ballroom.webp`,
    `${V}/tutti-frutti-sill.webp`,
  ],
};
