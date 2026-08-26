import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { RevealText, RevealPlate, type Segment } from "@/components/reveal";
import { SECTION_PAD } from "@/lib/timeline";

/**
 * The sticky-left plate with a column running past it — the home page's
 * atelier section, lifted out so The House can be the same object rather
 * than a second implementation of it.
 *
 * The bargain: one photograph holds still for the length of the argument
 * while the argument scrolls, so the reader is looking at the thing the
 * words are about for the entire time the words are being made. It is the
 * house's only long-form section and it earns its height by being one image
 * rather than nine.
 *
 * Everything below the sticky column is optional. The home page runs the
 * full set — pair, feature, pair, quote — because it has the photography
 * and the room. A section page can run the pairs without a quote, or the
 * feature without a CTA, and the column simply closes up rather than
 * leaving a hole where the missing beat was.
 */

type Pair = readonly string[];

export type StickyFeatureContent = {
  preheader: string;
  /** Plain, or segments where the heading mixes roman and italic. */
  heading: string | readonly Segment[];
  stickyImage: string;
  /** Alt for the sticky plate. Empty where it is atmosphere, not evidence. */
  stickyAlt?: string;
  pairOne?: Pair;
  pairTwo?: Pair;
  feature?: {
    heading: string;
    body: string;
    cta?: string;
    href?: string;
  };
  quote?: string;
  quoteAttribution?: string;
};

function PlatePair({ srcs }: { srcs: Pair }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {srcs.map((src, i) => (
        <RevealPlate
          key={src}
          delay={i * 90}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        </RevealPlate>
      ))}
    </div>
  );
}

export function StickyFeature({
  preheader,
  heading,
  stickyImage,
  stickyAlt = "",
  pairOne,
  pairTwo,
  feature,
  quote,
  quoteAttribution,
  id,
}: StickyFeatureContent & { id?: string }) {
  return (
    <section
      id={id}
      className={`on-ink relative z-[36] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}
    >
      {/* preheader + italic/caps heading */}
      <div className="mx-auto mb-24 flex max-w-5xl flex-col items-center gap-5 text-center sm:mb-32">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
          {preheader}
        </p>
        <RevealText
          as="h2"
          text={heading}
          className="font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl"
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ---- column 1: sticky ---- */}
        <div className="lg:sticky lg:top-28">
          <RevealPlate className="relative h-[60vh] w-full overflow-hidden lg:h-[calc(100vh-9rem)]">
            <Image
              src={stickyImage}
              alt={stickyAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </RevealPlate>
        </div>

        {/* ---- column 2: scrolls ---- */}
        <div className="flex flex-col gap-20 sm:gap-28">
          {pairOne ? <PlatePair srcs={pairOne} /> : null}

          {feature ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <RevealText
                as="h3"
                text={feature.heading}
                className="font-display text-4xl leading-tight tracking-tight text-paper sm:text-5xl"
              />
              <p className="max-w-md font-ui text-sm leading-relaxed text-paper/70">
                {feature.body}
              </p>
              {feature.cta && feature.href ? (
                /* mt-2 on top of the stack's own gap-6. A CTA is not another
                   paragraph, and the extra air is what says so. */
                <CtaLink href={feature.href} className="mt-2">
                  {feature.cta}
                </CtaLink>
              ) : null}
            </div>
          ) : null}

          {pairTwo ? <PlatePair srcs={pairTwo} /> : null}

          {quote ? (
            <>
              {/* abundant spacing, then the quote line */}
              <div className="h-[30vh]" />
              <blockquote className="flex flex-col gap-5 border-t border-paper/15 pt-10">
                <p className="font-display text-2xl leading-snug tracking-tight text-paper italic sm:text-3xl">
                  “{quote}”
                </p>
                {quoteAttribution ? (
                  <footer className="font-ui text-[11px] tracking-[0.3em] text-paper/45 uppercase">
                    {quoteAttribution}
                  </footer>
                ) : null}
              </blockquote>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
