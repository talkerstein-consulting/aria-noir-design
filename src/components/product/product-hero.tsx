import Image from "next/image";
import type { Hero } from "@/lib/product";
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
      {hero.video ? (
        <HeroFilm
          src={hero.video}
          poster={hero.poster ?? hero.image}
          alt={hero.alt}
          className="object-cover object-[50%_30%]"
        />
      ) : (
        <Image
          src={hero.image}
          alt={hero.alt}
          fill
          /* The one plate above the fold on this page, so it is the LCP
             candidate — fetched eagerly rather than waiting on the
             observer that governs every other image here. */
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
      )}
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
          <RevealText
            as="p"
            text={hero.eyebrow}
            delay={ENTER_MS}
            /* Lifted clear of the name. The block is bottom-anchored, so
               margin BELOW the eyebrow is what raises it while the name and
               the line hold their position against the foot of the frame. */
            className="t-eyebrow mb-6 sm:mb-10"
          />
          <HeroName
            text={hero.name}
            className="t-display-hero"
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
