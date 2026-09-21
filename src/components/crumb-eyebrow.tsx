"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement, useEffect, type CSSProperties, type ElementType } from "react";
import { crumbsFor, type Crumb } from "@/lib/crumbs";
import { RevealText, useReveal } from "@/components/reveal";

/** Matches RevealText's own per-word step, because these two sit in the
 *  same slot on different pages and a trail that staggered at a different
 *  rate to the eyebrow it replaced would read as a different component. */
const STEP_MS = 26;

type CrumbEyebrowProps = {
  /**
   * What this slot said before the trail took it over, and what it says
   * again on any route with no trail — the home page, checkout, anything
   * not yet in `architecture`. The eyebrow is never empty: the trail is a
   * better answer where there is one, not the only permitted answer.
   */
  label: string;
  /** The element, when there is no trail. A trail is always a `nav`. */
  as?: ElementType;
  /** The eyebrow's own classes at this site — the caller owns its look. */
  className?: string;
  /** Beat before the first word, in ms. Matches RevealText's `delay`. */
  delay?: number;
  /**
   * Whether this slot animates in. Off by default, because most eyebrows
   * on the site are plain paragraphs and a trail that faded up where a
   * label simply WAS is a change nobody asked for. The two mastheads that
   * did reveal their eyebrow pass it, and get the same word-rise they had.
   */
  reveal?: boolean;
  /**
   * A second, `aria-hidden` copy of a heading that some heroes draw for
   * the eye alone. It gets the words and none of the semantics: no `nav`,
   * no `aria-current`, and crucially no links — a hidden duplicate of
   * every crumb is two tab stops per crumb for anyone using the keyboard.
   */
  decorative?: boolean;
};

/**
 * The trail, in the first eyebrow of the page.
 *
 * ---- Why it is not a strip of its own ----
 *
 * It used to be: one absolutely-positioned line pinned under the navbar,
 * rendered once from the layout. That worked, and it cost a band of empty
 * page directly beneath a band of empty page — a strip of small caps
 * floating over the top of a hero it had no relationship with, on a site
 * whose whole opening move is a full-bleed frame with nothing over it.
 *
 * Every page here already opens with a small uppercase line above its
 * heading, saying where you are: EYEWEAR, CARE, THE HOUSE. That is
 * the trail's sentence, one crumb short. So the trail is set there instead
 * of above it — same scale, same colour, same reveal, one line instead of
 * two, and the last crumb IS the eyebrow the page would have written.
 *
 * Which means this is a drop-in for `<p className="t-eyebrow">{x}</p>`:
 * pass what the slot used to say as `label` and it survives wherever
 * `crumbsFor` has nothing to offer.
 */
export function CrumbEyebrow({
  label,
  as = "p",
  className,
  delay = 0,
  reveal = false,
  decorative = false,
}: CrumbEyebrowProps) {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  /* No trail for this route — the slot goes back to being an eyebrow, in
     the component the rest of the site's headings use, so the reveal is
     literally the same code rather than a copy of it. */
  if (!crumbs) {
    return reveal ? (
      <RevealText as={as} text={label} className={className} delay={delay} />
    ) : (
      createElement(as, { className }, label)
    );
  }

  const items: readonly Crumb[] = [...crumbs.trail, { label: crumbs.current }];

  if (decorative) {
    return (
      <p aria-hidden className={className}>
        {items.map((c) => c.label).join(" · ")}
      </p>
    );
  }

  return (
    <CrumbTrail
      items={items}
      className={className}
      delay={delay}
      reveal={reveal}
    />
  );
}

/**
 * Split out so the reveal hook is never called conditionally — the
 * no-trail branch above returns before this exists.
 *
 * Each crumb is its own `.reveal-word` box, so the trail rises one crumb
 * at a time exactly as a heading rises one word at a time. The separator
 * gets a box of its own at the same beat as the crumb it follows, so a
 * bullet is never left hanging in mid-air ahead of the word it belongs to.
 */
function CrumbTrail({
  items,
  className,
  delay,
  reveal,
}: {
  items: readonly Crumb[];
  className?: string;
  delay: number;
  reveal: boolean;
}) {
  /* Called either way — the hook only observes, and an element with no
     `data-reveal` has nothing for the observer to open. Calling it
     unconditionally is what keeps the two modes one component. */
  const ref = useReveal<HTMLElement>();
  const last = items.length - 1;

  /* Open scrolled to the end, so the current page's crumb is on screen
     and it is the trail behind it that runs off the left edge. Re-done on
     resize because the overflow, and so the end, moves with the width.
     The reader can still drag back to the start. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toEnd = () => {
      el.scrollLeft = el.scrollWidth;
    };
    toEnd();
    window.addEventListener("resize", toEnd);
    return () => window.removeEventListener("resize", toEnd);
  }, [ref]);

  return (
    <nav
      ref={ref}
      data-reveal={reveal ? "" : undefined}
      aria-label="Breadcrumb"
      className={className ? `crumb-eyebrow ${className}` : "crumb-eyebrow"}
    >
      <ol className="crumb-eyebrow-list">
        {items.map((crumb, i) => {
          /* Two boxes per crumb — the word and its bullet — so the beat
             counts boxes, not crumbs. */
          const beat = { "--d": `${delay + i * 2 * STEP_MS}ms` } as CSSProperties;
          return (
            <li key={`${crumb.label}-${i}`} className="crumb-eyebrow-item">
              <span className="reveal-word">
                <span style={beat}>
                  {crumb.href ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : i === last ? (
                    /* The page you are on. Never a link, one step
                       brighter, and the only crumb a screen reader is
                       told is the current one. */
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    /* A group with no page of its own — "The house" is a
                       heading in the menu, not a destination. Quiet like
                       the links beside it: what makes the last crumb the
                       bright one is being where you ARE, not being the
                       only one that isn't clickable. */
                    <span className="crumb-eyebrow-group">{crumb.label}</span>
                  )}
                </span>
              </span>
              {i < last ? (
                <span aria-hidden className="reveal-word crumb-eyebrow-sep">
                  <span style={beat}>·</span>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
