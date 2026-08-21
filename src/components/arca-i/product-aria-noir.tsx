import Image from "next/image";
import { ariaNoir } from "@/lib/arca-i";
import { SECTION_PAD } from "@/lib/timeline";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "Aria / Noir" — the two names side by side, same weight, same size. The
 * portraits sit as a pair rather than a sticky/scroll pairing since neither
 * one is the "reference" plate here — the point is that they're equals.
 */
export function ProductAriaNoir() {
  return (
    <section className={`relative z-[35] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col gap-5 sm:mb-20">
          <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
            {ariaNoir.preheader}
          </p>
          <RevealText
            as="h2"
            text={ariaNoir.heading}
            className="max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-balance text-paper sm:text-6xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {ariaNoir.images.map((img, i) => (
            <RevealPlate
              key={img.src}
              delay={i * 90}
              className="relative aspect-[3/4] overflow-hidden"
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

        <div className="mt-16 flex flex-col gap-6 sm:mt-20 sm:max-w-2xl">
          {ariaNoir.body.map((para) => (
            <p
              key={para}
              className="font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
