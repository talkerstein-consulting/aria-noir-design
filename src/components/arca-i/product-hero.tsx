import Image from "next/image";
import { hero } from "@/lib/arca-i";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * Full-bleed opening plate. The photograph carries the fold; type sits in the
 * lower third where the concrete goes dark, so no scrim is needed above the
 * subject's head — only a foot gradient to seat the caption line.
 */
export function ProductHero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink">
      <RevealPlate className="absolute inset-0">
        <Image
          src={hero.image}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
      </RevealPlate>
      {/* seats the type; the top stays clear so the architecture reads */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent"
      />

      <div className="relative px-6 pb-16 sm:px-10 sm:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <RevealText
            as="p"
            text={hero.eyebrow}
            className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase"
          />
          <RevealText
            as="h1"
            text={hero.name}
            delay={120}
            className="font-display text-[19vw] leading-[0.82] tracking-tight text-paper sm:text-[15vw] lg:text-[12rem]"
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <RevealText
              as="p"
              text={hero.line}
              delay={320}
              className="max-w-md font-display text-xl leading-snug text-paper/85 italic sm:text-2xl"
            />
            {/* the one caption row that stays a plain fade — running the
                word mechanic on three short specs reads as fussiness */}
            <ul
              className="arca-rise flex flex-wrap gap-x-8 gap-y-2 font-ui text-[11px] tracking-[0.25em] text-paper/55 uppercase"
              style={{ animationDelay: "520ms" }}
            >
              {hero.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
