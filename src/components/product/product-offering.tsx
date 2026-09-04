"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Offering } from "@/lib/product";
import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";
import { ProductModel, preloadModels } from "@/components/product/product-model";
import { useOnScreen } from "@/hooks/use-on-screen";
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
  /* ---- Which acetate is on the frame ----

     The turntable used to be one file named in the data. It is now one of
     a set, and this is the only thing that knows which — the model, the
     squares and the CTA all read it, so there is no arrangement in which
     the object showing and the offer underneath disagree about what is
     being sold.

     Held here rather than in a smaller component around the canvas
     because the CTA is the other half of the answer the user gave: a
     square SWAPS, and the offer carries the choice. A wrapper that owned
     only the viewer would leave the CTA pointing at the house default
     while the reader looked at a pink frame.

     The turntable's own heading is deliberately NOT reset on a swap. The
     angle lives at module scope in ProductModel and this component never
     unmounts, so the new acetate arrives already turned to wherever the
     reader had left the old one — which is what makes it read as the same
     object changing colour rather than a second photograph. */
  /* The acetates the TURNTABLE offers, which is not always the whole run.

     `turned` caps it. Every entry stays in the data because the palette
     band under the opening paints all of them and the buy page sells all
     of them; this slice only decides how many meshes the page fetches.
     Where the slice is short, `moreNote` says so under the squares, so a
     row of three reads as a selection rather than as the whole house. See
     `turned` in lib/product.ts. */
  const all = offering.view.kind === "model" ? offering.view.colorways : undefined;
  const shown = all?.slice(0, offering.view.kind === "model" ? (offering.view.turned ?? all.length) : 0);
  /* One acetate is not a choice, so no squares are drawn for it. */
  const colorways = (shown?.length ?? 0) > 1 ? shown : undefined;
  const [chosen, setChosen] = useState(0);
  const pick = colorways?.[chosen];

  /* ---- When the acetates are fetched, and why not all at once ----

     This used to warm drei's cache with EVERY glb the moment the component
     mounted. On ARCA II that is eight files and 6.85MB, fetched at the top
     of a page whose turntable is most of a scroll away, and eight Draco
     decodes on the main thread in one burst. Measured: a 271ms long task
     during load, on a fast machine with everything already in disk cache.
     That is the jitter.

     Three things replace it, in the order the reader needs them.

     1. The FIRST acetate is warmed on mount. It is the one the section
        opens on, so it is not speculative.

     2. The REST are warmed only once the section is near the viewport,
        one per idle callback rather than in a burst. `useOnScreen` already
        carries half a screen of warning, which is enough to have the set
        in before a reader who is scrolling can reach the squares. Idle
        scheduling is what keeps the decodes off the frames that are
        drawing the page.

     3. A square warms its own glb on POINTER ENTER, ahead of the click.
        That is the path that actually has to feel instant, and it costs
        nothing for the acetates nobody points at.

     Why warming matters at all: `useGLTF` SUSPENDS on a file it has not
     seen, and the boundary around the viewer falls back to null, so a cold
     swap tears the whole stage down, lights and environment included, and
     rebuilds it a moment later. Warmed, the swap happens inside one frame. */
  const stage = useRef<HTMLElement>(null);
  /* ---- One gate, for everything this section costs ----

     `false` until the observer says otherwise, because this decides when
     to do WORK rather than when to draw pixels. A hopeful default starts
     all eight downloads at mount, which is the thing being fixed.

     A screen and a half of warning rather than the usual half. Two things
     hang off this gate now, and the heavier one is the <Canvas> below: r3f
     sizes the canvas, builds the scene and convolves the environment map
     on its first render, and that is a job measured in hundreds of
     milliseconds. Half a screen of notice would simply move that cost from
     page load into the scroll approaching the section, which trades a slow
     load for a stutter. A screen and a half has it standing and steady
     before the reader arrives. */
  const near = useOnScreen(stage, "150% 0px", false);

  /* Built once, then kept.

     `near` goes false again the moment the reader scrolls past, and
     unmounting on the way out would mean paying the whole build a second
     time for anyone who scrolls back up — the same hundreds of
     milliseconds, now in the middle of a gesture, which is worse than
     paying it at load. So this latches: it turns on once and stays on.

     Keeping the scene mounted costs nothing per frame. ProductModel's own
     render gate (useRenderGate) already stops the loop whenever the
     turntable is off screen, which is where the saving actually was. */
  const [built, setBuilt] = useState(false);
  useEffect(() => {
    if (near) setBuilt(true);
  }, [near]);

  useEffect(() => {
    if (colorways?.[0]) preloadModels([colorways[0].src]);
  }, [colorways]);

  useEffect(() => {
    if (!near || !colorways) return;
    const rest = colorways.slice(1).map((c) => c.src);
    /* requestIdleCallback is not in Safari. The fallback is a timeout,
       which is worse at picking its moment but still spreads the decodes
       across separate tasks rather than one. */
    const idle: (cb: () => void) => number =
      typeof requestIdleCallback === "function"
        ? (cb) => requestIdleCallback(() => cb())
        : (cb) => window.setTimeout(cb, 300);

    let cancelled = false;
    const next = (i: number) => {
      if (cancelled || i >= rest.length) return;
      idle(() => {
        if (cancelled) return;
        preloadModels([rest[i]]);
        next(i + 1);
      });
    };
    next(0);
    return () => {
      cancelled = true;
    };
  }, [near, colorways]);

  /* The offer goes where the acetate goes. Falls back to the page's own
     buy link for a house with no per-colourway set. */
  const href = pick?.href ?? buyHref;

  return (
    <section
      ref={stage}
      id="offering"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink"
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
          /* Mounted on approach, not at page load.

             The turntable is most of a page down and its Canvas used to be
             built during first paint along with everything else: measured
             as a 260ms long task on a fast machine with a warm cache, for
             an object nobody could see yet.

             It is mounted rather than merely switched off. A Canvas that
             mounts already gated renders at its default 300x150 and never
             sets itself up — see the note on useRenderGate, which is the
             bug that rule exists for. Not existing yet has no such
             problem, and the gate above gives it a screen and a half to
             build in. */
          built ? <ProductModel src={pick?.src ?? offering.view.src} /> : null
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
      {/* `z-10` is load-bearing, not decoration. The turntable's drag
          handle (.model-grab) carries z-index 2 and is sized to the OBJECT
          — 115cqw by 50cqh about the centre — so on a short window it
          reaches down over this block. Without a z-index here it painted
          on top of the colourway squares and swallowed their clicks: the
          reader could see the control and not press it. The block stays
          transparent to the pointer except where it is an actual control,
          so lifting it takes nothing away from the drag. */}
      <div className="pointer-events-none relative z-10 px-6 pb-16 sm:px-10 sm:pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center">
          <p className="font-ui text-[11px] tracking-[0.35em] text-paper/50 uppercase">
            {offering.preheader}
          </p>

          <RevealText
            as="h2"
            text={offering.name}
            className="font-display text-6xl leading-[1.02] tracking-tight text-paper sm:text-8xl"
          />

          {/* ---- The acetates ----

              Square, hairline, gold when chosen: the same control the buy
              page's picker is, from the same stylesheet, because a reader
              who meets it here and again at checkout should be meeting one
              object twice rather than two objects once. `.swatch` reads
              --fg-*, so the row is wrapped in `on-ink` to resolve them
              against this section's black instead of the body default.

              Flat chips rather than the buy page's photographic thumbnails.
              A picture here would be a second, smaller, worse view of the
              exact thing turning full-screen above it; the frame itself is
              the preview, and these only have to say which colour it is
              about to become.

              `pointer-events-auto` because the block around it is
              transparent to the pointer by default — see the note on that
              wrapper. */}
          {colorways ? (
            <div
              className="on-ink pointer-events-auto mt-5 flex flex-wrap justify-center gap-2"
              role="radiogroup"
              aria-label="Colourway"
            >
              {colorways.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={i === chosen}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setChosen(i)}
                  /* Warm this one before it is asked for. See the note on
                     the preload effects above. */
                  onPointerEnter={() => preloadModels([c.src])}
                  onFocus={() => preloadModels([c.src])}
                  className="swatch"
                  data-on={i === chosen}
                >
                  <span
                    aria-hidden
                    className="swatch-chip"
                    style={{ background: c.swatch }}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {/* Which acetate is on the frame, directly under the squares
              rather than after the offer. The squares are colour and
              nothing else — a row of unlabelled chips is unreadable the
              moment two of them are browns — and the name belongs to the
              control, not to the CTA below it. */}
          {pick ? (
            <p className="mt-2 font-ui text-[11px] tracking-[0.35em] text-paper/60 uppercase">
              {pick.name}
            </p>
          ) : null}

          {/* The rest of the run, and where it lives. Only where the
              turntable is holding a short list. */}
          {colorways && offering.moreNote ? (
            <p className="mt-1 font-ui text-[11px] tracking-[0.2em] text-paper/35 uppercase">
              {offering.moreNote}
            </p>
          ) : null}

          <CtaLink
            href={href}
            /* Filled and inverted below 1024px — see .cta--filled. This is the
               page's offer, and on a phone a word with a rule under it is
               indistinguishable from the label above it. */
            className="cta--filled pointer-events-auto mt-5"
          >
            {offering.cta}
          </CtaLink>


          <p className="mt-5 max-w-md font-ui text-xs leading-relaxed text-pretty text-paper/40">
            {offering.registryNote}
          </p>
        </div>
      </div>

    </section>
  );
}
