"use client";

import { useEffect, useRef, useState } from "react";
import { spinScaleFor } from "@/lib/turntable";

/**
 * Colourways with a rendered turntable in /images/spin/<stem>/000..179.webp.
 *
 * Jai's Blender renders, Nov 2026: 1600px wide, one frame every 2 degrees,
 * imported by scripts/import-showcase-turntables.mjs (which reads this list,
 * so a stem added here is the stem it fetches next run).
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

const FRAMES = 180;
/** The frame that matches the tiles' hover view (the quarter, 30 degrees). */
const START = 15;
/** Pixels of drag per frame (2 degrees). */
const DRAG_PX = 4;
/** A slow, deliberate turn: 18 degrees a second, 20s a revolution. */
const DEG_PER_SEC = 18;
const FRAMES_PER_SEC = (DEG_PER_SEC * FRAMES) / 360;

/** Fetch order: a coarse ring first so the turn is possible at once, then
 *  the gaps. Every 15th frame, then every 5th, then the rest. */
function loadOrder() {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [15, 5, 1]) {
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

    const frames: HTMLImageElement[] = new Array(FRAMES);
    for (const i of loadOrder()) {
      const img = new Image();
      img.decoding = "async";
      img.src = `/images/spin/${stem}/${String(i).padStart(3, "0")}.webp`;
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

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={alt}
      className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain mix-blend-multiply transition-opacity duration-500 active:cursor-grabbing [transform:scale(var(--spin-m,1))] lg:[transform:scale(var(--spin-d,1))]"
      style={
        {
          opacity: ready ? 1 : 0,
          "--spin-m": scale.mobile,
          "--spin-d": scale.desktop,
        } as React.CSSProperties
      }
    />
  );
}
