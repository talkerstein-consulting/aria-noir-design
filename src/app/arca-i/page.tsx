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
import * as arca from "@/lib/arca-i";

export const metadata: Metadata = {
  title: "ARCA I — Aria Noir",
  description:
    "The first vessel. The house's founding model. Hand-cut acetate, a five-barrel hinge, finished by hand.",
};

/**
 * ARCA I product page. Built from the site's shared modules so this surface
 * and the home page read as one house rather than a site and a template.
 * Every word lives in lib/arca-i.ts; the sections are shared with ARCA II
 * and hold no copy of their own.
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
 *   background of its own. That turn is now a gradient inside
 *   ProductClose.
 *
 * What is left is ordinary document flow: each section arrives, is read,
 * and leaves.
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
        {/* No References band on this page. ARCA II still runs one — the
            component and its data are per-house, and this house's list
            (Whistler, La Tour, Hopper, Atget) was four names between the
            colourway stage and the registry with nothing asked of the
            reader in between. */}
        <ProductWorn worn={arca.worn} buyHref={BUY} />
        <ProductClose close={arca.close} buyHref={BUY} />
      </main>
      <SiteFooter />
    </>
  );
}
