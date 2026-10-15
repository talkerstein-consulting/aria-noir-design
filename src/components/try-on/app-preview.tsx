"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { TryOnHouse, TryOnPreviewSlide } from "@/lib/try-on";
import "./app-preview.css";

/**
 * The try-on, shown before it is asked for.
 *
 * One worn photograph per house, in a portrait screen. Each slide plays the
 * moment the mirror has: a scan line drops to the frame, the crosshair
 * closes on it and squares it off, and the house's name rises. Then the
 * next house. Nothing else on it: the photograph, the marks, the name.
 *
 * It holds still while hovered, while the tab is hidden, and entirely under
 * reduced motion, where it is a single photograph with the marks in place.
 */

const SLIDE_MS = 4200;

const MOTION = "(prefers-reduced-motion: reduce)";
const prefersStill = () => window.matchMedia(MOTION).matches;
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function AppPreview({
  houses,
  slides,
}: {
  houses: TryOnHouse[];
  slides: readonly TryOnPreviewSlide[];
}) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const still = useSyncExternalStore(subscribeMotion, prefersStill, () => false);

  useEffect(() => {
    if (held || still) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [held, still, slides.length]);

  const slide = slides[index];
  const name = houses.find((h) => h.slug === slide.house)?.name ?? slide.house;
  const [left, top, width, height] = slide.box;

  return (
    <figure
      className="try-preview relative mx-auto aspect-[9/16] w-full max-w-[min(100%,24rem)] select-none overflow-hidden border border-[var(--fg-rule)] bg-black"
      data-still={still || undefined}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      {slides.map((s, i) => (
        <Image
          key={s.image}
          src={s.image}
          alt={i === index ? `${name}, worn` : ""}
          fill
          sizes="(min-width: 1024px) 24rem, 90vw"
          /* 90, the site's other allowed quality (next.config): faces at
             this size show 75's smoothing. */
          quality={90}
          priority={i === 0}
          className={`try-preview__plate object-cover ${i === index ? "is-on" : ""}`}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      {/* ---- the moment of tracking ----
          Keyed on the slide, so both replay each time it changes. */}
      <div
        key={`scan-${index}`}
        className="try-preview__scan pointer-events-none absolute inset-x-0 top-0"
        style={{ "--to": `${top + height / 2}%` } as React.CSSProperties}
        aria-hidden
      />
      <div
        key={`lock-${index}`}
        className="try-preview__lock pointer-events-none absolute"
        style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
        aria-hidden
      >
        <span className="try-preview__corner left-0 top-0 border-l border-t" />
        <span className="try-preview__corner right-0 top-0 border-r border-t" />
        <span className="try-preview__corner bottom-0 left-0 border-b border-l" />
        <span className="try-preview__corner bottom-0 right-0 border-b border-r" />
      </div>

      <figcaption
        key={`name-${index}`}
        className="try-preview__name absolute inset-x-0 bottom-0 p-5 text-[1.05rem] font-medium tracking-[0.04em] text-white"
      >
        {name}
      </figcaption>
    </figure>
  );
}
