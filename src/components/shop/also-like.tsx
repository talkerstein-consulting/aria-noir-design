import { CtaLink } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";
import { houses, shopPath, type House } from "@/lib/navigation";
import { SHOP_ALL_URL, swatchFor } from "@/lib/shop";

/**
 * The rest of the catalogue, one card each, second photograph on hover.
 *
 * The card itself is `ProductCard` — the same object the house index, the
 * eyewear grid and the colourway wall render. This file decides only WHICH
 * houses appear and WHAT each card is allowed to say.
 *
 * ---- These link to another BUY page, not to the story ----
 *
 * They used to go to the house's story, and to `/eyewear` for the four
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
  const others = houses.filter((h) => h.slug !== current.slug);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
        <h2 className="t-display-md">You may also like</h2>
        <CtaLink href={SHOP_ALL_URL} external kind="secondary">
          Shop all
        </CtaLink>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {others.map((other) => (
          <li key={other.slug} className="flex">
            {/* The house's own card picture, not galleryFor: that returns
                the CHOSEN COLOURWAY's frames and nothing else, which is
                right for the column being scrolled and empty for a card
                with no colourway selected. The second picture is the
                house's editorial set, which is a fair thing to show on a
                card — it is not claiming to be any particular acetate.

                No price and no colourway count here: a cross-sell card
                carrying a second offer competes with the one being made
                above it, and this card's whole job is to be a picture
                worth following. */}
            <ProductCard
              href={shopPath(other)}
              image={other.plate}
              hoverImage={other.gallery?.[0]}
              swatch={other.swatch ?? swatchFor(other.colorwayNames[0])}
              name={other.name}
              sizes="(min-width: 1024px) 20vw, 45vw"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
