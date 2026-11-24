"use client";

/* Renamed: this file also uses the DOM's own Image constructor to fetch
   frames, and `Image` from next/image would shadow it. */
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { QUARTER, spinFrame, spinScaleFor } from "@/lib/turntable";

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
/** The frame that matches the tiles' hover view, and the still the story
 *  page's counter stands on: the quarter. See QUARTER in lib/turntable. */
const START = Math.round((QUARTER / 360) * FRAMES);
/** Pixels of drag per degree of turn. */
const DRAG_PX = 2;

/**
 * Frames a second for the turn of its own.
 *
 * One frame per degree, so 30fps is thirty degrees a second and a full
 * revolution in twelve. The old walk was 18 degrees a second against a
 * 180-frame set — nine frames a second, which is where the stepping came
 * from. At one frame a degree, 30 is the rate the renders were made for.
 *
 * Advanced from elapsed TIME, not once per animation frame: a 120Hz
 * laptop and a 60Hz monitor would otherwise turn the object at two
 * different speeds, and a frame the browser drops would slow it down
 * rather than skip it.
 */
const FPS = 30;

/** How much of the turn has to be in hand before it starts walking.
 *
 *  `nearest` will always find something to draw, so a walk that began on
 *  frame one would still move — in lurches, snapping between whichever
 *  frames had landed. A quarter of the set is the first point at which
 *  the gaps are small enough to read as a turn rather than as a stutter,
 *  and on the coarse-first load order (every 30th, then every 10th) it
 *  arrives within a second or so. */
const WALK_AT = 0.25;

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
 * No play button: it opens on the quarter — the frame every tile and
 * still on the site agrees on — and then turns on its own at 30fps, one
 * frame a degree, twelve seconds a revolution. A finger takes it over at
 * any point and the walk resumes from wherever the finger left it. It
 * holds still while it is off screen and under reduced motion. See the
 * note by `open` below for why it stands still no longer, and FPS for
 * why the rate is what it is.
 *
 * The renders are flattened onto white, so the canvas multiplies onto
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

    /* ---- It turns by itself again, at 30fps ----

       It was parked at the quarter and moved only under a finger (Rems,
       24 Nov). The reason given was the frame the reader arrives on: the
       story page's counter stood on frame 030 and handed this page over
       at that exact angle, so a plate that started turning on mount had
       moved the object between the last frame of one page and the first
       frame of the next — the one difference that hand-off could not
       hide.

       That counter does not exist any more. The story page ends at the
       faces and opens this one through a wipe (see StoryHandoff), which
       shares no frame with it and so has nothing to keep still for. The
       objection went with the thing it was protecting.

       So the turn is back, at the rate the renders were made for. It
       still opens ON the quarter, so the first thing seen is the frame
       every tile and still on the site agrees on; it just does not stay
       there.

       Three things stop it, all of them cheap:

         a finger on the plate. A drag takes over mid-walk and the walk
         picks up from wherever the finger left it, rather than snapping
         back to some remembered angle;

         being off screen. A turntable nobody can see costs a decode and
         a paint a frame for nothing, and this page has several of them
         down the column;

         reduced motion. The one picture on the page revolving on its own
         is exactly what that setting is asked for, so it stays on the
         quarter and the drag is the whole interaction. */
    const first = frames[START];
    const open = () => {
      if (!alive) return;
      if (shown < 0) draw(START);
    };
    if (first.complete) open();
    else first.addEventListener("load", open, { once: true });

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let seen = true;
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(cv);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* First frame of the loop, and the first after anything that
         paused it: take the clock and spend nothing. Without this, the
         gap since the last tick — a tab in the background, a long drag —
         is spent all at once and the object jumps. */
      if (!last || drag || !seen || arrived < FRAMES * WALK_AT) {
        last = now;
        return;
      }
      pos += ((now - last) / 1000) * FPS;
      last = now;
      draw(index());
    };
    if (!calm) raf = requestAnimationFrame(tick);

    const down = (e: PointerEvent) => {
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
      cancelAnimationFrame(raf);
      io.disconnect();
      first.removeEventListener("load", open);
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      /* Drop the queue: a colourway swap should not keep fetching the last one. */
      for (const img of frames) if (img && !img.complete) img.src = "";
    };
  }, [stem]);

  /* No holding opacity any more. See the still below: there is a real
     picture of this frame under the canvas from the first paint, so a
     plate that came up from 40% was dimming something already finished. */
  const settled = progress >= 1;

  return (
    <>
      {/* ---- the first paint: frame 030, the quarter ----

         What stands here while 360 frames are in flight has to be the
         picture the canvas will open on, because the canvas opens on
         START — this exact frame — and because the story page's counter
         is standing on the same file when it hands the reader over. It
         was the `fronts-cut` cut-out at 35%: a different crop, inset by
         8%, two thirds transparent. Landing on the buy page from the
         walk meant a crisp frame becoming a small pale ghost of itself,
         which is the whole seam the hand-off exists to avoid.

         So: the turn's own frame 030, at the turn's own proportion,
         blend and scale knob, at full strength, swapped for the canvas
         with no transition once the canvas has drawn it. The two are the
         same pixels, so the swap cannot be seen.

         `unoptimized`, like QuarterPlate: it is already an AVIF the
         loader below fetches raw, and re-encoding it would put a second
         copy of one picture in flight. */}
      <NextImage
        src={spinFrame(stem)}
        alt=""
        aria-hidden
        fill
        unoptimized
        sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
        priority
        className="object-contain mix-blend-multiply [transform:scale(var(--spin-m,1))] lg:[transform:scale(var(--spin-d,1))]"
        style={
          {
            opacity: ready ? 0 : 1,
            "--spin-m": scale.mobile,
            "--spin-d": scale.desktop,
          } as React.CSSProperties
        }
      />
      <canvas
        ref={canvas}
        role="img"
        aria-label={alt}
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain mix-blend-multiply active:cursor-grabbing [transform:scale(var(--spin-m,1))] lg:[transform:scale(var(--spin-d,1))]"
        style={
          {
            opacity: ready ? 1 : 0,
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
