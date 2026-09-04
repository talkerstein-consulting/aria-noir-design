"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Worn } from "@/lib/product";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { SECTION_PAD } from "@/lib/timeline";
import { CtaLink } from "@/components/cta-link";
import { RevealText, RevealPlate } from "@/components/reveal";

/** All columns reach their final position at this progress — together. */
const SETTLE_AT = 0.68;
/** Drape depth per column; one shared `settle` scales all three, so deeper
 *  columns necessarily move faster yet still land on the same beat. The
 *  middle column hangs lowest so the curtain reads as a V, not a stair. */
const TRAVEL_VH = [16, 40, 24];
/** Chase coefficient — lower is heavier. Keeps the curtain drifting for a
 *  moment after the wheel stops. */
const CHASE = 0.075;
const EPS = 0.0002;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The home page's curtain grid, carrying the ARCA I campaign frames. Also
 * the anchor the white-dot handoff measures against, hence the id.
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
export function ProductWorn({
  worn,
  buyHref,
}: {
  worn: Worn;
  buyHref: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);

  const target = useRef(0);
  const current = useRef(0);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    let raf = 0;
    let running = false;

    const step = () => {
      const diff = target.current - current.current;
      current.current += diff * CHASE;

      const settle = easeOutCubic(clamp01(current.current / SETTLE_AT));
      cols.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translateY(${(1 - settle) * TRAVEL_VH[i]}vh)`;
        }
      });

      if (Math.abs(diff) > EPS) {
        raf = requestAnimationFrame(step);
      } else {
        current.current = target.current;
        running = false;
      }
    };

    kick.current = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    return () => cancelAnimationFrame(raf);
  }, []);

  const onProgress = useCallback((p: number) => {
    target.current = p;
    kick.current();
  }, []);

  useScrollProgress(wrap, onProgress);

  return (
    <section
      ref={wrap}
      id="worn"
      /* px-6 is the page gutter (--gutter); this was the one section on the
         page opening at 32px while every other one opened at 24px. */
      className={`relative bg-ink px-6 sm:px-20 lg:px-40 ${SECTION_PAD}`}
    >
      <div className="mx-auto mb-24 flex max-w-4xl flex-col items-center gap-6 text-center sm:mb-32">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
          {worn.preheader}
        </p>
        <RevealText
          as="h2"
          text={worn.heading}
          className="font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl"
        />
        <CtaLink href={buyHref} className="cta--filled mt-4">
          {worn.cta}
        </CtaLink>
      </div>

      {/* Three columns at every width — same fix as the gallery curtain.
          `grid-cols-2` wrapped the third stack onto its own row, so the
          object arrived on a phone as two columns and a remainder. */}
      <div className="grid grid-cols-3 gap-3 sm:gap-10 lg:gap-14">
        {worn.columns.map((col, i) => (
          <div
            key={i}
            ref={(el) => {
              cols.current[i] = el;
            }}
            className="flex flex-col gap-3 will-change-transform sm:gap-10 lg:gap-14"
          >
            {col.map((img, j) => (
              <RevealPlate
                key={img.src}
                delay={j * 70}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="30vw"
                  /* The shoot blows out along the outer edges on several
                     plates (bright floor, sky, a lit wall running to 200+).
                     A small crop-in pushes those margins outside the frame
                     so the grid reads as one set rather than a run of
                     images with pale borders. */
                  className="scale-[1.06] object-cover"
                />
              </RevealPlate>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
