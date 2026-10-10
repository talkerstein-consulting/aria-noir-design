import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { architecture, routeCount } from "@/lib/navigation";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";
import { SitemapMap } from "@/components/sitemap-map";

export const metadata: Metadata = {
  title: "All pages | Aria Noir",
  description: "Every route the house answers on, in one page.",
  /* A working index of the site, not a page the house is presenting. It
     stays out of the search results for the same reason a contact sheet
     stays out of a lookbook. */
  robots: { index: false, follow: false },
};

/**
 * `/sitemap` — every route, linked.
 *
 * ---- What it is for ----
 *
 * Designing a page starts with being able to reach it. Before this, four
 * buy pages 404ed, the Process was reachable only from inside another
 * page, and three more rooms were built but unadvertised — so the only way
 * to open one was to know its path and type it. This is the index that
 * makes the whole site one click deep.
 *
 * ---- Why it reads from `architecture` ----
 *
 * Because a hand-written list of pages is wrong within a week. The houses
 * come from the catalogue and the policies come from the policies, so a
 * new one appears here on the commit that adds it. `lib/navigation.ts`.
 *
 * ---- Why it is not the footer's sitemap ----
 *
 * The footer leaves things out on purpose: it is grouped by why someone is
 * looking, and edited for length. This leaves nothing out, including the
 * pages nobody should arrive at cold and the tools that only work under
 * `next dev`. Two documents, two jobs. See `sitemap` vs `architecture`.
 */

export default function SitemapPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <section className="on-ink section bg-ink pt-20 sm:pt-40">
          <div className="mx-auto max-w-7xl">
            <div className="stack stack--sm mb-16">
              <CrumbEyebrow label="The architecture" className="t-eyebrow" />
              <h1 className="t-display-lg">All pages.</h1>
              <p className="t-body t-body--lede mt-2">
                Every room the house answers on, whether or not anything
                points at it. {routeCount()} routes, all unlocked. Select a page to
                preview it live; double click or Open to go there.
              </p>
              {/* The gates are off, and that is a state worth saying out
                  loud on the page that benefits from it — otherwise the
                  first question about this list is whether it is honest. */}
              <p className="t-caption mt-4 max-w-2xl text-[var(--fg-quiet)]">
                Every house is on show and every page is on the menu while
                the design pass runs. What was deliberately unadvertised,
                and why, is kept in
                <span className="font-mono"> docs/information-architecture.html</span>.
              </p>
            </div>

            <SitemapMap groups={architecture} />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
