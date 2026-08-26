"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { gallery } from "@/lib/content";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { SECTION_PAD } from "@/lib/timeline";
import { CtaLink } from "@/components/cta-link";
import { RevealText, RevealPlate, type Segment } from "@/components/reveal";

/** All columns reach their final position at this progress — together. */
const SETTLE_AT = 0.68;
/** Drape depth per column. Varying these is what gives the curtain its fall;
 *  because one shared `settle` scales all four, deeper columns necessarily
 *  move faster yet still land on the same beat. */
const TRAVEL_VH = [18, 44, 30];
/** Chase coefficient — lower is heavier. This is what keeps the curtain
 *  drifting for a moment after the wheel stops. */
const CHASE = 0.075;
const EPS = 0.0002;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type GridContent = {
  preheader: string;
  /** Plain, or segments where the heading mixes roman and italic. */
  heading: string | readonly Segment[];
  cta: string;
  columns: readonly (readonly string[])[];
};

type GridSectionProps = {
  /** Defaults to the home page's gallery. The lookbook passes its own set. */
  content?: GridContent;
  /** Where the CTA goes. */
  href?: string;
  /** WhiteDotOverlay anchors its handoff to this id, so a page running its
   *  own iris must give this section an id that page's overlay names. */
  id?: string;
};

export function GridSection({
  content = gallery,
  href = "#gallery",
  id = "gallery",
}: GridSectionProps = {}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);

  const target = useRef(0);
  const current = useRef(0);
  const kick = useRef<() => void>(() => {});

  /* The curtain follows scroll through a chase rather than tracking it 1:1,
     so when the wheel stops the columns keep easing into place for a beat.
     Declared before useScrollProgress so `kick` exists by its first call. */
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
      /* WhiteDotOverlay anchors its handoff to this section's extent */
      id={id}
      /* deliberately deeper side margins than the rest of the page — the
         curtain wants more air either side than a standard gutter gives */
      className={`relative z-[37] bg-ink px-6 sm:px-20 lg:px-40 ${SECTION_PAD}`}
    >
      {/* preheader + heading + CTA */}
      <div className="mx-auto mb-24 flex max-w-4xl flex-col items-center gap-6 text-center sm:mb-32">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
          {content.preheader}
        </p>
        <RevealText
          as="h2"
          text={content.heading}
          className="font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl"
        />
        <CtaLink href={href} className="mt-4">
          {content.cta}
        </CtaLink>
      </div>

      {/* 3-column curtain — equal photo counts, so it always rests aligned;
          the only difference between columns is how fast they fall */}
      {/* THREE columns at every width. It was `grid-cols-2` below sm, which
          quietly broke the whole object: the curtain is three vertical
          stacks, so a two-column grid wrapped the third stack onto a second
          row — two columns side by side and an orphan hanging underneath,
          each still translating at its own speed. A curtain with a piece
          fallen off it. Narrower tiles are the correct trade. */}
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-x-3 sm:gap-x-14 lg:gap-x-20">
        {content.columns.map((col, i) => (
          <div
            key={i}
            ref={(el) => {
              cols.current[i] = el;
            }}
            /* the in-column gap tracks the tile width, or a phone reads as
               three sparse ribbons rather than one dense curtain */
            className="flex flex-col gap-3 will-change-transform sm:gap-14 lg:gap-20"
            style={{ transform: `translateY(${TRAVEL_VH[i]}vh)` }}
          >
            {col.map((src, j) => (
              <RevealPlate
                key={src}
                delay={j * 70}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="30vw"
                  /* crop in slightly: several plates run bright right to
                     the edge, which reads as a pale border around the tile */
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
