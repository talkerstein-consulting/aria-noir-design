import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ProductHero } from "@/components/product/product-hero";
import { ProductLookbook } from "@/components/product/product-lookbook";
import { PageClose } from "@/components/page/page-close";
import { RevealText, RevealPlate } from "@/components/reveal";
import { apparel, elPatronPage } from "@/lib/apparel";

export const metadata: Metadata = {
  alternates: { canonical: "/el-patron" },
  title: "El Patrón | Aria Noir",
  description: "El Patrón. Baby alpaca, knitted in Peru, in five yarns.",
};

/**
 * El Patrón's collection page: the sweater given the same exhibition the
 * eyewear houses have, as Jai asked on the 5 Nov call.
 *
 * The lookbook layout (hero, the run, a closing line) because the shoot is
 * a campaign rather than a story deck, then the five yarns as garments,
 * then the offer. The offer goes to the garment's buy page, /shop/<slug>,
 * which is where apparel is sold in this build. Data in lib/apparel.
 */
const line = apparel[0];
const buyHref = `/shop/${line.slug}`;

export default function ElPatronPage() {
  const page = elPatronPage;
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <ProductHero hero={page.hero} />
        <ProductLookbook lookbook={page.lookbook} />

        <section aria-label="The colourways" className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-7xl flex-col gap-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <RevealText as="h2" text={page.colourways.heading} className="t-display-lg" />
              <p className="t-body t-body--lede">{page.colourways.body}</p>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
              {page.colourways.shots.map((shot, i) => (
                <li key={shot.name} className="flex flex-col gap-3">
                  <RevealPlate delay={i * 60} className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={shot.src}
                      alt={`El Patrón in ${shot.name}, laid out on its own`}
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover"
                    />
                  </RevealPlate>
                  <p className="t-label">{shot.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <PageClose
          tone="ink"
          heading={page.close.heading}
          body={page.close.body}
          cta={page.close.cta}
          href={buyHref}
        />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
