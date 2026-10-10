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

/** The cut-out render for one acetate, if it has been rendered. */
export const turntableStem = (collection: string, colorway: string | null | undefined) =>
  colorway ? TURNTABLE[`${collection}/${colorway}`] : undefined;


