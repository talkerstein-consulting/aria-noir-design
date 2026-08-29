"use client";

import FrameScrub from "@/components/frame-scrub";
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
const STAGE_VH = 72;

export function PrivateAccessSection() {
  return (
    <section id="private-access" className="relative z-[36] bg-ink">
      <div className="relative">
      <FrameScrub
        /* Full bleed at EVERY width, and the film held high in the screen.

           The stage's own wrapper carries a gutter (`px-4 sm:px-8`) and a
           max width — furniture for a component sitting IN a page, and this
           one is the page for as long as it holds the screen. Both are
           overridden on the sticky child, where they live.

           `!` on the padding is load-bearing: the wrapper sets it at two
           breakpoints, and an unflagged `px-0` loses to its `sm:px-8` on a
           desktop window — which is exactly how this came to be full width
           on a phone and inset on a laptop. Important beats both.

           `justify-start` with a small top offset lifts the film off centre.
           Centred, the frame sat behind the type; up here the object has the
           top two-thirds and the words have the floor. */
        /* pt-[7vh] is TOP_VH, written out. Tailwind scans source TEXT for
           class names, so a template literal here compiles to no rule at
           all and the film silently sits back in the middle — the two have
           to be kept in step by hand. */
        className="[&>div]:!px-0 [&>div]:justify-start [&>div]:pt-[7vh]"
        video={privateAccess.video}
        /* Nearly every frame the clip has (121), because the scrub is now
           long enough that a sparse set would step.

           Each frame is held as a decoded canvas at `videoQuality` across,
           so the two numbers trade against each other: 108 × 720 is about
           the same memory as the 84 × 860 this replaces, and on a stage
           already upscaling to ~1800px the softer sample is invisible while
           the extra frames are not. */
        count={108}
        videoQuality={720}
        /* The film's own black, not the page's.
        
           `contain` letterboxes a 1280×704 clip inside a taller stage, and
           those bars are painted in this colour — so anything but the black
           the frame was rendered against draws two pale bands across the
           top and bottom of the shot. Pure black matches the clip, and the
           stage then disappears into the section around it. */
        background="#000000"
        accent="#c6a664"
        variant="blend"
        /* cover at full bleed, and this is what actually fixes the seam.
        
           `contain` letterboxes, and a letterboxed stage has TWO blacks in
           it: the film's (rgb 3,3,3 — h264 does not quite reach zero) and
           whatever the bars are painted. No value blends both, which is why
           the stage read as a rectangle laid on the page however the colour
           was set. Filling the box removes the bars, so the only black on
           screen is the film's own. The clip has generous margin around the
           frame, so covering crops air rather than acetate. */
        fit="cover"
        height={STAGE_VH / 100}
        /* Uncapped in practice: the stage takes the window's width, and the
           number is only here because the prop demands one. */
        width={4000}
        /* Square. A rounded stage reads as a card, and this section is a
           window rather than a component. */
        borderRadius={0}
        /* Four screens of scroll for one five-second turn — the film moves
           at about a fifteenth of real time, which is the pace the rest of
           the page's sticky work runs at and slow enough that the frame
           reads as being turned rather than played.

           The white iris opens over the last screen of this, by design: the
           section is anchored to it (WhiteDotOverlay, DOT_START_VH), so the
           page turns light WHILE the frame is still turning rather than
           after a black gap. A tail was added here once to keep the two
           apart and taken out again — the overlap is the handover, not a
           collision. */
        scrollLength={4.2}
        /* No frame counter. It is an instrument reading, and this is the
           one section on the page that is meant to feel like a door. */
        showCounter={false}
        /* Off, both of them. They are the other half of why this did not
           blend: the component paints grain and a vignette over the whole
           STAGE, so the box was lighter and noisier than the page around
           it — a rectangle drawn in film effects. The clip is a clean
           render on black and wants nothing added to it. */
        vignette={0}
        grain={0}
      />

      {/* The words and the two edges, pinned over the film for the length of
          the scrub. */}
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
            style={{ top: `${TOP_VH}vh`, height: `${STAGE_VH}vh` }}
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
