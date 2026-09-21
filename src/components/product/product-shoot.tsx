import Image from "next/image";
import { StoryBuy } from "@/components/product/story-buy";
import type { Shoot } from "@/lib/product";
import { SECTION_PAD } from "@/lib/timeline";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Shoot" — two fisheye plates over the text, with an opt-in expandable
 * note, where the house has one. `<details>` keeps it genuinely optional (no
 * JS, no layout shift for readers who skip it) while matching the gold/paper
 * palette everywhere else. A house whose deck carries no note renders the
 * column without it rather than with an empty disclosure under the body.
 */
export function ProductShoot({
  shoot,
  buyHref,
  buyLabel,
}: {
  shoot: Shoot;
  buyHref: string;
  buyLabel?: string;
}) {
  return (
    <section className={`relative bg-ink px-6 sm:px-10 ${SECTION_PAD}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
            {shoot.preheader}
          </p>
          <RevealText
            as="h2"
            text={shoot.heading}
            className="font-display text-4xl leading-[1.05] tracking-tight text-balance text-paper sm:text-5xl"
          />
          <div className="mt-4 flex flex-col gap-6">
            {shoot.body.map((para) => (
              <p
                key={para}
                className="max-w-[62ch] font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base"
              >
                {para}
              </p>
            ))}
            <StoryBuy href={buyHref} label={buyLabel} />
          </div>

          {shoot.note ? (
          <details className="group mt-6 border-t border-paper/15 pt-6">
            <summary className="cursor-pointer list-none font-ui text-[11px] tracking-[0.25em] text-gold uppercase [&::-webkit-details-marker]:hidden">
              <span className="mr-2">①</span>
              {shoot.note.label}
            </summary>
            <p className="mt-4 max-w-[56ch] font-ui text-sm leading-relaxed text-pretty text-paper/60">
              {shoot.note.body}
            </p>
          </details>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 self-start sm:gap-6">
          {shoot.images.map((img, i) => (
            <RevealPlate
              key={img.src}
              delay={i * 90}
              className="relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </RevealPlate>
          ))}
        </div>
      </div>
    </section>
  );
}
