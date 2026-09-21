import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { StickyStudy } from "@/components/page/sticky-study";
import { TextPair } from "@/components/page/text-pair";
import { PageClose } from "@/components/page/page-close";
import { care } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Care — Aria Noir",
  description:
    "How to keep an Aria Noir frame for the years it was built for, and what the two-year international limited warranty covers.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function CarePage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero {...care.hero} />
        {/* The macro set was shot as a specification and reads just as well
            as an anatomy: each plate is the point the row beside it is
            making, which is the whole argument for the sticky study. */}
        <StickyStudy id="keeping" {...care.keeping} />
        <section id="ownership">
          <TextPair {...care.ownership} />
        </section>
        <PageClose tone="ink" {...care.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
