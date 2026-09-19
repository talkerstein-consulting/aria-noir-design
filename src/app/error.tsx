"use client";

import { SiteFooter } from "@/components/site-footer";
import { CtaLink } from "@/components/cta-link";

/**
 * When a route throws.
 *
 * ---- Why this exists ----
 *
 * Without it, anything that throws inside a client component on a buy page
 * hands the reader Next's own error screen: a stack trace in development
 * and an unbranded apology in production, either way a page that does not
 * look like this house and offers nowhere to go. The heaviest pages here
 * bring a turntable and a film with them, which is exactly the kind of
 * page that finds a way to fail on somebody's phone.
 *
 * ---- Why there is no SiteNav ----
 *
 * The header mounts the search sheet, the menu overlay, the session hint
 * and the bag store. If the thing that threw was one of those, rendering
 * the header here throws again and Next escalates to the global error
 * boundary — which is the unbranded apology this file exists to avoid. So
 * the recovery screen depends on as little as it can: a word, a button,
 * and two links out.
 *
 * `reset()` re-renders the segment without a reload, which is the right
 * first offer: most of what fails on a phone fails once.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <main className="on-ink relative flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
        <div className="flex max-w-lg flex-col items-center gap-6">
          <p className="t-eyebrow text-[color:var(--fg-accent)]">
            Something did not load
          </p>
          <h1 className="t-display-lg">The bench slipped.</h1>
          <p className="t-body">
            Not your doing, and nothing in your bag was lost. Try the page
            again, or take one of these.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <button type="button" className="cta-main" onClick={reset}>
              <span className="cta-chars">Try again</span>
            </button>
            <CtaLink href="/eyewear" kind="secondary">
              All frames
            </CtaLink>
            <CtaLink href="/contact" kind="secondary">
              Tell the studio
            </CtaLink>
          </div>

          {/* The digest is the only thing the studio can act on, and it is
              the one part of an error a reader can actually relay. Shown
              quietly rather than hidden in a console nobody opens. */}
          {error.digest ? (
            <p className="t-caption mt-6 font-mono text-[var(--fg-quiet)]">
              {error.digest}
            </p>
          ) : null}
        </div>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
