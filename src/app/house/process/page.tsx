import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { StickyStudy } from "@/components/page/sticky-study";
import { PlateBand } from "@/components/page/plate-band";
import { PageClose } from "@/components/page/page-close";
import { process } from "@/lib/pages";

export const metadata: Metadata = {
  title: "The Process — Aria Noir",
  description:
    "Twenty-four hand-finishing steps, from a solid block of Italian acetate to a finished front.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function ProcessPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <PageHero {...process.hero} />
        {/* Six rows against six macro plates. The study only holds its pin
            while the right column is taller than the left, so those two
            counts are load-bearing rather than incidental. */}
        <StickyStudy id="bench" {...process.study} />
        <PlateBand {...process.band} />
        <PageClose tone="ink" {...process.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
