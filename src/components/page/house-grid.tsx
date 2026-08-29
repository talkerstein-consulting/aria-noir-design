import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  houses,
  colorwayCount,
  shopPath,
  type House,
} from "@/lib/navigation";
import { RevealPlate, RevealText } from "@/components/reveal";

/**
 * The six houses, as a grid.
 *
 * Two decisions here, both forced by what the house actually has:
 *
 * MONARCA has no photograph in the pool, so it renders as an
 * acetate swatch rather than being dropped or given a borrowed plate. Same
 * bargain ProductVariations struck on ARCA I — a complete row with an
 * honest gap reads as a house with six names; four plates and two holes
 * reads as a broken page.
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
function Card({ house, i }: { house: House; i: number }) {
  return (
    <>
      <RevealPlate
        delay={i * 70}
        className="relative aspect-[4/5] overflow-hidden bg-ink"
      >
        {house.plate ? (
          <Image
            src={house.plate}
            alt={`${house.name} — ${house.material}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-end p-6"
            style={{
              background: `linear-gradient(160deg, ${house.swatch} 0%, var(--ink) 82%)`,
            }}
          >
            <span className="t-micro">Photography in progress</span>
          </div>
        )}
      </RevealPlate>

      <div className="flex flex-col gap-2">
        {/* No price. These pages are the argument for a frame, and the
            catalogue is on Shopify — a "from $100" here would be the only
            number on a page with no cart behind it, which reads as a
            promise the page cannot keep. The count of cuts and colourways
            is the useful figure at index level. */}
        <RevealText as="h2" text={house.name} className="t-display-xs" />
        <p className="t-label">
          {house.index} — {house.material}
        </p>
        <p className="t-caption">
          {house.models === 1
            ? `One cut · ${colorwayCount(house)} colourways`
            : `${house.models} cuts · ${colorwayCount(house)} colourways`}
        </p>
        {/* The colourways by NAME, not just how many there are. A count is
            the one fact about a colourway range that tells a reader nothing
            — "six colourways" is true of every house on the page. Noir,
            Caramel Stripe and Pixie Dust are the actual product, and until
            each house has a page of its own this line is the only place on
            the site they appear. */}
        <p className="t-caption text-[var(--fg-quiet)]">
          {house.colorwayNames.join(" · ")}
        </p>
        <p className="t-body t-body--tight mt-2">{house.note}</p>
      </div>
    </>
  );
}

export function HouseGrid() {
  return (
    <section className="on-ink section relative z-[36] bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {houses.map((house, i) => {
          const card: ReactNode = <Card house={house} i={i} />;
          return (
            <Link
              key={house.slug}
              href={house.href ?? shopPath(house)}
              className="group flex flex-col gap-5"
            >
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
