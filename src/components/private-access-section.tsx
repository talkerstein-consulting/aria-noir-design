"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { AccessModel, setAccessProgress } from "@/components/access-model";
import { privateAccess } from "@/lib/content";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";

/**
 * "The next edition isn't for everyone" — the private-access offer, over a
 * film scrubbed by the scroll.
 *
 * ---- Why a scrub and not a playing video ----
 *
 * A video that plays on its own is something happening in front of a
 * reader. A film advanced frame by frame off the scrollbar is something
 * the reader is doing — the page moves and the room moves with it, at
 * exactly their pace, stopping when they stop. For a section whose whole
 * subject is being let in ahead of everyone else, that difference is the
 * argument.
 *
 * The stage is FrameScrub (installed from the reactbits registry): it
 * samples the film into frames, pins one screen, and walks the sequence
 * across the runway underneath it. The film is the house's own turntable
 * clip — the frame revolving on black, nothing else in shot.
 *
 * ---- The type is a sibling, not a child ----
 *
 * FrameScrub renders its own section with its own sticky stage, so the
 * words cannot go inside it. They ride in an absolutely positioned layer
 * spanning the same runway, with its own `sticky` screen — which is what
 * keeps them pinned over the film for the whole scrub rather than scrolling
 * past it once. The layer is transparent to the pointer except at the CTA,
 * because everything under it is a canvas the reader may well want to
 * scroll straight through.
 */
/**
 * The stage's geometry, in one place.
 *
 * Both numbers are needed twice — once to lay the film out and once to
 * place the gradients that dissolve its two edges — and a gradient that
 * disagrees with the box it is masking is worse than no gradient at all.
 * That is not hypothetical: the bottom fade was first written against the
 * SCREEN's foot, which on a 1282px window put it at 949–1282 while the film
 * ended at 1013. It covered the page under the video and left the video's
 * own edge showing.
 */
const TOP_VH = 7;

/** The stage on a wide screen: a band across most of the window. */
const STAGE_VH = 72;

/** How much scroll the section is given. One screen of it is the sticky
 *  stage standing still; the rest is the lamp's travel. */
const SECTION_VH = 520;

/**
 * The same section on a phone.
 *
 * 520vh is 4.2 screens of lamp travel, which on a wheel is a slow reveal
 * and on a thumb is six or seven swipes to get the light across one frame.
 * The sequence is the same length either way — what changes is how much
 * scrolling it is spread over, and a phone has no reason to spend four
 * screens on it.
 *
 * 300 leaves the sticky screen intact and gives the lamp two screens rather
 * than four. Against the 36 frames a phone samples, that is a frame every
 * 5.6vh of travel — FINER than the desktop's 7vh over 72 frames, so the
 * turn does not get coarser for being shorter.
 *
 * The white iris is safe here and it is worth saying why: it is anchored to
 * this section but measured back from its BOTTOM (DOT_START_VH / DOT_END_VH
 * in lib/timeline), so it keeps its place in the last screen of the section
 * however tall the section is. Shortening moves the iris up with it rather
 * than out of alignment.
 */
const NARROW_SECTION_VH = 300;

/**
 * The stage on a phone: a 4:5 portrait plate, 1080×1350 in the shape the
 * house's stills are cut to.
 *
 * A landscape band on a portrait screen either crops the frame down to its
 * bridge (cover) or floats it small in the middle of a lot of black
 * (contain). A portrait plate is the shape the picture wants on that
 * screen, and `cover` into it is a genuine zoom rather than a compromise —
 * the frame arrives at the size a phone can actually read it at.
 *
 * Its height therefore follows the WIDTH, not the viewport: 100vw × 5/4,
 * expressed as the fraction of viewport height the stage prop takes.
 */
const PORTRAIT_AR = 1350 / 1080;

/** Below this the sequence is sampled for a phone rather than a desktop. */
const SMALL = "(max-width: 767px)";

/**
 * How many frames are decoded, and how wide each one is kept.
 *
 * These two numbers are the whole cost of this section. Every frame is held
 * as a decoded canvas, so the memory is roughly count × width × height × 4
 * — 108 frames at 720px is about 120MB, which is fine on a laptop and is a
 * phone browser discarding the tab.
 *
 * Worse than the memory was the WAIT. Frames are harvested by seeking the
 * video once per frame, and on a phone that took long enough that the
 * section showed the component's own loading readout — a percentage
 * counting up on a black screen where the film should be. That is what was
 * busted on mobile: not the layout, the budget.
 *
 * 36 frames of a five-second turn is a frame every 140ms. On a screen this
 * size, scrubbed by a thumb, that reads as continuous.
 *
 * The desktop number came down too, from 108. Frames are harvested by
 * seeking the video once each, so the count is also a WAIT — at 108 the
 * readout was still climbing when a reader arrived at the section. 72 over
 * five screens of scroll is a frame every 7vh of travel, which on a turn
 * this slow is more than the eye asks for.
 */
