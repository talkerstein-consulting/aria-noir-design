"use client";

import { useEffect, useRef } from "react";
import { DOT_START_VH, DOT_END_VH } from "@/lib/timeline";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Dark → light handoff, as a FIXED overlay rather than a section of its own.
 *
 * That distinction is the point: a section would have taken scroll length and
 * pushed the closing content down, whereas this expands over the tail of the
 * gallery while the gallery keeps scrolling underneath.
 *
 * Sits at z-37 — same as the gallery, but later in the DOM, so it covers it —
 * while the closing sections at z-38+ scroll over the top of it. Since those
 * are already `bg-paper`, the page simply stays white once the dot lands.
 *
 * The circle is sized in `vmax` so its diameter always exceeds the viewport
 * diagonal at scale 1, whatever the aspect ratio.
 */
export function WhiteDotOverlay({ anchorId = "gallery" }: { anchorId?: string }) {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(anchorId);
      if (!dot.current || !el) return;

      /* Anchored to the gallery ENDING rather than to a fraction of its
         height. Measured in viewport heights off the section's bottom edge,
         not as a percentage of it: a percentage means a tall gallery starts
         wiping while there is still a screen or two of photographs left to
         read, and the taller the section grows the earlier it eats itself.
         `from` is the moment the last row is fully on screen; the wipe then
         runs over the following viewport of scroll. */
      const top = el.getBoundingClientRect().top + window.scrollY;
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      const from = top + h - vh * DOT_START_VH;
      const to = top + h - vh * DOT_END_VH;

      const t = easeInOutCubic(clamp01((window.scrollY - from) / (to - from)));
      dot.current.style.transform = `translate(-50%, -50%) scale(${t})`;

      /* ---- Promoted only while it is actually moving ----
      
         This element is 150vmax square — 2160x2160 on a 1440 desktop, 4.7
         megapixels, which is 19MB of compositor layer at dpr 1 and 75MB at
         dpr 2. `will-change: transform` in the class list held that layer
         for the entire visit so that a circle could grow once, over one
         screen of scroll, near the end of the page. It was the single
         largest promoted layer on the site and it was idle for almost all
         of it.
      
         Promotion is worth having WHILE it runs — the whole point is a
         full-screen scale that must not repaint — so it is switched on at
         the first frame of the wipe and off again at either end. Writing
         the same string on every scroll tick is free; the browser only acts
         on a change. */
      const moving = t > 0 && t < 1;
      dot.current.style.willChange = moving ? "transform" : "auto";

      /* Scrollbar flips white-track/black-handle once the iris has fully
         landed (t===1, the same instant the page turns light — frame 1421 at
         the design viewport). Piggybacks on this handler's own scroll tick
         instead of adding a 7th listener; the audit already flagged six
         independent ones as the thing to fix, not grow. */
      document.documentElement.classList.toggle("light-scroll", t >= 1);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      /* And put the flag back.
         `light-scroll` says "the iris has landed and the viewport is white
         right now". It is written to <html>, which outlives this component,
         so leaving it set on unmount hands every page navigated to
         afterwards a lie about its own ground — and the header believes it
         over anything it can see, because the iris is pointer-events:none
         and this flag is the only way to know about it.

         The symptom was a black page with a black header: scroll into the
         home page's white finale, open the menu, go anywhere, and the nav
         is ink type on ink for the rest of the session. Easiest to hit on a
         phone, where the menu is how you navigate and the finale is the
         last thing before the footer. */
      document.documentElement.classList.remove("light-scroll");
    };
  }, [anchorId]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[37] overflow-hidden"
    >
      <div
        ref={dot}
        className="absolute top-1/2 left-1/2 aspect-square w-[150vmax] rounded-full bg-paper"
        style={{ transform: "translate(-50%, -50%) scale(0)" }}
      />
    </div>
  );
}
