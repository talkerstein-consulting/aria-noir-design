"use client";

import { useEffect, useRef, useState } from "react";
import { AtelierSection } from "./atelier-section";
import { CollectionsSection } from "./collections-section";
import { GridSection } from "./grid-section";
import dynamic from "next/dynamic";
import { WhiteDotOverlay } from "./white-dot-overlay";
import { FinaleSection } from "./finale-section";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { PatternBand } from "./pattern-band";
import { sectionTwo } from "@/lib/content";
import { CtaLink } from "@/components/cta-link";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { kickPlay } from "@/lib/autoplay";

/**
 * The scrubbed film, loaded on demand.
 *
 * It is the heaviest thing on this page after the hero — a canvas engine
 * that decodes a video into frames — and it sits below four full sections.
 * Nobody has seen it by the time the home page has to be interactive, so
 * none of it belongs in the first payload. `ssr: false` because it is a
 * canvas that measures the window: there is nothing for the server to
 * render but a hole the same size.
 */
const PrivateAccessSection = dynamic(
  () =>
    import("./private-access-section").then((m) => m.PrivateAccessSection),
    /* The placeholder reserves SECTION_VH of room, so the page does not
     jump by four screens when the real section lands. Keep it in step with
     SECTION_VH in private-access-section.tsx. */
  { ssr: false, loading: () => <div className="h-[260vh] bg-ink" /> },
);

/**
 * `dynamic` alone splits the code but still fetches it the moment the page
 * hydrates — three.js, fiber, drei and the frame's glTF, well over a
 * megabyte, racing the hero film for the first seconds of the visit. This
 * holds the import back until the reader is two screens away, so the
 * opening gets the whole connection to itself.
 */
function PrivateAccessWhenNear() {
  const [near, setNear] = useState(false);
  const hold = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hold.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (near) return <PrivateAccessSection />;
  /* Carries the section's id so the white iris can anchor to it before
     the real one lands. */
  return <div ref={hold} id="private-access" className="h-[260vh] bg-ink" />;
}


/* ---------- opening: the scaling rectangle ----------
   The React Bits ScrollExpand move, on the page's own fixed film. The film
   starts as a square-cornered rectangle in the middle of the screen and grows to
   full bleed on its own, about two seconds after load — no counter and no
   preload gate. The scroll scene then plays exactly as it did.

   Width and height are percentages of the screen, per ScrollExpand's
   startWidth / startHeight; a phone gets a taller, wider box because a
   42% column of a 375px screen is a slot, not a picture. */
const EXPAND_DELAY_MS = 700; // hold on the rectangle
const EXPAND_MS = 1300; // rectangle → full bleed
const START_W = 42;
const START_H = 58;
const START_W_NARROW = 74;
const START_H_NARROW = 48;
const START_RADIUS = 0; // px — sharp corners, no radii anywhere
const MEDIA_ZOOM = 1.35;

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
};


