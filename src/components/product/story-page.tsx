import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ProductHero } from "@/components/product/product-hero";
import { ProductOpening } from "@/components/product/product-opening";
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
import { StoryHandoff } from "@/components/product/story-handoff";
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
import { houseBySlug, priceOf } from "@/lib/shop";
import { StoryIndex } from "@/components/product/story-index";
import {
  ProductLookbook,
  type Lookbook,
} from "@/components/product/product-lookbook";

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
  /** Optional: ARCA I runs without it. */
  ariaNoir?: AriaNoir;
  shoot: Shoot;
  meaning: Meaning;
  detail: Detail;
  approach: Approach;
  offering: Offering;
  spec: Spec;
  worn: Worn;
  close: Close;
  /**
   * Set, and the page runs the lookbook's simple layout instead of the
   * full story: hero film, the lookbook's words and plates, then the
   * counter. See ProductLookbook.
   */
  lookbook?: Lookbook;
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

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <StoryIndex
        chapters={[
          { id: "story", label: "Story" },
          { id: "approach-film", label: "Approach" },
          { id: "offering", label: "The Object" },
          { id: "specification", label: "Specification" },
          /* "Faces of ARCA I", not "Worn" (Rems, 24 Nov). The section is
             the people the cut was shot on; "Worn" names the state of an
             object instead, and it reads as a condition. The house name
             comes from the catalogue, so a chapter cannot be labelled for
             a house the page is not about. */
          { id: "worn", label: house ? `Faces of ${house.name}` : "Faces" },
          { id: "acquire", label: house ? "Acquire" : "The Offer" },
        ]}
        name={house?.name}
        price={house ? priceOf(house) : undefined}
        buyHref={buyHref}
      />
      <main id="main" tabIndex={-1} className="relative">
        <ProductHero hero={story.hero} />
        {story.lookbook ? (
          <ProductLookbook lookbook={story.lookbook} />
        ) : (
          <>
        <ProductOpening structure={story.structure} buyHref={buyHref} buyLabel={house?.name} />
        {/* The acetate band that used to sit here is gone, with the
            turntable's swatches. A story page argues for the cut; the
            colours are the buy page's question, and asking it twice let a
            reader answer in a place that could not remember. */}
        {story.ariaNoir ? (
          <ProductAriaNoir ariaNoir={story.ariaNoir} buyHref={buyHref} buyLabel={house?.name} />
        ) : null}
        <ProductShoot shoot={story.shoot} buyHref={buyHref} buyLabel={house?.name} />
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
          </>
        )}
        {/* ---- The story ends at the faces, and the next scroll is the
             buy page ----

            There was a counter here: a copy of the buy page's hero —
            plate, panel, picker, price — drawn on the story page from the
            buy page's own stylesheet, revealed through a circle of ink
            (InvertFade) and walked into the real thing by StoryHandoff,
            with the other houses and the footer behind it.

            It is gone, and the whole apparatus with it. A story page that
            ends by rebuilding the buy page is selling the same screen
            twice, and every change to the offer had to be made in two
            places that were free to disagree. The offer lives on the PDP
            now and only there.

            So the last thing read is the faces the cut was shot on, and
            the scroll that would have gone past it goes to /shop/<slug>
            instead. Nothing follows: no other-houses rail, no footer. A
            document that ends where the next one begins has nothing to
            scroll through, which is the whole point — see StoryHandoff.

            Unless there is nothing here to take an order with. A story
            about something the eyewear catalogue does not carry (ALPACA,
            which is knitwear) has no buy page to hand to, so it still
            closes on the closing block and its own footer. That is the
            honest shape of "you cannot buy this here". */}
        {house ? (
          <StoryHandoff house={house} />
        ) : (
          <ProductClose close={story.close} buyHref={buyHref} />
        )}
      </main>
      {/* Only the branch that has somewhere to stand still. A house story
          hands over at the foot of the faces, so a footer below them would
          be a page the reader can never reach the bottom of. */}
      {house ? null : <SiteFooter tone="paper" />}
    </>
  );
}
