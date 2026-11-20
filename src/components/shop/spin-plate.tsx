"use client";

/* Renamed: this file also uses the DOM's own Image constructor to fetch
   frames, and `Image` from next/image would shadow it. */
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { spinScaleFor } from "@/lib/turntable";

/**
 * Colourways with a rendered turntable in /images/spin/<stem>/000..359.avif.
 *
 * Jai's Blender renders, Nov 2026: served at 1200px as AVIF, one frame a
 * degree, imported by scripts/import-showcase-turntables.mjs (which reads this
 * list, so a stem added here is the stem it fetches next run).
 */
export const SPIN = new Set([
  "ahava-black",
  "ahava-caramel-stripe",
  "ahava-noir",
  "ahava-root-beer-float",
  "ahava-rose",
  "ahava-tutti-frutti",
  "arca-i-309-blue",
  "arca-ii-caramel-stripe",
  "arca-ii-dark-tortoise",
  "arca-ii-dreamy-rose",
  "arca-ii-noir",
  "arca-ii-pixie-dust",
  "arca-ii-root-beer-float",
  "arca-ii-tutti-frutti",
  "arca-ii-velvet-rose",
  "arca-i-k-black",
  "arca-i-proceso-brown",
  "arca-i-z-white",
  "matriarca-brown",
  "matriarca-noir",
  "monarca-caramel-stripe",
  "monarca-dark-tortoise",
  "monarca-dreamy-rose",
  "monarca-noir",
  "monarca-pixie-dust",
  "monarca-tutti-frutti",
  "monarca-velvet-rose",
  "patriarca-black",
  "patriarca-brown",
  "patriarca-midnight-noir",
]);

/**
 * One frame per degree, as the renders and the showcase have.
 *
 * This was 180 — every second degree — on the argument that 2 degrees is
 * finer than a drag can resolve. It is not: at 180 the turn visibly steps
 * ("this is glitchy … can we not just make it super smooth" — Raviv,
 * 20 Nov). The showcase serves 360 for every set; the site now matches it,
 * and scripts/import-showcase-turntables.mjs writes 000..359.
 *
 * Everything below is expressed in terms of FRAMES rather than in frame
 * counts, so this constant is the only place the resolution lives.
 */
const FRAMES = 360;
/** The frame that matches the tiles' hover view (the quarter, 30 degrees). */
const START = Math.round((30 / 360) * FRAMES);
/** Pixels of drag per degree of turn. */
const DRAG_PX = 2;
/** A slow, deliberate turn: 18 degrees a second, 20s a revolution. */
const DEG_PER_SEC = 18;
const FRAMES_PER_SEC = (DEG_PER_SEC * FRAMES) / 360;

/** Fetch order: a coarse ring first so the turn is possible at once, then
 *  the gaps. At 360 frames that is every 30th, then every 10th, then every
 *  second, then the rest — four passes rather than three, because twice
 *  the frames means twice as long before the last one lands and the first
 *  usable ring has to arrive just as early. */
function loadOrder() {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [30, 10, 2, 1]) {
    for (let i = 0; i < FRAMES; i += step) {
      const f = (START + i) % FRAMES;
      if (!seen.has(f)) {
        seen.add(f);
        order.push(f);
      }
    }
  }
  return order;
}

/**
 * The turntable as an image sequence, drawn onto a canvas.
 *
 * No play button: it turns slowly on its own while it is on screen, stops
 * for good the moment it is grabbed (the reader has taken it), and never
 * moves for a reader who asks for reduced motion. Off screen it does no
 * work. The renders are flattened onto white, so the canvas multiplies onto
 * whatever ground it stands on.
 *
 * `house` picks the per-house size knob (see SPIN_SCALE in lib/turntable):
 * the render is scaled inside its box, so the frame grows without the
 * layout around it moving.
 */
