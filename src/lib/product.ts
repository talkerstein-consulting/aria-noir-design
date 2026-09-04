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
  /**
   * What is held under the film until it can actually play. Defaults to
   * `image`, which is a different photograph from the one the film opens
   * on — so the hero visibly CUT when the video took over. A frame pulled
   * from the film itself makes the handover invisible.
   */
  poster?: string;
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

/** The full-bleed breather. `line` is optional: the section's job is to
 *  stop talking for a screen, and it does that with or without a sentence
 *  laid over the plate. */
export type Detail = { image: string; alt: string; line?: Headline };

export type SpecRow = { term: string; summary: string; detail: string };

export type Spec = {
  preheader: string;
  heading: Headline;
  rows: readonly SpecRow[];
  macro: readonly Plate[];
};

/**
 * The offer, reduced to the three things it actually needs: what the frame
 * is called, the one action, and the note about the register.
 *
 * It used to carry a price, a tagline and the colourway list as well. All
 * three were saying something a better surface already says — the buy page
 * prices each colourway separately (the run is not one number), the
 * variations stage now names every colour at full bleed, and the tagline
 * repeated the hero. What is left is an offer rather than a summary of the
 * page above it.
 */
export type Offering = {
  preheader: string;
  name: string;
  cta: string;
  registryNote: string;
  /** Shown under the squares where `turned` holds the turntable to fewer
   *  acetates than the house makes. Names the full count and points at the
   *  buy page, so a short row of squares reads as a selection rather than
   *  as the whole run. */
  moreNote?: string;
  /**
   * What stands in for a product photograph.
   *
   * `model` is a turntable glb, named here rather than hardcoded in the
   * viewer: every house's Blender source has been through
   * scripts/export-models.mjs, so which frame turns is a filename and not
   * a component. A plate is the honest fallback for a house whose export
   * has not been run, and reads as a still life rather than as a viewer
   * that refuses to spin.
   */
  view:
    | {
        kind: "model";
        src: string;
        /**
         * The acetates this turntable can be turned into, as squares under
         * the object.
         *
         * This is what replaced "The Variations". That section spent eight
         * screens of scroll showing eight photographs of one shape, which
         * is the same shape eight times and a colour swap dressed as a
         * story. Here the reader changes the acetate on the frame they are
         * already holding, at the angle they have already turned it to,
         * and the offer under it follows what they picked.
         *
         * Each entry names its own glb — the exports are per colourway,
         * see scripts/export-models.mjs — and its own `href`, which is the
         * buy page with that acetate already chosen. Clicking a square
         * does NOT navigate: it swaps the model, and the section's one CTA
         * carries the choice onward. A control that both changed the view
         * and left the page would make the view unusable.
         *
         * Absent, or shorter than two, and no squares are drawn: one
         * colourway is not a choice.
         */
        colorways?: readonly OfferingColorway[];
        /**
         * How many of those the TURNTABLE will actually load.
         *
         * Every entry above is still the house's run, and the palette band
         * under the opening still shows all of them. This is only about
         * how many meshes the page is willing to fetch and decode.
         *
         * Each glb is roughly 0.9MB on ARCA II and 1.6MB on ARCA I, so a
         * house with eight is asking for close to seven megabytes to let a
         * reader try on colours that the buy page can show them anyway.
         * Three is enough to prove the shape holds its character across
         * the run; the rest are one click away, on the surface that can
         * actually take the order.
         *
         * Omit it and every colourway turns. Where it IS set, the section
         * says so in `moreNote` rather than quietly showing a short list.
         */
        turned?: number;
      }
    | { kind: "plate"; image: string; alt: string };
};

/** One acetate the turntable can wear. `swatch` comes from SWATCHES in
 *  lib/shop so the square here and the square on the buy page are never
 *  two different claims about one material. */
export type OfferingColorway = {
  name: string;
  swatch: string;
  /** The glb for THIS acetate, under public/models/houses. */
  src: string;
  /** The buy page with this colourway already chosen. */
  href: string;
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
