import Image from "next/image";
import Link from "next/link";
import { houses, colorwayCount, shopPath } from "@/lib/navigation";
import { apparel } from "@/lib/apparel";
import { formatPrice, priceOf, SHOP_ALL_URL } from "@/lib/shop";
import { CtaLink } from "@/components/cta-link";

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
            <div key={house.slug} className="flex flex-col gap-4">
              <Link
                href={house.href ?? shopPath(house)}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
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
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(160deg, ${house.swatch ?? "#2a2a2a"} 0%, var(--ink) 82%)`,
                      }}
                    />
                  )}
                </div>
                <div>
                  <h2 className="t-display-xs">{house.name}</h2>
                  <p className="t-label mt-1">
                    {house.index} — {house.material}
                  </p>
                </div>
              </Link>

              {/* How deep the range goes and what it opens at — not the
                    colourways themselves. See the note at the top of this
                    file for why they are not listed here. */}
              <div className="hairline flex items-baseline justify-between gap-4 pt-3">
                <p className="t-caption">
                  {house.models === 1
                    ? `One cut · ${colorwayCount(house)} colourways`
                    : `${house.models} cuts · ${colorwayCount(house)} colourways`}
                </p>
                <p className="t-caption tabular-nums">from {priceOf(house)}</p>
              </div>
            </div>
          ))}

          {/* ---- the apparel ---- */}
          {apparel.map((line) => (
            <div key={line.slug} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  {line.colourways[0]?.image ? (
                    <Image
                      src={line.colourways[0].image}
                      alt={`${line.name} — ${line.material}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <h2 className="t-display-xs">{line.name}</h2>
                  <p className="t-label mt-1">07 — {line.material}</p>
                </div>
              </div>

              <div className="hairline flex items-baseline justify-between gap-4 pt-3">
                <p className="t-caption">
                  One cut · {line.colourways.length} colourways ·{" "}
                  {line.sizes.length} sizes
                </p>
                <p className="t-caption tabular-nums">
                  from {formatPrice(line.colourways[0]?.cents ?? 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <CtaLink href={SHOP_ALL_URL} external tone="quiet">
            Shop all
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
