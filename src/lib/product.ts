/**
 * The SHAPE of a product page, separated from any one product's copy.
 *
 * lib/arca-i.ts and lib/arca-ii.ts are both instances of this. The modules
 * in components/product/ take these objects as props rather than importing
 * a house directly, which is the only reason two houses can share one set
 * of sections: the day a third ships, it is a data file and a route, not a
 * third copy of thirteen components.
 *
 * Everything optional here is genuinely optional — a house that has no
 * campaign video, no turntable model and no colourway stills still renders
 * a complete page, it just renders fewer things. That is deliberate: the
 * catalogue ships houses before their photography lands (see the `plate:
 * null` entries in lib/navigation.ts), so "missing" has to be a state the
 * page holds rather than a state it breaks in.
 */

import type { Segment } from "@/components/reveal";

/** A heading may be one string, or the mixed roman/italic run the atelier
 *  masthead uses. RevealText accepts either, so the type follows it. */
export type Headline = string | readonly Segment[];

export type Plate = { src: string; alt: string };

export type Hero = {
  eyebrow: string;
  name: string;
  line: Headline;
  /** Poster for the video where there is one; the plate itself where there
   *  is not. Always present, so the first paint is never empty. */
  image: string;
  alt: string;
  /** Campaign film. Omit and the hero renders the still alone. */
  video?: string;
};

export type Opening = {
  preheader: string;
  heading: Headline;
  body: readonly string[];
  images: readonly Plate[];
};

export type AriaNoir = {
  preheader: string;
  heading: Headline;
  body: readonly string[];
  images: readonly Plate[];
};

export type Shoot = {
  preheader: string;
  heading: Headline;
  body: readonly string[];
  images: readonly Plate[];
  note: { label: string; body: string };
};

export type Meaning = {
  image: string;
  alt: string;
  eyebrow: string;
  heading: Headline;
  body: string;
  /** Where to hold the plate's crop. Some frames put the subject centre,
   *  some put it hard right; the section is a half-width column over a
   *  full-bleed image, so the wrong anchor hides the face behind the type. */
  objectPosition?: string;
};

export type Detail = { image: string; alt: string; line: Headline };

export type SpecRow = { term: string; summary: string; detail: string };

export type Spec = {
  preheader: string;
  heading: Headline;
  rows: readonly SpecRow[];
  macro: readonly Plate[];
};

export type Offering = {
  preheader: string;
  name: string;
  tagline: string;
  price: string;
  colorways: readonly string[];
  cta: string;
  registryNote: string;
  /**
   * What stands in for a product photograph. `model` is the turntable glb
   * — one house has one, and it is not something to fake for the others.
   * A plate is the honest fallback, and reads as a still life rather than
   * as a viewer that refuses to spin.
   */
  view: { kind: "model" } | { kind: "plate"; image: string; alt: string };
};

export type Colorway = {
  name: string;
  swatch: string;
  image?: string;
  alt?: string;
};

export type Variations = {
  preheader: string;
  heading: Headline;
  colorways: readonly Colorway[];
};

export type References = { label: string; names: readonly string[] };

export type Worn = {
  preheader: string;
  heading: Headline;
  cta: string;
  /** Three columns, in the order they hang. Lengths need not match — the
   *  curtain drapes off column DEPTH, so a ragged foot is the effect. */
  columns: readonly (readonly Plate[])[];
};

export type Close = {
  heading: Headline;
  body: string;
  cta: string;
  /** Plates the pointer trail throws. */
  trail: readonly string[];
};
