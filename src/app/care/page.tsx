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
  title: "Fit & Care — Aria Noir",
  description:
    "Five contact points between a frame and a face, what each one tells you, and how to keep a frame for the years it was built for.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function CarePage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <PageHero {...care.hero} />
        {/* The macro set was shot as a specification and reads just as well
            as an anatomy: each plate is the point the row beside it is
            making, which is the whole argument for the sticky study. */}
        <StickyStudy id="fit" {...care.fit} />
        <section id="keeping">
          <TextPair {...care.keeping} />
        </section>
        <PageClose tone="ink" {...care.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
