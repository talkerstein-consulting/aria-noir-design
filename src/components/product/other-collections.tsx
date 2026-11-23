import { CollectionTiles, type CollectionTile } from "@/components/home/collection-tiles";
import { collectionItems } from "@/components/home/home-sections";
import { apparel } from "@/lib/apparel";
import type { House } from "@/lib/navigation";

/**
 * The knit, as the sixth tile.
 *
 * El Patrón is a collection of the house like any other and now has its own
 * story page (`/el-patron`), so a reader at the foot of a frame's story is
 * shown it alongside the frames rather than only ever the eyewear.
 *
 * Its picture is the CAMPAIGN RUN's cover, not a variant packshot: the rule
 * `lib/apparel` sets out, that every surface drawing this collection takes
 * the run. The dots carry the yarns and open that colourway at the counter;
 * they hold no photograph of their own, because the packshots are the one
 * thing on the site that looks like a marketplace listing.
 */
function sweaterTile(): CollectionTile[] {
  const line = apparel[0];
  if (!line) return [];
  return [
    {
      slug: line.slug,
      name: line.name,
      href: line.href ?? `/shop/${line.slug}`,
      image: line.run[0]?.src ?? "",
      colourways: line.colourways
        .filter((c) => c.listed !== false && c.available)
        .map((c) => ({ name: c.name, swatch: c.swatch, image: null })),
    },
  ];
}

/**
 * The other five houses, at the foot of a story.
 *
 * The page used to end at its counter, a terminus: a reader who decided
 * this house was not for them had only the nav or the back button. This is
 * the edge onward, the same one the buy page has in `AlsoLike`.
 *
 * The same collection tiles as the home page and the buy page's The
 * Collection, full bleed: a slider on a phone and tablet, all of them on
 * one row on a wide screen, each tile marking the colourway its cover shows.
 * A tile opens the other house's STORY where it has one, which is the rule
 * for meeting a house: the argument comes before the price.
 */
export function OtherCollections({
  current,
  tone = "ink",
}: {
  current: House;
  /** "paper" lays no ground and takes the InvertFade's white. */
  tone?: "ink" | "paper";
}) {
  return (
    <section id="other-collections" className={`section relative ${tone === "ink" ? "on-ink bg-ink" : "on-paper"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="hairline flex flex-wrap items-end justify-center gap-6 pt-10">
          <h2 className="t-display-lg text-center">Other Collections</h2>
        </div>
      </div>

      {/* Full bleed: the section's gutters given back. */}
      <div className="mt-10 -mx-[var(--gutter)] sm:-mx-[var(--gutter-wide)]">
        <CollectionTiles
          items={[
            ...collectionItems(current.slug),
            ...sweaterTile().filter((t) => t.slug !== current.slug),
          ]}
          row
        />
      </div>
    </section>
  );
}
