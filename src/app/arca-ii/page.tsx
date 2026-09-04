import type { Metadata } from "next";
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
import { ProductSpec } from "@/components/product/product-spec";
import { ProductApproach } from "@/components/product/product-approach";
import { ProductOffering } from "@/components/product/product-offering";
import { ProductWorn } from "@/components/product/product-worn";
import { ProductClose } from "@/components/product/product-close";
import * as arca from "@/lib/arca-ii";

export const metadata: Metadata = {
  title: "ARCA II — Aria Noir",
  description:
    "The second cut. One shape, eight colourways, and an inlaid gold plaque that is the only part of the frame finished to catch light.",
};

/**
 * ARCA II product page. The same section order ARCA I runs, from the same
 * modules in components/product/. The two pages differ only in the data
 * file they hand those modules, which is the point: a house is a copy deck
 * and a plate folder, not a second implementation.
 *
 * One continuous scroll, nothing pinned and nothing overlapping. Read the
 * note on the same page in app/arca-i/page.tsx for what was removed.
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
        {/* The colour scheme, straight off the back of the opening's body:
            the room has just been described, and this is the run of
            acetate it was built to hold. An accent band, not a section —
            see ProductPalette. It reads the SAME list the turntable's
            squares read, so the house has one set of colours. */}
        {arca.offering.view.kind === "model" &&
        arca.offering.view.colorways ? (
          <ProductPalette colorways={arca.offering.view.colorways} />
        ) : null}
        <ProductAriaNoir ariaNoir={arca.ariaNoir} />
        <ProductShoot shoot={arca.shoot} />
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
        <ProductMeaning meaning={arca.meaning} />
        <ProductBand detail={arca.detail} />
        <ProductApproach approach={arca.approach} />
        <ProductOffering offering={arca.offering} buyHref={BUY} />
        <ProductSpec spec={arca.spec} />
        {/* "The Variations" is GONE, and its component with it. Eight (or
            four) full-screen panels was one shape shown over and over with
            a screen of scroll between each, and no way to compare any two
            of them. The colours now live in two better places: as a flat
            material band under the opening (ProductPalette), and as
            squares ON the turntable in the offering, where changing one
            changes the object the reader is already holding and the offer
            under it. */}
        {/* No References band. It printed a list of names (Tanizaki,
            Sugimoto, Dunand, two films) under the gallery, which is the
            house citing its own sources. COPY.md is explicit that the
            knowledge shows up as instinct and restraint, never as a
            footnote, so the band is gone from this page as it already was
            from ARCA I. The names still inform the pictures. They just do
            not sign them. */}
        <ProductWorn worn={arca.worn} buyHref={BUY} />
        <ProductClose close={arca.close} buyHref={BUY} />
      </main>
      <SiteFooter />
    </>
  );
}
