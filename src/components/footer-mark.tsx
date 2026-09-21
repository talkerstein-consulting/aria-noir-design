"use client";

import { useEffect, useRef, useState } from "react";

/** Mount once the mark's top edge has come this far up the viewport. */
const TRIGGER_AT = 0.9;

/**
 * The enlarged ARIA NOIR wordmark.
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
 *
 * ---- Why there are two files ----
 *
 * `aria-footer-anim.svg` is ARIA alone — the draw-in was authored on those
 * four letters and its viewBox is their bounding box. So the mark closing
 * every page on the site was half the logo: the house is ARIA NOIR and the
 * footer said ARIA.
 *
 * NOIR is added as its own file rather than by re-authoring the animation,
 * because the animation is the thing most likely to break and least
 * possible to check by reading. `noir-word.svg` is cut from
 * `aria-noir.svg` — the real lockup — so the letterforms are the logo's
 * own and not a typeface guess.
 *
 * ---- Where NOIR sits ----
 *
 * Measured off that lockup with `getBBox`, as fractions of ARIA's width:
 * NOIR is 40.04% wide, starts 30.47% in, and its top is 12.98% below
 * ARIA's baseline. Percentage margins resolve against the container's
 * WIDTH, so those three numbers hold the lockup's proportions at every
 * size without a media query or a measured height.
 *
 * (The footer file's 1320×309 is 4.272:1 and ARIA in the lockup is
 * 4.279:1 — the same box, which is what makes the fractions transferable.)
 */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [markup, setMarkup] = useState<string | null>(null);
  const [noir, setNoir] = useState<string | null>(null);

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
    /* Both halves of the lockup, together. NOIR is static and tiny (2kb
       against the animation's 15), and fetching it in the same pass means
       the two never arrive a frame apart — a mark that draws ARIA and
       then pops NOIR in underneath reads as a bug, not as a flourish. */
    Promise.all([
      fetch("/logo/aria-footer-anim.svg").then((r) => r.text()),
      fetch("/logo/noir-word.svg").then((r) => r.text()),
    ])
      .then(([aria, word]) => {
        if (cancelled) return;
        setMarkup(aria.replaceAll('"white"', '"currentColor"'));
        setNoir(word);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shown, markup]);

  return (
    <div ref={ref} className="mt-14 sm:mt-24" role="img" aria-label="Aria Noir">
      <div
      /* The colour comes from the ground, not from a hardcoded token. The
         fetched SVG's `white` is rewritten to `currentColor` above, so this
         one declaration is what decides whether the mark is drawn in ink or
         in paper — and it was `text-ink` until the footer learned to be
         black, at which point it was a black wordmark on a black footer:
         three hundred pixels of nothing closing every page on the site. */
        className="aspect-[1320/309] w-full text-[var(--fg-primary)] [&_svg]:h-full [&_svg]:w-full"
        {...(markup ? { dangerouslySetInnerHTML: { __html: markup } } : {})}
      />
      {/* The second line of the lockup. The three numbers are the
          measured fractions in the note above; margins in % resolve
          against the container's width, which is what keeps them true as
          the footer gets narrower. */}
      {noir ? (
        <div
          className="text-[var(--fg-primary)] [&_svg]:block [&_svg]:w-full"
          style={{
            width: "40.04%",
            marginInlineStart: "30.47%",
            marginBlockStart: "12.98%",
          }}
          dangerouslySetInnerHTML={{ __html: noir }}
        />
      ) : null}
    </div>
  );
}
