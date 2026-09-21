import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { RevealPlate, RevealText } from "@/components/reveal";
import type { GalleryRoom } from "@/lib/pages";

/**
 * The gallery's rooms, one per house.
 *
 * ---- Why rooms and not a wall ----
 *
 * The home page has a curtain and the lookbook has a book; both are one
 * set of plates falling as one object. This page holds six sets that
 * were shot in six places, and pouring them into one curtain would put
 * Giza beside a Paris salon in the same column. So each house gets a
 * room: its name, where it was shot, and its plates laid out as a page
 * of a book, with a hairline between one room and the next.
 *
 * ---- The layout is the plates' shapes ----
 *
 * Six columns. A wide plate takes all six, a half takes three, a tall
 * takes two, and the rows fall out of that: wide, then three tall, then
 * two half, then three tall. The component does not know the pattern;
 * it reads each plate's `shape` and lets the grid flow. A room with a
 * different rhythm is a different list in lib/pages, not a new layout.
 */
const SPAN: Record<GalleryRoom["plates"][number]["shape"], string> = {
  wide: "col-span-6 aspect-[16/9]",
  half: "col-span-3 aspect-[16/9]",
  tall: "col-span-2 aspect-[4/5]",
};

const SIZES: Record<GalleryRoom["plates"][number]["shape"], string> = {
  wide: "(min-width: 1280px) 80rem, 100vw",
  half: "(min-width: 1280px) 40rem, 50vw",
  tall: "(min-width: 1280px) 26rem, 33vw",
};

export function GalleryRooms({ rooms }: { rooms: readonly GalleryRoom[] }) {
  return (
    <section className="on-ink section bg-ink">
      <div className="mx-auto max-w-7xl">
        {rooms.map((room, r) => (
          <article
            key={room.eyebrow}
            id={room.eyebrow.toLowerCase().replace(/\s+/g, "-")}
            aria-labelledby={`room-${r}`}
            className={r === 0 ? "" : "hairline mt-20 pt-20 sm:mt-40 sm:pt-40"}
          >
            {/* The head: the house, the place, the one line. Left-set,
                against the plates' right edge, so the room reads as a
                caption and a picture rather than as a masthead. */}
            <div className="mb-12 grid gap-8 sm:mb-16 md:grid-cols-[1fr_auto] md:items-end">
              <div className="stack stack--sm">
                <RevealText as="p" text={room.eyebrow} className="t-eyebrow" />
                <h2 id={`room-${r}`} className="t-display-lg max-w-3xl">
                  <RevealText text={room.heading} delay={80} />
                </h2>
                <RevealText
                  as="p"
                  text={room.line}
                  delay={160}
                  className="t-body t-body--lede mt-2 max-w-xl"
                />
              </div>
              <CtaLink href={room.href} kind="secondary">
                {room.cta}
              </CtaLink>
            </div>

            <div className="grid grid-cols-6 gap-3 sm:gap-5 lg:gap-6">
              {room.plates.map((plate, i) => (
                <RevealPlate
                  key={plate.src}
                  delay={(i % 3) * 70}
                  className={`relative overflow-hidden bg-ink ${SPAN[plate.shape]}`}
                >
                  <Image
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes={SIZES[plate.shape]}
                    /* The first room's first plate is above the fold on
                       every screen. Nothing else is. */
                    priority={r === 0 && i === 0}
                    className="object-cover"
                  />
                </RevealPlate>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
