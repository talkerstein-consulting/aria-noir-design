"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { kickPlay } from "@/lib/autoplay";

/**
 * The hero's film, and the still it is held behind until it can play.
 *
 * A `poster` attribute alone was not enough here. The browser drops the
 * poster the instant the first frame decodes, which on a cold load is a
 * hard cut from one photograph to another — and the still the page shipped
 * is not the frame the film opens on, so the cut was visible as a jump.
 *
 * So the still is a real element underneath, `poster` is left off the video
 * entirely, and the film fades up over it once it is genuinely playing.
 * The two pictures are the same frame (see the `poster` note in
 * lib/product.ts), which means the crossfade has nothing to travel: it
 * reads as the photograph starting to move rather than as a swap.
 *
 * `playing` — not `canplay` — is the trigger. canplay fires while the
 * element is still stalled behind autoplay policy or a slow first decode,
 * and fading to a frozen frame is the same jump one step later.
 */
export function HeroFilm({
  src,
  poster,
  alt,
  className,
}: {
  src: string;
  poster: string;
  alt: string;
  className: string;
}) {
  const [rolling, setRolling] = useState(false);

  /* Autoplay that already fired before hydration emits no `playing` event
     for React to hear, so the element is asked directly the moment it
     attaches — a ref callback rather than an effect, since it is a question
     about the DOM node and it has the node.

     And where autoplay did NOT fire — Low Power Mode, Data Saver, a
     background tab — `kickPlay` asks for it and keeps asking on the
     occasions the answer can change. Without it this component's contract
     ("the film fades up once it is genuinely playing") resolves to "the
     poster stays forever", silently. */
  const attach = useCallback((v: HTMLVideoElement | null) => {
    kickPlay(v);
    if (v && !v.paused && v.readyState >= 3) setRolling(true);
  }, []);

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        fill
        /* First paint of the page, and the LCP candidate whether or not
           the film ever arrives. */
        priority
        sizes="100vw"
        className={className}
      />
      <video
        ref={attach}
        className={`${className} absolute inset-0 h-full w-full transition-opacity duration-1000 ease-out ${
          rolling ? "opacity-100" : "opacity-0"
        }`}
        src={src}
        aria-label={alt}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setRolling(true)}
      />
    </>
  );
}
