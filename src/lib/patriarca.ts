/**
 * PATRIARCA — product page copy and plate assignments.
 *
 * The house's approved copy deck, in the shape lib/product.ts sets and
 * components/product/story-page.tsx renders. No film, one turntable
 * export; the approach runs face-only and the offering turns a single glb.
 * The three acetates are painted by the palette band, which StoryPage
 * builds from `colorwayNames` in lib/navigation.
 *
 * Plates live in public/images/patriarca/. Rome, marble, and the last hour
 * of the light.
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

const C = "/images/patriarca/campaign";
const V = "/images/patriarca/variants";

export const hero: Hero = {
  eyebrow: "PATRIARCA",
  name: "Made to command the room.",
  line: "A sculptural frame with the weight, presence, and permanence of an heirloom.",
  image: "/images/patriarca/cover/desktop.webp",
  imagePortrait: "/images/patriarca/cover/mobile.webp",
  alt: "PATRIARCA in black, front on",
};

export const structure: Opening = {
  preheader: "The Form",
  heading: "Authority, in form.",
  body: [
    "PATRIARCA is built around a bold acetate silhouette and a sculptural gold-toned bridge. Strong proportions give the frame an unmistakable presence, designed to be noticed without asking for attention.",
  ],
  images: [
    { src: `${C}/hero-hero-black-detail-01.webp`, alt: "The frame, detail, black acetate" },
    { src: `${V}/midnight-noir-tall.webp`, alt: "PATRIARCA in Midnight Noir, upright" },
  ],
};

export const ariaNoir: AriaNoir = {
  preheader: "The Presence",
  heading: "Strength without excess.",
  body: [
    "Broad lines and a substantial profile give PATRIARCA its commanding character. Worn with modern tailoring, it becomes part of the silhouette rather than simply an accessory.",
  ],
  /* The two among-columns frames: same colonnade, one subject each, the
     frame carried rather than presented. */
  images: [
    { src: `${C}/worn-aria-among-columns.webp`, alt: "Aria among the columns" },
    { src: `${C}/worn-noir-among-columns.webp`, alt: "Noir among the columns" },
  ],
};

export const shoot: Shoot = {
  preheader: "The Heritage",
  heading: "Built for the long view.",
  body: [
    "Ancient stone provides the setting, but PATRIARCA belongs to the present. Its contemporary form against centuries-old architecture creates a tension between what is inherited and what is being built now.",
  ],
  images: [
    { src: `${C}/wide-basilica-interior.webp`, alt: "The basilica interior" },
    { src: `${C}/wide-ruins-golden-hour.webp`, alt: "The ruins, last light" },
  ],
};

export const meaning: Meaning = {
  image: `${C}/hero-hero-black-detail-02.webp`,
  alt: "The gold-toned bridge against the dark acetate",
  eyebrow: "The Bridge",
  heading: "A mark of distinction.",
  body:
    "The gold-toned bridge breaks through the dark acetate with deliberate contrast. It is the defining detail of PATRIARCA, recalling the character of an object made to endure.",
};

/* The breather: lattice shadows falling across stone, and nobody in the
   room to cast them. */
export const detail: Detail = {
  image: `${C}/vibe-vibe-01-lattice-shadows.webp`,
  alt: "Lattice shadows across stone",
};

export const spec: Spec = {
  preheader: "The Construction",
  heading: "Designed with permanence in mind.",
  rows: [
    {
      term: "01",
      summary: "Bold Acetate Frame",
      detail:
        "A substantial acetate construction gives PATRIARCA its distinctive weight and confident profile.",
    },
    {
      term: "02",
      summary: "Sculptural Gold-Toned Bridge",
      detail:
        "A pronounced bridge detail creates the signature contrast between the dark frame and its metallic accent.",
    },
    {
      term: "03",
      summary: "Strong Proportions",
      detail:
        "Defined dimensions give the frame a commanding presence while maintaining a considered overall balance.",
    },
    {
      term: "04",
      summary: "Black or Brown Acetate",
      detail:
        "Available in deep, classic tones that let the sculptural form remain the focus.",
    },
    {
      term: "05",
      summary: "Enduring Silhouette",
      detail:
        "A timeless profile designed to sit comfortably between contemporary fashion and classical influence.",
    },
  ],
  /* One subject per plate: the hinge, the temple's woodgrain, the mosaic
     the temple was matched against, and the third detail crop of the
     front. The house's macro set is the only one on the bench that is
     genuinely four different subjects, so the sheet is shot rather than
     assembled out of colourway stills. */
  macro: [
    { src: `${C}/macro-macro-02-hinge-column.webp`, alt: "The hinge, against a column" },
    { src: `${C}/macro-macro-04-temple-woodgrain.webp`, alt: "The temple's woodgrain" },
    { src: `${C}/macro-macro-03-mosaic.webp`, alt: "The mosaic" },
    { src: `${C}/hero-hero-black-detail-03.webp`, alt: "The front, third detail" },
  ],
};

export const approach: Approach = {
  face: {
    src: `${C}/hero-aria-magazine-cover-colosseum.webp`,
    alt: "Aria, close, wearing PATRIARCA",
  },
};

export const offering: Offering = {
  preheader: "The Offering",
  name: "PATRIARCA",
  cta: "Discover PATRIARCA",
  registryNote: "Each acquisition is registered. The piece is yours, permanently.",
  view: {
    kind: "model",
    src: "/models/houses/patriarca-midnight-noir.glb",
  },
};

export const worn: Worn = {
  preheader: "PATRIARCA",
  heading: "Wear what endures.",
  cta: "Discover PATRIARCA",
  columns: [
    [
      { src: `${C}/worn-aria-marble-staircase.webp`, alt: "Aria on the marble staircase" },
      { src: `${C}/creative-noir-creative-01-temple-steps.webp`, alt: "Noir on the temple steps" },
      { src: `${C}/duo-aria-long-colonnade.webp`, alt: "Aria down the long colonnade" },
      { src: `${C}/vibe-vibe-03-worn-steps.webp`, alt: "The worn steps" },
    ],
    [
      { src: `${C}/worn-noir-arched-doorway.webp`, alt: "Noir in the arched doorway" },
      { src: `${C}/duo-duo-roman-steps.webp`, alt: "Both, on the Roman steps" },
      { src: `${C}/creative-aria-creative-05-overhead-recline.webp`, alt: "Aria from overhead" },
      { src: `${C}/wide-bathhouse-oculus.webp`, alt: "The bathhouse oculus" },
    ],
    [
      { src: `${C}/worn-aria-arched-doorway.webp`, alt: "Aria in the arched doorway" },
      { src: `${C}/creative-duo-creative-02-doorway-silhouette.webp`, alt: "Both, in the doorway, silhouetted" },
      { src: `${C}/worn-noir-marble-staircase.webp`, alt: "Noir on the marble staircase" },
      { src: `${C}/wide-amphitheater-facade.webp`, alt: "The amphitheatre facade" },
    ],
  ],
};

export const close: Close = {
  cta: "Discover PATRIARCA",
  trail: [
    `${V}/midnight-noir-tall.webp`,
    `${C}/worn-aria-marble-staircase.webp`,
    `${C}/macro-macro-02-hinge-column.webp`,
    `${V}/brown-tall.webp`,
    `${C}/duo-duo-roman-steps.webp`,
    `${V}/black-tall.webp`,
    `${C}/vibe-vibe-02-statue-fragment.webp`,
    `${C}/wide-ruins-golden-hour.webp`,
    `${C}/creative-aria-creative-02-archway.webp`,
  ],
};
