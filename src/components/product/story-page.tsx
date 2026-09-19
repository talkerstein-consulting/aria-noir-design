import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ProductHero } from "@/components/product/product-hero";
import { ProductOpening } from "@/components/product/product-opening";
import { ProductPalette } from "@/components/product/product-palette";
import { ProductAriaNoir } from "@/components/product/product-aria-noir";
import { ProductShoot } from "@/components/product/product-shoot";
import { ProductMeaning } from "@/components/product/product-meaning";
import { ProductBand } from "@/components/product/product-band";
import {
  ProductApproach,
  type Approach,
} from "@/components/product/product-approach";
import { ProductOffering } from "@/components/product/product-offering";
import { ProductSpec } from "@/components/product/product-spec";
import { ProductWorn } from "@/components/product/product-worn";
import { ProductBuy } from "@/components/product/product-buy";
import { ProductClose } from "@/components/product/product-close";
import type {
  AriaNoir,
  Close,
  Detail,
  Hero,
  Meaning,
  Offering,
  Opening,
  Shoot,
  PaletteColour,
  Spec,
  Worn,
} from "@/lib/product";
import { houseBySlug, swatchFor } from "@/lib/shop";

/**
 * The story page, as a page.
 *
 * ARCA I and ARCA II were two files running the same fifteen sections in
 * the same order off two data modules of the same shape, which meant every
 * change to the shape of a story had to be made twice and, twice, could be
 * made differently. The order, the palette's condition, the footer's tone
 * and the closing counter all live here now; a house is a copy deck and a
 * plate folder, and its page is its slug.
 *
 * ---- One continuous scroll ----
 *
 * Nothing on this page sits on top of anything else. Three mechanisms are
 * gone and should not come back without a reason better than the effect:
 *
 *   the pinned "Arca" definition, which held one viewport while later
 *   sections rode over it, and the wrapper that leashed it;
 *
 *   the z-index stack from 35 to 38 that every section carried so it would
 *   pass over that pinned plate rather than behind it;
 *
 *   the WhiteDotOverlay, a fixed circle that expanded over the gallery to
 *   turn the page white, which is why the closing block used to have no
 *   background of its own.
 *
 * What is left is ordinary document flow: each section arrives, is read,
 * and leaves.
 */
export type Story = {
  hero: Hero;
  /**
   * The acetates the palette band paints, where the catalogue is not the
   * place to read them from.
   *
   * Left out by every frame house: the band is built from that house's own
   * `colorwayNames`, so a colour is declared once, in lib/navigation, and
   * the strip under the opening cannot disagree with the picker at the
   * foot of the page. ALPACA sets it, because a sweater's colours live in
   * lib/apparel and it has no catalogue row at all.
   */
  palette?: readonly PaletteColour[];
  structure: Opening;
  ariaNoir: AriaNoir;
  shoot: Shoot;
  meaning: Meaning;
  detail: Detail;
  approach: Approach;
  offering: Offering;
  spec: Spec;
  worn: Worn;
  close: Close;
};

