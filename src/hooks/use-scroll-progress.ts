"use client";

import { useEffect, type RefObject } from "react";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Progress of an element through the viewport, 0 → 1, measured from when its
 * top hits the top of the screen to when its bottom does. Intended for tall
 * sections holding a `sticky` stage.
 *
 * The callback writes straight to the DOM — nothing here goes through React
 * state, so scrolling never triggers a render.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      onProgress(travel > 0 ? clamp01(-rect.top / travel) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, onProgress]);
}
