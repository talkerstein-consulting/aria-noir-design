import Image from "next/image";
import type { House } from "@/lib/navigation";

/**
 * The making, and what the frame arrives in (Nov 2026 review).
 *
 * Jai asked for the close every Jacques Marie Mage product page has: the
 * craft, then the packaging. The words are his draft from the review deck
 * (p.18), cut to the house voice in COPY.md: no em-dashes, no "because",
 * and nothing from the deck's "don't claim yet" list (no 18K gold, CE,
 * UV400, Rx-ready, unqualified "handmade", "sustainable"). The deck files
 * this copy under "once facts are confirmed", so treat it as a draft for
 * his sign-off.
 *
 * The packaging is REAL photography from the house's own photo bank
 * (arianoir-showcase.pages.dev/bank/product), never a render. It is the
 * house's packaging, not this frame's, so the alt text says what is in the
 * picture and does not claim the frame shown is the one on this page.
 */
const PACKAGING = [
  {
    src: "/images/packaging/cases-lineup.webp",
    alt: "The cases, lacquered, lined in red, open and closed beside their boxes",
    width: 1140,
    height: 760,
  },
  {
    src: "/images/packaging/lacquer-case-open.webp",
    alt: "A frame in its lacquered case, the lid open on the red lining",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/packaging/box-black.webp",
    alt: "A frame in front of the black ARIA box",
    width: 1140,
    height: 760,
  },
  {
    src: "/images/packaging/box-blue.webp",
    alt: "A frame in front of the blue ARIA box",
    width: 1200,
    height: 800,
  },
] as const;

export function BuyCraft({ house }: { house: House }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 lg:gap-24">
      {/* ---- the making ---- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-5">
          <p className="t-eyebrow">The making</p>
          <h2 className="t-display-lg">Made slowly, on purpose.</h2>
        </div>
        <div className="stack stack--sm">
          <p className="t-body">
            Each {house.name} frame begins as a solid block of cellulose acetate. It is milled to
            our drawings, not poured into a mould. Then it is shaped, tumbled for days and polished
            by hand.
          </p>
          <p className="t-body">
            The emblem is a separate piece, gold-plated, with its own tooling. It is set into the
            acetate.
          </p>
          <p className="t-body">Fewer frames, made properly, meant to be worn for years.</p>
        </div>
      </div>

      {/* ---- what it arrives in ---- */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="t-eyebrow">The case</p>
          <h2 className="t-display-md">What it arrives in.</h2>
        </div>
        {/* Two across at every width: a single column of four photographs of
            boxes would be the longest thing on a phone's buy page. */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-6">
          {PACKAGING.map((p) => (
            <li key={p.src} className="relative aspect-[3/2] overflow-hidden bg-[var(--fg-rule)]">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 1280px) 620px, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