export function PrivateAccessSection() {
  /* The scroll the lamp is spent over. Five screens: one is the sticky
     stage holding still, the other four are the light crossing the frame.
     The white iris opens over the last of them — see the note in
     experience.tsx — so the page turns light while the lamp is still
     moving, which is the handover rather than a collision. */
  const wrap = useRef<HTMLElement>(null);
  useScrollProgress(wrap, setAccessProgress);

  /* Read once, at mount, through the store React gives for exactly this:
     no state written from an effect, and a server render that matches the
     client's first paint because both start from the desktop branch. */
  const subscribe = useCallback((notify: () => void) => {
    const mq = window.matchMedia(SMALL);
    mq.addEventListener("change", notify);
    return () => mq.removeEventListener("change", notify);
  }, []);
  const small = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(SMALL).matches,
    () => false,
  );

  /* The phone stage is sized off the window's WIDTH, so it has to be
     recomputed when the window changes — a rotation is a different plate,
     not a stretched one. Rounded to three places because the snapshot is
     compared by value: an unrounded ratio would report a new number on
     every resize pixel and re-render for nothing. */
  const resize = useCallback((notify: () => void) => {
    window.addEventListener("resize", notify);
    window.addEventListener("orientationchange", notify);
    return () => {
      window.removeEventListener("resize", notify);
      window.removeEventListener("orientationchange", notify);
    };
  }, []);
  const portrait = useSyncExternalStore(
    resize,
    () =>
      Math.round(
        Math.min(0.94, (window.innerWidth * PORTRAIT_AR) / window.innerHeight) *
          1000,
      ) / 1000,
    () => STAGE_VH / 100,
  );

  const stage = small ? portrait : STAGE_VH / 100;

  return (
    <section
      id="private-access"
      ref={wrap}
      className="relative z-[36] bg-ink"
      style={{ height: `${small ? NARROW_SECTION_VH : SECTION_VH}vh` }}
    >
      <div className="relative h-full">
      {/* The stage: one screen, held, with the frame in it. The section's
          height is what the scroll is spent on — see SECTION_VH. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-x-0"
          style={{ top: `${TOP_VH}vh`, height: `${stage * 100}vh` }}
        >
          <AccessModel />
        </div>
      </div>

      {/* The words and the two edges, pinned over the frame for the length
          of the section. */}
      <div className="pointer-events-none absolute inset-0">
        {/* Lower than it was, but not against the edge: on a phone the block
            is a three-line heading, three lines of body and the CTA, and at
            40px the action was sitting under the floating cart badge. */}
        <div className="sticky top-0 h-screen">
          {/* The two edges, laid over THE FILM rather than over the screen.

              The film runs edge to edge, so it ends at two hard horizontal
              lines — the top and bottom of the stage box against the page.
              This layer is that box exactly (see TOP_VH / STAGE_VH), which
              is the only way the fades can land on the edges they exist to
              dissolve. Ink at full strength at each edge, gone by about a
              third of the way in. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{ top: `${TOP_VH}vh`, height: `${stage * 100}vh` }}
          >
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-ink from-2% via-ink/55 via-45% to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink from-2% via-ink/60 via-45% to-transparent" />
          </div>

          {/* The words sit against the foot of the SCREEN, not of the film —
              they are the section's floor, and the film is behind them. */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-16 text-center sm:px-10 sm:pb-14">
          <div className="relative flex max-w-3xl flex-col items-center gap-5">
            <RevealText
              as="h2"
              text={privateAccess.heading}
              className="font-display text-4xl leading-[1.04] tracking-tight text-balance text-paper uppercase sm:text-6xl"
            />
            <p className="max-w-xl font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base">
              {privateAccess.body}
            </p>
            <CtaLink href={privateAccess.href} className="pointer-events-auto mt-6">
              {privateAccess.cta}
            </CtaLink>
            </div>
          </div>
        </div>
      </div>
      </div>

    </section>
  );
}
