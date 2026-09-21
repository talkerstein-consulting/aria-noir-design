import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { TextPair } from "@/components/page/text-pair";
import { StickyFeature } from "@/components/page/sticky-feature";
import { PlateBand } from "@/components/page/plate-band";
import { PageClose } from "@/components/page/page-close";
import { about } from "@/lib/pages";

export const metadata: Metadata = {
  title: "The House — Aria Noir",
  description:
    "Eyewear by designers, for visionaries. The brand, the company, and the vision behind six houses and nine frames.",
};

/**
 * Section pages share one shell: SmoothScroll, the fixed nav (which now
 * carries the menu), the page's own sections, then the shared footer. The
 * chrome is identical to the home experience and to ARCA I on purpose —
 * the site should read as one surface, not as an experience with a set of
 * satellite templates hanging off it.
 */
export default function AboutPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        {/* The title plate, back. For a while this page opened on the
            house's whole inventory, on the argument that a page called The
            House should show what the house makes before it argues for
            itself. The inventory has a room of its own now, /shop, and a
            page about the house that opens on thirty-six prices is a shop
            wearing an essay's name. The founders open it; the close still
            sends the reader to the frames. */}
        <PageHero {...about.hero} />
        <TextPair {...about.opening} />
        {/* The band is this page's one full-bleed beat, and it sits between
            the two arguments rather than after both — the vision section
            reads better as an answer to that line than as a sequel to it. */}
        <PlateBand {...about.band} />
        {/* The home page's sticky study, on the one question worth holding
            a reader still for. It replaces the second TextPair rather than
            sitting beside it — two paragraph-and-plate sections and a study
            saying the same thing in three registers is the page repeating
            itself, not building. */}
        <StickyFeature id="vision" {...about.study} />
        <PageClose tone="ink" {...about.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
