import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { LogoEntry } from "@/components/page/logo-entry";
import { MailtoForm } from "@/components/page/mailto-form";
import { RevealText } from "@/components/reveal";
import { footer } from "@/lib/content";
import { press } from "@/lib/maison";

export const metadata: Metadata = {
  alternates: { canonical: "/house/press" },
  title: "Press | Aria Noir",
  description: "What has been written about Aria Noir, each entry linked to the page as published. Press enquiries.",
};

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const when = (iso: string | null) => (iso ? fmt.format(new Date(`${iso}T00:00:00Z`)) : "Undated");

/**
 * Press, under About.
 *
 * A dated list, newest first, and nothing more. The review (5 Nov 2026) was
 * specific: no logo wall on the home page, and "As seen in" only for genuine
 * editorial. Most of these are placements or a wire release, so the page
 * lists them as what they are and lets the reader judge. See lib/maison.
 */
export default function PressPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero eyebrow="Maison" title={press.title} line={press.line} />

        <section aria-labelledby="press-list" className="on-ink section bg-ink">
          <div className="mx-auto max-w-5xl">
            <h2 id="press-list" className="sr-only">
              Articles
            </h2>
            <p className="t-body t-body--lede max-w-xl">{press.intro}</p>
            <ol className="mt-12 flex flex-col">
              {press.items.map((item) => (
                <LogoEntry
                  key={item.href}
                  outlet={item.outlet}
                  when={item.date ? <time dateTime={item.date}>{when(item.date)}</time> : when(null)}
                >
                    <p className="t-micro text-[var(--fg-tertiary)]">
                      {item.kind}
                      {item.language ? ` · In ${item.language}` : null}
                    </p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet t-display-xs text-balance"
                    >
                      {item.headline}
                    </a>
                    {item.also?.length ? (
                      <p className="t-caption text-[var(--fg-secondary)]">
                        Also{" "}
                        {item.also.map((a, i) => (
                          <span key={a.outlet}>
                            {i > 0 ? (i === item.also!.length - 1 ? " and " : ", ") : null}
                            {a.href ? (
                              <a href={a.href} target="_blank" rel="noopener noreferrer" className="link-quiet link-quiet--accent">
                                {a.outlet}
                              </a>
                            ) : (
                              a.outlet
                            )}
                            {a.note ? `, ${a.note}` : null}
                          </span>
                        ))}
                        .
                      </p>
                    ) : null}
                </LogoEntry>
              ))}
            </ol>
          </div>
        </section>

        <section aria-label="Press enquiries" className="on-ink section bg-ink">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <RevealText as="h2" text={press.enquiries.heading} className="t-display-lg" />
              <p className="t-body">{press.enquiries.body}</p>
              <dl className="flex flex-col">
                <div className="hairline py-5">
                  <dt className="t-label">Press</dt>
                  <dd className="mt-2">
                    <a href={`mailto:${press.enquiries.email}`} className="link-quiet link-quiet--accent t-body t-body--tight">
                      {press.enquiries.email}
                    </a>
                  </dd>
                </div>
                {footer.socials.map((s) => (
                  <div key={s.label} className="hairline py-5">
                    <dt className="t-label">{s.label}</dt>
                    <dd className="mt-2">
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-quiet link-quiet--accent t-body t-body--tight">
                        @arianoir_official
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="border border-[var(--fg-rule)] p-6 sm:p-10">
              <MailtoForm
                to={press.enquiries.email}
                subject="Press enquiry"
                send="Send"
                sent="Your mail app has the enquiry ready to send."
                fallback="Nothing opened. Write to"
                fields={[
                  { name: "name", label: "Name", required: true, autoComplete: "name", half: true },
                  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", half: true },
                  { name: "outlet", label: "Publication" },
                  { name: "message", label: "Message", type: "textarea", required: true },
                ]}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
