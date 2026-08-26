"use client";

import { useEffect, useRef, useState } from "react";
import { AtelierSection } from "./atelier-section";
import { CollectionsSection } from "./collections-section";
import { GridSection } from "./grid-section";
import { WhiteDotOverlay } from "./white-dot-overlay";
import { FinaleSection } from "./finale-section";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { opening, sectionTwo } from "@/lib/content";
import {
  F,
  FRAMES_PER_VH,
  RUNWAY_VH,
  EXIT_VH,
  VIDEO_REST_SCALE,
  VIDEO_REST_LIFT_VH,
  H2_GAP_VH,
} from "@/lib/timeline";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/* ---------- opening ----------
   One rAF loop writing straight to the DOM. Nothing goes through React state
   per frame and no value is rounded before it reaches a transform.

   Beats: dot → mini → full, all on cubic-bezier(0.83, 0, 0.17, 1).

   Scale is UNIFORM at every step. A non-uniform scale would squash the video
   frame itself, which is what made the mini box look elongated. */
const COUNT_MS = 1700; // 0 → 100 readout
const DOT_AT = 0.09; // counter fraction where the dot appears
const GROW_END_AT = 0.55; // counter fraction where the mini box is complete
const GROW_MS = 300; // dot → mini
const FULL_MS = 520; // mini → full bleed
const OPENING_MS = COUNT_MS + FULL_MS;

const GROW_START_MS = COUNT_MS * GROW_END_AT - GROW_MS;
const DOT_MS = COUNT_MS * DOT_AT;

const DOT_SCALE = 0.006;
const MINI_SCALE = 0.16;
/** How far the stacks travel relative to the box's own half-height. 1.0 would
 *  weld them to its edges; above that they still START touching but open up
 *  progressively faster than the box grows. */
const PUSH_MULT = 1.95;

/* ---------- logo geometry (width-driven, never transform:scale) ---------- */
const HERO_LOGO_W = 288; // px
const NAV_LOGO_W = 80; // px
const NAV_CENTER_Y = 40; // px from top

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** The JS equivalent of cubic-bezier(0.83, 0, 0.17, 1). */
const easeInOutQuint = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

/**
 * Continuous, un-quantised UNIFORM scale for the whole opening.
 * Returns [scale, expandT] — expandT drives the text cross-fade so the type
 * is swallowed mid-expansion rather than on a separate timer.
 */
function openingScale(ms: number): [number, number] {
  if (ms < DOT_MS) return [0, 0]; // nothing yet
  if (ms < GROW_START_MS) return [DOT_SCALE, 0]; // the dot holds
  if (ms < COUNT_MS * GROW_END_AT) {
    const t = easeInOutQuint((ms - GROW_START_MS) / GROW_MS);
    return [lerp(DOT_SCALE, MINI_SCALE, t), 0];
  }
  if (ms < COUNT_MS) return [MINI_SCALE, 0]; // hangtime
  const t = easeInOutQuint(clamp01((ms - COUNT_MS) / FULL_MS));
  return [lerp(MINI_SCALE, 1, t), t];
}

