import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { AboutTabs } from "@/components/page/about-tabs";
import { LogoEntry } from "@/components/page/logo-entry";
import { CtaLink } from "@/components/cta-link";
import { heritage } from "@/lib/heritage";

export const metadata: Metadata = {
  alternates: { canonical: "/house/heritage" },
  title: "Heritage | Aria Noir",
  description: "A Toronto design house. Eyewear, and knitwear in baby alpaca.",
};

/**
 * Heritage, a tab of About. Built only from what the house has already
 * published: its own About text, its own books, and the press. See
 * lib/heritage for the source of every line.
 */
export default function HeritagePage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero
          eyebrow="Maison"
          title={heritage.title}
          line={heritage.line}
          plate={heritage.cover.src}
          platePortrait={heritage.cover.portrait}
          alt={heritage.cover.alt}
        />
        <AboutTabs />

        <section aria-label="The house" className="on-ink section bg-ink">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            {heritage.intro.map((p) => (
              <p key={p} className="t-body t-body--lede">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section aria-label="Photographs" className="on-ink bg-ink px-6 sm:px-10">
          <figure className="mx-auto max-w-7xl">
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {heritage.photos.map((ph) => (
                <li key={ph.src} className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={ph.src}
                    alt={ph.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
            <figcaption className="t-caption mt-4 text-[var(--fg-secondary)]">{heritage.photosCaption}</figcaption>
          </figure>
        </section>

        <section aria-labelledby="milestones" className="on-ink section bg-ink">
          <div className="mx-auto max-w-5xl">
            <h2 id="milestones" className="sr-only">
              Milestones
            </h2>
            <ol className="flex flex-col">
              {heritage.milestones.map((m) => (
                <LogoEntry
                  key={m.date + m.label}
                  outlet={"source" in m && m.source ? m.source.outlet : undefined}
                  when={<time dateTime={m.date}>{m.label}</time>}
                >
                  {"source" in m && m.source ? (
                    <a
                      href={m.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet t-display-xs text-balance"
                    >
                      {m.text}
                    </a>
                  ) : (
                    /* Same type as the linked rows (link-quiet sets it), without the hover. */
                    <p className="link-quiet pointer-events-none t-display-xs text-balance">{m.text}</p>
                  )}
                </LogoEntry>
              ))}
            </ol>
            <div className="mt-12">
              <CtaLink href={heritage.close.href} kind="secondary">
                {heritage.close.label}
              </CtaLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
