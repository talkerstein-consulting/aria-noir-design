import { houses } from "@/lib/navigation";
import { ProductCard } from "@/components/product-card";
import { houseCard } from "@/lib/product-cards";

/**
 * The six houses, as a grid.
 *
 * The card is `ProductCard` — the same object the house index, the
 * cross-sell rail and the colourway wall render — filled by
 * `houseCard(house, "grid")` in lib/product-cards, which is where each
 * product's facts are written. This file decides only which houses appear
 * and how the grid is laid out.
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
            {/* What the card SAYS is `houseCard(house, "grid")` — the
                worn photograph on hover, the house's note, and no price.
                See lib/product-cards for why this grid carries no number.
                The stagger stays here: it depends on where the card sits
                in this list, which is the one thing only this file knows. */}
            <ProductCard {...houseCard(house, "grid")} reveal revealDelay={i * 70} />
          </div>
        ))}
      </div>
    </section>
  );
}
