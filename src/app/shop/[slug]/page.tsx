import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CtaLink } from "@/components/cta-link";
import { RevealPlate, RevealText } from "@/components/reveal";
import { SpecRows } from "@/components/product/spec-rows";
import { ColourwayPicker } from "@/components/shop/colourway-picker";
import { houses, colorwayCount } from "@/lib/navigation";
import { SHOP_ALL_URL, houseBySlug, priceOf, swatchFor } from "@/lib/shop";

/**
 * The buy page. One template, six houses, no per-house implementation.
 *
 * ---- Why this is a different page from /arca-i ----
 *
 * ARCA I and ARCA II already have pages, and they are long editorial
 * arguments: a campaign film, the shoot, what the name means, fourteen
 * sections of it. They are excellent and they are not where you buy
 * anything — the "acquire" CTA on those pages scrolls to a closing block
 * that scrolls to itself.
 *
 * The two jobs want opposite pages. A story page withholds; a buy page
 * answers. This one is the whole transaction above the fold — plate,
 * price, colourway, buy — and everything below it is the detail a person
 * checks before spending money, in the order they check it: what it is
 * made of, what it measures, what happens if it does not fit.
 *
 * ---- The funnel is index → STORY → buy ----
 *
 * This page is downstream of the argument, never a shortcut past it.
 * Nothing on the index, the home page or the footer links here; the two
 * story pages do, from the three CTAs that used to scroll to themselves.
 *
 * The other four houses have a buy page — the template covers all six —
 * and nothing points at it. That is deliberate rather than unfinished:
 * they become reachable the day their story is written, because a price
 * with no argument in front of it is the one thing this site does not do.
 *
 * ---- Templated means templated ----
 *
 * Everything here is read from `houses` and `lib/shop`. Adding the seventh
 * house is a row in the catalogue: the route, the metadata, the swatches,
 * the sitemap and the static params all follow. There is no `arca-i` in
 * this file, and there should never be one.
 */

export function generateStaticParams() {
  return houses.map((house) => ({ slug: house.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const house = houseBySlug(slug);
  if (!house) return {};
  return {
    title: `${house.name} — Aria Noir`,
    description: `${house.note} ${colorwayCount(house)} colourways, from ${priceOf(house)}.`,
  };
}

export default async function ShopHousePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const house = houseBySlug(slug);
  if (!house) notFound();

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        {/* ---- the whole transaction, above the fold ---- */}
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <RevealPlate className="relative aspect-[4/5] overflow-hidden bg-ink lg:sticky lg:top-28">
              {house.plate ? (
                <Image
                  src={house.plate}
                  alt={`${house.name} — ${house.material}`}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  priority
                  className="object-cover"
                />
              ) : (
                /* No photograph yet. The house's own acetate rather than a
                   borrowed plate — the same bargain the index grid strikes,
                   and the more important one here, where the picture is
                   what someone is deciding on. */
                <div
                  className="flex h-full w-full items-end p-6"
                  style={{
                    background: `linear-gradient(160deg, ${house.swatch ?? swatchFor(house.colorwayNames[0])} 0%, var(--ink) 82%)`,
                  }}
                >
                  <span className="t-micro">Photography in progress</span>
                </div>
              )}
            </RevealPlate>

            <div className="stack">
              <p className="t-eyebrow">
                {house.index} — {house.material}
              </p>
              <RevealText
                as="h1"
                text={house.name}
                className="t-display-lg"
              />
              <p className="t-body t-body--lede mt-2">{house.note}</p>

              <div className="mt-10">
                <ColourwayPicker house={house} />
              </div>

              {/* The way back out to everything else. A product page whose
                  only exits are five more pairs of glasses is a smaller
                  shop than the one that exists. */}
              <div className="hairline mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 pt-8">
                <CtaLink href={SHOP_ALL_URL} external tone="quiet">
                  Shop all
                </CtaLink>
                <CtaLink href="/eyewear" tone="quiet">
                  All six houses
                </CtaLink>
                {house.href ? (
                  <CtaLink href={house.href} tone="quiet">
                    {`Read the ${house.name} story`}
                  </CtaLink>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ---- the detail, in the order it is checked ---- */}
        <section className="on-ink section bg-ink pt-0">
          <div className="mx-auto max-w-3xl">
            <SpecRows
              rows={[
                {
                  term: "The cut",
                  summary:
                    house.models === 1
                      ? "One shape, held in every colourway the house makes."
                      : `${house.models} distinct shapes, each in its own colourway.`,
                  detail: house.note,
                },
                {
                  term: "The material",
                  summary: house.material,
                  detail:
                    "Milled from a solid block rather than poured into a mould, which is why the pattern runs through the frame instead of across its surface and why a cut edge holds colour where a moulded one shows a seam.",
                },
                {
                  term: "The colourways",
                  summary: `${colorwayCount(house)} — ${house.colorwayNames.join(", ")}.`,
                  detail:
                    "A colourway is the acetate, not a different frame: the cut, the measurements and the price are the same across the run.",
                },
                {
                  term: "Fit",
                  summary:
                    "Decided at the bridge and the brow, and adjustable at five points.",
                  detail:
                    "A frame that sits wrong is usually minutes at a bench rather than a return. The fit guide covers what each contact point tells you.",
                },
                {
                  term: "Returns and warranty",
                  summary:
                    "Thirty days unworn. Two years on the hinge and the front.",
                  detail:
                    "Most warranty claims are a hinge seat, which is a repair rather than a replacement — send a photograph before returning anything.",
                },
              ]}
            />

            <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4">
              <CtaLink href="/care">Read the fit guide</CtaLink>
              <CtaLink href="/contact" tone="quiet">
                Talk to the studio
              </CtaLink>
            </div>
          </div>
        </section>

        {/* ---- the rest of the catalogue ---- */}
        <section className="on-ink section bg-ink pt-0">
          <div className="mx-auto max-w-7xl">
            <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
              <h2 className="t-display-xs">The other houses</h2>
              <CtaLink href={SHOP_ALL_URL} external tone="quiet">
                Shop all
              </CtaLink>
            </div>

            {/* Each of these goes to the other house's STORY, not its buy
                page. The reader has been argued to about THIS frame; they
                have not been argued to about that one, and dropping them on
                its price is the cross-sell skipping the only part that
                justifies it. Houses with no story yet go to the index. */}
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {houses
                .filter((h) => h.slug !== house.slug)
                .map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={other.href ?? "/eyewear"}
                      className="group flex flex-col gap-3"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                        {other.plate ? (
                          <Image
                            src={other.plate}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 20vw, 45vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className="h-full w-full"
                            style={{
                              background: `linear-gradient(160deg, ${other.swatch ?? swatchFor(other.colorwayNames[0])} 0%, var(--ink) 82%)`,
                            }}
                          />
                        )}
                      </div>
                      <p className="t-label text-[var(--fg-primary)]">
                        {other.name}
                      </p>
                      <p className="t-caption">
                        {priceOf(other)} · {colorwayCount(other)} colourways
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
