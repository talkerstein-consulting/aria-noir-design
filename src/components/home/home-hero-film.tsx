"use client";

import { useEffect, useRef } from "react";

/**
 * The home hero as a muted film loop (Jai's review, 5 Nov: "Hero: still, or
 * test a muted film loop"; decided 8 Nov: the loop).
 *
 * The ARCA I film, which the review names as the benchmark, cut without its
 * audio track. A phone gets its own 4:5 crop so the two figures are not
 * sliced by a 16:9 frame. The still it replaced is the poster, so the first
 * paint is identical to the old page and a reader with reduced motion keeps
 * the still: the film is paused and never started.
 */
export function HomeHeroFilm({ alt }: { alt: string }) {
  const desktop = useRef<HTMLVideoElement>(null);
  const phone = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      for (const v of [desktop.current, phone.current]) {
        if (!v) continue;
        if (query.matches) v.pause();
        else void v.play().catch(() => {});
      }
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <video
        ref={desktop}
        aria-label={alt}
        className="absolute inset-0 hidden h-full w-full object-cover lg:block"
        poster="/video/home/hero-poster.webp"
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/video/home/hero-1080.mp4" type="video/mp4" />
      </video>
      <video
        ref={phone}
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover lg:hidden"
        poster="/video/home/hero-m-poster.webp"
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/video/home/hero-m.mp4" type="video/mp4" />
      </video>
    </>
  );
}