export function StoryPage({
  story,
  slug,
  buyHref: sellsAt,
}: {
  story: Story;
  slug: string;
  /**
   * Where the offers go, for a story whose subject this site does not sell.
   *
   * Every frame house leaves it out and lands on `/shop/<slug>`, the only
   * surface that can take an order. ALPACA points it at the storefront,
   * because the knitwear is sold there and nowhere here, and a CTA aimed
   * at a route that 404s is worse than no page at all.
   */
  buyHref?: string;
}) {
  /** Every offer on the page lands on the buy page, which is the only
   *  surface that can actually take an order. */
  const buyHref = sellsAt ?? `/shop/${slug}`;
  /** The catalogue row the closing counter sells. Read at build time from
   *  the same table the buy page reads, so the price, the colourways and
   *  what is in the workshop cannot drift between the two surfaces.
   *
   *  Undefined for a story whose subject the eyewear catalogue does not
   *  carry — ALPACA is knitwear, sold on the storefront and not through
   *  this site's bag. The page then closes on a link rather than on a
   *  counter; see the foot of this component. */
  const house = houseBySlug(slug);

  /**
   * The house's run of acetate, for the band under the opening.
   *
   * Built here rather than written into each copy deck, because the names
   * are already in the catalogue and the hexes are already in SWATCHES. A
   * deck that restated them would be a second list of the house's colours,
   * free to fall out of step with the picker selling them.
   */
  const palette: readonly PaletteColour[] =
    story.palette ??
    (house?.colorwayNames.map((name) => ({
      name,
      swatch: swatchFor(name),
    })) ??
      []);

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <ProductHero hero={story.hero} />
        <ProductOpening structure={story.structure} />
        {/* The colour scheme, straight off the back of the opening's body:
            the room has just been described, and this is the run of
            acetate it was built to hold. An accent band, not a section —
            see ProductPalette. It is the CATALOGUE's list, which is also
            what the turntable's squares and the buy page's picker are
            named from, so the house has one set of colours.

            It used to be drawn only where the offering carried
            `colorways`, which is a turntable feature: four houses have a
            single glb between their whole run, so four houses painted no
            palette despite every colour being known. One acetate is still
            not a run, so a house with one shows nothing. */}
        {palette.length > 1 ? <ProductPalette colorways={palette} /> : null}
        <ProductAriaNoir ariaNoir={story.ariaNoir} />
        <ProductShoot shoot={story.shoot} />
        {/* One continuous run from here to the registry. There was a
            wrapper around the next four sections once, holding the "Arca"
            definition pinned while they rode over the top of it. Nothing
            pins now, so there is nothing to hold: the definition is read,
            then the band, then the object, then the numbers.

            The order is the argument. The band makes a claim about the
            material; the approach walks in on it, film to face; the
            turntable is the object that claim is about, and the reader can
            turn it and change its acetate; the specification answers it
            with numbers. Argument, approach, thing, evidence. */}
        <ProductMeaning meaning={story.meaning} />
        <ProductBand detail={story.detail} />
        <ProductApproach approach={story.approach} />
        <ProductOffering offering={story.offering} buyHref={buyHref} />
        <ProductSpec spec={story.spec} />
        {/* "The Variations" is GONE, and its component with it. Eight (or
            four) full-screen panels was one shape shown over and over with
            a screen of scroll between each, and no way to compare any two
            of them. The colours now live in two better places: as a flat
            material band under the opening (ProductPalette), and as
            squares ON the turntable in the offering, where changing one
            changes the object the reader is already holding and the offer
            under it. */}
        {/* No References band on any house. It printed a list of names
            under the gallery, which is the house citing its own sources.
            COPY.md is explicit that the knowledge shows up as instinct and
            restraint, never as a footnote. The names still inform the
            pictures. They just do not sign them. */}
        <ProductWorn worn={story.worn} buyHref={buyHref} />
        {/* The page ends at a counter rather than at a fourth link to
            one. See ProductBuy for what it is and is not.

            Unless there is nothing here to take an order with. The counter
            is the bag, the picker and the price, all three read off the
            eyewear catalogue; a story about something the catalogue does
            not carry gets the closing block instead, which makes the offer
            and hands the reader to the storefront. That is the honest
            shape of "you cannot buy this here", and it is one branch
            rather than a second template. */}
        {house ? (
          <ProductBuy close={story.close} house={house} buyHref={buyHref} />
        ) : (
          <ProductClose close={story.close} buyHref={buyHref} />
        )}
      </main>
      {/* The counter is laid on ink, so the footer carries on in ink
          rather than dropping the page back to paper under it. The closing
          block turns the page to paper, so the footer follows it there. */}
      <SiteFooter tone={house ? "ink" : "paper"} />
    </>
  );
}
