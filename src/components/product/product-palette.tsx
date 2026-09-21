import type { PaletteColour } from "@/lib/product";

/**
 * The house's colour scheme, as an accent under the opening.
 *
 * Not a picker and not a gallery — there is nothing to click here. The
 * opening has just said what the room is made of and what the light does
 * in it, and this is the run of acetate that room was built to hold, laid
 * out flat before the reader has been shown a single frame. It reads as a
 * material sample card pinned under the paragraph, which is what a house
 * that pours its own acetate would actually put there.
 *
 * A BAND rather than a section: no heading, no CTA, one screen-wide strip
 * of colour and a row of names. It is an accent, and an accent that took a
 * full screen and a masthead would be a third argument between the
 * structure and the campaign.
 *
 * It takes a name and a hex per colour, and nothing else. It used to take
 * the turntable's own `OfferingColorway[]`, which carried a glb and a buy
 * link as well — so a house with one export between its whole run could
 * not paint a strip of its own acetate. StoryPage builds the list from the
 * catalogue now, which is where the colours were all along. A house that
 * adds a ninth acetate adds it once, in lib/navigation.
 */
export function ProductPalette({
  colorways,
  label = "The Acetates",
}: {
  colorways: readonly PaletteColour[];
  label?: string;
}) {
  if (!colorways.length) return null;

  return (
    <section
      id="palette"
      aria-label={label}
      className="relative bg-ink px-6 pb-16 sm:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <p className="font-ui text-[11px] tracking-[0.35em] text-paper/55 uppercase">
          {label}
        </p>

        {/* One continuous strip, flush, no gaps and no radius: this is a
            pour of material with the colours running into each other, not
            a row of chips floating on black. The hairline over it is the
            same rule every other band on the site rests under. */}
        <div className="mt-4 flex h-16 w-full overflow-hidden border-t border-paper/15 sm:h-20">
          {colorways.map((c) => (
            <div
              key={c.name}
              className="flex-1"
              style={{ background: c.swatch }}
              /* The names are written out underneath, so the strip itself
                 is decoration and says nothing a screen reader needs. */
              aria-hidden
            />
          ))}
        </div>

        {/* The names, on the same track as the colours above them, so each
            one sits under its own band. From `sm` up there is room for
            that. On a phone there is not: eight bands are 40px each and
            TORTOISE alone is wider, so the track ran off the right edge of
            the screen. There the names run as one line in the strip's
            order instead, which still says what the bands are. */}
        <div className="mt-3 hidden w-full sm:flex">
          {colorways.map((c) => (
            <p
              key={c.name}
              className="min-w-0 flex-1 pr-2 font-ui text-[10px] leading-tight tracking-[0.14em] text-paper/55 uppercase"
            >
              {c.name}
            </p>
          ))}
        </div>
        <p className="mt-3 font-ui text-[10px] leading-relaxed tracking-[0.14em] text-paper/55 uppercase sm:hidden">
          {colorways.map((c, i) => (
            <span key={c.name} className="whitespace-nowrap">
              {c.name}
              {i < colorways.length - 1 ? (
                <span aria-hidden className="px-2 text-paper/25">·</span>
              ) : null}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
