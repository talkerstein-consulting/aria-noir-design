import Image from "next/image";
import { atelier } from "@/lib/content";
import { SECTION_PAD } from "@/lib/timeline";
import { CtaLink } from "@/components/cta-link";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * Ordinary document flow — no frame choreography. The left column holds with
 * `position: sticky` while the right column scrolls past it:
 *   image pair → heading/body/CTA → image pair → space → quote line.
 *
 * Opaque background so it covers the fixed hero layers as it arrives.
 */
export function AtelierSection() {
  return (
    <section className={`relative z-[36] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}>
      {/* preheader + italic/caps heading */}
      <div className="mx-auto mb-24 flex max-w-5xl flex-col items-center gap-5 text-center sm:mb-32">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
          {atelier.preheader}
        </p>
        <RevealText
          as="h2"
          text={atelier.heading}
          className="font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl"
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ---- column 1: sticky ---- */}
        <div className="lg:sticky lg:top-28">
          <RevealPlate className="relative h-[60vh] w-full overflow-hidden lg:h-[calc(100vh-9rem)]">
            <Image
              src={atelier.stickyImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </RevealPlate>
        </div>

        {/* ---- column 2: scrolls ---- */}
        <div className="flex flex-col gap-20 sm:gap-28">
          {/* image pair */}
          <div className="grid grid-cols-2 gap-4">
            {atelier.pairOne.map((src, i) => (
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

          {/* heading · body · CTA — centred */}
          <div className="flex flex-col items-center gap-6 text-center">
            <RevealText
              as="h3"
              text={atelier.feature.heading}
              className="font-display text-4xl leading-tight tracking-tight text-paper sm:text-5xl"
            />
            <p className="max-w-md font-ui text-sm leading-relaxed text-paper/70">
              {atelier.feature.body}
            </p>
            <CtaLink href="#process">{atelier.feature.cta}</CtaLink>
          </div>

          {/* image pair */}
          <div className="grid grid-cols-2 gap-4">
            {atelier.pairTwo.map((src, i) => (
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

          {/* abundant spacing, then the quote line */}
          <div className="h-[30vh]" />

          <blockquote className="flex flex-col gap-5 border-t border-paper/15 pt-10">
            <p className="font-display text-2xl leading-snug tracking-tight text-paper italic sm:text-3xl">
              “{atelier.quote}”
            </p>
            <footer className="font-ui text-[11px] tracking-[0.3em] text-paper/45 uppercase">
              {atelier.quoteAttribution}
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
