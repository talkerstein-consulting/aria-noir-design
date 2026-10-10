import { CtaLink } from "@/components/cta-link";
import { CollectionTiles } from "@/components/home/collection-tiles";
import { collectionItems } from "@/components/home/home-sections";
import type { House } from "@/lib/navigation";

/**
 * The rest of the catalogue, one card each, second photograph on hover.
 *
 * The card itself is `ProductCard`, filled by
 * `houseCard(other, "cross-sell")` — the same object and the same facts
 * the house index, the eyewear grid and the colourway wall render. This
 * file decides only WHICH houses appear; what a cross-sell card is allowed
 * to say is the variant, in lib/product-cards.
 *
 * ---- These link to another BUY page, not to the story ----
 *
 * They used to go to the house's story, and to `/collections` for the four
 * houses that have none — so a reader comparing frames on a shop page was
 * put back on the index by four of the five cards, having asked to see a
 * frame and been shown the shelf.
 *
 * The argument-before-price rule still stands; this is just not where it
 * applies. It governs the way IN to the shop — the index sends a reader to
 * the story where one exists — and by the time these cards are on screen
 * the reader is already inside, has already been argued to, and is
 * shopping. Sideways from a buy page is another buy page. The story is
 * still one link away from each of them.
 */
export function AlsoLike({ current }: { current: House }) {
  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
          <h2 className="t-display-lg">The Collection</h2>
          <CtaLink href="/collections" kind="secondary">
            Shop all
          </CtaLink>
        </div>
      </div>

      {/* The home page's collection tiles, less the house on this page, on
          the run's grid: full bleed, the section's gutters given back. */}
      <div className="mt-10 -mx-[var(--gutter)] sm:-mx-[var(--gutter-wide)]">
        <CollectionTiles items={collectionItems(current.slug)} single />
      </div>
    </>
  );
}