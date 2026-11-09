"use client";

import { useEffect, useRef } from "react";
import { kickPlay } from "@/lib/autoplay";

/**
 * One of the house's box films (Jai's showcase, Film: product_06 the open
 * case, product_07 the box opening), re-encoded to 1280px and muted.
 * Plays silently in a loop; under reduced motion it holds on its poster.
 */
export function BoxFilm({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }
    kickPlay(el);
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