const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export function Experience() {
  useSmoothScroll(true);

  const videoBox = useRef<HTMLDivElement>(null);

  const logoWrap = useRef<HTMLDivElement>(null);
  const logoMark = useRef<HTMLImageElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);

  /* ---------- the film ----------
     No on-screen pause control, by request (the button sat over the
     opening film). A reader who has asked the OS for less motion still
     gets a still: the film is held on attach and lib/autoplay reads the
     same flag, so its retries do not undo it. */
  const film = useRef<HTMLVideoElement>(null);

  const setFilm = (el: HTMLVideoElement | null) => {
    film.current = el;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.held = "true";
      el.pause();
    }
    /* On screen from the first frame now, inside the rectangle, so it is
       asked to play on attach. The poster holds the frame until it can. */
    if (!el.dataset.held) kickPlay(el);
  };

  /* ---------- opening: the rectangle expands by itself ----------
     Timed, not scrolled: a short hold on the rectangle, then it grows to
     full bleed. Scroll is held for the ~2s it takes, as the old opening
     did, so the scene below always starts from a full-screen film. */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start = performance.now();
    let raf = 0;
    const apply = (p: number) => {
        const e = smoothstep(0, 1, p);
        const sw = narrow ? START_W_NARROW : START_W;
        const sh = narrow ? START_H_NARROW : START_H;
        const w = sw + (100 - sw) * e;
        const h = sh + (100 - sh) * e;
        if (videoBox.current) {
          videoBox.current.style.clipPath = `inset(${(100 - h) / 2}% ${(100 - w) / 2}% round ${START_RADIUS * (1 - e)}px)`;
        }
        if (film.current) {
          film.current.style.transform = `scale(${MEDIA_ZOOM + (1 - MEDIA_ZOOM) * e})`;
        }
    };
    /* A reader who reaches for the wheel, the screen or a key has said
       they are ready: the film jumps to full bleed and scroll is theirs,
       rather than the page ignoring them for the rest of the two seconds. */
    let skipped = false;
    const skip = () => {
      if (skipped) return;
      skipped = true;
      cancelAnimationFrame(raf);
      apply(1);
      document.body.style.overflow = "";
      unbind();
    };
    const keys = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "End", "Enter", "Escape"].includes(e.key)) skip();
    };
    const unbind = () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", keys);
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", keys);
    const tick = (now: number) => {
      const p = reduce ? 1 : clamp01((now - start - EXPAND_DELAY_MS) / EXPAND_MS);
      apply(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        document.body.style.overflow = "";
        unbind();
      }
    };
    /* Held behind the boot sheet on a first visit (see layout.tsx), so
       the rectangle and the mark's draw-in start when they can be seen. */
    const begin = () => {
      start = performance.now();
      if (logoMark.current) logoMark.current.src = "/logo/aria-loader.svg?play";
      raf = requestAnimationFrame(tick);
    };
    const booted = document.documentElement.dataset.boot === "done";
    if (booted) raf = requestAnimationFrame(tick);
    else window.addEventListener("aria:boot", begin, { once: true });
    return () => {
      window.removeEventListener("aria:boot", begin);
      cancelAnimationFrame(raf);
      unbind();
      document.body.style.overflow = "";
    };
  }, []);

  /* ---------- scroll ----------
     A standard scroll, by request: the film no longer shrinks to a framed
     rectangle and hangs. It is still the fixed layer (the opening iris
     expands it in place), but it now travels up 1:1 with the page, so it
     reads as the first section scrolling away. The heading below it is in
     normal flow. Only the logo's flight into the navbar is still timed. */
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      /* How far down the whole page, as a hairline under the nav. */
      if (progressBar.current) {
        const room = document.documentElement.scrollHeight - vh;
        progressBar.current.style.transform = `scaleX(${room > 0 ? clamp01(y / room) : 0})`;
      }
      if (videoBox.current) {
        videoBox.current.style.transform = `translateY(${-Math.min(y, vh * 1.05)}px)`;
      }

      /* ---- logo: stays centred and fades out; the nav's own mark fades
         in over the same stretch, so there is never one in flight. ---- */
      const fade = clamp01(y / (vh * 0.35));
      if (logoWrap.current) logoWrap.current.style.opacity = String(1 - fade);
      document.documentElement.style.setProperty("--home-mark", String(fade));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.style.removeProperty("--home-mark");
    };
  }, []);

  return (
    <>
      {/* ---------- video ---------- */}
      <div
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
      >
        <div
          ref={videoBox}
          /* First paint, before the scroll handler has run: see
             .home-open in interactions.css. */
          className="home-open-box h-screen w-screen origin-center overflow-hidden will-change-transform"
        >
          {/* `autoPlay` is a request the browser may decline — Low Power
              Mode, Data Saver, a tab that opened in the background. This
              film is the page's opening image, so it is asked directly as
              well, and asked again if the answer changes. See lib/autoplay. */}
          {/* The poster is the film's own first frame, so a slow line, a
              refused autoplay or a reduced-motion reader all see the
              opening image rather than a black screen. */}
          <video
            ref={setFilm}
            className="h-full w-full object-cover"
            poster="/video/hero-bg-poster.webp"
            muted
            loop
            playsInline
            /* `metadata`, not `auto`.
             *
             * `auto` is a request to fetch the WHOLE file up front, and the
             * browser honours it whether or not the film ever plays —
             * measured here as 4.67MB pulled down with the element still
             * `paused`, because this context declined the autoplay. The
             * opening is a black screen the reader scrolls THROUGH before
             * the film is uncovered, so that was a full video downloaded
             * ahead of a frame nobody had looked at yet.
             *
             * `metadata` fetches the header and lets playback pull the rest
             * as it needs it. Nothing above is weakened: `autoPlay` still
             * asks, lib/autoplay still asks again on visibility and on the
             * first interaction, and the poster below the film still holds
             * the opening image until it genuinely rolls. */
            preload="metadata"
            style={{ transform: `scale(${MEDIA_ZOOM})` }}
          >
            {/* A phone gets the 720p cut (1.6MB, not 2.5MB): the film is a
                background behind type, and a 1080p frame on a 390px screen
                is bytes the display throws away. An old browser that
                ignores `media` on <source> takes the first one, so it gets
                the 720p cut at any width — soft on a desktop, never broken. */}
            <source
              src="/video/hero-bg-720.mp4"
              type="video/mp4"
              media="(max-width: 1023px)"
            />
            <source src="/video/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* ---------- navbar ---------- */}
      {/* The nav's mark fades in as the hero mark below fades out (see
          --home-mark in the scroll handler). */}
      <SiteNav visible />

      {/* ---------- logo: centred, fades on scroll ----------
          Mounted with the page, so the SVG's own draw-in plays on arrival. It has to be an <img> (or inline SVG): a CSS mask does
          not run the animation embedded in the file. Sizing stays width-based
          so the vector re-rasterises crisply instead of being scaled. */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center mix-blend-difference">
        <div ref={logoWrap} className="will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoMark}
            src="/logo/aria-loader.svg"
            alt="Aria Noir"
            className="block h-auto"
            style={{ width: "min(288px, 72vw)" }}
          />
        </div>
      </div>

      <div
        ref={progressBar}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[71] h-px origin-left bg-paper/40 mix-blend-difference"
        style={{ transform: "scaleX(0)" }}
      />

      <main id="main" tabIndex={-1} className="relative">
        {/* The page's one H1. The mark above is an image and the opening
            lines are choreography, so the outline needs a heading of its
            own; it is read, never shown. */}
        <h1 className="sr-only">Aria Noir. Eyewear, carved not assembled.</h1>
        {/* Runway for the fixed choreography above — the scroll distance the
            scene needs, and nothing else. Shorter on a phone because the
            scene itself is compressed there; see NARROW_FRAMES_PER_VH. */}
        <div className="home-runway" />
        {/* The opening's heading and two columns, in normal flow right
            after the film's screen. The space above it mirrors the space
            below: the Collections heading that follows is centred in a
            full-screen sticky panel, so its lead-in is about half the
            screen less half that heading block (~16rem), and this top
            padding is the same sum. */}
        <section className="relative z-10 flex flex-col items-center gap-8 bg-ink px-8 pt-[max(5rem,calc(50svh-16rem))]">
          <h2 className="max-w-3xl text-center font-display text-3xl leading-tight text-paper sm:text-5xl">
            {sectionTwo.heading}
          </h2>
          <div className="grid max-w-3xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            {sectionTwo.body.map((para) => (
              <p
                key={para}
                className="font-ui text-sm leading-relaxed text-paper/85 sm:text-base"
              >
                {para}
              </p>
            ))}
          </div>
          <CtaLink href={sectionTwo.href} className="mt-2">
            {sectionTwo.cta}
          </CtaLink>
        </section>
        <CollectionsSection />
        <AtelierSection />
        {/* A chapter break, in the house pattern (Raviv's Jacques Marie
            Mage reference). */}
        <div className="relative z-[37] bg-ink">
          <PatternBand />
        </div>
        <GridSection />
        {/* The last black on the page, and the one offer that is not for
            everybody. */}
        <PrivateAccessWhenNear />
        {/* The dark→light handoff. The iris is anchored to the END of
            whatever section precedes the closing block, and that is the
            private-access film rather than the gallery. Anchored by id
            rather than by position so the two cannot drift apart
            silently. */}
        <WhiteDotOverlay anchorId="private-access" />
        <FinaleSection />
      </main>
      {/* ---- The footer is PAPER here, and only here ----

          It carries no background of its own, because the white underneath
          it is the iris still covering the viewport. This is the one page
          that runs that circle, which is why every other route passes
          `tone="ink"`: declaring `.on-paper` with nothing painting paper
          behind it is white type on black.

          Those three blocks above, and this tone with them, were taken off
          the page in 9d5972d and are back by request. They are ONE
          mechanism, not three: the iris is the site's only dark to light
          cut, it needs a lit surface to hand over to, and the footer is the
          last thing standing on that surface. Removing any one of them
          breaks the other two. */}
      <SiteFooter />
    </>
  );
}
