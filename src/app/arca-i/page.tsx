import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { WhiteDotOverlay } from "@/components/white-dot-overlay";
import { ProductHero } from "@/components/arca-i/product-hero";
import { ProductOpening } from "@/components/arca-i/product-opening";
import { ProductAriaNoir } from "@/components/arca-i/product-aria-noir";
import { ProductShoot } from "@/components/arca-i/product-shoot";
import { ProductMeaning } from "@/components/arca-i/product-meaning";
import { ProductBand } from "@/components/arca-i/product-band";
import { ProductSpec } from "@/components/arca-i/product-spec";
import { ProductOffering } from "@/components/arca-i/product-offering";
import { ProductVariations } from "@/components/arca-i/product-variations";
import { ProductReferences } from "@/components/arca-i/product-references";
import { ProductWorn } from "@/components/arca-i/product-worn";
import { ProductClose } from "@/components/arca-i/product-close";

export const metadata: Metadata = {
  title: "ARCA I — Aria Noir",
  description:
    "The first vessel. The house's founding model. Hand-cut acetate, a five-barrel hinge, finished by hand.",
};

/**
 * ARCA I product page — built from the home page's own modules (fixed nav,
 * sticky two-column study, curtain grid, white-dot handoff, shared footer)
 * so the two surfaces read as one site rather than one site and a template.
 * Content follows the approved "ARCA I - Product Page Story" copy deck.
 *
 * The dark→light handoff is anchored to the curtain section, matching how
 * the landing page hands over to its own closing block.
 */
export default function ArcaOnePage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <ProductHero />
        <ProductOpening />
        <ProductAriaNoir />
        <ProductShoot />
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
          <ProductMeaning />
          <ProductBand />
          <ProductSpec />
        </div>
        <ProductOffering />
        <ProductVariations />
        <ProductReferences />
        <ProductWorn />
        <WhiteDotOverlay anchorId="worn" />
        <ProductClose />
      </main>
      <SiteFooter />
    </>
  );
}
