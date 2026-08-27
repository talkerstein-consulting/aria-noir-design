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
import * as arca from "@/lib/arca-ii";

export const metadata: Metadata = {
  title: "ARCA II — Aria Noir",
  description:
    "The second cut. One shape, eight colourways, and an inlaid gold plaque that is the only part of the frame finished to catch light.",
};

/**
 * ARCA II product page — the same section order ARCA I runs, from the same
 * modules in components/product/. The two pages differ only in the data
 * file they hand those modules, which is the point: a house is a copy deck
 * and a plate folder, not a second implementation.
 *
 * Two things this cut does NOT have, and the modules handle by omission
 * rather than by substitution: no campaign film (ProductHero renders the
 * still), and no turntable glb (ProductOffering renders the still life).
 * See lib/product.ts for why those are optional at the type level.
 */
/** Every offer on this page lands on the buy page, which is the only
 *  surface that can actually take an order. */
const BUY = "/shop/arca-ii";

export default function ArcaTwoPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <ProductHero hero={arca.hero} />
        <ProductOpening structure={arca.structure} />
        <ProductAriaNoir ariaNoir={arca.ariaNoir} />
        <ProductShoot shoot={arca.shoot} />
        {/* The sticky definition's LEASH — read the long note on the same
            wrapper in app/arca-i/page.tsx before changing this. Short
            version: ProductMeaning is `sticky top-0` and pins to the bottom
            of its containing block, so without this wrapper it would take
            <main> and sit behind every later section to the end of the
            page — showing through ProductClose, which is deliberately
            transparent so the white beneath it can be the iris.

            `relative` with no z-index is load-bearing: a containing block
            WITHOUT a stacking context, so the z-indices of the three
            sections inside still compare against the rest of the page. */}
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
