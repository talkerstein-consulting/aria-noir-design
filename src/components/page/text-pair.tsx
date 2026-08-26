import Image from "next/image";
import { RevealText, RevealPlate } from "@/components/reveal";

type Plate = { src: string; alt: string };

/**
 * Claim, evidence, then two plates — ProductOpening's shape, generalised.
 *
 * It earns its keep the same way it does on ARCA I: it is the section that
 * gives the eye a rest between image-heavy ones, so it leads with type and
 * lets the photographs arrive after the argument rather than instead of it.
 * Two plates, never three — a third turns a breather into a gallery.
 */
export function TextPair({
  preheader,
  heading,
  body,
  images,
}: {
  preheader: string;
  heading: string;
  body: readonly string[];
  images: readonly Plate[];
}) {
  return (
    <section className="on-ink section relative z-[35] bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 sm:gap-20">
        <p className="t-eyebrow">{preheader}</p>

        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
          <RevealText as="h2" text={heading} className="t-display-lg" />
          <div className="flex flex-col gap-6 lg:pt-3">
            {body.map((para) => (
              <p key={para} className="t-body">
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {images.map((img, i) => (
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
