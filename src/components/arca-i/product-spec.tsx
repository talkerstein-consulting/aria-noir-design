import Image from "next/image";
import { spec } from "@/lib/arca-i";
import { SECTION_PAD } from "@/lib/timeline";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Specs" — same sticky-left / scrolling-right shape the object study
 * used elsewhere on this page: the bench sheet holds in place while the
 * macro plates run past it, so every material claim stays in view against
 * the detail shots that back it up.
 */
export function ProductSpec() {
  return (
    <section
      id="specification"
      className={`relative z-[36] bg-ink px-6 sm:px-10 ${SECTION_PAD}`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ---- column 1: sticky bench sheet ---- */}
        <div className="lg:sticky lg:top-28">
          <div className="mb-16 flex flex-col gap-5 sm:mb-20">
            <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
              {spec.preheader}
            </p>
            <RevealText
              as="h2"
              text={spec.heading}
              className="font-display text-4xl leading-[1.05] tracking-tight text-balance text-paper sm:text-6xl"
            />
          </div>

          <dl className="flex flex-col">
            {spec.rows.map((row) => (
              <div
                key={row.term}
                className="border-t border-paper/15 py-6 sm:py-7"
              >
                <dt className="font-ui text-[11px] tracking-[0.25em] text-paper/50 uppercase">
                  {row.term}
                </dt>
                <dd>
                  <p className="mt-2 font-ui text-sm text-paper sm:text-base">
                    {row.summary}
                  </p>
                  <p className="mt-2 max-w-[52ch] font-ui text-sm leading-relaxed text-pretty text-paper/60">
                    {row.detail}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---- column 2: scrolling macro plates ---- */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {spec.macro.map((img, i) => (
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
