"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
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
  srcPortrait,
  poster,
  posterPortrait,
  alt,
  className,
  priority = true,
  lazy = false,
}: {
  src: string;
  /** A 9:16 cut of the same film for a phone, chosen by the browser from a
   *  `<source media>` so one element decodes one file and nothing is read
   *  in JS. Omit and `src` runs at every width. */
  srcPortrait?: string;
  poster: string;
  /** Frame 0 of `srcPortrait`, shown in its place below `sm` so the phone's
   *  crossfade has nothing to travel either. */
  posterPortrait?: string;
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

  /* ---- the reader's say ----
     A film that loops with no way to stop it fails WCAG 2.2.2, and a
     reader who has asked the OS for less motion should be left on the
     still. `held` is that decision; lib/autoplay reads the same flag off
     the element so its retries do not undo it. Held means the still
     stays up: the film only ever fades in over it once it is playing. */
  const [held, setHeld] = useState(false);
  const hold = (el: HTMLVideoElement, on: boolean) => {
    if (on) {
      el.dataset.held = "true";
      el.pause();
      setRolling(false);
    } else {
      delete el.dataset.held;
      kickPlay(el);
    }
    setHeld(on);
  };
  useEffect(() => {
    const el = video.current;
    if (el && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hold(el, true);
    }
  }, []);

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
        } else if (el.dataset.held !== "true") {
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
        className={`${className} ${posterPortrait ? "hidden sm:block" : ""}`}
      />
      {posterPortrait ? (
        <Image
          src={posterPortrait}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`${className} sm:hidden`}
        />
      ) : null}
      <video
        ref={attach}
        className={`${className} absolute inset-0 h-full w-full transition-opacity duration-1000 ease-out ${
          rolling ? "opacity-100" : "opacity-0"
        }`}
        src={srcPortrait ? undefined : src}
        aria-label={alt}
        autoPlay={!lazy}
        muted
        loop
        playsInline
        /* `none` when lazy, and that is the case this attribute actually
           governs: nothing is fetched until the observer above starts the
           film.
           
           For the EAGER case `metadata` is honest intent and little more.
           An element carrying `autoPlay` downloads what it needs to play no
           matter what this says — measured on /arca-i as the full 4.0MB
           with `preload="metadata"` set — because playback, not the hint,
           drives the fetch. It stays `metadata` rather than `auto` so the
           element never asks for MORE than playback needs, but it is not
           what keeps a hero light.
           
           What would: this hero is genuinely on screen and rolling the
           moment the page opens, so the only ways to make it cheaper are a
           smaller encode, or letting the poster lead and starting the film
           at idle — the poster is already laid underneath and faded out on
           `onPlaying`, so that handover is built and unused. */
        preload={lazy ? "none" : "metadata"}
        onPlaying={() => setRolling(true)}
        onPause={() => {
          if (video.current?.dataset.held === "true") setRolling(false);
        }}
      >
        {/* The portrait cut first, since the browser takes the first
            source whose media matches. The breakpoint is the same `sm`
            that swaps the poster stills in ProductHero. */}
        {srcPortrait ? (
          <>
            <source src={srcPortrait} media="(max-width: 639px)" />
            <source src={src} />
          </>
        ) : null}
      </video>
      <button
        type="button"
        onClick={() => video.current && hold(video.current, !held)}
        aria-pressed={held}
        aria-label={held ? "Play the film" : "Pause the film"}
        /* No disc. The control was a bordered, tinted, blurred circle —
           a piece of chrome the size of an app icon sitting on top of the
           one full-bleed film on the page. The glyph alone is enough: it
           is the only mark in that corner, and the film behind it is dark
           at the foot where the gradient seats the type.

           `h-11 w-11` stays. It is the TOUCH TARGET, not the disc — 44px
           is the size a control has to be to be hit reliably, and losing
           the circle is a change to what is drawn, not to what is
           pressable. The glyph is centred in that box.

           Hover and focus move the glyph's own colour now that there is no
           border to brighten, and the focus ring is drawn with an offset
           so it reads as a ring around the icon rather than a box on it. */
        className="absolute bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center text-paper/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)] transition-colors hover:text-paper focus-visible:text-paper focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper"
      >
        {held ? (
          <Play size={16} strokeWidth={1.5} aria-hidden />
        ) : (
          <Pause size={16} strokeWidth={1.5} aria-hidden />
        )}
      </button>
    </>
  );
}
