"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { House } from "@/lib/navigation";

/**
 * The bottom of the story is the top of the buy page.
 *
 * ---- What this used to be ----
 *
 * A hand-off between two drawings of the same screen. The story page
 * ended on a counter — the buy page's hero rebuilt from the buy page's
 * own stylesheet — and this file pinned that counter at the one offset
 * where it coincided with the real thing, measured the gap by laying out
 * an invisible copy of the buy page's grid (the "ghost") and comparing
 * plate to plate, faded the closing words out on the way up, snapped the
 * reader through the dead stretch, and changed the route at the pin. No
 * animation, because at the pin the two surfaces were the same picture to
 * the pixel.
 *
 * All of that was the price of the counter existing. The counter is gone
 * (see StoryPage), so the lift, the ghost, the plate measurement, the
 * closing fade and the snap are gone with it. There is nothing to align
 * any more: there is a document that ends, and a page that begins.
 *
 * ---- What it is now ----
 *
 * Three things:
 *
 *   a runway. Past the last of the faces the reader scrolls on into a
 *   screen of empty ground, so the story is still MOVING UP after the
 *   pictures have run out. The wipe starts a fifth of the way into it,
 *   while that movement is still going, and the rest of the ground sits
 *   under the trigger so the scroll has somewhere to go while the circle
 *   opens (RUNWAY_LEAD / RUNWAY_TAIL);
 *
 *   then the route changes;
 *
 *   then the buy page is wiped in. Not scrubbed by scroll: the push
 *   carries the `story-wipe` transition type, app/template.tsx maps it
 *   onto its <ViewTransition>, and house.css runs it — the story held
 *   dead still exactly where the reader left it while a circle opens from
 *   the centre of the screen and the buy page comes through it. Scroll
 *   chooses the moment; the browser runs the move.
 *
 * ---- Reduced motion ----
 *
 * Nothing. No runway, no trigger, no push, no wipe: a page that navigates itself
 * under a reader who has asked the screen to hold still is the one thing
 * this should never do. The way to the buy page is then the pinned
 * ACQUIRE link that StoryIndex carries the whole length of the story,
 * which is a press and is always there.
 */

/** How far from the trigger the destination starts loading, in pixels.
 *
 *  Two and a half screens on a laptop. It was one, which put the fetch
 *  and the reader's arrival close enough together that the work could
 *  still be landing as they reached the foot. The route wants to be warm
 *  and QUIET by the time the wipe is due, so the window is wide and the
 *  call itself waits for an idle frame inside it (see the observer).
 *
 *  Still short enough that a reader who turns back at the last plate has
 *  not paid for a page they never asked for. */
const WARM = 2000;

/** How much of the foot has to be on screen to count as arrival.
 *
 *  The sentinel is 8px rather than 1px and the trip is its intersection,
 *  not a scroll-position sum. Measuring `scrollHeight - (scrollY +
 *  innerHeight)` against zero looks equivalent and is not: it can only be
 *  re-read when something fires a scroll event, and the last thing that
 *  happens at the foot of this page is the page getting SHORTER as lazy
 *  sections above resolve to their real heights. Measured, the reader ends
 *  up parked at a gap of exactly zero with the trip last evaluated at a
 *  gap of four hundred, nothing left to scroll, and nothing happening —
 *  which is what this did on the first run. An observer is told when the
 *  foot arrives whatever moved it, the document or the viewport. */
const FOOT = 8;

/** ---- Where in the runway the wipe starts ----
 *
 *  The runway is still 85svh of ground after the last plate, so the story
 *  still carries on moving up after the pictures have run out. What
 *  changed is WHERE in it the circle opens.
 *
 *  It used to open at the very foot: the reader travelled the whole
 *  screen, came to a stop, and only then did anything happen — a beat of
 *  dead air at the end of a page, which read as the story having finished
 *  rather than as one page opening into another.
 *
 *  Now the trigger sits a fifth of the way in. The wipe commences while
 *  the story is STILL TRAVELLING, which is the point: the circle opens
 *  over moving content and the two motions carry each other, rather than
 *  one waiting for the other to finish.
 *
 *  LEAD is the travel before it starts; TAIL is the ground left under the
 *  trigger. The tail is not padding — it is what stops the reader hitting
 *  the bottom of the document mid-wipe, where the scroll would stall
 *  against the end of the page while the circle was still opening. The
 *  two sum to the runway, so the document is no longer than it was. */
const RUNWAY_LEAD = "18svh";
const RUNWAY_TAIL = "67svh";

