/**
 * Per-photograph framing for the 4:3 product cards.
 *
 * The colourway photographs were shot at different distances, so one
 * shared crop left some pairs filling the tile and others small and off
 * to one side. Each entry is [scale, x%, y%]: zoom until the frame spans
 * about 88% of the tile's width, then shift it to the middle (clamped
 * so the photo never pulls away from an edge). Measured from the images;
 * re-measure if a photograph is replaced.
 */
export const CARD_FRAMING: Record<string, readonly [number, number, number]> = {
  "/images/ahava/variants/caramel-stripe-card.webp": [1.36, -4.3, -7.6],
  "/images/ahava/variants/dark-tortoise-card.webp": [1.24, -2.6, -6.9],
  "/images/ahava/variants/noir-card.webp": [1.92, -8.0, -21.3],
  "/images/ahava/variants/root-beer-float-card.webp": [1.76, -11.0, -7.3],
  "/images/ahava/variants/rose-card.webp": [1.21, -3.8, -10.3],
  "/images/ahava/variants/tutti-frutti-card.webp": [1.17, -0.0, -8.7],
  "/images/arca-ii/variants/caramel-stripe-card.webp": [1.32, -2.8, -3.7],
  "/images/arca-ii/variants/dark-tortoise-card.webp": [1.51, -3.1, -12.6],
  "/images/arca-ii/variants/dreamy-rose-card.webp": [1.21, -1.3, -6.7],
  "/images/arca-ii/variants/noir-card.webp": [1.46, -1.5, -8.1],
  "/images/arca-ii/variants/pixie-dust-card.webp": [1.76, -11.0, -29.3],
  "/images/arca-ii/variants/root-beer-float-card.webp": [1.24, -0.0, -6.9],
  "/images/arca-ii/variants/tutti-frutti-card.webp": [1.24, -2.6, -8.6],
  "/images/arca-ii/variants/velvet-rose-card.webp": [1.28, 6.7, -10.7],
  "/images/matriarca/variants/brown-card.webp": [1.28, -9.3, -7.1],
  "/images/matriarca/variants/midnight-noir-card.webp": [1.12, 4.7, -3.1],
  "/images/monarca/variants/caramel-stripe-card.webp": [1.41, -5.9, -3.9],
  "/images/monarca/variants/dark-tortoise-card.webp": [1.24, -2.6, -1.7],
  "/images/monarca/variants/dreamy-rose-card.webp": [1.24, -2.6, -3.5],
  "/images/monarca/variants/noir-card.webp": [1.36, -1.4, -1.9],
  "/images/monarca/variants/pixie-dust-card.webp": [1.28, -1.3, -3.6],
  "/images/monarca/variants/tutti-frutti-card.webp": [1.28, -1.3, -3.6],
  "/images/monarca/variants/velvet-rose-card.webp": [1.28, -1.3, -3.6],
  "/images/patriarca/variants/black-card.webp": [1.12, -0.0, -6.0],
  "/images/patriarca/variants/brown-card.webp": [1.12, -3.5, -3.1],
  "/images/patriarca/variants/midnight-noir-card.webp": [1.12, -6.0, -4.7],
};

/** Photographs not measured above get a gentle shared zoom. */
export const DEFAULT_FRAMING = [1.2, 0, 0] as const;

export function framingFor(src: string | null | undefined) {
  return (src && CARD_FRAMING[src]) || DEFAULT_FRAMING;
}
