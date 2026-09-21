import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { ContactIntake } from "@/components/page/contact-intake";
import { contact } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Contact — Aria Noir",
  description:
    "Support, adjustments and warranty. Write to the studio.",
};

/**
 * The contact page, cut to what a contact page is for: the addresses,
 * and a way to write.
 *
 * It used to run three screens: the masthead, a six-tile block of routes
 * explaining which desk is which, and then a form on paper. The routes
 * are now the first question of the intake, so the block is gone; and
 * the page stays on ink from top to bottom, because one ground is quieter
 * than two and there is nothing here that needs the light to be read.
 */
export default function ContactPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero {...contact.hero} />

        <section className="on-ink section bg-ink">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            {/* ---- the addresses ---- */}
            <div className="lg:sticky lg:top-28">
              <p className="t-body t-body--lede">{contact.intro}</p>
              <dl className="mt-8 flex flex-col">
                {contact.desks.map((desk) => (
                  <div key={desk.value} className="hairline py-5">
                    <dt className="t-label">{desk.label}</dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${desk.value}`}
                        className="link-quiet link-quiet--accent t-body t-body--tight"
                      >
                        {desk.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* ---- the intake, in a box ----
                The one hairline box on the page: the intake is the thing
                to be used here, and a rule around it is what tells it
                apart from the addresses it sits beside. */}
            <div className="border border-[var(--fg-rule)] p-6 sm:p-10">
              <p className="t-eyebrow">{contact.intake.eyebrow}</p>
              <div className="mt-6">
                <ContactIntake />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
