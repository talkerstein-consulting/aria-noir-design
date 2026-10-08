"use client";

import { CtaLink } from "@/components/cta-link";
import { useEffect, useState } from "react";
import { DollyGallery } from "@/components/react-bits/dolly-gallery";
import { apparel } from "@/lib/apparel";
import { houses, shopPath } from "@/lib/navigation";
import { collections, pieces } from "@/lib/shop-all";

/**
 * `/collections`: every collection the house makes.
 *
 * The opening is the dolly gallery at full screen, with the collection's
 * words laid over its centre. The
 * words answer to whichever picture the gallery has in front. Each collection
 * carries ONE way out: its story page (its counter where it has no story).
 */

/** One line per collection, from the house. */
const LINES: Record<string, string> = {
  "arca-i": "Concrete, shadow, and restraint. The original study in form.",
  "arca-ii": "Concrete meets chiaroscuro. Darker, warmer, more intimate.",
  patriarca: "Ancient stone. Modern power. A frame built for presence.",
  matriarca: "Monumental scale. Gold, stone, and a frame made to endure.",
  monarca: "A faded palazzo. Deep shadow, quiet light, and something left unsaid.",
  ahava: "A Parisian interior. Soft light, still air, and a frame at rest.",
  "alpaca-sweater": "A study in knit. Diamond, texture, and the weight of the Louvre.",
};

const chapters = collections.map((c, i) => {
  const own = pieces.filter((p) => p.collection === c.slug);
  const house = houses.find((h) => h.slug === c.slug);
  const line = apparel.find((a) => a.slug === c.slug);
  return {
    ...c,
    number: String(i + 1).padStart(2, "0"),
    material: house?.material ?? line?.material ?? "",
    note: LINES[c.slug] ?? house?.note ?? line?.note ?? "",
    href: house?.href ?? (house ? shopPath(house) : `/shop/${c.slug}`),
    cta: house?.href ? "Discover the story" : `Shop ${c.name}`,
    count: own.length,
    fromCents: own.length ? Math.min(...own.map((p) => p.cents)) : 0,
  };
});

/** The house's order: the founding study first, the knit last. */
const ORDER = ["arca-i", "arca-ii", "patriarca", "matriarca", "monarca", "ahava"];
const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
const gallery = chapters.filter((c) => c.image).sort((a, b) => rank(a.slug) - rank(b.slug));

export function CollectionsIndex() {
  const [active, setActive] = useState(0);
  /* The side the front photograph passes on; the words take the other. */
  const [side, setSide] = useState<-1 | 1>(1);
  const shown = chapters[active];

  /* The resting photograph fills its half of the screen. The gallery draws
     tiles at `itemWidth` on the front plane and rests each one REST past
     it, where perspective enlarges it by SWELL; so the tile is sized to
     arrive at the wanted size, not drawn at it. */
  const [view, setView] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const read = () => setView({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const phone = view.w < 768;
  /* Far photographs sit well back: the next one waits small. */
  const SPACING = 800;
  const REST = 0.6;
  const PERSPECTIVE = 1000;
  const SWELL = PERSPECTIVE / (PERSPECTIVE - REST * SPACING);
  /* Shown size: on a desktop, most of a half and most of the height; on a
     phone, the upper part of the screen, the words below it. */
  const shownW = phone
    ? Math.min(view.w * 0.88, (view.h * 0.4) / 1.25)
    : Math.min(view.w * 0.4, (view.h * 0.8) / 1.25);
  const itemWidth = shownW / SWELL;
  /* Centre of the photograph, from the middle of the screen. */
  const offset = phone ? view.h * 0.22 : view.w * 0.25;
  const spread = offset / SWELL / (phone ? itemWidth * 1.25 : itemWidth);
  const lift = 0;

  return (
    <>
      <section
        className="on-ink relative h-[100svh] overflow-hidden bg-ink"
        aria-labelledby="collections-heading"
        data-lenis-prevent
      >
        <h1 id="collections-heading" className="sr-only">
          Collections
        </h1>

        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 md:pt-0 md:pb-0 ${
            side === -1 ? "pt-[22svh]" : "pb-[22svh]"
          } ${
            side === 1 ? "md:justify-start" : "md:justify-end"
          }`}
          aria-live="polite"
        >
          <div key={shown.slug} className="rise-now flex w-full max-w-md flex-col items-center gap-4 text-center md:w-1/2 md:max-w-none md:px-[6vw]">
            <h2 className="t-display-lg">{shown.name}</h2>
            {shown.note ? (
              <p className="t-body max-w-sm text-pretty text-paper/75">{shown.note}</p>
            ) : null}
            <CtaLink href={shown.href} className="pointer-events-auto mt-2">
              {shown.cta}
            </CtaLink>
          </div>
        </div>

        <div className="absolute inset-0" style={{ transform: `translateY(${lift}px)` }}>
          <DollyGallery
            images={gallery.map((c) => ({ src: c.image!, alt: c.name }))}
            grayscale={0}
            itemWidth={itemWidth}
            spacing={SPACING}
            perspective={PERSPECTIVE}
            borderRadius={0}
            snap
            infinite
            resolution={3}
            rest={REST}
            ghost={phone ? 0.14 : 0.04}
            axis={phone ? "y" : "x"}
            fan={phone ? 3.4 : 0}
            spread={spread}
            scatter={0}
            parallaxX={0}
            parallaxY={0}
            tilt={0}
            onIndexChange={(i, s) => {
              setActive(chapters.indexOf(gallery[i]));
              setSide(s);
            }}
          />
        </div>
      </section>

    </>
  );
}
