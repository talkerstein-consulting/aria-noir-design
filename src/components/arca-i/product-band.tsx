import Image from "next/image";
import { detail } from "@/lib/arca-i";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Detail" — full-bleed breather between the material story and the
 * specification. One line of type, bottom-left, over the widest plate in
 * the set — the page needs somewhere to stop talking.
 *
 * This is the section that ENDS the pinned "Arca" definition before it —
 * not by any margin or scroll trick, but simply by outranking it. That
 * section is `sticky` at z-index 35 and stays put forever; this one is in
 * ordinary flow at z-index 37, so it scrolls up the page as normal and
 * passes over the top of it. The negative margin this section used to
 * carry is gone: with a genuinely pinned section behind it, overlapping
 * is the default behaviour rather than something to be arranged.
 *
 * `bg-ink` is therefore load-bearing, not decoration — without it the
 * pinned definition would read straight through this plate's letterboxing.
 * The top-edge shadow sells the plate as sitting above what it covers.
 */
export function ProductBand() {
  return (
    <section className="relative z-[37] h-[70svh] min-h-[420px] overflow-hidden bg-ink shadow-[0_-40px_60px_-20px_rgba(0,0,0,0.6)] sm:h-[85svh]">
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
