import { houses, colorwayCount, shopPath } from "@/lib/navigation";
import { apparel } from "@/lib/apparel";
import { formatPrice, priceOf } from "@/lib/shop";
import { CtaLink } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";

/**
 * Everything the house makes, at the top of the house's own page.
 *
 * ---- Why a page about the house opens with an inventory ----
 *
 * `/house/about` opened on a title plate — a photograph of the founders and
 * a line about symmetry and soul — and then argued, at length and well, for
 * a house whose actual output the reader had to go somewhere else to see.
 * The argument is still below. What is above it now is the answer to the
 * question the argument raises: what, exactly, does this house make?
 *
 * Seven collections and thirty-six products — counted from the catalogue at
 * render rather than written down here, so the sentence in the lede cannot
 * drift from the list under it. Small enough to simply SHOW. A house this size does not need a filtered
 * grid, and one would be furniture around a list that fits on a page.
 *
 * ---- Collections, not variants ----
 *
 * Every colourway was listed here — named, priced, linked, thirty-six rows
 * of them — and it is deliberately not any more. At this level the reader
 * is deciding WHICH THING, and a wall of Caramel Stripe and Pixie Dust is
 * an answer to a question they have not asked yet. Each card carries the
 * two facts that help them choose instead: how deep the range goes, and
 * what it opens at. The colourways are named on the eyewear grid and shown
 * as acetate on each buy page, which are the two places someone browsing
 * them is actually standing.
 *
 * This is still not the eyewear index. That page lists the six houses; this
 * one lists everything the house makes, apparel included — which is the
 * part that was missing, since the garment appeared nowhere on the site at
 * all.
 *
 * Opening prices come from `lib/catalogue`, synced from the live
 * storefront, so this page cannot quote a price the shop has moved off. The
 * apparel comes from `lib/apparel`, which exists because the sync script
 * reads eyewear collections only — see that file.
 */

export function HouseIndex() {
  const totalProducts =
    houses.reduce((n, h) => n + colorwayCount(h), 0) +
    apparel.reduce((n, a) => n + a.colourways.length, 0);
  const totalCollections = houses.length + apparel.length;

  return (
    <section className="on-ink section relative bg-ink pt-32 sm:pt-40">
      <div className="mx-auto max-w-7xl">
        <div className="stack stack--sm mb-16">
          <p className="t-eyebrow">The House</p>
          {/* This page's h1. The argument below opens with its own heading,
              which is a h2 — a page has one h1 and this is the top of the
              page now. */}
          <h1 className="t-display-lg">Everything we make.</h1>
          <p className="t-body t-body--lede mt-2 max-w-2xl">
            {totalCollections} collections, {totalProducts} pieces. Eyewear cut
            from block acetate, and one garment knitted in Peru.
          </p>
        </div>

        <div className="house-index grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => (
            <div key={house.slug} className="flex">
              {/* How deep the range goes and what it opens at — not the
                  colourways themselves. See the note at the top of this
                  file for why they are not listed here. */}
              <ProductCard
                href={house.href ?? shopPath(house)}
                image={house.plate}
                swatch={house.swatch}
                name={house.name}
                as="h2"
                meta={`${house.index} — ${house.material}`}
                detail={
                  house.models === 1
                    ? `One cut · ${colorwayCount(house)} colourways`
                    : `${house.models} cuts · ${colorwayCount(house)} colourways`
                }
                price={`from ${priceOf(house)}`}
              />
            </div>
          ))}

          {/* ---- the apparel ----
              No page of its own yet, so the card carries no link. It keeps
              the shape of the six beside it regardless. */}
          {apparel.map((line) => (
            <div key={line.slug} className="flex">
              <ProductCard
                image={line.colourways[0]?.image}
                name={line.name}
                as="h2"
                meta={`07 — ${line.material}`}
                detail={`One cut · ${line.colourways.length} colourways · ${line.sizes.length} sizes`}
                price={`from ${formatPrice(line.colourways[0]?.cents ?? 0)}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-16">
          <CtaLink href="/eyewear">
            Shop all
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
