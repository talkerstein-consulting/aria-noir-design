"use client";

import ImageTrail from "@/components/ImageTrail";
import type { Close } from "@/lib/product";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";

/**
 * Light closing block, and the page's own dark to light turn.
 *
 * It used to carry NO background: the white came from the WhiteDotOverlay,
 * a fixed circle that expanded over the gallery while the gallery kept
 * scrolling underneath it. That was the clearest case of a section sitting
 * above another on this page, so it is gone from the story pages, and the
 * white is this section's own.
 *
 * The turn is a gradient in the top band rather than a hard edge. The
 * gallery above ends on ink; this opens on ink and is paper by the time
 * the heading arrives, so the page changes ground while it scrolls instead
 * of cutting between two grounds.
 *
 * The closing line still sits near the TOP rather than a third of the way
 * down: a run-up of empty white before it reads as the page having
 * stalled.
 *
 * The pointer trail is scoped to the heading's own zone — absolutely
 * positioned inside it, so it can never reach the body copy or the CTA
 * below. Within that zone it sits above the type, so plates pass over the
 * letterforms rather than under them.
 */
/**
 * `buyHref` is where the offer actually goes.
 *
 * These CTAs pointed at `#acquire`, the closing block at the foot of the
 * page — whose own CTA also pointed at `#acquire`. Three offers to acquire
 * the frame, every one of which scrolled you to a fourth offer to acquire
 * the frame. The page could not sell anything because the site had nowhere
 * to sell it. `/shop/<slug>` is that place now, so the page hands the
 * reader to it.
 */
export function ProductClose({
  close,
  buyHref,
}: {
  close: Close;
  buyHref: string;
}) {
  return (
    <section
      id="acquire"
      className="relative overflow-hidden bg-paper px-6 pt-[8vh] pb-32 text-ink sm:px-10 sm:pb-48"
    >
      {/* The turn itself. Ink at the very top, paper by the time the
          heading is on screen, so the gallery above hands over rather than
          stops. Behind the content and inert to the pointer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-ink to-paper"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
        {/* heading zone — the trail's full extent */}
        <div className="relative w-full">
          {/* `isolate` traps ImageTrail's own z-index:100 inside this wrapper,
              so the z-20 here is what actually decides its stacking. */}
          <div className="absolute inset-0 z-20 isolate" aria-hidden>
            <ImageTrail items={[...close.trail]} variant={1} />
          </div>
          <RevealText
            as="h2"
            text={close.heading}
            className="pointer-events-none relative z-10 font-display text-5xl leading-[1.02] tracking-tight text-balance text-ink sm:text-7xl md:text-8xl"
          />
        </div>

        <p className="relative z-30 max-w-xl font-ui text-base leading-relaxed text-pretty text-ink/65 sm:text-lg">
          {close.body}
        </p>
        <CtaLink
          href={buyHref}
          variant="dark"
          className="cta--filled relative z-30 mt-4"
        >
          {close.cta}
        </CtaLink>
      </div>
    </section>
  );
}
