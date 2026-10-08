"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AriaWordmark } from "@/components/aria-wordmark";

/**
 * Every page change, the same as the first visit: the black comes up with
 * the logo on it, holds for a minimum time, and then the logo flies into
 * the navbar while the black fades away. The first-visit version lives in
 * layout.tsx (BOOT_LIFT); this is its twin for route changes, so every load
 * ends the same way.
 *
 * ---- Phases ----
 *
 *   cover  black sheet, logo fading up in the middle (ROUTE_MIN_MS)
 *   morph  the logo is measured against the nav's and moved onto it while
 *          the sheet fades (MORPH_MS)
 *   off    unmounted
 *
 * ---- Why it lives in the layout ----
 *
 * `app/loading.tsx` is a Suspense fallback and is replaced in one commit
 * with no exit, so it cannot animate out. This component survives every
 * route change, so it owns the exit.
 *
 * ---- useLayoutEffect ----
 *
 * The cover has to be up in the same frame the new route commits, or one
 * frame of the new page shows before it. A layout effect runs before that
 * paint.
 *
 * ---- The first render does nothing ----
 *
 * A full page load has no previous route; the boot loader in layout.tsx
 * handles that one.
 */

/** Minimum time the logo is shown before it moves. */
const ROUTE_MIN_MS = 800;
/** Matches the transform transition on `.route-cover` (house.css). */
const MORPH_MS = 850;

export function RouteWipe() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const mark = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<"off" | "cover" | "morph">("off");

  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setPhase("cover");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let done = 0;
    let svg: SVGElement | null = null;
    const hand = (e?: TransitionEvent) => {
      if (e && e.propertyName !== "transform") return;
      clearTimeout(done);
      setPhase("off");
    };

    const toMorph = window.setTimeout(() => {
      svg = mark.current?.querySelector("svg") ?? null;
      const n = document.querySelector<SVGElement>(".site-nav .nav-mark svg");
      if (!svg || !n || still) {
        setPhase("off");
        return;
      }
      const a = svg.getBoundingClientRect();
      const b = n.getBoundingClientRect();
      if (!a.width || !b.width) {
        setPhase("off");
        return;
      }
      /* Width, not scale: redrawn crisp at every size, landing
         pixel-identical to the nav's mark. The cover centres it, so the
         centre holds still as it shrinks and the translate stays true. */
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      svg.addEventListener("transitionend", hand);
      setPhase("morph");
      requestAnimationFrame(() => {
        if (!svg) return;
        svg.style.width = `${b.width}px`;
        svg.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      /* Hand over on the transition's end; this is only the safety net. */
      done = window.setTimeout(() => setPhase("off"), MORPH_MS + 250);
    }, still ? 200 : ROUTE_MIN_MS);

    return () => {
      clearTimeout(toMorph);
      clearTimeout(done);
      svg?.removeEventListener("transitionend", hand);
    };
  }, [pathname]);

  if (phase === "off") return null;

  return (
    <div aria-hidden className="route-cover" data-phase={phase}>
      <span ref={mark} className="route-cover-mark">
        <AriaWordmark className="site-loading-mark text-paper" />
      </span>
    </div>
  );
}
