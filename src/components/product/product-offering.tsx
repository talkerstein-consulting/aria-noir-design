import Image from "next/image";
import type { Offering } from "@/lib/product";
import { SECTION_PAD } from "@/lib/timeline";
import { CtaLink } from "@/components/cta-link";
import { RevealText, RevealPlate } from "@/components/reveal";
import { ProductModel } from "@/components/product/product-model";

/**
 * "The Offering" — static, centered, no scroll-triggered dissolve, no amber
 * accent rule. Copy stays plain and factual: number, colorways, one action.
 * Where there is a turntable — ARCA I's K Black, dragable, slow auto-spin —
 * it carries whatever warmth the section needs, standing in for a product
 * photograph. Where there is not, a still life does the same job, and the
 * halo behind it is what keeps a black frame from floating on a black page
 * either way.
 */
export function ProductOffering({ offering }: { offering: Offering }) {
  return (
    <section
      id="offering"
      className={`relative z-[36] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 text-center sm:gap-16">
        <p className="font-ui text-[11px] tracking-[0.35em] text-paper/50 uppercase">
          {offering.preheader}
        </p>

        <RevealPlate className="relative aspect-[3/2] w-full touch-none overflow-hidden">
          {/* The frame is black and so is the page. This halo gives it
              somewhere to sit — a pool of light the object stands in,
              rather than a cut-out floating on nothing. Two stops: a warm
              gold core at very low alpha, fading to nothing well inside
              the plate edge so it never shows a seam against the section. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:radial-gradient(58%_58%_at_50%_46%,rgba(198,166,100,0.16)_0%,rgba(198,166,100,0.06)_38%,rgba(0,0,0,0)_72%)]"
          />
          {offering.view.kind === "model" ? (
            <ProductModel />
          ) : (
            <Image
              src={offering.view.image}
              alt={offering.view.alt}
              fill
              sizes="(min-width: 768px) 56rem, 100vw"
              className="object-contain"
            />
          )}
        </RevealPlate>

        <div className="flex flex-col items-center gap-4">
          <RevealText
            as="h2"
            text={offering.name}
            className="font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl"
          />
          <p className="max-w-md font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base">
            {offering.tagline}
          </p>
        </div>

        <p className="font-ui text-3xl tabular-nums text-paper sm:text-4xl">
          {offering.price}
        </p>

        <p className="font-ui text-[11px] tracking-[0.25em] text-paper/50 uppercase">
          Available in {offering.colorways.join(" · ")}
        </p>

        <CtaLink href="#acquire">{offering.cta}</CtaLink>

        <p className="max-w-md font-ui text-xs leading-relaxed text-pretty text-paper/40">
          {offering.registryNote}
        </p>
      </div>
    </section>
  );
}
