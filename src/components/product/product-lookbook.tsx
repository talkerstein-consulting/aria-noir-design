import Image from "next/image";
import { RevealText, RevealPlate } from "@/components/reveal";

/**
 * The story told the way the lookbook tells it.
 *
 * The lookbook PDFs are a page of words, a run of photographs and a closing
 * line, on ink, with nothing laid over anything. A house that sets
 * `lookbook` on its deck gets that and only that between the hero film and
 * the counter: no turntable, no specification, no curtain grid.
 *
 * Each plate keeps the placement it has in the PDF:
 *   full     edge to edge, the page's full width
 *   inset    a landscape held inside the column, ink around it
 *   portrait an upright plate centred in the column
 *   pair     two plates side by side in the column, where two uprights (or
 *            two of the same subject) would otherwise each stand alone in
 *            a screen of ink
 */
export type LookbookPlate = {
  src: string;
  alt: string;
  kind: "full" | "inset" | "portrait";
  width: number;
  height: number;
};

export type LookbookRow = LookbookPlate | { pair: readonly [LookbookPlate, LookbookPlate] };

export type Lookbook = {
  intro: readonly string[];
  rows: readonly LookbookRow[];
  closing: string;
};

const SIZES: Record<LookbookPlate["kind"], string> = {
  full: "100vw",
  inset: "(min-width: 1280px) 1200px, 100vw",
  portrait: "(min-width: 640px) 520px, 100vw",
};

const FRAME: Record<LookbookPlate["kind"], string> = {
  full: "w-full",
  inset: "mx-auto w-full max-w-7xl px-6 sm:px-10",
  portrait: "mx-auto w-full max-w-[520px] px-6 sm:px-0",
};

export function ProductLookbook({ lookbook }: { lookbook: Lookbook }) {
  return (
    <section className="on-ink relative bg-ink">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-32 text-center sm:py-48">
        {lookbook.intro.map((para, i) => (
          <RevealText
            key={para}
            as="p"
            text={para}
            delay={i * 120}
            /* Body size, set in the display serif rather than Manrope. */
            className="t-body t-body--serif mx-auto text-balance text-paper/80"
          />
        ))}
      </div>

      <div className="flex flex-col gap-16 sm:gap-28">
        {lookbook.rows.map((row) =>
          "pair" in row ? (
            <div
              key={row.pair[0].src}
              className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-4 px-6 sm:grid-cols-2 sm:gap-6 sm:px-10"
            >
              {row.pair.map((plate, i) => (
                <Plate key={plate.src} plate={plate} delay={i * 90} sizes="(min-width: 1280px) 620px, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          ) : (
            <div key={row.src} className={FRAME[row.kind]}>
              <Plate plate={row} sizes={SIZES[row.kind]} />
            </div>
          ),
        )}
      </div>

      <div className="mx-auto max-w-2xl px-6 py-32 text-center sm:py-48">
        <RevealText
          as="p"
          text={lookbook.closing}
          className="t-display-xs text-balance text-paper"
        />
      </div>
    </section>
  );
}

function Plate({
  plate,
  sizes,
  delay = 0,
}: {
  plate: LookbookPlate;
  sizes: string;
  delay?: number;
}) {
  return (
    <RevealPlate delay={delay} className="relative overflow-hidden">
      <Image
        src={plate.src}
        alt={plate.alt}
        width={plate.width}
        height={plate.height}
        sizes={sizes}
        className="block h-auto w-full"
      />
    </RevealPlate>
  );
}