export function SpinPlate({ stem, alt, house }: { stem: string; alt: string; house?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  /* Frames in, out of FRAMES. Drives the fill under the plate and how far
     up from its holding opacity the picture has come. */
  const [progress, setProgress] = useState(0);
  const scale = spinScaleFor(house ?? stem);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let alive = true;
    let pos = START;
    let shown = -1;
    let drag: { x: number; at: number } | null = null;
    let held = false; /* grabbed once: the reader has it now */
    let visible = false;
    let raf = 0;
    let last = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* A colourway swap starts its own load: the plate goes back to its
       holding opacity and the fill back to empty rather than carrying the
       last set's count. */
    setReady(false);
    setProgress(0);

    const frames: HTMLImageElement[] = new Array(FRAMES);
    let arrived = 0;
    /* One state write a frame at 360 frames is 360 renders for nothing;
       the fill is posted in hundredths, which is finer than the track is
       wide. */
    let posted = 0;
    const count = () => {
      arrived++;
      const now = arrived / FRAMES;
      if (now - posted >= 0.01 || arrived === FRAMES) {
        posted = now;
        if (alive) setProgress(now);
      }
    };
    for (const i of loadOrder()) {
      const img = new Image();
      img.decoding = "async";
      /* AVIF: about half of WebP's bytes for the same turn, and the plate
         asks for every one of 360 frames (see the note in
         scripts/import-showcase-turntables.mjs). There is no second copy
         on disk, so Safari 15 and older get no plate. */
      img.src = `/images/spin/${stem}/${String(i).padStart(3, "0")}.avif`;
      if (img.complete && img.naturalWidth > 0) count();
      else {
        img.addEventListener("load", count, { once: true });
        /* A 404 or a failed decode still has to move the fill, or it would
           stop short of the end and never clear. */
        img.addEventListener("error", count, { once: true });
      }
      frames[i] = img;
    }
    const loaded = (i: number) => frames[i].complete && frames[i].naturalWidth > 0;

    /* The nearest frame that has arrived, so the turn never stalls on a
       frame still in flight. */
    const nearest = (i: number) => {
      for (let d = 0; d < FRAMES / 2; d++) {
        if (loaded((i + d) % FRAMES)) return (i + d) % FRAMES;
        if (loaded((i - d + FRAMES) % FRAMES)) return (i - d + FRAMES) % FRAMES;
      }
      return -1;
    };

    const draw = (want: number) => {
      const i = nearest(want);
      if (i < 0 || i === shown) return;
      const img = frames[i];
      if (cv.width !== img.naturalWidth) {
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
      }
      /* Cleared first: drawing one over the last left the previous angles
         showing through as a trail. */
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0);
      /* Reveal on the first frame drawn, whichever it is. Waiting for the
         START frame's load event raced the turn: if the turn drew another
         frame first, `open` bailed and the canvas stayed at opacity 0. */
      if (shown < 0) setReady(true);
      shown = i;
    };
    const index = () => ((Math.round(pos) % FRAMES) + FRAMES) % FRAMES;

    const tick = (now: number) => {
      raf = 0;
      if (!alive || held || drag || !visible || reduced.matches) return;
      if (last) pos += ((now - last) / 1000) * FRAMES_PER_SEC;
      last = now;
      draw(index());
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      if (raf || held || !visible || reduced.matches) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const first = frames[START];
    const open = () => {
      if (!alive) return;
      if (shown < 0) draw(START);
      run();
    };
    if (first.complete) open();
    else first.addEventListener("load", open, { once: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) run();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(cv);
    const onMotion = () => (reduced.matches ? stop() : run());
    reduced.addEventListener("change", onMotion);

    const down = (e: PointerEvent) => {
      held = true;
      stop();
      drag = { x: e.clientX, at: pos };
      cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      /* The front follows the pointer: frames advance as the near face
         turns to the right, so a drag right steps forward. */
      pos = drag.at + (e.clientX - drag.x) / DRAG_PX;
      draw(index());
    };
    const up = () => {
      drag = null;
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);

    return () => {
      alive = false;
      stop();
      io.disconnect();
      reduced.removeEventListener("change", onMotion);
      first.removeEventListener("load", open);
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      /* Drop the queue: a colourway swap should not keep fetching the last one. */
      for (const img of frames) if (img && !img.complete) img.src = "";
    };
  }, [stem]);

  /* The holding state: the first frame to land is shown faint, and the
     picture comes up to full as the set fills in. Full at half the frames
     — by then the turn is smooth and the reader is looking at a finished
     object, not a loading one. */
  const lit = 0.4 + 0.6 * Math.min(1, progress / 0.5);
  const settled = progress >= 1;

  return (
    <>
      {/* Something to look at while 360 frames are in flight: the same
         cut-out still the tiles use, held faint under the plate and gone
         the moment the first frame is drawn. The callers' own still is
         switched off wherever a turntable runs, so this is the only one. */}
      <NextImage
        src={`/images/fronts-cut/${stem}.webp`}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
        priority
        className="object-contain p-[8%] mix-blend-multiply transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 0.35 }}
      />
      <canvas
        ref={canvas}
        role="img"
        aria-label={alt}
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain mix-blend-multiply transition-opacity duration-500 active:cursor-grabbing [transform:scale(var(--spin-m,1))] lg:[transform:scale(var(--spin-d,1))]"
        style={
          {
            opacity: ready ? lit : 0,
            "--spin-m": scale.mobile,
            "--spin-d": scale.desktop,
          } as React.CSSProperties
        }
      />
      {/* How much of the turn has arrived. A hairline on the plate's own
          floor, in the same grey as the drag hint; it clears itself once
          the last frame is in rather than sitting there full. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] bottom-0 h-px bg-ink/10 transition-opacity duration-700"
        style={{ opacity: ready && !settled ? 1 : 0 }}
      >
        <div
          className="h-full origin-left bg-ink/40 transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </>
  );
}
