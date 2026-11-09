"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The About section's tabs (Raviv, 5 Nov: About, Heritage, Craftsmanship,
 * the book; Rems, 8 Nov: tabs on the opened page, not a dropdown, and the
 * section is labelled About; Rems, 9 Nov: the Book tab removed; Rems, 9 Nov:
 * the section is Maison again, the first tab stays About).
 *
 * Links, not an ARIA tablist: each tab is its own page with its own URL, so
 * this is a navigation landmark and the current page is marked with
 * aria-current. One row; on a phone it scrolls sideways rather than
 * stacking.
 */
export const ABOUT_TABS = [
  { label: "About", href: "/house/about" },
  { label: "Heritage", href: "/house/heritage" },
  { label: "Craftsmanship", href: "/house/craftsmanship" },
] as const;

export function AboutTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Maison" className="on-ink border-b border-[var(--fg-rule)] bg-ink">
      <ul className="about-tabs mx-auto flex max-w-7xl overflow-x-auto px-6 sm:justify-center sm:px-10">
        {ABOUT_TABS.map((t) => {
          const here = pathname === t.href;
          return (
            <li key={t.href} className="shrink-0">
              <Link href={t.href} aria-current={here ? "page" : undefined} className="about-tab">
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
