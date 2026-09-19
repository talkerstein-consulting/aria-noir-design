import { houses, colorwayCount, shopPath } from "@/lib/navigation";
import { ProductCard } from "@/components/product-card";

/**
 * The six houses, as a grid.
 *
 * The card is `ProductCard` — the same object the house index, the
 * cross-sell rail and the colourway wall render. This file decides only
 * which houses appear, what each card says, and where it goes.
 *
 * A house with no photograph in the pool renders as its acetate rather
 * than being dropped or given a borrowed plate: a complete row with an
 * honest gap reads as a house with six names, where four plates and two
 * holes reads as a broken page. Every house has been shot now, so nothing
 * currently takes that path — it stays because the seventh will land here
 * before its photography does.
 *
 * ---- Every card is a link, and where it goes depends on what exists ----
 *
 * A house with a STORY goes to the story: the buy page sits after the
 * argument, not beside it, and a card that jumped a reader straight to a
 * price would skip the only part of the site that explains the price.
 * ARCA I and ARCA II today.
 *
 * A house with no story yet goes to its BUY page. That is a change: those
 * four cards used to be plain divs, so four of the six frames the house
 * makes could not be reached from anywhere on the site — the page existed,
 * fully built, and nothing pointed at it. A dead end on the index is not
 * withholding the argument, it is withholding the product. The rule was
 * always "never skip the story", and there is no story to skip here.
 *
 * The day one of the four is written, adding its `href` moves that card
 * from the buy page to the story with no edit here.
 *
 * The index numerals are information, not ornament: they are the order the
 * houses were cut in, which is why the grid does not re-sort by price.
 */
export function HouseGrid() {
  return (
    <section className="on-ink section relative z-[36] bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {houses.map((house, i) => (
          <div key={house.slug} className="flex">
            {/* The object at rest, and the frame being WORN on hover where
                there is such a photograph. See `lifestyle` in lib/navigation.

                No price. These pages are the argument for a frame and the
                catalogue is on Shopify — a "from $100" here would be the
                only number on a page with no cart behind it. The count of
                cuts and colourways, and the colourways by NAME, are the
                useful figures at index level: "six colourways" is true of
                every house on the page, where Noir, Caramel Stripe and
                Pixie Dust are the actual product. */}
            <ProductCard
              href={house.href ?? shopPath(house)}
              image={house.plate}
              hoverImage={house.lifestyle}
              swatch={house.swatch}
              swatchNote="Photography in progress"
              name={house.name}
              as="h2"
              meta={`${house.index} · ${house.material}`}
              detail={
                house.models === 1
                  ? `One cut · ${colorwayCount(house)} colourways`
                  : `${house.models} cuts · ${colorwayCount(house)} colourways`
              }
              note={house.note}
              reveal
              revealDelay={i * 70}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
