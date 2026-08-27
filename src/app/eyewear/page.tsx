import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ModelStage } from "@/components/eyewear/model-stage";
import { HouseGrid } from "@/components/page/house-grid";
import { houses } from "@/lib/navigation";
import { eyewear } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Eyewear — Aria Noir",
  description:
    "Six houses, one hand. ARCA I, ARCA II, AHAVA, MATRIARCA, PATRIARCA and MONARCA, in the round.",
};

/**
 * The index, opening on the turntable.
 *
 * There is no PageHero here and that is the point. Every other section page
 * opens on a title plate — eyebrow, headline, photograph — and under the
 * old arrangement this one opened on a title plate and THEN had a 3D
 * scroller under it, which is two heroes stacked: the reader has to scroll
 * past the opening to reach the opening. So the stage is the hero, and the
 * title is its first beat — it turntables away on the same axis the frame
 * turns on, while the frame grows out of nothing in front of it.
 *
 * Six houses, not nine frames. The stage carries one OBJECT per beat and
 * there is one mesh per house — ARCA I's four cuts are four exports of one
 * house, and spending four full revolutions on them before the reader has
 * seen ARCA II is the index arguing with its own shape. The cuts are named
 * on the grid below, where a comparison belongs.
 */
export default function EyewearPage() {
  const stage = houses.map((house) => ({
    name: house.name,
    /* Index and material, and nothing else.
       The colourways used to run here — three names and a "+5" — and it
       was the wrong line in the wrong place twice over: the stage is
       showing ONE frame in ONE colourway, so listing five it is not
       currently wearing is a caption arguing with its own picture; and at
       phone width it wrapped to two lines of wide-tracked caps and pushed
       the house name off its baseline. The colourways are named in full on
       the grid below, where you can see them side by side. */
    meta: `${house.index} — ${house.material}`,
    image: house.ground ?? house.plate ?? undefined,
    swatch: house.swatch,
    model: house.model,
    /* The STORY page, where there is one — the buy page comes after it,
       not instead of it. Four houses have no page yet and carry no CTA
       rather than being sent somewhere that skips the argument. */
    href: house.href ?? undefined,
    cta: house.href ? `View ${house.name}` : undefined,
  }));

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <ModelStage
          id="frames"
          items={stage}
          intro={
            <>
              <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
                {eyewear.hero.eyebrow}
              </p>
              <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl">
                {eyewear.hero.title}
              </h1>
              <p className="mt-6 font-ui text-[11px] tracking-[0.42em] text-paper/55 uppercase">
                {eyewear.stage.sub}
              </p>
            </>
          }
        />

        <section className="on-ink bg-ink px-6 pt-24 sm:px-10 sm:pt-32">
          <p className="t-body t-body--lede mx-auto text-center">
            {eyewear.intro}
          </p>
        </section>

        {/* The grid stays, and it stays AFTER the stage. The stage is the
            argument — one frame at a time, turning, at the size the object
            deserves — and the grid is the reference sheet you want the
            moment the argument ends: six houses side by side, every
            colourway named, comparable in one glance.

            There is no closing CTA under it. This IS the destination, and a
            block asking the reader to go somewhere else is the index
            apologising for existing. They leave sideways, into a house. */}
        <HouseGrid />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
