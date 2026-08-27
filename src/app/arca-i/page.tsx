import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { WhiteDotOverlay } from "@/components/white-dot-overlay";
import { ProductHero } from "@/components/product/product-hero";
import { ProductOpening } from "@/components/product/product-opening";
import { ProductAriaNoir } from "@/components/product/product-aria-noir";
import { ProductShoot } from "@/components/product/product-shoot";
import { ProductMeaning } from "@/components/product/product-meaning";
import { ProductBand } from "@/components/product/product-band";
import { ProductSpec } from "@/components/product/product-spec";
import { ProductOffering } from "@/components/product/product-offering";
import { ProductVariations } from "@/components/product/product-variations";
import { ProductReferences } from "@/components/product/product-references";
import { ProductWorn } from "@/components/product/product-worn";
import { ProductClose } from "@/components/product/product-close";
import * as arca from "@/lib/arca-i";

export const metadata: Metadata = {
  title: "ARCA I — Aria Noir",
  description:
    "The first vessel. The house's founding model. Hand-cut acetate, a five-barrel hinge, finished by hand.",
};

/**
 * ARCA I product page — built from the home page's own modules (fixed nav,
 * sticky two-column study, curtain grid, white-dot handoff, shared footer)
 * so the two surfaces read as one site rather than one site and a template.
 * Content follows the approved "ARCA I - Product Page Story" copy deck, and
 * lives entirely in lib/arca-i.ts — the sections themselves are shared with
 * ARCA II and hold no copy of their own.
 *
 * The dark→light handoff is anchored to the curtain section, matching how
 * the landing page hands over to its own closing block.
 */
/** Every offer on this page lands on the buy page, which is the only
 *  surface that can actually take an order. */
const BUY = "/shop/arca-i";

export default function ArcaOnePage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <ProductHero hero={arca.hero} />
        <ProductOpening structure={arca.structure} />
        <ProductAriaNoir ariaNoir={arca.ariaNoir} />
        <ProductShoot shoot={arca.shoot} />
        {/* This wrapper is the sticky Arca definition's LEASH.
            ProductMeaning is `sticky top-0`, and a sticky element stays
            pinned to the bottom of its containing block — which, with no
            wrapper, was <main>, i.e. the rest of the page. It therefore sat
            behind every later section forever, and showed through the one
            section that is deliberately transparent: the closing block,
            which has no background of its own because the white beneath it
            is meant to be the iris. That is what exposed the Latin plate
            under the closing heading.

            Bounding it here lets it pin through the band and the spec —
            long enough for both to have covered it completely — and then
            release while it is still hidden, so nothing is behind the
            closing block but the page's own black.

            `relative` with no z-index is load-bearing: it makes this a
            containing block WITHOUT making it a stacking context, so the
            z-indices of the three sections inside still compare against
            the rest of the page rather than being trapped in here. */}
        <div className="relative">
          <ProductMeaning meaning={arca.meaning} />
          <ProductBand detail={arca.detail} />
          <ProductSpec spec={arca.spec} />
        </div>
        <ProductOffering offering={arca.offering} buyHref={BUY} />
        <ProductVariations variations={arca.variations} />
        <ProductReferences references={arca.references} />
        <ProductWorn worn={arca.worn} buyHref={BUY} />
        <WhiteDotOverlay anchorId="worn" />
        <ProductClose close={arca.close} buyHref={BUY} />
      </main>
      <SiteFooter />
    </>
  );
}
