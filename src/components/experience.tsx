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
import { opening, sectionTwo } from "@/lib/content";
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
import { whenAssetsReady } from "@/lib/preload";
import { kickPlay } from "@/lib/autoplay";
import { privateAccess } from "@/lib/content";

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
  { ssr: false, loading: () => <div className="h-[520vh] bg-ink" /> },
);

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

/**
 * Where the counter waits for the page.
 *
 * The readout is no longer a pure animation: it climbs on time until this
 * fraction and then HOLDS there until the assets are in — see lib/preload.
 * The last few percent are the handover itself, so they cannot be spent
 * before the thing being handed over exists.
 *
 * 0.9 rather than 0.99 on purpose. A bar that sticks at 99 reads as broken;
 * one that pauses at 90 reads as still working, which is the truth.
 */
const HOLD_AT = 0.9;

/**
 * The ceiling on all of it.
 *
 * Waiting for assets means the loader's length is now decided by the
 * NETWORK, and a network can simply never answer. Past this, the page opens
 * regardless and whatever has not arrived arrives late — a page assembling
 * itself is a bad first impression, a loading screen that never ends is a
 * lost visitor.
 */
const MAX_WAIT_MS = 26000;

/* 9000 before, and it was the binding constraint on the whole loader rather
   than the last-resort ceiling it is written as: the per-asset waits in
   lib/preload run to 8s each and are wrapped again at 16s, so anything that
   was genuinely still downloading lost to this timer every time. The loader
   spent its life pretending to wait.
   
   It can afford to be a real ceiling now. The hero film was a 42MB master
   and is 4.2MB — see scripts/compress-video.mjs — so the thing this was
   quietly cutting short is now something a slow connection can actually
   finish inside the ceiling.

   26s rather than 16, to sit above lib/preload's own per-asset ceiling
   rather than under it: at 16s this timer fired first and the per-asset
   waits never got to finish, which made them decorative. The home page's
   cold payload is about 7MB, so this covers down to roughly 2.5 Mbps.
   Past that the page opens unfinished, which is the correct failure — the
   alternative is a visitor who never gets in. */

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
    /* Set when the page's own assets are in. A ref, not state: it is read
       inside the rAF loop, and a re-render per change would be a re-render
       for something nothing renders. */
    let ready = false;
    /* Time spent waiting at HOLD_AT, subtracted from the clock so the
       counter resumes where it paused instead of jumping to catch up. */
    let held = 0;
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

    /* The counter now waits on the page. The hero film is the one that
       matters most — it is what the box expands into — but everything the
       document declared is included, plus the glb the private-access
       section lights, which no markup above would otherwise make anyone
       wait for and which decides whether that section has an object in it
       when a reader arrives. */
    whenAssetsReady({ files: [privateAccess.model] }).then(() => {
      ready = true;
    });

    /* Two failsafes, because there are now two ways to hang: a starved rAF
       (the old one — background tabs and low-power throttling never reach
       OPENING_MS) and a network that never finishes. */
    const failsafe = window.setTimeout(finish, MAX_WAIT_MS);

    const tick = (now: number) => {
      if (done) return;
      const ms = now - start - held;

      /* Hold the readout at HOLD_AT while the page is still loading by
         freezing the clock rather than the number: everything downstream is
         a function of `ms`, so one subtraction pauses the whole opening —
         counter, dot and box together — and releases it in step. */
      if (!ready && ms > COUNT_MS * HOLD_AT) {
        held += ms - COUNT_MS * HOLD_AT;
        raf = requestAnimationFrame(tick);
        return;
      }

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

    /* Read per frame rather than captured once: a phone rotating into
       landscape crosses this breakpoint, and a scene half-played on one
       budget and half on the other would jump. */
    const perVh = () =>
      window.matchMedia("(max-width: 1023px)").matches
        ? NARROW_FRAMES_PER_VH
        : FRAMES_PER_VH;

    const onScroll = () => {
      const vh = window.innerHeight;
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
          {/* `autoPlay` is a request the browser may decline — Low Power
              Mode, Data Saver, a tab that opened in the background. This
              film is the page's opening image, so it is asked directly as
              well, and asked again if the answer changes. See lib/autoplay. */}
          <video
            ref={kickPlay}
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
        {/* The dark→light handoff moved with it: the iris is anchored to
            the END of whatever section precedes the closing block, and that
            is no longer the gallery. Anchored by id rather than by position
            so the two cannot drift apart silently. */}
        <WhiteDotOverlay anchorId="private-access" />
        <FinaleSection />
      </main>
      <SiteFooter />
    </>
  );
}
