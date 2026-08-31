"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether an element is anywhere near the viewport.
 *
 * ---- What this is for ----
 *
 * react-three-fiber's `<Canvas>` defaults to `frameloop="always"`, which
 * means it renders sixty times a second for as long as it is mounted —
 * whether or not anyone can see it. Nothing on this site sets that prop, so
 * every WebGL scene was rendering continuously for the whole visit: a
 * full-screen antialiased scene with an environment map, still drawing ten
 * screens after the reader had scrolled past it, on the home page, on both
 * story pages and on every buy page.
 *
 * A GPU doing that is a GPU not available to everything else, and the
 * symptom is not a stuttering model — the model looks fine. The symptom is
 * that the whole page feels heavy: scrolling, the Lenis loop, the scrubbed
 * film and the reveal passes all share a main thread and a compositor with
 * a scene nobody is looking at.
 *
 * ---- Why a margin ----
 *
 * The scene is started BEFORE it arrives. Waiting for the element to touch
 * the viewport would mean the first frame a reader sees is the first frame
 * the renderer has drawn — and with a glb to fit and an environment to
 * convolve, that first frame is not free. Half a screen of warning is
 * enough to have it drawn and steady by the time it is on screen.
 *
 * ---- Why IntersectionObserver and not scroll ----
 *
 * This is the one question an observer answers better than a scroll
 * handler: it is asked by the browser off the main thread, it fires only on
 * a change of state rather than on every frame, and being wrong for a
 * moment costs nothing here — the worst case is one extra rendered frame or
 * one missed one, on a decorative object.
 */
export function useOnScreen(
  ref: RefObject<Element | null>,
  /** How far outside the viewport still counts, as a CSS margin. */
  margin = "50% 0px",
) {
  /* Starts true, and that is deliberate: a scene that is above the fold
     must render on the first frame, and an observer's first callback
     arrives after paint. Being wrong in this direction costs one frame of
     rendering a scene that turns out to be off screen; being wrong in the
     other shows the reader an empty canvas. */
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return onScreen;
}
