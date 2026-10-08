"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The collection tiles: one per house, a horizontal 5:4, with the house
 * name and a dot per colourway under it. Clicking a dot shows that
 * colourway's photograph in the tile (crossfaded); the tile's link then
 * opens that colourway. Data is built on the server (HomeCollections).
 */

/** The key for the house's own photograph among the tile's layers. */
const HOUSE = "__house";

export type CollectionTile = {
  slug: string;
  name: string;
  href: string;
  /** The house's own photograph, shown until a colourway is chosen. */
  image: string;
  colourways: { name: string; swatch: string; image: string | null }[];
};

/** `scroll`: on a phone, one row that side-scrolls (Shop All) instead of
 *  the two-column grid. From sm up it is the grid either way. */
export function CollectionTiles({ items, scroll = false }: { items: CollectionTile[]; scroll?: boolean }) {
  return (
    <ul
      className={
        scroll
          ? "tiles-scroll flex snap-x snap-mandatory overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3"
          : "grid grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => (
        <Tile key={item.slug} item={item} scroll={scroll} />
      ))}
    </ul>
  );
}

function Tile({ item, scroll = false }: { item: CollectionTile; scroll?: boolean }) {
  const [chosen, setChosen] = useState<string | null>(null);
  /* What is on screen. Lags `chosen` until the new photograph has loaded,
     so a switch never fades to an empty frame. */
  const [shown, setShown] = useState<string>(HOUSE);
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set([HOUSE]));
  /* Colourway photographs load when the pointer arrives, not on click. */
  const [warm, setWarm] = useState(false);

  const current = item.colourways.find((c) => c.name === chosen);
  const target = current?.image ? current.name : HOUSE;
  useEffect(() => {
    if (loaded.has(target)) setShown(target);
  }, [target, loaded]);

  /* A chosen colourway opens its buy page; otherwise the house's page. */
  const href = current ? `/shop/${item.slug}?colourway=${encodeURIComponent(current.name)}` : item.href;

  const layers = [
    { key: HOUSE, src: item.image },
    ...(warm
      ? item.colourways.filter((c) => c.image).map((c) => ({ key: c.name, src: c.image as string }))
      : []),
  ];

  return (
    /* `group` on the whole tile, dots included, so moving onto a dot keeps
       the hover. Static: the name. Hover: the name, the photograph zooms,
       the colour dots appear. */
    <li
      className={`tile group relative ${scroll ? "w-[78vw] shrink-0 snap-start sm:w-auto" : ""}`}
      onPointerEnter={() => setWarm(true)} onFocusCapture={() => setWarm(true)}>
      <Link href={href} className="relative isolate block aspect-[5/4] w-full overflow-hidden">
        {/* The zoom lives on this wrapper so it never fights the
            crossfade's own scale on each picture. */}
        <div className="absolute inset-0 isolate transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
        {layers.map((layer) => {
          const on = layer.key === shown;
          return (
            <Image
              key={layer.key}
              src={layer.src}
              alt={on ? `${item.name}${current ? `, ${current.name}` : ""}` : ""}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              /* A slow crossfade, and the incoming picture settles from a
                 touch larger, so the change reads as one movement. */
              className="object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(1.02)", zIndex: on ? 1 : 0 }}
              onLoad={() => setLoaded((s) => (s.has(layer.key) ? s : new Set(s).add(layer.key)))}
            />
          );
        })}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink/85 to-transparent sm:block"
        />
      </Link>

      {/* Outside the link: the dots are buttons, and a button inside an
          anchor is invalid. Positioned over the tile's foot. */}
      {/* Phone: a caption under the photograph, so it never sits on the
          frame. Wider: over the foot of the tile, as before. */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-1.5 px-2 pt-2.5 pb-4 text-center sm:absolute sm:inset-x-0 sm:bottom-0 sm:gap-3 sm:p-6">
        {/* Same size as the product names in the frames grid. */}
        <h3 className="font-display text-base leading-tight text-paper sm:text-2xl">
          {item.name}
          {current ? <span className="italic"> {current.name}</span> : null}
        </h3>
        <ul
          className="tile-dots pointer-events-auto flex flex-wrap justify-center gap-1.5 sm:gap-2"
          aria-label={`${item.name} colourways`}
        >
          {item.colourways.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={chosen === c.name}
                onClick={() => {
                  /* Touch has no hover: a tap is also the warm-up. */
                  setWarm(true);
                  setChosen(chosen === c.name ? null : c.name);
                }}
                /* No stroke at rest: the ring appears on hover (and keyboard
                   focus). The chosen dot is marked by size instead. */
                className="swatch-dot block size-3 ring-paper/80 ring-offset-transparent transition-[box-shadow,transform] duration-300 hover:ring-1 hover:ring-offset-2 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:outline-none aria-pressed:scale-125 max-sm:size-2.5 sm:size-3.5"
                style={{ background: c.swatch }}
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
