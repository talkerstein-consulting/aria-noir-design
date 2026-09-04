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
  /**
   * What to answer before the observer has reported.
   *
   * Defaults to TRUE, and for the original caller that is deliberate: a
   * scene above the fold must render on the first frame, and an observer's
   * first callback arrives after paint. Being wrong in that direction
   * costs one frame of rendering a scene that turns out to be off screen;
   * being wrong the other way shows the reader an empty canvas.
   *
   * Pass FALSE when the answer gates WORK RATHER THAN PIXELS — fetching,
   * decoding, anything the reader is not currently owed. There the two
   * errors are not symmetrical at all: a hopeful `true` means the work
   * starts at mount for an element most of a page away, which is precisely
   * what the gate was added to prevent. ProductOffering's acetate preload
   * is the case this was added for.
   */
  initial = true,
) {
  const [onScreen, setOnScreen] = useState(initial);

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

/**
 * Whether a WebGL canvas should be rendering.
 *
 * Not the same question as "is it on screen", and the difference is a bug I
 * shipped by assuming it was. `frameloop="never"` does not merely skip
 * frames — react-three-fiber sizes its canvas and builds its scene on the
 * first render, so a Canvas that mounts already switched off never sets
 * itself up at all. The observable symptom is a canvas left at its default
 * 300x150 with nothing in it, which is exactly what happened: every scene
 * on this site mounts below the fold, so the gate turned it off before it
 * had drawn once.
 *
 * So a scene renders until it has been SEEN, and only then becomes
 * pausable. That keeps the saving where almost all of it was — a page is
 * long, and a scene the reader has scrolled past is the one that used to go
 * on drawing for the rest of the visit — while never withholding the first
 * frame from a scene that has not had one.
 */
export function useRenderGate(
  ref: RefObject<Element | null>,
  margin = "50% 0px",
) {
  /* Starts true so the first paint renders — see above. */
  const [render, setRender] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    /* `seen` is a closure variable rather than state or a ref: it is read
       and written only inside the observer callback, so it never needs to
       participate in a render, and keeping it here is what lets the whole
       decision be made in the one place React is happy to see a setState —
       a subscription callback. */
    let seen = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) seen = true;
        setRender(entry.isIntersecting || !seen);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return render;
}
