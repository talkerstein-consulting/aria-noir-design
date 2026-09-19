import Image from "next/image";
import type { House } from "@/lib/navigation";
import { RevealPlate, RevealText } from "@/components/reveal";

/**
 * The house's own world, on the page where it is sold.
 *
 * ---- Why a buy page carries a campaign at all ----
 *
 * The funnel is index → story → buy, and the buy page is meant to be
 * downstream of an argument. Four of the six houses have no story page, so
 * for them the buy page opens on a price with nothing in front of it. That
 * is the one thing this site does not do.
 *
 * Each house has now been shot as its own campaign — a Parisian apartment,
 * a faded palazzo, imperial Rome, Egypt — and those frames are not product
 * stills. They do the story page's job in three plates instead of fourteen
 * sections, which is the right size for a page whose real business is the
 * transaction above it.
 *
 * ---- Three beats, and no more ----
 *
 * The world, wide. The frame worn, twice, and the object close. Then one
 * line. A buy page that turns into a lookbook is a buy page a reader
 * scrolls past to get back to the price, so the set is curated in the
 * catalogue rather than rendered from the whole shoot.
 *
 * ---- Templated, like everything else here ----
 *
 * No slug appears in this file. A house with no `campaign` renders nothing
 * and the page closes up around it, which is how ARCA I and ARCA II — the
 * two that already have a story page — are handled without a branch.
 */
export function BuyCampaign({ house }: { house: House }) {
  const campaign = house.campaign;
  if (!campaign) return null;

  /* The worn frames and the macro read as one row of the same object at
     three distances, so they are built as one list rather than as a pair
     plus an extra. A house shot without the macro renders two. */
  const row = [
    ...campaign.worn.map((src) => ({ src, alt: `${house.name}, worn.` })),
    ...(campaign.macro ? [{ src: campaign.macro, alt: `${house.name}, close.` }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* ---- where, said once ---- */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <p className="t-eyebrow">The campaign</p>
        <p className="t-body text-[var(--fg-tertiary)]">{campaign.place}</p>
      </div>

      {/* ---- the world ---- */}
      <RevealPlate className="relative mt-8 aspect-[16/9] w-full overflow-hidden">
        <Image
          src={campaign.world}
          alt={`${house.name}, on location.`}
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
      </RevealPlate>

      {/* ---- the same object, closer ---- */}
      {/* `auto-fit` rather than a column count: a house shot without the
          macro has two plates here, and a fixed three-column grid would
          leave the third cell empty rather than widening the two. */}
      <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {row.map((plate, i) => (
          <RevealPlate
            key={plate.src}
            delay={i * 90}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <Image
              src={plate.src}
              alt={plate.alt}
              fill
              sizes="(min-width: 1280px) 420px, (min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
          </RevealPlate>
        ))}
      </div>

      {/* ---- the line ---- */}
      <RevealText
        as="p"
        text={campaign.line}
        className="t-display-xs mt-16 max-w-[26ch] text-balance text-[var(--fg-primary)]"
      />
    </div>
  );
}
