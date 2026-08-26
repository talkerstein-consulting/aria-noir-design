import Image from "next/image";
import { RevealPlate, RevealText } from "@/components/reveal";
import { SpecRows } from "@/components/product/spec-rows";

type Plate = { src: string; alt: string };
type Row = { term: string; summary: string; detail: string };

/**
 * Sticky-left / scrolling-right study — ProductSpec's shape, lifted out so
 * the process and fit pages use the object rather than a copy of it.
 *
 * The bargain is the same one that made it worth building on ARCA I: the
 * claims hold still while the plates that evidence them run past, so a
 * reader never has to hold a specification in their head and scroll to go
 * find the photograph of it. That only works while the rows outnumber
 * nothing and the plates outnumber the rows — a study with two plates
 * un-pins before the sheet has been read, and should be an ordinary
 * two-column section instead.
 */
export function StickyStudy({
  id,
  preheader,
  heading,
  rows,
  plates,
}: {
  id?: string;
  preheader: string;
  heading: string;
  rows: readonly Row[];
  plates: readonly Plate[];
}) {
  return (
    <section id={id} className="on-ink section relative z-[36] bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <div className="stack stack--sm mb-16 sm:mb-20">
            <p className="t-eyebrow">{preheader}</p>
            <RevealText as="h2" text={heading} className="t-display-lg" />
          </div>
          <SpecRows rows={rows} />
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          {plates.map((img, i) => (
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
