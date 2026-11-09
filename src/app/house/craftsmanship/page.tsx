import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { HeroFilm } from "@/components/product/hero-film";
import { RevealText } from "@/components/reveal";
import { CtaLink } from "@/components/cta-link";
import { craftsmanship } from "@/lib/maison";
import { AboutTabs } from "@/components/page/about-tabs";

export const metadata: Metadata = {
  alternates: { canonical: "/house/craftsmanship" },
  title: "Craftsmanship | Aria Noir",
  description:
    "Each frame begins as a solid block of cellulose acetate, milled to our drawings, then shaped, tumbled and polished by hand.",
};

/**
 * Craftsmanship, a tab of About.
 *
 * The house's own factory film, then the making in three paragraphs, then
 * the 888. The film is HeroFilm with `lazy`: it fetches nothing until it is
 * near, pauses when it leaves, stays on the still for a reader who has asked
 * for less motion, and carries its own pause control (WCAG 2.2.2).
 */
export default function CraftsmanshipPage() {
  const { film, paragraphs, number } = craftsmanship;
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        {/* Cover: hands polishing a frame, a still from the house's own
            factory film (0:30), not its poster, so the picture is not shown
            twice on the page. Pillarbox bars cropped off. */}
        <PageHero
          eyebrow="Maison"
          title={craftsmanship.title}
          line={craftsmanship.line}
          plate="/images/craftsmanship/cover.webp"
          platePortrait="/images/craftsmanship/cover-m.webp"
          alt="Hands polishing an acetate frame"
        />
        <AboutTabs />

        <section aria-label="The workshop" className="on-ink bg-ink px-6 sm:px-10">
          <div className="relative mx-auto aspect-[1600/844] w-full max-w-7xl overflow-hidden">
            <HeroFilm
              src={film.src}
              poster={film.poster}
              alt={film.alt}
              lazy
              priority={false}
              className="object-cover"
            />
          </div>
        </section>

        <section aria-label="The making" className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-2xl flex-col gap-8">
            {paragraphs.map((p) => (
              <p key={p} className="t-body t-body--lede">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section aria-label="888" className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <RevealText as="p" text={number.figure} className="t-display-xl" />
            <p className="t-body t-body--lede">{number.line}</p>
            <p className="t-micro">{number.note}</p>
            <CtaLink href="/collections" kind="secondary" className="mt-8">
              The collection
            </CtaLink>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
