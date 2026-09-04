import Image from "next/image";
import type { Opening } from "@/lib/product";
import { SECTION_PAD } from "@/lib/timeline";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Structure" — the claim, then the evidence, then the two reused plates
 * of the building itself. Deliberately typographic first; it lands between
 * the hero and the Aria/Noir portraits and earns its keep by giving the eye
 * a rest before the next image-heavy section.
 */
export function ProductOpening({ structure }: { structure: Opening }) {
  return (
    <section className={`relative bg-ink px-6 sm:px-10 ${SECTION_PAD}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 sm:gap-20">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
          {structure.preheader}
        </p>
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
          <RevealText
            as="h2"
            text={structure.heading}
            className="font-display text-4xl leading-[1.05] tracking-tight text-balance text-paper sm:text-6xl"
          />
          <div className="flex flex-col gap-6 lg:pt-3">
            {structure.body.map((para) => (
              <p
                key={para}
                className="max-w-[68ch] font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {structure.images.map((img, i) => (
            <RevealPlate
              key={img.src}
              delay={i * 90}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </RevealPlate>
          ))}
        </div>
      </div>
    </section>
  );
}
