"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import type Snap from "lenis/snap";

/**
 * On a phone, make a pinned stage come to rest on a PANEL and never between
 * two of them.
 *
 * ---- Why this exists, and why only on a phone ----
 *
 * A wheel delivers scroll in small continuous increments, so a desktop
 * reader can stop anywhere and the frame they stop on is a frame the
 * composition was designed to be seen at. A thumb cannot do that: a swipe is
 * one shove plus momentum, and where it ends is decided by the flick, not by
 * the reader. On a stage whose whole job is to hold a composition still, that
 * means most releases land on a panel frozen halfway across the screen.
 *
 * So the phone gets snapping and the desktop does not. `sticky-panels`
 * already knows where every panel finishes arriving — those points are the
 * only places this stage looks composed — and hands them here.
 *
 * ---- Why `lenis/snap` and not CSS ----
 *
 * `scroll-snap-type` and Lenis both write `scrollTop`, and they fight on
 * every gesture: the browser pulls toward a snap point while Lenis animates
 * away from it, and the result reads as a page that will not settle.
 * `lenis/snap` is the same idea expressed through the one system that owns
 * the scroll position.
 *
 * ---- The settings ----
 *
 * `mandatory`, which is normally the wrong choice — it takes the scroll away
 * from the reader — and is the right one here because it is what was asked
 * for: one swipe, one panel, no midway state. It is confined to the track,
 * so the rest of the page scrolls freely; the only places it can pull to are
 * panels of this stage.
 *
 * `debounce` is short because the snap is meant to feel like the end of the
 * swipe rather than a correction arriving after it. `lerp` is low so that
 * when it does move it glides the last stretch instead of yanking.
 */
export function usePanelSnap(
  track: RefObject<HTMLElement | null>,
  /** Fractions of the track's SCROLLED distance where a panel is fully in. */
  holds: readonly number[],
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !holds.length) return;
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let snap: Snap | null = null;
    let cancelled = false;
    /* `add` hands back its own unsubscribe. Kept so the points can be
       recomputed on a resize without tearing the instance down — a phone
       hiding its address bar changes every svh in the track, and every one
       of these offsets is derived from the track's height. */
    let drop: (() => void)[] = [];

    const place = (instance: Snap) => {
      for (const off of drop) off();
      drop = [];
      const el2 = track.current;
      if (!el2) return;
      /* Page coordinates, computed the same way the stage's own progress
         is: the track's top plus a fraction of the distance it actually
         scrolls, which is its height minus the one screen the sticky child
         holds. */
      const top = el2.getBoundingClientRect().top + window.scrollY;
      const scrolled = el2.offsetHeight - window.innerHeight;
      if (scrolled <= 0) return;
      drop = holds.map((h) => instance.add(Math.round(top + h * scrolled)));
    };

    const onResize = () => {
      if (snap) place(snap);
    };

    /* Imported at use rather than at module scope: this is dead weight on
       every desktop, and on a phone it is wanted only for the stages that
       actually pin. */
    import("lenis/snap")
      .then(({ default: Snap }) => {
        const lenis = window.__lenis;
        if (cancelled || !lenis) return;

        const instance = new Snap(lenis, {
          type: "mandatory",
          lerp: 0.08,
          duration: 0.6,
          /* Long enough that it waits for the swipe's momentum to run out,
             short enough that it reads as the swipe finishing rather than
             the page correcting itself a moment later. */
          debounce: 220,
        });

        /* No `ignoreSticky` here, though it is the option you reach for on a
           page with pinned stages. It is not a constructor option in this
           version — reading lenis-snap.d.ts rather than the docs, the
           constructor takes type, lerp, easing, duration, distanceThreshold,
           debounce and the two callbacks, and `ignoreSticky` belongs to
           `addElement`. It would have been ignored silently. It is not
           needed either: nothing is registered as an ELEMENT here, only the
           explicit offsets below, so the stage cannot become a target of its
           own accord.

           `distanceThreshold` is likewise absent on purpose — the type notes
           it is ignored under `mandatory`, which is the point of mandatory. */

        snap = instance;
        place(instance);
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
      })
      .catch(() => {
        /* No snap is a worse phone experience, not a broken one: the stage
           still scrolls and still composes, it just no longer guarantees
           where a swipe ends. Nothing here is worth a thrown error. */
      });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      for (const off of drop) off();
      snap?.destroy();
    };
  }, [track, holds, enabled]);
}
