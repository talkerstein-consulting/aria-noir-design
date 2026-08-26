"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { sitemap } from "@/lib/navigation";

/**
 * The footer's sitemap, as tabs.
 *
 * Four columns of links is the default footer shape and it is the wrong
 * one here for a specific reason: this footer already carries a newsletter
 * field, a socials row, a legal line and a three-hundred-pixel wordmark. On
 * a phone all of that stacks, and four more columns turn the end of every
 * page into a screen and a half of link list that nobody scrolls to the
 * bottom of. Tabs collapse it to one group at a time — the same links, one
 * fifth of the height, and the group names stay visible so nothing is
 * hidden, only deferred.
 *
 * ---- The tabs are the CTA's rule, not a control ----
 *
 * There is no pill, no fill and no radius. A tab is a word with a rule
 * under it and the selected one holds the rule lit in accent — which is
 * exactly what `.cta--here` already means in the menu overlay ("you are
 * here"), so the footer is not inventing a fourth interactive object. It
 * is the third one, reused.
 *
 * ---- Every link is in the DOM at all times ----
 *
 * The hidden panels are `hidden` via an attribute, not unmounted. A
 * sitemap that only renders a quarter of itself is a sitemap that a
 * crawler reads a quarter of, which defeats the point of having one in the
 * footer. This is also why the tabs are a real ARIA tablist with arrow-key
 * roving focus rather than six buttons and some state: a keyboard user
 * should reach the whole map, and `Home`/`End` should do what they do
 * everywhere else.
 */
export function SitemapTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Roving focus. Arrow keys move between tabs and SELECT as they go —
     correct for tabs whose panels are already in the document, since
     nothing is fetched or computed by switching. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = sitemap.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label="Sitemap"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-x-6 gap-y-3"
      >
        {sitemap.map((group, i) => {
          const on = i === active;
          return (
            <button
              key={group.title}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`sitemap-tab-${i}`}
              aria-selected={on}
              aria-controls={`sitemap-panel-${i}`}
              /* Only the selected tab is in the tab order; the arrow keys
                 are how you reach the others. That is the tablist
                 contract, and it is why Tab out of here lands on the first
                 link rather than walking four buttons first. */
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`cta cta--quiet cta--strong ${on ? "cta--here" : ""}`}
            >
              <span className="cta-chars">
                <span className="cta-char">
                  <span className="cta-char-clip">
                    <span className="cta-char-line">{group.title}</span>
                    <span className="cta-char-line" aria-hidden="true">
                      {group.title}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {sitemap.map((group, i) => (
        <ul
          key={group.title}
          role="tabpanel"
          id={`sitemap-panel-${i}`}
          aria-labelledby={`sitemap-tab-${i}`}
          hidden={i !== active}
          /* Two columns on a phone: these are one or two words each, and a
             single column of five short links is a lot of vertical for very
             little ink. */
          className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-col"
        >
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
      ))}
    </div>
  );
}
