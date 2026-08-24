import Image from "next/image";
import { meaning } from "@/lib/arca-i";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * The "Arca" definition — plate right, text left.
 *
 * The WHOLE SECTION is sticky at exactly one viewport tall. It pins the
 * moment its top reaches 0 and then never moves again: because its
 * containing block is <main>, which runs to the end of the page, there is
 * always more scroll left for it to stay stuck to. Nothing here animates
 * out and nothing here scrolls away.
 *
 * What ends it is the next section simply arriving. ProductBand and every
 * section after it sit at z-index 36+ against this one's 35, in ordinary
 * document flow — so they scroll up the page as normal and pass straight
 * over the top of this pinned frame, covering it. No negative margins, no
 * scroll maths: the effect is entirely "a fixed thing, and opaque things
 * moving in front of it".
 *
 * Every later section on this page is therefore REQUIRED to carry both an
 * explicit z-index of 36 or higher and an opaque background. Without the
 * z-index it would render *behind* this pinned section (a positioned
 * element beats an auto-z sibling regardless of source order); without the
 * background this section would show through it.
 *
 * The gradient lives INSIDE the text column (bleeding right, past its own
 * edge) rather than as a separate overlay, so it is set off against the
 * plate as one unit.
 */
export function ProductMeaning() {
  return (
    <section className="sticky top-0 z-[35] h-svh overflow-hidden bg-ink">
      <RevealPlate className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-3/4">
        <Image
          src={meaning.image}
          alt={meaning.alt}
          fill
          sizes="(min-width: 640px) 60vw, 100vw"
          className="object-cover object-[70%_center]"
        />
      </RevealPlate>

      {/* The column no longer needs its own `sticky` — the section around it
          is the thing that pins now, so this just fills it. */}
      <div className="relative z-10 flex h-full w-full flex-col justify-center gap-5 px-6 py-20 sm:w-3/5 sm:px-10 sm:py-28 lg:w-1/2">
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
