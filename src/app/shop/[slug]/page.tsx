import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { BuyHero } from "@/components/shop/buy-hero";
import { BuyDetail, type DetailTab } from "@/components/shop/buy-detail";
import { AlsoLike } from "@/components/shop/also-like";
import { colorwayCount, houses, type House } from "@/lib/navigation";
import { houseBySlug, priceOf } from "@/lib/shop";
import { shipping } from "@/lib/policies";

/**
 * ============================================================
 *  THE MASTER TEMPLATE FOR PRODUCT SHOP PAGES.
 *  Every frame the house sells is this file. Do not fork it.
 * ============================================================
 *
 * The buy page. One template, six houses, no per-house implementation.
 *
 * ---- What "master template" means in practice ----
 *
 * There is exactly one product page in this application and it lives here.
 * A new frame is not a new route, a new component or a copy of this file
 * with the names changed — it is a ROW in `houses` (lib/navigation), a row
 * in `CATALOGUE` (lib/catalogue, generated), and its photographs under
 * `public/images/<slug>/`. The route, the metadata, the static params, the
 * sitemap and the eyewear index all follow from that row on their own.
 *
 * So the way to add the seventh house is:
 *
 *   1. add its row to `houses`, with `slug`, `colorwayNames` and `from`;
 *   2. re-run `scripts/sync-catalogue.mjs`, which reads the live storefront
 *      and writes the prices, handles, variant ids and stock;
 *   3. re-run `scripts/import-colourway-photography.mjs`, which brings the
 *      shop's per-colourway photography into `public/` at web weight and
 *      prints the `colorwayPlates` / `colorwayGallery` wiring to paste back;
 *   4. add `heroColorway` — the acetate the page opens turning.
 *
 * Nothing in this file, in BuyHero, in BuyDetail or in AlsoLike needs to be
 * touched by any of that. If a house ever seems to need a change HERE, the
 * change belongs in the catalogue or in the template's own behaviour for
 * every house — never in a branch on a slug. There is no `arca-i` in this
 * file, and there should never be one.
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
 * answers. This one is the whole transaction beside a column of
 * photographs, then the four things a person checks before spending money,
 * then the rest of the catalogue.
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
 * Everything here is read from `houses` and `lib/shop`. The four houses
 * with no story page still have a full buy page, complete with their own
 * colourway shoot — and nothing links to them. That is deliberate rather
 * than unfinished: they become reachable the day their story is written,
 * because a price with no argument in front of it is the one thing this
 * site does not do.
 */

/* No slug outside the list below is renderable, so a held-back house is a
   real 404 rather than a soft one rendered at request time. */
export const dynamicParams = false;

/**
 * A buy page per house ON SHOW.
 *
 * `houses` is the catalogue filtered by what is currently published (see
 * VISIBLE_SLUGS in lib/navigation), so the held-back houses get no buy
 * page — the template still covers them, and the day they are shown their
 * page is built with nothing here to change.
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

/**
 * The four panels, built from the catalogue and from the house's own
 * policies rather than written again here.
 *
 * Shipping is READ from lib/policies — the same document the /policies
 * route renders — so the times quoted on the buy page cannot drift from
 * the times quoted on the policy. Packaging is the returns policy read
 * forwards: it already specifies what a frame arrives in, by specifying
 * what it has to go back in.
 */
function tabsFor(house: House): readonly DetailTab[] {
  return [
    {
      id: "description",
      label: "Description",
      paragraphs: [
        house.note,
        "Milled from a solid block rather than poured into a mould, which is why the pattern runs through the frame instead of across its surface and why a cut edge holds colour where a moulded one shows a seam.",
      ],
    },
    {
      id: "details",
      label: "Details",
      paragraphs: [
        house.models === 1
          ? `One shape, held in every colourway the house makes — ${house.colorwayNames.join(", ")}.`
          : `${house.models} distinct shapes, each in its own colourway — ${house.colorwayNames.join(", ")}.`,
        `${house.material}. A colourway is the acetate, not a different frame: the cut and the measurements are the same across the run, though the price is not — each colour is priced on its own.`,
        "Fit is decided at the bridge and the brow, and adjustable at five points. A frame that sits wrong is usually minutes at a bench rather than a return.",
      ],
    },
    {
      id: "packaging",
      label: "Packaging",
      paragraphs: [
        "Each piece is handcrafted and packed with intention: the frame in its protective case, with a pouch, and the accessories and tags alongside it.",
        "Keep the case and the pouch. A return has to come back in them, and the case is also the answer to the most common warranty claim — frames stored loose are frames that come back with a hinge complaint.",
        "Clean the lenses with the microfiber cloth only, and with approved solutions.",
      ],
    },
    {
      id: "shipping",
      label: "Shipping",
      /* Flattened from the shipping policy's own sections, so this reads
         as the policy rather than as a summary of it that will age. A
         policy body may hold a nested array, which the policy page renders
         as a list; here each entry becomes its own line, since a tab panel
         has no list to put it in. */
      paragraphs: shipping.sections.flatMap((section) =>
        section.body.flatMap((entry) =>
          typeof entry === "string" ? [entry] : [...entry],
        ),
      ),
    },
  ];
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
      <main className="buy-page relative">
        {/* ---- the transaction: photographs left, offer sticky right ---- */}
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <BuyHero house={house} />
        </section>

        {/* ---- the detail, beside the film ---- */}
        <section className="on-ink section bg-ink">
          <BuyDetail
            tabs={tabsFor(house)}
            video={house.video}
            poster={house.videoPoster}
            image={house.ground ?? house.plate}
            alt={`${house.name}, ${house.material}`}
          />
        </section>

        {/* ---- the rest of the catalogue ---- */}
        <section className="on-ink section bg-ink">
          <AlsoLike current={house} />
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
