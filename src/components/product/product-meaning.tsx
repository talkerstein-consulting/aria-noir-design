import Image from "next/image";
import type { Meaning } from "@/lib/product";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * The "Arca" definition — plate right, text left.
 *
 * The WHOLE SECTION is sticky at exactly one viewport tall. It pins the
 * moment its top reaches 0 and holds there while the sections after it
 * ride over the top of it. Nothing here animates out and nothing here
 * scrolls away under its own power.
 *
 * How long it holds is decided by the wrapper around it in the page file,
 * NOT here — a sticky element pins until the bottom of its containing
 * block. That wrapper is deliberately short (this section, the band and
 * the spec), because a sticky element with no wrapper takes <main> as its
 * containing block and stays pinned behind every later section to the end
 * of the page, showing through anything transparent. Read the note there
 * before changing this section's height.
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
 * The gradient is a section-level overlay rather than something inside the
 * text column: the column is now centred on the page's own container (see
 * the note on it), and a scrim that travelled with it would start a couple
 * of hundred pixels in from the left edge on a wide screen, leaving a
 * bright strip of the plate showing down the side of the page.
 */
export function ProductMeaning({ meaning }: { meaning: Meaning }) {
  return (
    <section className="sticky top-0 z-[35] h-svh overflow-hidden bg-ink">
      <RevealPlate className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-3/4">
        <Image
          src={meaning.image}
          alt={meaning.alt}
          fill
          sizes="(min-width: 640px) 60vw, 100vw"
          /* The text column covers the left half at every width above sm,
             so the crop has to hold the subject clear of it. 70% suits a
             plate shot right-of-centre; a centred one says so. */
          style={{ objectPosition: meaning.objectPosition ?? "70% center" }}
          className="object-cover"
        />
      </RevealPlate>

      {/* The scrim is the SECTION's now, not the column's. It has to start
          at the true left edge of the viewport whatever the column does,
          and the column no longer starts there — see the note below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-ink via-ink/70 to-transparent sm:inset-y-0 sm:right-auto sm:left-0 sm:w-[85%] sm:bg-gradient-to-r sm:from-ink sm:from-40% sm:via-ink/80 sm:to-transparent"
      />

      {/* Aligned to the page's own column, not to the gutter.
          
          The text used to start at the section's padding — 24px, 40px at
          sm — while every other section on this page puts its content in a
          centred `max-w-7xl`, whose left edge on a wide screen is a couple
          of hundred pixels further in. So the one section that is
          full-bleed by design was also the one section whose type did not
          line up with anything above or below it, and on a wide monitor
          that reads as the paragraph having slid off the page.

          Same container, same gutter, same left edge as its neighbours.
          The gutter is on the flex wrapper and the `max-w-7xl` inside it,
          which is the order `.section` uses — the other way round adds the
          padding INSIDE the container and lands the type 40px further in
          than every section it is meant to line up with. The COLUMN's width
          is capped rather than set as a fraction of the section, so the
          measure holds while the container does the aligning. */}
      <div className="relative z-10 flex h-full items-center px-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <div className="flex flex-col gap-5 sm:max-w-[58%] lg:max-w-[48%]">
            <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase italic">
              {meaning.eyebrow}
            </p>
            <RevealText
              as="h2"
              text={meaning.heading}
              className="font-display text-3xl leading-[1.1] tracking-tight text-balance text-paper italic sm:text-5xl"
            />
            <p className="max-w-[52ch] font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base">
              {meaning.body}
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
