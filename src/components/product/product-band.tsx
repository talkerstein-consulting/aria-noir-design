import Image from "next/image";
import type { Detail } from "@/lib/product";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * "The Detail" — full-bleed breather between the material story and the
 * specification. One line of type, bottom-left, over the widest plate in
 * the set — the page needs somewhere to stop talking.
 *
 * It used to be the section that ENDED the pinned "Arca" definition, by
 * outranking it at z-index 37 and scrolling over the top of it. Nothing
 * pins any more, so it simply follows the definition down the page. The
 * z-index and the top-edge shadow that sold it as sitting ABOVE something
 * are both gone with the thing they were covering.
 */
export function ProductBand({ detail }: { detail: Detail }) {
  return (
    <section className="relative h-[70svh] min-h-[420px] overflow-hidden bg-ink sm:h-[85svh]">
      <RevealPlate className="absolute inset-0">
        <Image
          src={detail.image}
          alt={detail.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </RevealPlate>
      {/* The scrim exists to carry the line. With no line there is nothing
          for it to make legible, and a gradient over the bottom half of a
          photograph for its own sake is just the plate being dimmed. */}
      {detail.line ? (
        <>
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
        </>
      ) : null}
    </section>
  );
}
