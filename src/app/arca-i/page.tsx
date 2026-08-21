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
        <ProductMeaning />
        <ProductBand />
        <ProductSpec />
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
