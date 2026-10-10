"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { EmberRevealHandle } from "@/components/ember-reveal";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AriaWordmark } from "@/components/aria-wordmark";

const loadEmber = () => import("@/components/ember-reveal");
const EmberReveal = dynamic(loadEmber, { ssr: false });

/**
 * Every page change, the same as the first visit: the black comes up with
 * the logo on it, holds for a minimum time, and then the logo flies into
 * the navbar while the black fades away. The first-visit version lives in
 * layout.tsx (BOOT_LIFT); this is its twin for route changes, so every load
 * ends the same way.
 *
 * ---- Phases ----
 *
 *   cover  black sheet, logo fading up in the middle (ROUTE_MIN_MS)
 *   burn   the sheet, logo and all, is photographed onto a canvas and set
 *          alight where the reader clicked (EmberReveal, burnThrough): the
 *          new page shows through the hole as it spreads
 *   off    unmounted
 *
 * Reduced motion, or no WebGL, skips the burn and simply lifts the sheet.
 *
 * ---- Why it lives in the layout ----
 *
 * `app/loading.tsx` is a Suspense fallback and is replaced in one commit
 * with no exit, so it cannot animate out. This component survives every
 * route change, so it owns the exit.
 *
 * ---- useLayoutEffect ----
 *
 * The cover has to be up in the same frame the new route commits, or one
 * frame of the new page shows before it. A layout effect runs before that
 * paint.
 *
 * ---- The first render does nothing ----
 *
 * A full page load has no previous route; the boot loader in layout.tsx
 * handles that one.
 */

/** Minimum time the logo is shown before the sheet burns. */
const ROUTE_MIN_MS = 800;
/** How long the fire takes to cross the screen. */
const BURN_S = 1.5;
/** If the burn never reports back (lost context, failed texture). */
const BURN_MAX_MS = 4500;

/* Where the last click landed, as 0..1 of the viewport: the fire starts
   there, so the page burns open from the link that was pressed. A route
   change with no click (back button) burns from the centre. */
let lastPress: readonly [number, number] | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastPress = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
    },
    { capture: true, passive: true },
  );
}

/** The cover as it looks right now, as an image: its colour, with the
 *  wordmark drawn where it sits, so the swap to the canvas is invisible. */
async function snapshotCover(cover: HTMLElement): Promise<string | null> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = getComputedStyle(cover).backgroundColor;
  ctx.fillRect(0, 0, w, h);

  /* Taken the moment the cover goes up, while its logo is still fading in:
     so the logo is placed by its wrapper (which does not animate) and drawn
     at full strength, as it will look by the time it burns. */
  const svg = cover.querySelector("svg");
  const box = cover.querySelector(".route-cover-mark");
  if (svg && box) {
    const r = box.getBoundingClientRect();
    const ink = getComputedStyle(svg).color;
    const markup = new XMLSerializer()
      .serializeToString(svg)
      .replace(/currentColor/g, ink);
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    try {
      await img.decode();
      ctx.drawImage(img, r.left, r.top, r.width, r.height);
    } catch {
      /* The sheet burns without its logo. */
    }
  }
  return canvas.toDataURL("image/png");
}

export function RouteWipe() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const cover = useRef<HTMLDivElement>(null);
  const fire = useRef<EmberRevealHandle>(null);
  const [phase, setPhase] = useState<"off" | "cover" | "burn">("off");
  const [picture, setPicture] = useState<string | null>(null);
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);

  /* Fetch the fire's code (and three.js) while the reader is still on the
     first page, so the first change does not wait on a download. */
  useEffect(() => {
    const warm = () => void loadEmber();
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm);
    else window.setTimeout(warm, 1500);
  }, []);

  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setPhase("cover");
    setPicture(null);
    setLit(false);
    litRef.current = false;
    const origin = lastPress ?? ([0.5, 0.5] as const);
    lastPress = null;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let giveUp = 0;

    /* The canvas is built straight away, UNDER the cover: three.js, the
       shaders and the texture all get ready during the logo's hold, so
       when the fire starts all it has to do is draw. */
    if (!still) {
      requestAnimationFrame(async () => {
        const el = cover.current;
        const shot = el ? await snapshotCover(el) : null;
        if (!cancelled && shot) setPicture(shot);
      });
    }

    /* Lit only once the incoming page has stopped blocking the main
       thread: three smooth frames in a row (capped at 2s). */
    let calmRaf = 0;
    const whenCalm = (go: () => void) => {
      let last = performance.now();
      let calm = 0;
      const start = last;
      const tick = (now: number) => {
        calm = now - last < 40 ? calm + 1 : 0;
        last = now;
        if (calm >= 3 || now - start > 2000) go();
        else calmRaf = requestAnimationFrame(tick);
      };
      calmRaf = requestAnimationFrame(tick);
    };

    const toBurn = window.setTimeout(() => whenCalm(() => {
      if (still || !fire.current) {
        setPhase("off");
        return;
      }
      setPhase("burn");
      fire.current.ignite(origin[0], origin[1]);
      /* onIgnite runs inside ignite(). A canvas that was not ready ignores
         it: lift the sheet rather than hold it. */
      if (!litRef.current) {
        setPhase("off");
        return;
      }
      giveUp = window.setTimeout(() => setPhase("off"), BURN_MAX_MS);
    }), still ? 200 : ROUTE_MIN_MS);

    return () => {
      cancelled = true;
      clearTimeout(toBurn);
      clearTimeout(giveUp);
      cancelAnimationFrame(calmRaf);
    };
  }, [pathname]);

  if (phase === "off") return null;

  /* A product page opens on white, so its cover is white too. */
  const light = pathname.startsWith("/shop/");

  return (
    <>
      {/* The solid sheet stays until the fire has caught, so there is
          never a frame of page between the two. */}
      {!lit ? (
        <div ref={cover} aria-hidden className="route-cover" data-tone={light ? "light" : undefined}>
          <span className="route-cover-mark">
            <AriaWordmark className={`site-loading-mark ${light ? "text-ink" : "text-paper"}`} />
          </span>
        </div>
      ) : null}
      {picture ? (
        <div aria-hidden className="route-burn" data-lit={lit ? "" : undefined}>
          <EmberReveal
            ref={fire}
            images={[picture, picture]}
            burnThrough
            aspectRatio={0}
            radius={0}
            hover={false}
            clickToBurn={false}
            autoplay={false}
            burnDuration={BURN_S}
            roughness={0.6}
            emberColor="#C6A664"
            charColor="#121110"
            smoke={0.3}
            sparks={0.7}
            maxPixelRatio={1}
            onIgnite={() => {
              litRef.current = true;
              setLit(true);
            }}
            onChange={() => setPhase("off")}
            className="!cursor-default"
          />
        </div>
      ) : null}
    </>
  );
}
