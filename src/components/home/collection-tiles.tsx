"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

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
  /** The colourway that photograph shows: its dot is marked until another
   *  is chosen, so the dots say what is on screen from the start. */
  cover?: string;
  colourways: { name: string; swatch: string; image: string | null }[];
};

/** `scroll`: on a phone, one row that side-scrolls (Shop All) instead of
 *  the two-column grid. From sm up it is the grid either way. */
/** `single`: the product page's grid: one column on a phone, and the
 *  run's four across with hairline gaps on a wide screen. */
/** `row`: the story pages' Other Collections: one side-scrolling row at
 *  every width, four tiles to a screen from lg up, the rest swiped to. */
export function CollectionTiles({
  items,
  scroll = false,
  single = false,
  row = false,
  anchors = false,
  gutter = "paper",
}: {
  items: CollectionTile[];
  /** The colour of the gaps between tiles: white everywhere, black on the
   *  home page (Rems, 8-9 Nov). */
  gutter?: "paper" | "ink";
  scroll?: boolean;
  single?: boolean;
  row?: boolean;
  /** Shop all: a tile scrolls to its own run further down the page
   *  (`#run-<slug>`, ShopAll's breaker) instead of leaving for the house. */
  anchors?: boolean;
}) {
  return (
    /* The gaps between tiles show this list's own ground. */
    <ul
      className={
        (gutter === "ink" ? "bg-ink " : "bg-paper ") +
        (row
          ? "tiles-scroll flex gap-px snap-x snap-mandatory overflow-x-auto"
          : scroll
          ? "tiles-scroll flex gap-1.5 snap-x snap-mandatory overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3"
          : single
            ? "grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4"
            : "grid grid-cols-2 gap-1.5 lg:grid-cols-3")
      }
    >
      {items.map((item) => (
        <Tile key={item.slug} item={item} scroll={scroll} row={row} anchors={anchors} />
      ))}
    </ul>
  );
}

function Tile({
  item,
  scroll = false,
  row = false,
  anchors = false,
}: {
  item: CollectionTile;
  scroll?: boolean;
  row?: boolean;
  anchors?: boolean;
}) {
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
  const href = anchors
    ? `#run-${item.slug}`
    : current
      ? `/shop/${item.slug}?colourway=${encodeURIComponent(current.name)}`
      : item.href;

  /* Under the sticky shop bar, through Lenis when it is running.
     The clearance is the layout's own: `--run-anchor` is declared on
     `.shop-run` and says where that run wants to land — clear of the
     stuck bar on a phone, flush with the top of the screen where the
     cover is full height. A hardcoded 140 was right for neither. 140
     only if the page has no run to ask. */
  const toRun = (e: MouseEvent) => {
    const run = document.getElementById(`run-${item.slug}`);
    if (!anchors || !run) return;
    e.preventDefault();
    const declared = getComputedStyle(run).getPropertyValue("--run-anchor").trim();
    const lid = declared ? parseFloat(declared) : NaN;
    const clear = Number.isFinite(lid) ? lid : 140;
    const top = run.getBoundingClientRect().top + window.scrollY - clear;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top });
    } else if (window.__lenis) {
      window.__lenis.scrollTo(top);
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

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
      className={`tile group relative ${scroll ? "w-[78vw] shrink-0 snap-start sm:w-auto" : ""} ${row ? "w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((100%-3px)/4)]" : ""}`}
      onPointerEnter={() => setWarm(true)} onFocusCapture={() => setWarm(true)}>
      {/* ---- Square cell, uncropped photograph ----

          Raviv, 20 Nov: "something slightly taller, like the ratio of a
          phone screen", then, on seeing it: "make sure there is no
          cropping on the photos, meaning ARCA I is not cropped out."

          The first answer was a portrait cell with the plate contained
          inside it. Nothing was cut, but every tile then carried a band
          of dead ground under its picture, the name had to be dragged
          back up over it by a negative margin, and the gaps between rows
          came out uneven (Rems, 23 Nov: "this alignment and spacing is
          still broken").

          The house plates are square files (cover/square.webp, all six).
          So the CELL is square: the plate fills it edge to edge with
          nothing cropped and nothing left over, and the name sits in flow
          underneath on the same spacing in every tile. */}
      <Link href={href} onClick={toRun} className="relative isolate block aspect-square w-full overflow-hidden">
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
              /* The cell matches the square plates, so this crops nothing;
                 a colourway card shot taller is centred in it, as the shop
                 grid's square cards already do. */
              className="object-cover object-center transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(1.02)", zIndex: on ? 1 : 0 }}
              onLoad={() => setLoaded((s) => (s.has(layer.key) ? s : new Set(s).add(layer.key)))}
            />
          );
        })}
        </div>
      </Link>

      {/* Outside the link: the dots are buttons, and a button inside an
          anchor is invalid. Positioned over the tile's foot. */}
      {/* Phone: a caption under the photograph, so it never sits on the
          frame. Wider: over the foot of the tile, as before. */}
      {/* In flow, under the picture, at every width, on one spacing step:
          the same distance below every plate and above every row. */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-2 px-2 pt-3 pb-5 text-center sm:gap-3 sm:px-6 sm:pt-4 sm:pb-7">
        {/* Same size as the product names in the frames grid. */}
        <h3 className="font-display text-base leading-tight text-[var(--fg-primary)] sm:text-2xl">
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
                aria-pressed={(chosen ?? item.cover) === c.name}
                onClick={() => {
                  /* Touch has no hover: a tap is also the warm-up. */
                  setWarm(true);
                  setChosen(chosen === c.name ? null : c.name);
                }}
                /* The colourway on screen wears the ring (and a touch more
                   size), so when the dots rise in they say which one this
                   is; any other dot takes the ring under the pointer or
                   keyboard focus. The chosen dot's ring and gap are cut by
                   its 1.25 scale, so on screen they match the others. */
                className="swatch-dot block size-3 ring-paper/80 ring-offset-transparent transition-[box-shadow,transform] duration-300 hover:ring-1 hover:ring-offset-2 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:outline-none aria-pressed:scale-125 aria-pressed:ring-[0.8px] aria-pressed:ring-offset-[1.6px] max-sm:size-2.5 sm:size-3.5"
                style={{ background: c.swatch }}
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
