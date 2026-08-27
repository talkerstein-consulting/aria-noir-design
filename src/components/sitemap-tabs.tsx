"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sitemap } from "@/lib/navigation";

/**
 * The footer's sitemap. One markup, two objects.
 *
 *   phone   — an FAQ. Four group names stacked down the page, each a rule
 *             with a word on it; tapping one opens its links and closes
 *             whichever was open. Nothing is more than one tap deep and the
 *             footer stays about a screen instead of a screen and a half.
 *
 *   desktop — four columns, spread across the whole span beside the desk.
 *             There is nothing to open: every link is already visible,
 *             because the width to show them is right there and hiding a
 *             four-word list behind a click on a 1500px screen is an
 *             interaction charging rent for space it is not saving.
 *
 * ---- Why CSS decides, and JS only follows ----
 *
 * The open/closed state is a `data-open` attribute and the columns are a
 * media query. That ordering matters: the server renders the accordion
 * shape, and on a wide screen the stylesheet has already opened everything
 * before a single line of JS runs — no flash of four collapsed groups, and
 * no layout that depends on hydration finishing.
 *
 * What JS does after mount is narrower: it asks whether this is the wide
 * layout and, if so, stops the headers claiming to be buttons. A control
 * that says `aria-expanded="false"` over a list that is plainly visible is
 * worse than no control, and that is exactly what a media-query-only
 * version would announce to a screen reader.
 *
 * Every link is in the DOM in both shapes — collapsed, not absent. A
 * sitemap that renders a quarter of itself is one a crawler reads a
 * quarter of, which defeats the point of putting it in the footer.
 */
export function SitemapTabs() {
  /** Which group is open on the phone. One at a time, FAQ-style. */
  const [open, setOpen] = useState(0);

  /* Starts false so the server and the first client render agree — the
     stylesheet is what makes the wide layout correct on paint, and this
     only catches the semantics up afterwards. */
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="sitemap flex flex-col gap-0 sm:flex-row sm:justify-between sm:gap-10">
      {sitemap.map((group, i) => (
        <div
          key={group.title}
          className="sitemap-group"
          data-open={i === open}
        >
          {wide ? (
            <p className="t-eyebrow sitemap-head">{group.title}</p>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(i === open ? -1 : i)}
              aria-expanded={i === open}
              aria-controls={`sitemap-panel-${i}`}
              className="t-eyebrow sitemap-head sitemap-head--button"
            >
              {group.title}
              {/* A rule that becomes a cross. No chevron: the site has no
                  icon language, and a plus rotating to an x is the same
                  hairline the whole page is drawn with. */}
              <span aria-hidden className="sitemap-sign" />
            </button>
          )}

          {/* The grid wrapper is not decoration. `grid-template-rows: 0fr
              → 1fr` is what opens a list of unknown height without
              measuring it in JS, and it only sizes the FIRST row — so the
              thing being collapsed has to be a SINGLE child. Putting the
              rows on the <ul> itself left every <li> after the first in an
              auto row, and a "closed" group still stood 92px tall. */}
          <div id={`sitemap-panel-${i}`} className="sitemap-panel">
            <ul className="sitemap-list">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link-quiet"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="link-quiet">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
