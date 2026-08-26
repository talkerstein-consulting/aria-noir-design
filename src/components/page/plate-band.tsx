import Image from "next/image";
import { RevealPlate, RevealText } from "@/components/reveal";

/**
 * Full-bleed breather — ProductBand, generalised.
 *
 * Same job wherever it lands: one line of type bottom-left over the widest
 * plate available, so a page that has been talking for three sections has
 * somewhere to stop. `bg-ink` behind the plate is load-bearing rather than
 * decorative — this section routinely scrolls over a sticky one, and
 * without a ground of its own the pinned section reads through the
 * letterboxing.
 */
export function PlateBand({
  image,
  alt,
  line,
}: {
  image: string;
  alt: string;
  line: string;
}) {
  return (
    <section className="on-ink relative z-[37] h-[70svh] min-h-[420px] overflow-hidden bg-ink shadow-[0_-40px_60px_-20px_rgba(0,0,0,0.6)] sm:h-[85svh]">
      <RevealPlate className="absolute inset-0">
        <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" />
      </RevealPlate>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent"
      />
      <RevealText
        as="p"
        text={line}
        delay={220}
        className="t-quote absolute right-6 bottom-10 left-6 mx-auto max-w-7xl sm:right-10 sm:bottom-14 sm:left-10"
      />
    </section>
  );
}
