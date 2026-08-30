import Image from "next/image";
import Link from "next/link";
import { houses, colorwayCount, shopPath } from "@/lib/navigation";
import { apparel } from "@/lib/apparel";
import { CATALOGUE } from "@/lib/catalogue";
import {
  formatPrice,
  shopHref,
  swatchFor,
  SHOP_URL,
  SHOP_ALL_URL,
} from "@/lib/shop";
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
 * ---- Every colourway, not every collection ----
 *
 * The eyewear index already lists the six houses; a second list of the same
 * six would be a duplicate wearing a different heading. This goes one level
 * further down and names the PRODUCTS — each colourway, its price, and
 * whether the workshop currently has it — because that is the level at
 * which "all the products" is a true statement and the level nothing else
 * on the site shows.
 *
 * Stock and price come from `lib/catalogue`, which is synced from the live
 * storefront, so this page cannot quote a price the shop has moved off. The
 * apparel comes from `lib/apparel`, which exists because the sync script
 * reads eyewear collections only — see that file.
 */

/** A colourway's line: name, price, and the one fact that changes. */
function Row({
  name,
  price,
  available,
  href,
  swatch,
  external,
}: {
  name: string;
  price: string;
  available: boolean;
  href: string;
  swatch: string;
  external?: boolean;
}) {
  const body = (
    <>
      <span
        aria-hidden
        className="size-3 shrink-0 rounded-full"
        style={{ background: swatch }}
      />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {/* Struck rather than hidden. "We make this, not right now" is a
          different sentence from "we do not make this", and the catalogue
          is the one place that distinction is worth the ink. */}
      <span
        className={`tabular-nums ${available ? "" : "text-[var(--fg-quiet)] line-through"}`}
      >
        {price}
      </span>
    </>
  );

  const shape =
    "house-index-row flex items-center gap-4 py-3 text-[var(--fg-secondary)]";

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${shape} transition-colors hover:text-[var(--fg-primary)]`}
    >
      {body}
    </a>
  ) : (
    <Link
      href={href}
      className={`${shape} transition-colors hover:text-[var(--fg-primary)]`}
    >
      {body}
    </Link>
  );
}

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
            {totalCollections} collections, {totalProducts} pieces. Eyewear
            cut from block acetate, and one garment knitted in Peru.
          </p>
        </div>

        <div className="house-index grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => {
            const stock = CATALOGUE[house.slug] ?? [];
            return (
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

                {/* The products themselves. A house the storefront does not
                    carry falls back to the names it is cut in, so the list
                    is never empty for a house that exists. */}
                <div className="hairline pt-3">
                  {stock.length
                    ? stock.map((e) => (
                        <Row
                          key={e.colorway}
                          name={e.colorway}
                          price={formatPrice(e.cents)}
                          available={e.available}
                          href={shopHref(house, e.colorway)}
                          external
                          /* The acetate itself, from the same table the
                             colourway picker reads — not a photograph,
                             which at this size would be a grey dot. */
                          swatch={swatchFor(e.colorway)}
                        />
                      ))
                    : house.colorwayNames.map((n) => (
                        <p
                          key={n}
                          className="house-index-row py-3 text-[var(--fg-quiet)]"
                        >
                          {n}
                        </p>
                      ))}
                </div>
              </div>
            );
          })}

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

              <div className="hairline pt-3">
                {line.colourways.map((c) => (
                  <Row
                    key={c.name}
                    name={c.name}
                    price={formatPrice(c.cents)}
                    available={c.available}
                    href={`${SHOP_URL}/products/${c.handle}`}
                    external
                    swatch={c.swatch}
                  />
                ))}
                <p className="t-caption mt-4">
                  {line.sizes.join(" · ")}
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
