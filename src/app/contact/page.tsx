import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { ContactForm } from "@/components/page/contact-form";
import Contact12 from "@/components/contact-12";
import { contact } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Contact — Aria Noir",
  description:
    "Support, adjustments, returns and warranty. Write to the studio in Los Angeles.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function ContactPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <PageHero {...contact.hero} />

        {/* Light from the first section down. A contact page is somewhere
            people arrive with a problem, and reading a form on black over
            photography is the site admiring itself while someone is trying
            to describe a broken hinge. No iris either — there is no dark
            stretch above it for the circle to cut through. */}
        {/* The routes, before the form. A contact page that opens on a
            form assumes the reader already knows which desk they want; six
            named routes answer that first, and most of them resolve without
            anyone filling anything in. The form is for whatever is left. */}
        <Contact12 />

        <section className="on-paper section bg-paper">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
            <div className="stack stack--sm lg:sticky lg:top-28">
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
                <div className="hairline py-5">
                  <dt className="t-label">{contact.studio.label}</dt>
                  <dd className="t-body t-body--tight mt-2">
                    {contact.studio.value}
                  </dd>
                </div>
              </dl>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
