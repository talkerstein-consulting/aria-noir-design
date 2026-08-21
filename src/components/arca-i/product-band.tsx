import Image from "next/image";
import { detail } from "@/lib/arca-i";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Detail" — full-bleed breather between the material story and the
 * specification. One line of type, bottom-left, over the widest plate in
 * the set — the page needs somewhere to stop talking.
 *
 * Pulled up over the meaning section with a negative top margin, so this
 * plate physically slides over that section's lower half as the page
 * scrolls rather than simply following it — the "acetate, cut and
 * polished" line lands as the next thing covering the last, not the next
 * thing after it. A top-edge shadow sells the plate as sitting above the
 * section beneath it rather than just abutting it.
 */
export function ProductBand() {
  return (
    <section className="relative z-[37] -mt-[18vh] h-[70svh] min-h-[420px] overflow-hidden bg-ink shadow-[0_-40px_60px_-20px_rgba(0,0,0,0.6)] sm:-mt-[26vh] sm:h-[85svh]">
      <RevealPlate className="absolute inset-0">
        <Image
          src={detail.image}
          alt={detail.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </RevealPlate>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent"
      />
      <RevealText
        as="p"
        text={detail.line}
        delay={220}
        className="absolute right-6 bottom-10 left-6 mx-auto max-w-7xl font-display text-xl leading-snug text-balance text-paper italic sm:right-10 sm:bottom-14 sm:left-10 sm:text-3xl"
      />
    </section>
  );
}
