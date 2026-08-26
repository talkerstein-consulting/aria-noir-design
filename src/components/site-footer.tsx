import { footer } from "@/lib/content";
import { SitemapTabs } from "./sitemap-tabs";
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
    <footer className={`${ground} relative z-[39] border-t border-[var(--fg-rule)] px-6 pt-24 pb-10 sm:px-10`}>
      <div className="mx-auto max-w-7xl">
        {/* ---- newsletter, then the sitemap as tabs ----
            Two blocks rather than a four-column grid. The desk (field and
            socials) is the thing someone came down here to USE; the map is
            the thing they came down here to READ, and folding it into tabs
            keeps the whole footer to about one screen on a phone instead
            of a screen and a half of link list. */}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-24">
          <div className="flex flex-col gap-4">
            <p className="t-label">{footer.newsletterLabel}</p>
            <form className="field-row">
              <label htmlFor="footer-email" className="sr-only">
                {footer.newsletterPlaceholder}
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder={footer.newsletterPlaceholder}
                className="field"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="field-submit"
              >
                →
              </button>
            </form>
            <div className="mt-2 flex gap-5">
              {footer.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-quiet link-quiet--accent link-quiet--micro"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <SitemapTabs />
        </div>

        {/* legal line sits ABOVE the mark, so ARIA closes the page alone */}
        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-[var(--fg-rule)] pt-8 sm:flex-row">
          <p className="link-quiet link-quiet--micro">{footer.legal}</p>
          <ul className="flex gap-6">
            {footer.legalLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link-quiet link-quiet--micro">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* enlarged ARIA mark — draws itself in when it scrolls into view */}
        <FooterMark />
      </div>
    </footer>
  );
}
