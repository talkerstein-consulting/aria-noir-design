"use client";

import { useEffect, useRef, useState } from "react";

/** Colourways with a 72-frame turntable in /images/spin/<stem>/00..71.webp. */
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

const FRAMES = 72;
/** The frame that matches the tiles' hover view (the quarter, 30 degrees). */
const START = 6;
/** Pixels of drag per frame. */
const DRAG_PX = 8;

/**
 * The turntable as an image sequence: 72 renders, one every 5 degrees,
 * drawn onto a canvas. It opens on the quarter view and turns only under a
 * drag. The renders are flattened onto white, so the canvas multiplies
 * onto the tile and the white takes the tile's grey.
 */
export function SpinPlate({ stem, alt }: { stem: string; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let alive = true;
    let pos = START;
    let shown = -1;
    let drag: { x: number; at: number } | null = null;

    const frames = Array.from({ length: FRAMES }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `/images/spin/${stem}/${String(i).padStart(2, "0")}.webp`;
      return img;
    });

    const draw = (i: number) => {
      const img = frames[i];
      if (!img.complete || !img.naturalWidth) return;
      if (cv.width !== img.naturalWidth) {
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
      shown = i;
    };

    const first = frames[START];
    const open = () => alive && shown < 0 && (draw(START), setReady(true));
    if (first.complete) open();
    else first.addEventListener("load", open, { once: true });

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, at: pos };
      cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      pos = drag.at - (e.clientX - drag.x) / DRAG_PX;
      const i = ((Math.round(pos) % FRAMES) + FRAMES) % FRAMES;
      if (i !== shown) draw(i);
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
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    };
  }, [stem]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={alt}
      className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain mix-blend-multiply transition-opacity duration-500 active:cursor-grabbing"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
