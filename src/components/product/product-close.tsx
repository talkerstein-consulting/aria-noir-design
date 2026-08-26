"use client";

import ImageTrail from "@/components/ImageTrail";
import type { Close } from "@/lib/product";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";

/**
 * Light closing block. Like the home page's finale it carries no background
 * of its own — the white underneath is the iris the WhiteDotOverlay has
 * already expanded, which keeps that circle the page's only dark→light cut.
 *
 * The closing line sits at the TOP of this section rather than a third of
 * the way down it: the iris finishing is the beat the line is answering, so
 * any run-up of empty white in between reads as the page having stalled.
 *
 * The pointer trail is scoped to the heading's own zone — absolutely
 * positioned inside it, so it can never reach the body copy or the CTA
 * below. Within that zone it sits above the type, so plates pass over the
 * letterforms rather than under them.
 */
export function ProductClose({ close }: { close: Close }) {
  return (
    <section
      id="acquire"
      className="relative z-[38] overflow-hidden px-6 pt-[8vh] pb-32 text-ink sm:px-10 sm:pb-48"
    >
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
        <CtaLink href="#acquire" variant="dark" className="relative z-30 mt-4">
          {close.cta}
        </CtaLink>
      </div>
    </section>
  );
}
