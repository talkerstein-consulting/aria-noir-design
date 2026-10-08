"use client";

import { useEffect, useRef } from "react";
import ImageTrail from "./ImageTrail";
import { finale } from "@/lib/content";
import { CtaLink } from "@/components/cta-link";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Closing section, in LIGHT mode — the page hands over from ink to paper in
 * the gradient at the foot of the gallery, so this section and the footer are
 * plainly light rather than carrying the blend themselves.
 *
 * The pointer trail is deliberately scoped to the quote block only: it is
 * absolutely positioned inside the quote zone, so it ends at the last line of
 * type and can never reach the CTA beneath. Within that zone it sits ABOVE
 * the type (z-20 vs z-10), so images pass over the letterforms.
 */
export function FinaleSection() {
  const quote = useRef<HTMLQuoteElement>(null);

  /* The big type fades up on ordinary scroll once the wipe has handed over. */
  useEffect(() => {
    const el = quote.current;
    if (!el) return;

    const update = () => {
      const vh = window.innerHeight;
      const p = clamp01((vh - el.getBoundingClientRect().top) / (vh * 0.55));
      el.style.opacity = String(p);
      el.style.transform = `translateY(${(1 - easeOutCubic(p)) * 5}vh)`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section
      /* Top padding is in vh, not the shared SECTION_PAD: it sets where the
         quote lands on the frame timeline (~1467) and has to hold that
         relationship as the viewport changes. */
      /* No background of its own — the white comes from the iris, which is a
         fixed layer already covering the viewport by the time this arrives.
         Giving this section bg-paper would put a hard horizontal edge at the
         section boundary, cutting the black off in a straight line instead of
         letting the circle be the only transition. */
      /* `on-paper` declares the ground: it is what the type recipes read,
         and it is what the fixed nav probes to know it must go dark here. */
      className="on-paper relative z-[38] overflow-hidden px-6 pt-[16vh] pb-20 text-ink sm:px-10 sm:pt-[29vh] sm:pb-48"
    >
      {/* ---- quote zone: the trail's full extent ---- */}
      <div className="relative">
        {/* `isolate` traps ImageTrail's own z-index: 100 inside this wrapper,
            so the z-20 here is what actually decides its stacking. */}
        <div className="absolute inset-0 z-20 isolate" aria-hidden>
          <ImageTrail items={finale.trail} variant={1} />
        </div>

        <blockquote
          ref={quote}
          className="pointer-events-none relative z-10 mx-auto max-w-5xl text-center will-change-transform"
          style={{ opacity: 0 }}
        >
          {finale.lines.map((line) => (
            <p
              key={line}
              className="font-display text-[clamp(24px,7.4vw,132px)] leading-[0.94] font-normal tracking-tight text-ink uppercase"
            >
              {line}
            </p>
          ))}
        </blockquote>
      </div>

      {/* ---- the way on: outside the quote zone, so the trail never covers it ---- */}
      <div className="relative z-30 mx-auto mt-24 flex justify-center sm:mt-32">
        <CtaLink href="/eyewear">See the collections</CtaLink>
      </div>
    </section>
  );
}
