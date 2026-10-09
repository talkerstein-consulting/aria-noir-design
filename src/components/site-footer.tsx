import { footer } from "@/lib/content";
import { SitemapTabs } from "./sitemap-tabs";
import { NewsletterField } from "./newsletter-field";
import { FooterMark } from "./footer-mark";

/**
 * Two grounds, one object.
 *
 * `tone="paper"` (the default) is the home page and ARCA I: the footer
 * carries NO background of its own, because the white underneath it is the
 * iris still covering the viewport — the circle stays the only dark→light
 * transition on those pages, and painting a second one here would put a
 * seam directly under it.
 *
 * `tone="ink"` is every other page. Those run no iris at all, and a footer
 * declaring `.on-paper` with nothing painting paper behind it is exactly
 * the bug it looks like: white-on-white type over whatever the last
 * section left on screen. They end black, and they end black on purpose —
 * the invert is a piece of choreography the home page earns over four
 * screens of scroll, not a house style every page has to perform.
 */
export function SiteFooter({
  tone = "paper",
}: {
  tone?: "paper" | "ink";
} = {}) {
  const ground = tone === "ink" ? "on-ink bg-ink" : "on-paper";
  return (
    /* `sm:pb-0` is not a footer with no foot: from `sm` up the space
       under the mark is set INSIDE the column below, so both gaps in the
       lockup resolve against the same box. See the mark. */
    <footer className={`${ground} relative z-[39] border-t border-[var(--fg-rule)] px-6 pt-24 pb-10 sm:px-10 sm:pb-0`}>
      {/* The lockup's column, and the box every percentage in it
          resolves against — the mark's own gaps and the
          room under the last line. Carried here rather than as the
          footer's padding so both read the same width. */}
      <div className="mx-auto max-w-7xl sm:pb-[calc(6.49%_-_0.6rem)]">
        {/* ---- newsletter, then the sitemap as tabs ----
            Two blocks rather than a four-column grid. The desk (field and
            socials) is the thing someone came down here to USE; the map is
            the thing they came down here to READ, and folding it into tabs
            keeps the whole footer to about one screen on a phone instead
            of a screen and a half of link list. */}
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="flex flex-col gap-4 lg:w-[19rem] lg:shrink-0">
            <p className="t-label">{footer.newsletterLabel}</p>
            <NewsletterField placeholder={footer.newsletterPlaceholder} />
            {/* ---- The one social account, as its glyph ----
                Icon only: the Instagram mark names the destination on its
                own; the label stays for screen readers. Still hidden on a
                phone, where the socials are a tab in the map below. */}
            <div className="mt-3 hidden sm:flex sm:gap-3">
              {footer.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`}
                  className="inline-flex size-10 items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                >
                  {/* lucide 1.x ships no brand marks, so the glyph is drawn here. */}
                  <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* The map takes the rest of the span rather than a fixed column.
              It was sharing a two-column grid with the desk, which parked
              four short link lists in the right half and left a third of
              the footer empty — a footer being narrow in the one place
              there is nothing competing for the width. */}
          <div className="lg:min-w-0 lg:flex-1">
            <SitemapTabs
              narrowExtra={{
                title: "Follow us",
                links: footer.socials.map((s) => ({ ...s, external: true })),
              }}
            />
          </div>
        </div>

        {/* ── the closing row, then the mark ───────────────────
            Left: the legal pages, which is where a reader looks for
            them. Right: the maker's credit, as plain text, the only
            counterweight that is not a
            second set of links — the four columns above already carry
            every route, and repeating three of them here to fill the
            space would be the footer saying the same thing twice.

            Under both, the ARIA NOIR mark closes the page; NOIR is
            the last thing on it. */}
        {/* The line over the legal row is the house pattern: the monoline
            emblem repeated across the column, rather than a plain rule. */}
        <div aria-hidden className="breaker mt-16" />
        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <ul className="flex flex-wrap justify-center gap-6">
            {footer.legalLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link-quiet link-quiet--micro">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={footer.credit.href}
            target="_blank"
            rel="noopener"
            className="link-quiet link-quiet--micro"
          >
            {footer.credit.label}
          </a>
        </div>

        {/* enlarged ARIA mark — draws itself in when it scrolls into view */}
        <FooterMark />

      </div>
    </footer>
  );
}
