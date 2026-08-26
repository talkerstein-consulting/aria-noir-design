import Image from "next/image";
import type { Spec } from "@/lib/product";
import { RevealText, RevealPlate } from "@/components/reveal";
import { SpecRows } from "./spec-rows";

/**
 * "The Specs" — same sticky-left / scrolling-right shape the object study
 * used elsewhere on this page: the bench sheet holds in place while the
 * macro plates run past it, so every material claim stays in view against
 * the detail shots that back it up.
 */
export function ProductSpec({ spec }: { spec: Spec }) {
  return (
    <section
      id="specification"
      className="on-ink section relative z-[36] bg-ink"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ---- column 1: sticky bench sheet ---- */}
        <div className="lg:sticky lg:top-28">
          <div className="stack stack--sm mb-16 sm:mb-20">
            <p className="t-eyebrow">{spec.preheader}</p>
            <RevealText as="h2" text={spec.heading} className="t-display-lg" />
          </div>

          <SpecRows rows={spec.rows} />
        </div>

        {/* ---- column 2: scrolling macro plates ---- */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {spec.macro.map((img, i) => (
            <RevealPlate
              key={img.src}
              delay={i * 60}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </RevealPlate>
          ))}
        </div>
      </div>
    </section>
  );
}
