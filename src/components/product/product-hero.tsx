import Image from "next/image";
import type { Hero } from "@/lib/product";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";
import { RevealText } from "@/components/reveal";
import { HeroName } from "./hero-name";
import { HeroFilm } from "./hero-film";

/**
 * Full-bleed opening plate. The film carries the fold; type is centred and
 * sits in the lower third where the concrete goes dark, so no scrim is
 * needed above the subject's head — only a foot gradient to seat it.
 *
 * The film runs alone for a beat before anything is written over it: the
 * whole overlay — scrim included — is held back by ENTER_MS so the opening
 * frame is read as film first and as a title card second. Under the film
 * sits its own first frame as a still, and the film fades up over it once
 * it is actually rolling — see HeroFilm — so the opening is one continuous
 * picture rather than a plate that gets replaced.
 *
 * A house without a campaign film gets the still on its own and the same
 * hold. Nothing else changes — the beat belongs to the type, not to the
 * video, so the page reads identically whether or not there is footage.
 */
const ENTER_MS = 1000;

export function ProductHero({ hero }: { hero: Hero }) {
  return (
    <section className="on-ink relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink">
      {/* FULL BLEED, and the one plate on the page that is.

          Every other film and photograph on a story page stands in the
          page's column (see .plate-frame in interactions.css). The hero
          does not, and the exception is the point: this is the first thing
          on the screen and it is the whole screen, so the page opens as a
          film and then resolves into a document. A hero held in the column
          is a picture OF a film on a page; this is the film.

          The poster rides with it, full bleed for the same reason and at
          the same crop — HeroFilm lays the still underneath and fades the
          footage up over it once it is genuinely playing, so the two are
          one image and the handover is invisible. */}
      <div className="absolute inset-0 overflow-hidden">
      {hero.video ? (
        <HeroFilm
          src={hero.video}
          poster={hero.poster ?? hero.image}
          alt={hero.alt}
          className="object-cover object-[50%_30%]"
        />
      ) : (
        <>
          <Image
            src={hero.image}
            alt={hero.alt}
            fill
            /* The one plate above the fold on this page, so it is the LCP
               candidate — fetched eagerly rather than waiting on the
               observer that governs every other image here. */
            priority
            sizes="100vw"
            style={{ objectPosition: hero.focus ?? "50% 30%" }}
            className={`object-cover ${hero.imagePortrait ? "hidden sm:block" : ""}`}
          />
          {/* The portrait cut on a phone, where the wide plate would lose
              the frame to the crop. Both are in the DOM and CSS picks one,
              so there is no flash while a media query is read in JS. */}
          {hero.imagePortrait ? (
            <Image
              src={hero.imagePortrait}
              alt={hero.alt}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: hero.focusPortrait ?? "50% 40%" }}
              className="object-cover sm:hidden"
            />
          ) : null}
        </>
      )}
      </div>
      {/* seats the type; the top stays clear so the architecture reads */}
      <div
        aria-hidden
        className="arca-rise absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent"
        style={{ animationDelay: `${ENTER_MS}ms` }}
      />

      {/* Same masthead as the homepage's atelier block: one centred column,
          gold caps preheader, display heading under it at a 5xl measure. The
          hero adds the product name between the two, since unlike a section
          masthead it has a name to carry. */}
      <div className="relative px-6 pb-16 sm:px-10 sm:pb-24">
        <div className="stack stack--sm mx-auto max-w-5xl items-center text-center">
          {/* The trail, where this house's eyebrow used to be — see
              components/crumb-eyebrow. */}
          <CrumbEyebrow
            reveal
            label={hero.eyebrow}
            delay={ENTER_MS}
            /* Lifted clear of the name. The block is bottom-anchored, so
               margin BELOW the eyebrow is what raises it while the name and
               the line hold their position against the foot of the frame. */
            className="t-eyebrow mb-6 sm:mb-10"
          />
          {/* `--display-hero` is 17vw, and it was set for a NAME: six
              glyphs, one line, filling the frame. A hero line that is a
              sentence breaks into three ragged lines at that size and
              stands 470px tall. So the scale follows the length of what it
              is given rather than the slot it sits in, and a house whose
              deck puts the product name back in the H1 gets the big
              treatment again with nothing here to change. */}
          <HeroName
            text={hero.name}
            className={hero.name.length > 12 ? "t-display-xl" : "t-display-hero"}
          />
          {/* the atelier heading mechanic — italic lowercase set against
              roman caps — carried onto the hero's own line */}
          <RevealText
            as="p"
            text={hero.line}
            delay={ENTER_MS + 320}
            className="t-display-xs mt-1 max-w-xl"
          />
        </div>
      </div>
    </section>
  );
}
