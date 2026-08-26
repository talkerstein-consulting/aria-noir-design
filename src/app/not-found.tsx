import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";
import { notFound } from "@/lib/pages";

/**
 * Dark, silent, one way back.
 *
 * No SmoothScroll: the page is one viewport, so Lenis would be a momentum
 * engine attached to nothing. No plate either — a 404 that arrives with a
 * campaign image is the site selling to someone who just hit a dead end.
 * The code is set as a figure so it reads as a fact rather than as
 * decoration, and the only action on the page is the way home.
 */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="on-ink relative flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
        <div className="flex max-w-lg flex-col items-center gap-6">
          <p className="t-figure text-[color:var(--fg-accent)]">
            {notFound.code}
          </p>
          <RevealText as="h1" text={notFound.heading} className="t-display-lg" />
          <p className="t-body">{notFound.body}</p>
          <CtaLink href={notFound.href} className="mt-4">
            {notFound.cta}
          </CtaLink>
        </div>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
