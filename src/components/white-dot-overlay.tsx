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
    };
  }, [anchorId]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[37] overflow-hidden"
    >
      <div
        ref={dot}
        className="absolute top-1/2 left-1/2 aspect-square w-[150vmax] rounded-full bg-paper will-change-transform"
        style={{ transform: "translate(-50%, -50%) scale(0)" }}
      />
    </div>
  );
}
