import Image from "next/image";
import { meaning } from "@/lib/arca-i";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * The "Arca" definition — plate right, text left. The section runs tall
 * (well past one viewport) and the text column is pinned with `sticky`, so
 * the words hold in place while the plate keeps scrolling behind them —
 * and then get physically covered when ProductBand's negative margin pulls
 * the next plate up over this one. Sticky, then overlapped, in one motion.
 *
 * The gradient lives INSIDE the sticky column (bleeding right, past its own
 * edge) rather than as a separate overlay, so it stays pinned together with
 * the text it exists to set off instead of drifting independently.
 */
export function ProductMeaning() {
  return (
    <section className="relative z-[35] min-h-[150svh] overflow-hidden bg-ink sm:min-h-[170svh]">
      <RevealPlate className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-3/4">
        <Image
          src={meaning.image}
          alt={meaning.alt}
          fill
          sizes="(min-width: 640px) 60vw, 100vw"
          className="object-cover object-[70%_center]"
        />
      </RevealPlate>

      <div className="sticky top-0 z-10 flex min-h-svh w-full flex-col justify-center gap-5 px-6 py-20 sm:w-3/5 sm:px-10 sm:py-28 lg:w-1/2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-transparent sm:inset-y-0 sm:right-auto sm:left-0 sm:w-[140%] sm:bg-gradient-to-r sm:from-ink sm:via-ink/80 sm:from-40% sm:to-transparent"
        />
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase italic">
          {meaning.eyebrow}
        </p>
        <RevealText
          as="h2"
          text={meaning.heading}
          className="max-w-xl font-display text-3xl leading-[1.1] tracking-tight text-balance text-paper italic sm:text-5xl"
        />
        <p className="max-w-[52ch] font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base">
          {meaning.body}
        </p>
      </div>
    </section>
  );
}
