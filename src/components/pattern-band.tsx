/**
 * The breaker: the house pattern between chapters.
 *
 * The reference is Jacques Marie Mage, which closes one block and opens the
 * next with a narrow ornamental strip. Ours is the emblem from the logo
 * (the ARCA bridge plaque: doorway, fan, hatched corners, crossed panels),
 * traced monoline and repeated across the content column at 12px, 30%.
 * Drawn by `.breaker` in styles/house.css; the rules are in
 * docs/style-guide.html under Pattern.
 *
 * It sits inside the column, gutter to gutter, never full bleed.
 */
export function Breaker({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`mx-auto max-w-7xl px-6 py-6 sm:px-10 ${className}`}>
      <div className="breaker" />
    </div>
  );
}

/** The old name, kept so existing imports keep working. */
export const PatternBand = Breaker;
