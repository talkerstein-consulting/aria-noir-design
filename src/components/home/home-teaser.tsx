"use client";

import dynamic from "next/dynamic";
import { CtaLink } from "@/components/cta-link";

/**
 * The teaser: PATRIARCA in Black across the full span, lit as if it had depth.
 * React Bits' Depth Image (`components/depth-image.tsx`) derives a depth map
 * from the photograph and casts a light across it.
 *
 * Interactive, not automatic: the light follows the pointer and holds still
 * when it leaves (autoOrbit off). Nothing sits over the canvas except the
 * words, and they let the pointer through, so the light can be moved
 * anywhere on the image.
 *
 * The plain photograph sits underneath: it is what shows before the WebGL
 * chunk arrives, and instead of it where WebGL is unavailable.
 *
 * The foot fades to black so the house letter below continues it without
 * a seam.
 */
const DepthImage = dynamic(() => import("@/components/depth-image"), { ssr: false });

export function HomeTeaser() {
  return (
    /* Phone: the whole 16:9 frame in its own box, the words underneath,
       so the glasses are never cropped at the temples. */
    <section
      aria-labelledby="teaser-heading"
      className="relative w-full bg-ink lg:h-[100svh] lg:min-h-[560px] lg:overflow-hidden"
    >
      <div className="relative aspect-video w-full lg:absolute lg:inset-0 lg:aspect-auto">
        <picture>
          <source media="(max-width: 1023px)" srcSet="/images/home/teaser-patriarca-m.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/teaser-patriarca.webp"
            alt="PATRIARCA in Black, edged in gold, on stone among columns"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <DepthImage
          image="/images/home/teaser-patriarca.webp"
          fit="cover"
          autoOrbit={false}
          follow={0.15}
          lightIntensity={11}
          className="absolute inset-0 h-full w-full"
        />

        {/* A veil over the whole picture: the collection is not shown yet. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/25" />
        {/* Dark at the top, out of the section above. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black via-black/80 to-transparent lg:h-[42%]"
        />
        {/* Fade into the words, and on into the house letter. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/85 to-transparent lg:h-[62%]"
        />
      </div>

      <div className="pointer-events-none relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 pt-6 pb-14 text-center sm:px-10 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pt-0 lg:pb-20">
        <h2 id="teaser-heading" className="t-display-xl text-paper rise">
          Before it exists.
        </h2>
        <p className="t-body t-body--lede max-w-xl text-paper/80 rise">
          The next Aria Noir collection is now taking form. A small number of frames will be offered by pre-order before production begins.
        </p>
        <CtaLink href="/contact" className="pointer-events-auto rise">
          Reserve a frame
        </CtaLink>
      </div>
    </section>
  );
}
