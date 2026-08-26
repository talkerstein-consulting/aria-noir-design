import Image from "next/image";
import type { Variations } from "@/lib/product";
import { SECTION_PAD } from "@/lib/timeline";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Variations" — four colorways, one building. Only K Black has a still
 * shot in hand at time of writing; the other three carry a swatch and name
 * so the row stays complete rather than three-quarters empty until the rest
 * of the still-life set lands.
 */
export function ProductVariations({ variations }: { variations: Variations }) {
  return (
    <section className={`relative z-[36] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col gap-5 sm:mb-20">
          <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
            {variations.preheader}
          </p>
          <RevealText
            as="h2"
            text={variations.heading}
            className="max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-balance text-paper sm:text-6xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {variations.colorways.map((c, i) => (
            <div key={c.name} className="flex flex-col gap-4">
              <RevealPlate
                delay={i * 90}
                className="relative aspect-[3/4] overflow-hidden bg-paper/5"
              >
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.alt ?? c.name}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ backgroundColor: c.swatch }}
                  />
                )}
              </RevealPlate>
              <p className="font-ui text-[11px] tracking-[0.2em] text-paper/60 uppercase">
                {c.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
