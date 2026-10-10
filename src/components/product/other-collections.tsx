import { CollectionTiles } from "@/components/home/collection-tiles";
import { collectionItems } from "@/components/home/home-sections";
import type { House } from "@/lib/navigation";

/**
 * The other five houses, at the foot of a story.
 *
 * The page used to end at its counter, a terminus: a reader who decided
 * this house was not for them had only the nav or the back button. This is
 * the edge onward, the same one the buy page has in `AlsoLike`.
 *
 * The same collection tiles as the home page and the buy page's The
 * Collection, on the same grid: full bleed, one column on a phone, four
 * across on a wide screen, each tile marking the colourway its cover shows.
 * A tile opens the other house's STORY where it has one, which is the rule
 * for meeting a house: the argument comes before the price.
 */
export function OtherCollections({ current }: { current: House }) {
  return (
    <section id="other-collections" className="on-ink section relative bg-ink">
      <div className="mx-auto max-w-7xl">
        <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
          <h2 className="t-display-lg">Other Collections</h2>
        </div>
      </div>

      {/* Full bleed: the section's gutters given back. */}
      <div className="mt-10 -mx-[var(--gutter)] sm:-mx-[var(--gutter-wide)]">
        <CollectionTiles items={collectionItems(current.slug)} single />
      </div>
    </section>
  );
}
