import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { GridSection } from "@/components/grid-section";
import PageFlip from "@/components/page-flip";
import { PlateBand } from "@/components/page/plate-band";
import { PageClose } from "@/components/page/page-close";
import { lookbook } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Lookbook SS26 — Aria Noir",
  description: "The spring/summer 2026 book. Twelve plates, six houses, one bench.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function LookbookPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <PageHero {...lookbook.hero} />
        {/* The home gallery's falling curtain, carrying the book's own
            plates. The id is what the iris anchors to, so it must not
            collide with the home page's "gallery". */}
        {/* The book first, as a book. `@reactbits-starter/page-flip-tw`,
            with the house's own leaves and no chrome of its own: square
            corners, no drop shadow, paper the colour of the page it sits
            on. Hover riffles rather than click, because a lookbook is
            something you run a thumb across — a reader should not have to
            decide to open it.

            It is `interactive`, which means it is also a keyboard object;
            everything it shows is in the curtain below, so nothing is only
            reachable by turning a leaf. */}
        <section className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
            <p className="t-eyebrow">{lookbook.book.preheader}</p>
            <h2 className="t-display-lg">{lookbook.book.heading}</h2>
            <p className="t-caption">{lookbook.book.note}</p>
          </div>
          <div className="mt-16 flex justify-center sm:mt-20">
            <PageFlip
              pages={lookbook.book.leaves.map((leaf) => ({ ...leaf }))}
              pageWidth={300}
              pageHeight={400}
              pageRadius={0}
              pageColor="var(--ink)"
              shadow={0}
              trigger="hover"
              closeOnLeave
              ease="easeInOut"
            />
          </div>
        </section>

        <GridSection content={lookbook.grid} href="/eyewear" id="book" />
        <PlateBand {...lookbook.band} />
        <PageClose tone="ink" {...lookbook.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
