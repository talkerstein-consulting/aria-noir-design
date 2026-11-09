import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { CtaLink } from "@/components/cta-link";
import { careers } from "@/lib/maison";

export const metadata: Metadata = {
  alternates: { canonical: "/house/careers" },
  title: "Careers | Aria Noir",
  description: "Careers at Aria Noir. No open positions today; designers and makers may write at any time.",
};

/**
 * Careers, under About. Linked from the footer, per the review.
 *
 * Deliberately short. There are no roles to list, and a careers page that
 * invents some to look busy is the opposite of what the review asked this
 * page to be for: evidence of a real house. See lib/maison.
 */
export default function CareersPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero eyebrow="Maison" title={careers.title} line={careers.line} />
        <section aria-label="Working with Aria Noir" className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            {careers.body.map((p) => (
              <p key={p} className="t-body t-body--lede">
                {p}
              </p>
            ))}
            <p className="t-micro">{careers.email}</p>
            <CtaLink href={`mailto:${careers.email}?subject=${encodeURIComponent("Careers")}`} className="mt-4">
              {careers.cta}
            </CtaLink>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
