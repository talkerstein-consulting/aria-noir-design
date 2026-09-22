import { footer } from "@/lib/content";
import { SitemapTabs } from "./sitemap-tabs";
import { Camera, ChevronRight } from "lucide-react";
import { CtaLink } from "@/components/cta-link";
import { FooterMark } from "./footer-mark";
import { TcgBadge } from "./tcg-badge";

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
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="flex flex-col gap-4 lg:w-[19rem] lg:shrink-0">
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
                <ChevronRight aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </form>
            {/* ---- The one social account, as an offer ----
            
                It was a bare word — "Instagram" — in the quiet link style
                the legal row uses, sitting under the newsletter field
                with no box and no verb. Next to a form with a submit
                button it read as a footnote rather than as the second
                thing the house is asking a reader to do.
            
                An outlined CTA says what pressing it does, and the glyph
                names the destination faster than the word does. Secondary
                and not filled: the newsletter field is this column's main
                action and two solid blocks would fight.
            
                Still hidden on a phone, where the socials are a tab in
                the map below rather than a stray control under the
                field. */}
            <div className="mt-3 hidden sm:block">
              {footer.socials.map((social) => (
                <CtaLink
                  key={social.label}
                  href={social.href}
                  external
                  kind="secondary"
                  /* `Camera`, not `Instagram`: lucide 1.x removed every brand
                     mark from the set — there is no twitter, github or
                     instagram glyph in the 4,070 icons installed — and the
                     deleted one was a camera outline anyway. The word next
                     to it names the destination; the glyph only has to say
                     "this is the picture one". */
                  icon={<Camera aria-hidden size={16} strokeWidth={1.5} />}
                >
                  {`Follow us on ${social.label}`}
                </CtaLink>
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

        {/* ── the closing row, then the mark, then the credit ───────
            Left: the legal pages, which is where a reader looks for
            them. Right: the copyright, which is the other thing a foot
            of a page says and the only counterweight that is not a
            second set of links — the four columns above already carry
            every route, and repeating three of them here to fill the
            space would be the footer saying the same thing twice.

            Under both, ARIA closes the page alone, and the maker's
            credit is the last line, centred beneath the mark. */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--fg-rule)] pt-8 sm:flex-row">
          <ul className="flex flex-wrap justify-center gap-6">
            {footer.legalLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link-quiet link-quiet--micro">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="t-micro text-[var(--fg-quiet)]">{footer.legal}</p>
        </div>

        {/* enlarged ARIA mark — draws itself in when it scrolls into view */}
        <FooterMark />

        <div className="mt-8 flex justify-center">
          <TcgBadge tone={tone} />
        </div>
      </div>
    </footer>
  );
}
