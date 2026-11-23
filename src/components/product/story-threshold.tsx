"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import type { House } from "@/lib/navigation";
import { defaultColorway, priceOf, squareFor, swatchFor } from "@/lib/shop";
import { useStoryOffer } from "@/lib/story-offer";

/**
 * The foot of the story, and the way into the counter without a click.
 *
 * ---- What it is ----
 *
 * A reader who has come all the way down a story page has read the whole
 * argument. The page then ends — the counter, the other houses, the footer
 * — and the only thing left to do is press something. This is the other
 * answer: keep scrolling at the bottom of the page and the buy page comes
 * up to meet you, the chosen acetate's plate rising into the position it
 * occupies on `/shop/<slug>`, and the route changes under it.
 *
 * ---- Why the gesture is OVERSCROLL and not a pinned section ----
 *
 * The first shape for this was a pinned stage above Other Collections that
 * committed at eighty-five percent of its own scroll. It worked, and it
 * made the rest of the page unreachable: a reader who wanted the other
 * houses had to be carried to the counter first. A page cannot have a
 * trapdoor in the middle of it.
 *
 * So the gesture lives past the LAST pixel of the document, where there is
 * nothing below to take. Pull down at the bottom and the sheet rises with
 * the pull; let go and it falls back; pull it the whole way and the page
 * commits. Nothing above the fold changes, nothing is skipped, and a
 * reader who never reaches the bottom never meets it.
 *
 * ---- Why the plate is the buy page's own plate ----
 *
 * The sheet shows `squareFor(house, colourway)` — the SAME photograph the
 * buy page opens on, at the same proportion, on the same ink. The reader
 * is looking at the object when the route changes and is still looking at
 * it afterwards, which is the continuity this is for.
 *
 * It is not yet a paired morph. React's `<ViewTransition name>` would hand
 * the plate across the navigation as one moving object, and it is the
 * right mechanism — but it ships in React 19.3 and this app is on 19.2.8,
 * where the export does not exist. When React moves, the change is one
 * wrapper here and one around the buy page's first plate, both named
 * `plate-<slug>`; nothing else in this file has to change. The counter
 * above must stay unnamed either way, because two live elements under one
 * transition name is a duplicate and the browser drops the animation.
 *
 * ---- Reduced motion ----
 *
 * The sheet does not rise and nothing morphs. The pull is still counted,
 * because the gesture is a way of navigating and not an ornament; it
 * simply arrives at the buy page without the travel.
 */

/** How much overscroll, in pixels of wheel or thumb, commits the page. */
const PULL = 440;
/** Nothing felt for this long and the sheet falls back. */
const IDLE = 140;

export function StoryThreshold({ house }: { house: House }) {
  const router = useRouter();
  const offer = useStoryOffer();
  /* The counter publishes what it is showing; before it has mounted or on
     a house whose counter is the lookbook's, fall back to the same rule
     every other surface opens on. */
  const colourway =
    (offer.slug === house.slug ? offer.colourway : null) ??
    defaultColorway(house) ??
    null;

  const href = `/shop/${house.slug}${colourway ? `?colourway=${encodeURIComponent(colourway)}` : ""}`;

  const [p, setP] = useState(0);
  const pull = useRef(0);
  const idle = useRef(0);
  const fall = useRef(0);
  const done = useRef(false);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setCalm(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);

  /* The buy page is fetched the moment the reader is at the bottom, not
     when they commit: a morph into a page that has not arrived yet drops
     to a plain navigation, which is exactly the case this exists to
     avoid. */
  const warmed = useRef(false);
  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    router.prefetch(href);
  }, [router, href]);

  const commit = useCallback(() => {
    if (done.current) return;
    done.current = true;
    /* A Transition is what arms `<ViewTransition>`; a bare push animates
       nothing. */
    startTransition(() => {
      router.push(href);
    });
  }, [router, href]);

  useEffect(() => {
    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;

    const relax = () => {
      window.cancelAnimationFrame(fall.current);
      const step = () => {
        pull.current = Math.max(0, pull.current - PULL / 14);
        setP(pull.current / PULL);
        if (pull.current > 0) fall.current = window.requestAnimationFrame(step);
      };
      fall.current = window.requestAnimationFrame(step);
    };

    const take = (dy: number) => {
      if (done.current) return;
      if (!atBottom()) {
        /* Left the floor: whatever was pulled is given back. */
        if (pull.current > 0) relax();
        pull.current = 0;
        return;
      }
      warm();
      if (dy <= 0) {
        /* Pulling the other way is a refusal, and a fast one. */
        pull.current = Math.max(0, pull.current + dy * 2);
        setP(pull.current / PULL);
        return;
      }
      window.cancelAnimationFrame(fall.current);
      pull.current = Math.min(PULL, pull.current + dy);
      setP(pull.current / PULL);
      if (pull.current >= PULL) {
        commit();
        return;
      }
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(relax, IDLE);
    };

    const onWheel = (e: WheelEvent) => take(e.deltaY);

    /* Touch gives no delta of its own: the thumb's travel is the pull, and
       a drag UP the screen is a scroll DOWN, hence the sign. */
    let last = 0;
    const onStart = (e: TouchEvent) => {
      last = e.touches[0]?.clientY ?? 0;
    };
    const onMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      take(last - y);
      last = y;
    };
    const onEnd = () => {
      window.clearTimeout(idle.current);
      if (!done.current) relax();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.clearTimeout(idle.current);
      window.cancelAnimationFrame(fall.current);
    };
  }, [commit, warm]);

  const plate = squareFor(house, colourway ?? undefined);
  const acetate = swatchFor(colourway ?? house.colorwayNames[0]);

  /* Nothing in the tree until the reader has actually pulled, so the page
     carries no fixed overlay for the ninety-nine percent who never do. */
  if (p <= 0) return null;

  /* Reduced motion: the gesture still navigates, it just never draws. */
  if (calm) return null;

  /* Eased, so the first few pixels of the pull are felt. */
  const e = 1 - Math.pow(1 - Math.min(1, p), 3);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-ink"
      style={{ transform: `translate3d(0, ${(1 - e) * 100}%, 0)` }}
    >
      <div
        className="flex w-full max-w-[min(560px,70svh)] flex-col items-center px-6"
        style={{ opacity: Math.min(1, e * 1.4) }}
      >
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ background: acetate }}
        >
          {plate ? (
            <Image src={plate} alt="" fill sizes="560px" className="object-cover" />
          ) : null}
        </div>
        <p className="t-display-lg mt-6 text-paper">{house.name}</p>
        <p className="buy-price mt-2 text-paper/70 tabular-nums">
          {priceOf(house, colourway ?? undefined)}
        </p>
        <p className="t-caption mt-4 text-paper/50">Keep going for the counter</p>
      </div>
    </div>
  );
}