export function StoryHandoff({ house }: { house: House }) {
  const router = useRouter();
  /* No query. The counter was the only thing on a story page that asked
     which acetate, and it is gone, so there is no reader choice to carry
     across — the buy page opens on its own default, exactly as it does
     for anyone arriving from the shop grid. See lib/story-offer, now
     written only by the buy page. */
  const href = `/shop/${house.slug}`;

  const foot = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const warmed = useRef(false);
  /* The reader has to have moved at least once before the foot means
     anything. A story restored at its own bottom — a reload, a back
     press, a deep link with a remembered position — would otherwise
     observe the sentinel on its first frame and push, which is not a
     hand-off, it is a redirect out of a page nobody has looked at. */
  const armed = useRef(false);

  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setCalm(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);

  useEffect(() => {
    if (calm) return;

    const el = foot.current;
    if (!el) return;

    const arm = () => {
      armed.current = true;
    };
    window.addEventListener("scroll", arm, { passive: true, once: true });

    const hand = () => {
      if (done.current) return;
      done.current = true;

      /* ---- the swap ----

         `scroll: false`, then the top of the document by hand.

         The router's own reset lands in the same place but runs when the
         new tree commits, and Lenis is driving this page: one animated
         frame of it is a flinch on the frame the zoom starts from. Taken
         by hand it is a setting, not a movement.

         Lenis is stopped first. It may still be easing toward a target
         measured on THIS document — seventeen thousand pixels of it —
         and left running it carries that target over the top of the new
         page, which is how the buy page once opened five and a half
         thousand pixels down.

         `transitionTypes` rather than a bare push: it is what arms the
         wipe. See app/template.tsx and `.story-wipe` in house.css. */
      const dest = new URL(href, window.location.origin).pathname;
      const lenis = window.__lenis;
      lenis?.stop();
      router.push(href, { scroll: false, transitionTypes: ["story-wipe"] });

      /* Never reset before the destination is actually on. A reset taken
         while the story is still the document is a flight back to its own
         hero, and that is exactly what it looks like: a flash of the top
         of the story on the way out. So it waits for the route to change
         under it, frame by frame, and gives up rather than watching
         forever. */
      let frames = 0;
      const settle = () => {
        if (window.location.pathname === dest) {
          /* Held for a few frames rather than set once. Between the
             commit and the first paint the new document is still finding
             its height, and Lenis, the router's restoration and the
             browser's scroll anchoring each get a say; any one of them
             can leave the buy page opening two hundred pixels down.
             Lenis is stopped throughout, so no reader input is being
             overruled — it starts again at the end of the hold. */
          const hold = () => {
            lenis?.scrollTo(0, { immediate: true, force: true });
            if (window.scrollY !== 0) window.scrollTo(0, 0);
          };
          hold();
          let held = 0;
          const keep = () => {
            if (held++ < 15) {
              if (window.scrollY > 2) hold();
              requestAnimationFrame(keep);
            } else {
              lenis?.start();
            }
          };
          requestAnimationFrame(keep);
          return;
        }
        /* Three seconds is not a hand-off, it is a failure — and a page
           left with its scroll stopped is worse than one that arrived
           badly. */
        if (frames++ < 180) requestAnimationFrame(settle);
        else lenis?.start();
      };
      requestAnimationFrame(settle);
    };

    /* Two observers on the one sentinel, because they answer different
       questions. The warm one is asked a screen out — is the reader
       heading this way — and the trip one only when the foot is actually
       on screen. One observer with two thresholds cannot express that:
       `rootMargin` is per observer, not per threshold. */
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || warmed.current) return;
        warmed.current = true;
        /* ---- why the prefetch waits for an idle frame ----

           `router.prefetch` is not free on the main thread, and in
           development it is expensive: it makes the dev server compile
           /shop/[slug], and the client work that comes back with it lands
           while the reader is mid-scroll — a stutter at the foot of the
           story, which is the one place on this page nothing may stutter,
           because it is the run-up to the wipe.

           An idle callback hands it a gap between frames instead. The
           2s timeout is the floor: a reader scrolling hard may never give
           the browser a genuinely idle moment, and a warm route late is
           still better than a cold one at the pin. The fallback is for
           Safari, which has no requestIdleCallback — a timeout there is
           no worse than the unconditional call this replaces. */
        const go = () => router.prefetch(href);
        const idle: typeof window.requestIdleCallback | undefined =
          window.requestIdleCallback;
        if (idle) idle(go, { timeout: 2000 });
        else window.setTimeout(go, 300);
      },
      { rootMargin: `0px 0px ${WARM}px 0px` },
    );

    const trip = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || !armed.current) return;
        hand();
      },
      { rootMargin: "0px" },
    );

    warm.observe(el);
    trip.observe(el);

    return () => {
      window.removeEventListener("scroll", arm);
      warm.disconnect();
      trip.disconnect();
    };
  }, [calm, router, href]);

  /* ---- the runway, the trigger, the ground under it ----

     Ink after the last picture, with the sentinel a fifth of the way down
     rather than at the bottom. The reader scrolls past the faces, the
     story keeps moving up, and the circle opens EARLY — while that
     movement is still going — with the rest of the runway underneath so
     the scroll does not hit the end of the document while the wipe is
     still opening. See RUNWAY_LEAD / RUNWAY_TAIL.

     `svh`, not `vh`, for the same reason every other full-height box on
     this site uses it: on a phone `vh` is the tallest the viewport ever
     gets, so the runway would be a browser-chrome taller than the screen
     and the trigger would sit below a bar the reader cannot scroll past.

     Nothing at all under reduced motion. The runway is scroll that
     exists to be travelled before a wipe, and there is no wipe: left in,
     it would be most of a screen of black at the end of the page with
     nothing under it and nothing to come. Those readers end on the last
     of the faces, and the way on is the pinned ACQUIRE link.

     `aria-hidden` otherwise, because there is nothing here to read. A
     reader on a screen reader reaches the end of the faces and takes that
     same link. */
  if (calm) return null;

  return (
    <div aria-hidden className="w-full bg-ink">
      <div className="w-full" style={{ height: RUNWAY_LEAD }} />
      <div ref={foot} className="w-full" style={{ height: FOOT }} />
      <div className="w-full" style={{ height: RUNWAY_TAIL }} />
    </div>
  );
}
