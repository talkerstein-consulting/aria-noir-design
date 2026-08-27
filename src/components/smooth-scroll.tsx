"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/**
 * Renders nothing — just arms the shared Lenis instance. The home page
 * calls the hook itself (gated behind its intro loader, so Lenis doesn't
 * fight the opening `scrollTo(0, 0)`); every other page has no loader to
 * wait for, so it just wants this always on. Without it a page falls back
 * to plain native scroll, which is why ARCA I felt different from home —
 * it never called the hook at all.
 */
export function SmoothScroll() {
  useSmoothScroll(true);
  useScrollToTop();
  return null;
}

/**
 * Every navigation arrives at the top.
 *
 * The App Router restores scroll position on its own, which is right for a
 * back button and wrong for a fresh page: follow a link from the foot of
 * the eyewear index and you land two thirds of the way down a page you have
 * never seen. Lenis makes it worse — it holds its own idea of the scroll
 * position, so even a plain `scrollTo(0, 0)` gets animated back to wherever
 * it thinks the page was.
 *
 * So both are reset, in a LAYOUT effect: after the DOM is committed and
 * before the browser paints, which is the difference between arriving at
 * the top and being seen to jump there.
 *
 * `immediate` on the Lenis call is load-bearing — its default is to ease,
 * and a page that scrolls itself to the top over a second is a page that
 * looks like it is being scrolled by someone else.
 */
function useScrollToTop() {
  const pathname = usePathname();

  /* Take the browser out of it, once. Chrome restores the previous scroll
     offset after a history entry is committed — which is AFTER the layout
     effect below has already put the page at the top, so the reset landed
     and was then quietly undone. Instrumenting it showed exactly that:
     scrollTop 0 immediately after the write, and the old offset back a
     moment later. `manual` is what stops that, and it is the correct
     setting for a site that is telling the browser where to be. */
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const top = () => {
      /* Lenis owns the number, so it is told first — resetting the document
         without telling it leaves the two disagreeing until the next wheel
         event. */
      window.__lenis?.scrollTo(0, { immediate: true, force: true });

      /* Then the document ITSELF, not `window.scrollTo`. Lenis proxies that
         method, so a call to it becomes another Lenis animation applied
         inside its rAF loop rather than now — and on a page that has not
         painted yet there is no loop to apply it. Setting scrollTop is the
         one write nothing intercepts. */
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    /* ---- Why this holds the top for a moment instead of setting it once ----
     *
     * Setting it once does not survive. Instrumenting the reset showed the
     * document at 0 immediately after the write and back at the previous
     * offset a few hundred milliseconds later — after the layout effect,
     * after a `setTimeout(0)`, and with `history.scrollRestoration` already
     * set to manual. Something downstream of the commit puts it back:
     * streaming finishes, a section measures itself, the router settles.
     *
     * Rather than guess which and race it, the top is simply HELD for a
     * short window. Whatever writes last during that window is overwritten
     * on the next tick, and the window is short enough that nothing else
     * can be happening yet.
     *
     * The hold yields instantly to a real gesture: if the reader has
     * started scrolling, they have taken over and the page must stop
     * arguing with them. That is the difference between a page that lands
     * at the top and a page that traps you there. */
    top();

    let hold = 0;
    const stop = () => {
      window.clearInterval(hold);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };

    hold = window.setInterval(top, 40);
    window.setTimeout(stop, 500);

    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });

    return stop;
  }, [pathname]);
}
