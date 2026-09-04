import Image from "next/image";
import { HeroFilm } from "@/components/product/hero-film";
import { RevealPlate } from "@/components/reveal";

/**
 * The approach to the object: a film, then a face, then the frame.
 *
 * This is a sequence and not a section — three shots in a deliberate order,
 * and the third one is not in this file. The page used to hand the reader
 * straight from the band's claim about the material to a turntable, which
 * is a cut from an argument to a product photograph. These two stages are
 * the walk in: the film sets the mood with nothing to read, the portrait
 * brings the frame onto a person at the distance you would actually see it
 * from, and only then is the object itself offered as a thing on its own.
 *
 * Wide to close to closer. It is the order a camera would move in, and the
 * reason both stages here are silent — no heading, no body, no CTA. Words
 * on either of them would make each a section arguing its own point, and
 * the point is the approach.
 *
 * Both stages are ordinary sections in ordinary flow. They used to carry
 * z-index 36 to clear the pinned Arca definition; nothing pins on these
 * pages any more, so there is no stacking to arrange.
 */
export type Approach = {
  /** The mood film. Muted, looping, no controls: it is a moving plate. */
  film: { src: string; poster: string; alt: string };
  /** The face, close. A PORTRAIT of someone wearing the frame, not a macro
   *  of a hinge — the detail shots have their own section, and what this
   *  step has to answer is how the cut sits on a head. */
  face: { src: string; alt: string };
};

export function ProductApproach({ approach }: { approach: Approach }) {
  return (
    <>
      {/* ---- The film ----
          Full bleed, silent, and given the whole screen. It carries a
          vignette rather than a scrim: nothing is set over it, so the
          darkening is only there to keep the frame edges from cutting hard
          against the black sections either side of it. */}
      <section
        id="approach-film"
        className="relative h-svh overflow-hidden bg-ink"
      >
        <HeroFilm
          src={approach.film.src}
          poster={approach.film.poster}
          alt={approach.film.alt}
          /* Not the LCP candidate: this is most of a page down. */
          priority={false}
          /* And it does not decode until the reader is near it. This is
             the SAME file the hero is playing, so without this the page
             runs two decode pipelines for one film from first paint. See
             HeroFilm. */
          lazy
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_100%_at_50%_50%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.55)_100%)]"
        />
      </section>

      {/* ---- The face ----
          Held at 4:5 on a phone and full screen above it, because a close
          portrait cropped to a landscape box is a picture of a chin. The
          plate reveals on scroll like every other still on these pages. */}
      <section
        id="approach-face"
        className="relative overflow-hidden bg-ink"
      >
        <RevealPlate className="relative h-svh w-full">
          <Image
            src={approach.face.src}
            alt={approach.face.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Seats the cut into the offering below it: the object's stage
              opens on black, and a photograph running edge to edge into it
              would meet that black on a hard line. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent"
          />
        </RevealPlate>
      </section>
    </>
  );
}
