import { ProductCard } from "@/components/product-card";
import type { House } from "@/lib/navigation";
import { colourwayCard } from "@/lib/product-cards";
import { sillFor, stockFor } from "@/lib/shop";

/**
 * The run, one card per acetate.
 *
 * ---- Why a wall of colourways under a page that already has a picker ----
 *
 * The picker is a CONTROL: it changes the offer above it, and a reader
 * using it is already deciding how to spend money. This is a CATALOGUE —
 * the seven frames side by side, each priced, each its own product on the
 * storefront, which is what they actually are. MONARCA's Velvet Rose is
 * $247.50 against $150 for the rest of its run; a swatch row cannot say
 * that and a reader comparing the run should not have to click seven times
 * to find it out.
 *
 * ---- One photograph per card, and only that one ----
 *
 * The picture is the colourway shoot and nothing else: one composition
 * held across the whole run, the same sill in the same light, colour by
 * colour. That is the entire argument for showing them as a grid — the
 * only thing that changes from card to card is the acetate, which is the
 * only thing the reader is choosing between here.
 *
 * So there is no fallback to the house plate, no second photograph on
 * hover, and no numbered storefront still mixed in. A colourway with no
 * frame in that shoot shows its acetate rather than a sibling's
 * photograph, for the same reason `galleryFor` refuses to: a picture of
 * another colour is not a bonus picture, it is the wrong one.
 *
 * A house that has not been shot this way renders nothing at all.
 */
export function ColourwayCards({ house }: { house: House }) {
  /* The STORE's list, in the store's order — the same source the picker
     reads. A colourway the storefront has never heard of is not an offer. */
  const stock = stockFor(house);
  if (!stock.some(({ colorway }) => sillFor(house, colorway))) return null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
        <h2 className="t-display-md">The run</h2>
        <p className="t-caption">
          {house.material} · one cut, {stock.length} colourways
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {stock.map(({ colorway }) => (
          <li key={colorway} className="flex">
            {/* What each acetate's card says — its own name, its own price,
                its own photograph — is `colourwayCard` in
                lib/product-cards, beside every other product's. */}
            <ProductCard {...colourwayCard(house, colorway)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
