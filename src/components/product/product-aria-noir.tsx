import Image from "next/image";
import type { AriaNoir } from "@/lib/product";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "Aria / Noir" — the two names side by side, same weight, same size. The
 * portraits sit as a pair rather than a sticky/scroll pairing since neither
 * one is the "reference" plate here — the point is that they're equals.
 */
export function ProductAriaNoir({ ariaNoir }: { ariaNoir: AriaNoir }) {
  return (
    <section className="on-ink section relative bg-ink">
      <div className="mx-auto max-w-6xl">
        {/* the homepage atelier masthead: one centred column at max-w-5xl,
            gold caps preheader, display heading under it running the same
            italic-lowercase-against-roman-caps mechanic */}
        <div className="stack stack--sm mx-auto mb-24 max-w-5xl items-center text-center sm:mb-32">
          <p className="t-eyebrow">
            {ariaNoir.preheader}
          </p>
          <RevealText
            as="h2"
            text={ariaNoir.heading}
            className="t-display-xl"
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

        <div className="stack mt-16 sm:mt-20">
          {ariaNoir.body.map((para) => (
            <p
              key={para}
              className="t-body"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
