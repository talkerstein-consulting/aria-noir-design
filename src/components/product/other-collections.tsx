"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CtaLink } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";
import { houses, type House } from "@/lib/navigation";
import { houseCard } from "@/lib/product-cards";

/**
 * The other five houses, at the foot of a story.
 *
 * ---- Why a story page needs this and did not have it ----
 *
 * The page ended at its counter, and a counter is a terminus: a reader who
 * has just read fourteen sections about ARCA I and decided it is not the
 * frame for them had exactly two ways on — the nav, or back. Six story
 * pages, no edge between any of them. This is that edge, and it is the
 * same one the buy page already has in `AlsoLike`.
 *
 * ---- Where the cards go ----
 *
 * `houseCard(other, "cross-sell")` — which routes through `cardHref`, so
 * a card here opens the other house's STORY. That is the rule for meeting
 * a house (the argument comes before the price) and it is exactly right at
 * this position: the reader is leaving one argument, so they are handed
 * the next one, not somebody else's till.
 *
 * It is the same card object the index, the eyewear grid and the
 * cross-sell rail draw, so a house that changes its photograph changes it
 * in all four places at once.
 *
 * ---- Why a rail and not the grid ----
 *
 * Five cards in a grid at the end of a page this long is a second index,
 * and it would out-weigh the counter directly above it. One row that runs
 * off the right edge reads as "there is more", which is the whole message,
 * and it costs one row of height instead of two.
 *
 * The chevrons are the `shop-nudge` pair from the shop's collection rail —
 * same square, same size, same 2.75rem target, and gone under 640px where
 * the rail is already swipeable and two buttons would be spending a
 * quarter of the bar on a gesture the thumb has. Real buttons with labels,
 * not `aria-hidden` decoration: on a horizontally scrolled region they do
 * something a keyboard cannot otherwise do.
 */
export function OtherCollections({ current }: { current: House }) {
  const others = houses.filter((h) => h.slug !== current.slug);
  const rail = useRef<HTMLUListElement>(null);

  const nudge = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    /* Two thirds of what is showing — the same step the shop's rail
       takes: enough to feel like a page, little enough that the card you
       were looking at is still on screen. */
    el.scrollBy({ left: dir * el.clientWidth * 0.66, behavior: "smooth" });
  };

  return (
    <section
      id="other-collections"
      /* `section`, not `section-pad`: the gutter is part of it. Without
         the inline padding the heading sat against the left edge of the
         window and the first card was cut by it — the rail is supposed to
         run off the RIGHT edge only, and it cannot say that if both sides
         bleed. */
      className="on-ink section relative bg-ink"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rail-head hairline flex flex-wrap items-end justify-between gap-6 pt-10">
          <h2 className="t-display-md">Other collections</h2>
          <div className="flex items-center gap-3">
            <div className="shop-nudge">
              <button
                type="button"
                onClick={() => nudge(-1)}
                aria-label="Scroll the collections left"
              >
                <ChevronLeft aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                aria-label="Scroll the collections right"
              >
                <ChevronRight aria-hidden />
              </button>
            </div>
            <CtaLink href="/eyewear" kind="secondary">
              Shop all
            </CtaLink>
          </div>
        </div>

        {/* `rail-row` carries the scroll, the snap and the right-edge
            mask. The cards keep their own width so the row shows four and
            a bit on a desktop and one and a half on a phone — a partial
            card at the edge is what tells a reader the row moves. */}
        <ul ref={rail} className="rail-row mt-10">
          {others.map((other) => (
            <li key={other.slug} className="rail-cell">
              <ProductCard {...houseCard(other, "cross-sell")} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
