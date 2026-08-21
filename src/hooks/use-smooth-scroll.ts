"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
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
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      syncTouch: false, // native momentum is better on touch
      anchors: true,
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [enabled]);
}
