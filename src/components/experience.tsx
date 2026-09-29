"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AtelierSection } from "./atelier-section";
import { CollectionsSection } from "./collections-section";
import { GridSection } from "./grid-section";
import dynamic from "next/dynamic";
import { WhiteDotOverlay } from "./white-dot-overlay";
import { FinaleSection } from "./finale-section";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { sectionTwo } from "@/lib/content";
import { CtaLink } from "@/components/cta-link";
import {
  F,
  FRAMES_PER_VH,
  NARROW_FRAMES_PER_VH,
  EXIT_VH,
  VIDEO_REST_SCALE,
  VIDEO_REST_LIFT_VH,
  H2_GAP_VH,
} from "@/lib/timeline";
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


/* ---------- opening: the scaling rectangle ----------
   The React Bits ScrollExpand move, on the page's own fixed film. The film
   starts as a rounded rectangle in the middle of the screen and grows to
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
const START_RADIUS = 24; // px
const MEDIA_ZOOM = 1.35;

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
};

const HERO_LOGO_W = 288; // px
const NAV_LOGO_W = 80; // px
const NAV_CENTER_Y = 40; // px from top

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** The JS equivalent of cubic-bezier(0.83, 0, 0.17, 1). */
export function Experience() {
  useSmoothScroll(true);

  const videoBox = useRef<HTMLDivElement>(null);

  const logoWrap = useRef<HTMLDivElement>(null);
  const logoMark = useRef<HTMLImageElement>(null);
  const headGroup = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);

  /* ---------- the film's pause control ----------
     A looping film with no way to stop it fails WCAG 2.2.2, and a reader
     who has asked the OS for less motion should not be shown one at all.
     `held` is the reader's decision; lib/autoplay reads the same flag off
     the element so its retries do not undo it. `filmGone` hides the control
     once the choreography has carried the film off the top of the page. */
  const film = useRef<HTMLVideoElement>(null);
  const [held, setHeld] = useState(false);
  const [filmGone, setFilmGone] = useState(false);

  const setFilm = (el: HTMLVideoElement | null) => {
    film.current = el;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.held = "true";
      el.pause();
      setHeld(true);
    }
    /* On screen from the first frame now, inside the rectangle, so it is
       asked to play on attach. The poster holds the frame until it can. */
    if (!el.dataset.held) kickPlay(el);
  };

  const toggleFilm = () => {
    const el = film.current;
    if (!el) return;
    if (held) {
      delete el.dataset.held;
      setHeld(false);
      kickPlay(el);
    } else {
      el.dataset.held = "true";
      el.pause();
      setHeld(true);
    }
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
    const start = performance.now();
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
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      unbind();
      document.body.style.overflow = "";
    };
  }, []);

  /* ---------- scroll choreography (all in frames) ---------- */
  useEffect(() => {
    /* Read per frame rather than captured once: a phone rotating into
       landscape crosses this breakpoint, and a scene half-played on one
       budget and half on the other would jump. */
    const perVh = () =>
      window.matchMedia("(max-width: 1023px)").matches
        ? NARROW_FRAMES_PER_VH
        : FRAMES_PER_VH;

    const onScroll = () => {
      const vh = window.innerHeight;
      /* How far down the whole page, as a hairline under the nav: four
         screens of runway with no sign of their length reads as a page
         that might not end. */
      if (progressBar.current) {
        const room = document.documentElement.scrollHeight - vh;
        progressBar.current.style.transform = `scaleX(${room > 0 ? clamp01(window.scrollY / room) : 0})`;
      }
      const frame = (window.scrollY / vh) * perVh();

      const shrink = clamp01(frame / F.videoShrinkEnd);
      /* the lift starts LATER than the shrink — nothing moves up until 94 */
      const lift = clamp01(
        (frame - F.videoLiftStart) / (F.videoShrinkEnd - F.videoLiftStart),
      );
      const logoP = clamp01(frame / F.logoDocked);
      const headIn = clamp01(
        (frame - F.h2Start) / (F.videoShrinkEnd - F.h2Start),
      );
      /* The heading used to hold until F.productStart, because the ARCA I
         block was what replaced it. With that block gone it leaves WITH the
         video instead — same two frames — so the section ends as one motion
         rather than the type outliving the thing it was captioning. */
      const headOut = clamp01(
        (frame - F.modelStart) / (F.modelEntryEnd - F.modelStart),
      );
      /* The model and the ARCA I block are both gone from this page, but
         F.modelStart still times the video's exit — so `entry` stays,
         driving the video off screen on its own. */
      const entry = easeOutCubic(
        clamp01((frame - F.modelStart) / (F.modelEntryEnd - F.modelStart)),
      );

      /* ---- video ---- */
      const scale = lerp(1, VIDEO_REST_SCALE, shrink);
      const liftVh = -VIDEO_REST_LIFT_VH * lift;
      const exitVh = -(EXIT_VH - VIDEO_REST_LIFT_VH) * entry;
      if (videoBox.current) {
        videoBox.current.style.transform = `translateY(${liftVh + exitVh}vh) scale(${scale})`;
      }
      /* The film's bottom edge, in vh from the top of the viewport. Once it
         is above zero the film is off screen and its control goes with it. */
      setFilmGone(50 + scale * 50 + liftVh + exitVh <= 0);

      /* ---- heading group is ANCHORED to the video's bottom edge, so the two
         are one unit. It naturally HANGS while the video rests. ---- */
      if (headGroup.current) {
        const videoBottomVh = scale * 50 + liftVh + exitVh;
        const headAlpha = headIn * (1 - headOut);
        headGroup.current.style.transform = `translateY(${videoBottomVh + H2_GAP_VH}vh)`;
        headGroup.current.style.opacity = String(headAlpha);
        /* The group carries the page's only link into /eyewear, and the
           group is a FIXED layer that spends most of the scroll invisible.
           An invisible fixed layer with a live link in it is a trap: the
           reader clicks a photograph three sections later and lands on the
           index. So the whole group's pointer-events follow its own
           opacity, written in the same frame as the opacity, which is the
           only way the two cannot fall out of step. */
        headGroup.current.style.pointerEvents = headAlpha > 0.9 ? "auto" : "none";
      }

      /* ---- logo ---- */
      if (logoWrap.current) {
        logoWrap.current.style.transform = `translateY(${-logoP * (vh / 2 - NAV_CENTER_Y)}px)`;
      }
      if (logoMark.current) {
        /* cap the hero size on narrow screens so the mark keeps real margin */
        const heroW = Math.min(HERO_LOGO_W, window.innerWidth * 0.72);
        logoMark.current.style.width = `${heroW - logoP * (heroW - NAV_LOGO_W)}px`;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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

      {!filmGone && (
        <button
          type="button"
          onClick={toggleFilm}
          aria-pressed={held}
          aria-label={held ? "Play the film" : "Pause the film"}
          className="fixed bottom-6 right-6 z-[46] flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 bg-ink/60 text-paper backdrop-blur transition-colors hover:border-paper/60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-paper"
        >
          {held ? (
            <Play size={16} strokeWidth={1.5} aria-hidden />
          ) : (
            <Pause size={16} strokeWidth={1.5} aria-hidden />
          )}
        </button>
      )}

      {/* ---------- navbar ---------- */}
      {/* showMark=false: this page flies its own animated mark into the
          navbar slot below, so the static one would double up */}
      <SiteNav visible showMark={false} />

      {/* ---------- logo: centre → navbar ----------
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
            style={{ width: HERO_LOGO_W }}
          />
        </div>
      </div>

      {/* ---------- heading + 2-column body, welded under the video ---------- */}
      <div
        ref={headGroup}
        className="pointer-events-none fixed inset-x-0 top-1/2 z-10 flex flex-col items-center gap-8 px-8 will-change-transform"
        style={{ opacity: 0 }}
      >
        <h2 className="max-w-3xl text-center font-display text-3xl leading-tight text-paper sm:text-5xl">
          {sectionTwo.heading}
        </h2>
        {/* no separate reveal — the group's own opacity carries both, so the
            heading and the two columns arrive together */}
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
        {/* `pointer-events-auto` on the link and nothing else in the group:
            the parent is pointer-events-none so the type never intercepts a
            scroll gesture, and the parent's own gate above decides whether
            this is reachable at all. */}
        <CtaLink href={sectionTwo.href} className="pointer-events-auto mt-2">
          {sectionTwo.cta}
        </CtaLink>
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
        <CollectionsSection />
        <AtelierSection />
        <GridSection />
        {/* The last black on the page, and the one offer that is not for
            everybody. */}
        <PrivateAccessSection />
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
