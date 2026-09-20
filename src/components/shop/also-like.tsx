import { CtaLink } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";
import { houses, type House } from "@/lib/navigation";
import { houseCard } from "@/lib/product-cards";

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
        <CtaLink href="/eyewear" kind="secondary">
          Shop all
        </CtaLink>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {others.map((other) => (
          <li key={other.slug} className="flex">
            <ProductCard {...houseCard(other, "cross-sell")} />
          </li>
        ))}
      </ul>
    </div>
  );
}
