"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
 *
 * ---- `lazy`, and why the second film on a page needs it ----
 *
 * A <video> that is autoplaying is decoding, whether or not it is on
 * screen. Both story pages run their campaign film twice: once in the hero
 * and once again as the approach stage most of a page below it. Left
 * alone that is two decode pipelines running side by side for the whole
 * visit, for one file, of which the reader can only ever see one.
 *
 * `lazy` makes the element fetch nothing until it is near (`preload
 * none`), start when it arrives, and PAUSE again when it leaves. The hero
 * stays eager: it is the first thing on the page and the one film that
 * must be moving before anyone scrolls.
 */
export function HeroFilm({
  src,
  poster,
  alt,
  className,
  priority = true,
  lazy = false,
}: {
  src: string;
  poster: string;
  alt: string;
  className: string;
  /** Whether the still is the page's LCP candidate. True for the hero,
   *  which IS the first paint; false everywhere else — a mid-page film
   *  marked `priority` tells the browser to fetch a picture ten screens
   *  down ahead of the one the reader is looking at. */
  priority?: boolean;
  /** Fetch and decode only while the film is near the viewport. See the
   *  note above the component. Leave it off for the hero. */
  lazy?: boolean;
}) {
  const [rolling, setRolling] = useState(false);
  const video = useRef<HTMLVideoElement | null>(null);

  /* ---- lazy: play on arrival, pause on departure ----

     The margin is generous on purpose. A film that starts decoding the
     instant its top edge touches the viewport shows the reader a frozen
     first frame while it catches up; a screen of warning is enough for it
     to be genuinely rolling by the time it is looked at.

     Pausing on the way out is the half that matters for the measurement:
     it is what stops this element decoding for the rest of the visit. */
  useEffect(() => {
    if (!lazy) return;
    const el = video.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.preload = "auto";
          kickPlay(el);
        } else {
          el.pause();
          setRolling(false);
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  /* Autoplay that already fired before hydration emits no `playing` event
     for React to hear, so the element is asked directly the moment it
     attaches — a ref callback rather than an effect, since it is a question
     about the DOM node and it has the node.

     And where autoplay did NOT fire — Low Power Mode, Data Saver, a
     background tab — `kickPlay` asks for it and keeps asking on the
     occasions the answer can change. Without it this component's contract
     ("the film fades up once it is genuinely playing") resolves to "the
     poster stays forever", silently. */
  const attach = useCallback(
    (v: HTMLVideoElement | null) => {
      video.current = v;
      /* A lazy film is started by the observer above, not on attach:
         asking here would fetch the file at mount, which is the whole
         thing `lazy` exists to avoid. */
      if (lazy) return;
      kickPlay(v);
      if (v && !v.paused && v.readyState >= 3) setRolling(true);
    },
    [lazy],
  );

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        fill
        /* First paint of the page, and the LCP candidate whether or not
           the film ever arrives. */
        priority={priority}
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
        autoPlay={!lazy}
        muted
        loop
        playsInline
        preload={lazy ? "none" : "auto"}
        onPlaying={() => setRolling(true)}
      />
    </>
  );
}
