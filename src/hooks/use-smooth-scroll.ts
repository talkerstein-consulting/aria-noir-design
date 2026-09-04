"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Whether this device gets the inertia layer at all.
 *
 * Two devices are refused it, for the same reason from opposite ends:
 *
 *  - reduced motion, because the whole point of Lenis is motion the reader
 *    did not ask for;
 *  - touch, because there is nothing here to improve. `syncTouch` is off,
 *    so a finger already scrolls natively — Lenis contributes a rAF loop
 *    running every frame of every scroll and a wheel handler nothing on a
 *    phone will ever fire. That is a main-thread cost with no effect, on
 *    the devices least able to pay it.
 *
 * A coarse pointer is the test rather than a width, because the question
 * is "does this scroll with a finger", not "is this window narrow" — a
 * narrow desktop window still has a wheel, and a tablet in landscape still
 * does not.
 */
function wantsSmoothScroll() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  return !window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Global inertia scrolling — the page keeps gliding for a beat after the wheel
 * is released.
 *
 * Lenis scrolls the real document (it sets scrollTop rather than transforming
 * the body), so `position: sticky`, native `scroll` events, and every existing
 * scroll listener in this project keep working untouched.
 *
 * `enabled` is false during the loader: the opening owns the scroll position
 * then, and a smooth-scroll layer would fight its `scrollTo(0, 0)`.
 *
 * The library is imported INSIDE the effect rather than at the top of the
 * file, so a phone never downloads, parses or executes it — the decision
 * above is made before the request. Everything that reads `window.__lenis`
 * already treats it as optional, which is what a page without it looks
 * like: plain native scroll.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (!wantsSmoothScroll()) return;

    let lenis: Lenis | undefined;
    let raf = 0;
    /* The import is a round trip; the effect can be torn down inside it. */
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
        smoothWheel: true,
        syncTouch: false, // native momentum is better on touch
        anchors: true,
      });
      window.__lenis = lenis;

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, [enabled]);
}
