"use client";

import { useEffect, useRef, useState } from "react";

/** Mount once the mark's top edge has come this far up the viewport. */
const TRIGGER_AT = 0.9;

/**
 * The enlarged ARIA wordmark.
 *
 * The SVG is INLINED rather than used as an <img> or a CSS mask:
 *  - a mask never runs the keyframes embedded in the file at all;
 *  - inside an <img> they do run, but the parent document cannot inspect or
 *    control them, and every path rests at opacity 0 until the animation
 *    plays — so any failure to start leaves an invisible logo with no way to
 *    tell from out here.
 *
 * Inlining puts the paths in this document, so the draw-in is inspectable and
 * `white` can be swapped for `currentColor` — which also retires the invert
 * filter the light footer previously needed.
 *
 * It is fetched on first reveal, so the animation begins as the footer
 * arrives rather than on page load.
 */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;

    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * TRIGGER_AT) {
        setShown(true);
      }
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [shown]);

  useEffect(() => {
    if (!shown || markup) return;
    let cancelled = false;
    fetch("/logo/aria-footer-anim.svg")
      .then((r) => r.text())
      .then((svg) => {
        if (cancelled) return;
        setMarkup(svg.replaceAll('"white"', '"currentColor"'));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shown, markup]);

  return (
    <div
      ref={ref}
      className="mt-24 aspect-[1320/309] w-full text-ink [&_svg]:h-full [&_svg]:w-full"
      role="img"
      aria-label="Aria Noir"
      {...(markup ? { dangerouslySetInnerHTML: { __html: markup } } : {})}
    />
  );
}
