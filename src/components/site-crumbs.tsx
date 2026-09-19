"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { crumbsFor } from "@/lib/crumbs";

/**
 * The trail, under the navbar, on every page that has one.
 *
 * ---- The whole design ----
 *
 * One strip at label scale, rendered once from the layout rather than by
 * each page, so it is the same strip everywhere: directly under the band,
 * centred on a wide screen, and one swipeable line on a phone — it never
 * wraps, and the reader drags it rather than losing the end of it.
 *
 * Every crumb but the last is a link in the quiet colour; a group name
 * with no page of its own is set the same but is not a link; the last is
 * the page you are on, one step brighter, carrying `aria-current`. The
 * separator is a bullet at 45% — a chevron would be a second glyph
 * weight inside the smallest type on the page.
 *
 * It does NOT begin with "Home". The logo that goes home is in the band
 * directly above it.
 */
export function SiteCrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);
  if (!crumbs) return null;

  return (
    <nav aria-label="Breadcrumb" className="site-crumbs">
      <ol className="site-crumbs-list">
        {crumbs.trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="site-crumbs-item">
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            <span aria-hidden className="site-crumbs-sep">
              •
            </span>
          </li>
        ))}
        <li className="site-crumbs-item">
          <span aria-current="page">{crumbs.current}</span>
        </li>
      </ol>
    </nav>
  );
}
