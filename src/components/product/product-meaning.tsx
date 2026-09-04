import Image from "next/image";
import type { Meaning } from "@/lib/product";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * The "Arca" definition: plate right, text left.
 *
 * ---- This section used to PIN ----
 *
 * It was `sticky top-0 z-[35] h-svh`, held by a wrapper in the page file,
 * and the sections after it rode over the top of it at z-index 36+. That
 * whole machine is gone. The page is one continuous scroll now, so this is
 * an ordinary section that arrives, is read, and leaves.
 *
 * What that removes, and none of it is missed: the leash wrapper in both
 * page files, the requirement that every later section carry an explicit
 * z-index and an opaque background, and the reason ProductClose had no
 * background of its own.
 *
 * It keeps a viewport of height because the plate is the argument and a
 * full-bleed photograph wants the screen. Nothing pins to it.
 *
 * The gradient is a section-level overlay rather than something inside the
 * text column: the column is centred on the page's own container (see the
 * note on it), and a scrim that travelled with it would start a couple of
 * hundred pixels in from the left edge on a wide screen, leaving a bright
 * strip of the plate showing down the side of the page.
 */
export function ProductMeaning({ meaning }: { meaning: Meaning }) {
  return (
    <section className="relative h-svh overflow-hidden bg-ink">
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
