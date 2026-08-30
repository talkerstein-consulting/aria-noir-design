import Image from "next/image";
import type { Offering } from "@/lib/product";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";
import { ProductModel } from "@/components/product/product-model";
import { ConcreteField } from "@/components/vectors/ConcreteField";

/**
 * "The Offering" — a full-screen stage for the object, with the offer set
 * low over it.
 *
 * It was a centred stack in a 3:2 plate, and once the price, the tagline
 * and the colourway list came off it there was not enough left to hold the
 * middle of a section: a small frame floating in a large dark box, a name
 * and a link. The frame is the argument here, so it gets the screen, and
 * the three things still being said sit at the foot of it — the same
 * treatment the colourway panels use, which is what makes the two read as
 * the same page rather than two centring habits.
 *
 * The type is left-aligned at the page's gutter rather than centred: the
 * object is dead centre and stays there, and a centred stack under it
 * would put words across the frame's own shadow at every window height.
 *
 * The halo is now sized to the screen rather than to a plate. It is doing
 * the same job it always did — a black frame on a black page has nowhere
 * to sit — just at the scale the stage is.
 */
/**
 * `buyHref` is where the offer actually goes.
 *
 * These CTAs pointed at `#acquire`, the closing block at the foot of the
 * page — whose own CTA also pointed at `#acquire`. Three offers to acquire
 * the frame, every one of which scrolled you to a fourth offer to acquire
 * the frame. The page could not sell anything because the site had nowhere
 * to sell it. `/shop/<slug>` is that place now, so the page hands the
 * reader to it.
 */
export function ProductOffering({
  offering,
  buyHref,
}: {
  offering: Offering;
  /** See the note above the component. */
  buyHref: string;
}) {
  return (
    <section
      id="offering"
      className="relative z-[36] flex min-h-svh flex-col justify-end overflow-hidden bg-ink"
    >
      {/* The architecture the object stands in. Behind the halo and behind
          the frame, fading out before the type — see ConcreteField. Only
          where the object is the turntable: a still life already arrives
          with a building in it. */}
      {offering.view.kind === "model" ? <ConcreteField /> : null}

      {/* The ground the object stands on, rather than a cut-out floating on
          nothing.

          Broad and flat, not a pool. It was a tight warm core at 18% — a
          spotlight, which is exactly the reading the scene's own rig has
          just been taken off. This is the same idea under an overcast sky:
          a wide, weak lift across most of the frame, barely warm, with no
          discernible centre to point at. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(78%_74%_at_50%_42%,rgba(198,166,100,0.09)_0%,rgba(198,166,100,0.05)_45%,rgba(0,0,0,0)_84%)]"
      />

      {/* The object, and — where it is the turntable — its own Rotate
          control, which ProductModel carries rather than this section: the
          label belongs to the thing that turns, not to the offer around
          it. */}
      <div className="absolute inset-0">
        {offering.view.kind === "model" ? (
          <ProductModel src={offering.view.src} />
        ) : (
          <Image
            src={offering.view.image}
            alt={offering.view.alt}
            fill
            sizes="100vw"
            /* contain, not cover: this is a still life of one object, and
               cropping a product shot to fill a screen cuts the temples
               off the frame being sold. */
            className="object-contain p-10 sm:p-20"
          />
        )}
      </div>

      {/* Seats the type. Same mechanic as the colourway panels: only as
          tall as the words need, and nothing over the object itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink from-20% via-ink/70 via-55% to-transparent"
      />

      {/* Centred under the object, on its axis.

          It sat in the bottom-left corner while the frame hung dead centre
          above it, which is a composition with two subjects and no
          relationship between them. On the centre line the name reads as
          this object's caption and the CTA as the action for it.

          Still transparent to the pointer except where it is an actual
          control: the block spans the full width of the section and paints
          after the viewer, so left alone it swallows drags aimed at the
          frame. */}
      <div className="pointer-events-none relative px-6 pb-16 sm:px-10 sm:pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center">
          <p className="font-ui text-[11px] tracking-[0.35em] text-paper/50 uppercase">
            {offering.preheader}
          </p>

          <RevealText
            as="h2"
            text={offering.name}
            className="font-display text-6xl leading-[1.02] tracking-tight text-paper sm:text-8xl"
          />

          <CtaLink
            href={buyHref}
            /* Filled and inverted below 1024px — see .cta--filled. This is the
               page's offer, and on a phone a word with a rule under it is
               indistinguishable from the label above it. */
            className="cta--filled pointer-events-auto mt-6"
          >
            {offering.cta}
          </CtaLink>

          <p className="mt-6 max-w-md font-ui text-xs leading-relaxed text-pretty text-paper/40">
            {offering.registryNote}
          </p>
        </div>
      </div>

    </section>
  );
}
