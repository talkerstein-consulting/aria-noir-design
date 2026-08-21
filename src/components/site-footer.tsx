import { footer } from "@/lib/content";
import { FooterMark } from "./footer-mark";

/**
 * Light mode. Like the finale, this carries NO background of its own — the
 * white is the iris still covering the viewport underneath, so the circle
 * stays the only dark→light transition on the page.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-[39] border-t border-ink/10 px-6 pt-24 pb-10 text-ink sm:px-10">
      <div className="mx-auto max-w-7xl">
        {/* newsletter + link columns */}
        <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <p className="font-ui text-[11px] tracking-[0.3em] text-ink/60 uppercase">
              {footer.newsletterLabel}
            </p>
            <form className="flex items-center gap-3 border-b border-ink/25 pb-2">
              <label htmlFor="footer-email" className="sr-only">
                {footer.newsletterPlaceholder}
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder={footer.newsletterPlaceholder}
                className="w-full bg-transparent font-ui text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="font-ui text-sm text-ink transition-colors hover:text-gold-on-light"
              >
                →
              </button>
            </form>
            <div className="mt-2 flex gap-5">
              {footer.socials.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="font-ui text-xs text-ink/60 transition-colors hover:text-gold-on-light"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.title} className="flex flex-col gap-4">
              <p className="font-ui text-[11px] tracking-[0.3em] text-gold-on-light uppercase">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-ui text-sm text-ink/70 transition-colors hover:text-ink"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* legal line sits ABOVE the mark, so ARIA closes the page alone */}
        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-ink/10 pt-8 sm:flex-row">
          <p className="font-ui text-[11px] text-ink/60">{footer.legal}</p>
          <ul className="flex gap-6">
            {footer.legalLinks.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  className="font-ui text-[11px] text-ink/60 transition-colors hover:text-ink"
                >
                  {l}
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
