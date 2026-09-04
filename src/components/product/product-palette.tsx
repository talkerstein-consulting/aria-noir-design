import type { OfferingColorway } from "@/lib/product";

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
 * It takes the same `OfferingColorway[]` the turntable's squares take, so
 * the colours here and the colours on the frame are one list. A house that
 * adds a ninth acetate adds it once.
 */
export function ProductPalette({
  colorways,
  label = "The Acetates",
}: {
  colorways: readonly OfferingColorway[];
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
        <p className="font-ui text-[11px] tracking-[0.35em] text-paper/40 uppercase">
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
            one sits under its own band. They wrap to two lines on a phone
            at eight colourways and that is fine — the strip stays intact,
            which is the part that has to read. */}
        <div className="mt-3 flex w-full">
          {colorways.map((c) => (
            <p
              key={c.name}
              className="flex-1 pr-2 font-ui text-[10px] leading-tight tracking-[0.14em] text-paper/45 uppercase"
            >
              {c.name}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