export function Experience() {
  const [live, setLive] = useState(false);

  /* inertia scrolling, but only once the loader has handed over */
  useSmoothScroll(live);

  const videoBox = useRef<HTMLDivElement>(null);
  const stackA = useRef<HTMLDivElement>(null);
  const stackB = useRef<HTMLDivElement>(null);
  const barWrap = useRef<HTMLDivElement>(null);
  const barFill = useRef<HTMLDivElement>(null);
  const barNum = useRef<HTMLSpanElement>(null);

  const logoWrap = useRef<HTMLDivElement>(null);
  const logoMark = useRef<HTMLImageElement>(null);
  const headGroup = useRef<HTMLDivElement>(null);

  /* ---------- opening: one rAF loop, direct DOM writes ---------- */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let raf = 0;
    let done = false;
    const start = performance.now();

    /* Return visit: the opening has already been seen this session, so it
       is skipped entirely and the black wipe in the markup below covers
       the handover instead. Set before paint by the boot script in
       layout.tsx — reading it here rather than from state is the whole
       point, since state would arrive a frame too late to stop the
       counter from showing. */
    const revisit =
      document.documentElement.classList.contains("revisit");

    /* rAF is paused in background tabs and throttled hard under low-power /
       heavy load. Without this, a starved loop would never reach OPENING_MS
       and the scroll lock below would never lift — leaving the visitor stuck
       on the loader. The timer guarantees the sequence always completes. */
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      if (videoBox.current) videoBox.current.style.transform = "scale(1)";
      setLive(true);
      document.body.style.overflow = "";
    };
    if (revisit) {
      finish();
      return;
    }

    const failsafe = window.setTimeout(finish, OPENING_MS + 500);

    const tick = (now: number) => {
      if (done) return;
      const ms = now - start;

      const cp = clamp01(ms / COUNT_MS);
      const pct = cp * 100;
      if (barNum.current) {
        barNum.current.textContent = String(Math.round(pct));
        barNum.current.style.left = `${pct}%`;
      }
      if (barFill.current) barFill.current.style.width = `${pct}%`;
      if (barWrap.current) barWrap.current.style.opacity = cp >= 1 ? "0" : "1";

      const [s, expandT] = openingScale(ms);
      if (videoBox.current) {
        videoBox.current.style.transform = `scale(${s})`;
      }

      /* The stacks start at normal spacing and are DRIVEN APART by the box:
         push == the box's own half-height, so they ride its edges exactly.
         Past the mini size the push freezes while the box keeps growing —
         that is what lets the expansion overtake and swallow them. */
      const push = Math.min(s, MINI_SCALE) * 50 * PUSH_MULT; // vh
      const textOpacity = String(1 - clamp01(expandT / 0.65));
      if (stackA.current) {
        stackA.current.style.transform = `translateY(${-push}vh)`;
        stackA.current.style.opacity = textOpacity;
      }
      if (stackB.current) {
        stackB.current.style.transform = `translateY(${push}vh)`;
        stackB.current.style.opacity = textOpacity;
      }

      if (ms < OPENING_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, []);

  /* ---------- scroll choreography (all in frames) ---------- */
  useEffect(() => {
    if (!live) return;

    const onScroll = () => {
      const vh = window.innerHeight;
      const frame = (window.scrollY / vh) * FRAMES_PER_VH;

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

      /* ---- heading group is ANCHORED to the video's bottom edge, so the two
         are one unit. It naturally HANGS while the video rests. ---- */
      if (headGroup.current) {
        const videoBottomVh = scale * 50 + liftVh + exitVh;
        headGroup.current.style.transform = `translateY(${videoBottomVh + H2_GAP_VH}vh)`;
        headGroup.current.style.opacity = String(headIn * (1 - headOut));
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
  }, [live]);

  return (
    <>
      {/* ---------- return-visit wipe ----------
          Inert on a first load: the CSS keeps it out of the document
          unless <html> carries `revisit`, so the opening choreography
          owns the screen alone. On every load after that it is the whole
          transition — one black panel already covering the viewport,
          travelling up and off. */}
      <div className="opening-wipe" aria-hidden />

      {/* ---------- video ---------- */}
      <div
        className={`pointer-events-none fixed inset-0 flex items-center justify-center ${
          live ? "z-0" : "z-40"
        }`}
      >
        <div
          ref={videoBox}
          className="h-screen w-screen origin-center overflow-hidden will-change-transform"
          style={{ transform: "scale(0)" }}
        >
          <video
            className="h-full w-full object-cover"
            src="/video/hero-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      </div>

      {/* ---------- opening (video is above this and overtakes it) ---------- */}
      {!live && (
        <>
          <div className="fixed inset-0 z-30 bg-ink" />

          <div className="pointer-events-none fixed inset-0 z-[35]">
            {/* flush to the centre line at rest — the box drives them apart */}
            <div
              ref={stackA}
              className="absolute inset-x-0 bottom-1/2 text-center will-change-transform"
            >
              {opening.stackA.map((line) => (
                <div
                  key={line}
                  className="font-display text-4xl leading-[1.05] tracking-tight text-paper sm:text-6xl md:text-7xl"
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              ref={stackB}
              className="absolute inset-x-0 top-1/2 text-center will-change-transform"
            >
              {opening.stackB.map((line) => (
                <div
                  key={line}
                  className="font-display text-4xl leading-[1.05] tracking-tight text-paper sm:text-6xl md:text-7xl"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={barWrap}
            className="pointer-events-none fixed inset-x-0 bottom-10 z-[45] px-8 transition-opacity duration-500"
          >
            <div className="relative h-px w-full bg-paper/20">
              <div
                ref={barFill}
                className="absolute inset-y-0 left-0 bg-paper"
                style={{ width: "0%" }}
              />
              <span
                ref={barNum}
                className="absolute -top-7 -translate-x-1/2 font-ui text-xs tabular-nums text-paper"
                style={{ left: "0%" }}
              >
                0
              </span>
            </div>
          </div>
        </>
      )}

      {/* ---------- navbar ---------- */}
      {/* showMark=false: this page flies its own animated mark into the
          navbar slot below, so the static one would double up */}
      <SiteNav visible={live} showMark={false} />

      {/* ---------- logo: centre → navbar ----------
          Mounted only once live, so the SVG's own draw-in animation plays as
          it appears. It has to be an <img> (or inline SVG): a CSS mask does
          not run the animation embedded in the file. Sizing stays width-based
          so the vector re-rasterises crisply instead of being scaled. */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center mix-blend-difference">
        <div ref={logoWrap} className="will-change-transform">
          {live && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={logoMark}
              src="/logo/aria-loader.svg"
              alt="Aria Noir"
              className="block h-auto"
              style={{ width: HERO_LOGO_W }}
            />
          )}
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
              className="font-ui text-xs leading-relaxed text-paper/70 sm:text-sm"
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      <main className="relative">
        {/* runway for the fixed choreography above */}
        <div style={{ height: `${RUNWAY_VH}vh` }} />
        <CollectionsSection />
        <AtelierSection />
        <GridSection />
        <WhiteDotOverlay />
        <FinaleSection />
      </main>
      <SiteFooter />
    </>
  );
}
