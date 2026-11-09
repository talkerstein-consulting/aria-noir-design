/** The turntable's cut-out renders in /images/fronts-cut/, keyed `collection/colourway`. */
export const TURNTABLE: Record<string, string> = {
  "arca-i/309 Blue": "arca-i-309-blue",
  "arca-i/K Black": "arca-i-k-black",
  "arca-i/Proceso Brown": "arca-i-proceso-brown",
  "arca-i/Z White": "arca-i-z-white",
  "arca-ii/Caramel Stripe": "arca-ii-caramel-stripe",
  "arca-ii/Dark Tortoise": "arca-ii-dark-tortoise",
  "arca-ii/Dreamy Rose": "arca-ii-dreamy-rose",
  "arca-ii/Noir": "arca-ii-noir",
  "arca-ii/Pixie Dust": "arca-ii-pixie-dust",
  "arca-ii/Root Beer Float": "arca-ii-root-beer-float",
  "arca-ii/Tutti Frutti": "arca-ii-tutti-frutti",
  "arca-ii/Velvet Rose": "arca-ii-velvet-rose",
  "ahava/Caramel Stripe": "ahava-caramel-stripe",
  "ahava/Dark Tortoise": "ahava-dark-tortoise",
  "ahava/Noir": "ahava-noir",
  "ahava/Root Beer Float": "ahava-root-beer-float",
  "ahava/Rose": "ahava-rose",
  "ahava/Tutti Frutti": "ahava-tutti-frutti",
  "monarca/Caramel Stripe": "monarca-caramel-stripe",
  "monarca/Dark Tortoise": "monarca-dark-tortoise",
  "monarca/Dreamy Rose": "monarca-dreamy-rose",
  "monarca/Noir": "monarca-noir",
  "monarca/Pixie Dust": "monarca-pixie-dust",
  "monarca/Tutti Frutti": "monarca-tutti-frutti",
  "monarca/Velvet Rose": "monarca-velvet-rose",
  "matriarca/Brown": "matriarca-brown",
  "matriarca/Midnight Noir": "matriarca-noir",
  "patriarca/Black": "patriarca-black",
  "patriarca/Brown": "patriarca-brown",
  "patriarca/Midnight Noir": "patriarca-midnight-noir",
};

/**
 * Per-house size of the turntable, as a scale on the render inside its box
 * (the box, and so the layout around it, stays put). From Jai's review,
 * 5 Nov 2026: PATRIARCA on desktop at least 25% bigger; ARCA I on a phone
 * about 15% bigger; ARCA II on a phone is right as it is. Everything else 1.
 */
const SPIN_SCALE: Record<string, { mobile?: number; desktop?: number }> = {
  patriarca: { desktop: 1.25 },
  "arca-i": { mobile: 1.15 },
};

/** The scale for a house slug, or for a turntable stem (`arca-i-k-black`). */
export function spinScaleFor(slugOrStem: string) {
  /* Longest match first, so `arca-ii-…` never reads as `arca-i`. */
  const key = Object.keys(SPIN_SCALE)
    .sort((a, b) => b.length - a.length)
    .find((k) => slugOrStem === k || (slugOrStem.startsWith(`${k}-`) && !slugOrStem.startsWith(`${k}i-`)));
  const s = key ? SPIN_SCALE[key] : {};
  return { mobile: s.mobile ?? 1, desktop: s.desktop ?? 1 };
}

/** The cut-out render for one acetate, if it has been rendered. */
export const turntableStem = (collection: string, colorway: string | null | undefined) =>
  colorway ? TURNTABLE[`${collection}/${colorway}`] : undefined;


