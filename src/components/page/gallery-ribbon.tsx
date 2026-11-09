"use client";

import { useEffect, useRef, useState } from "react";
import DepthRibbon from "@/components/depth-ribbon";
import { CtaLink } from "@/components/cta-link";
import type { GalleryRoom } from "@/lib/pages";

/** Every room's plates on one ribbon, captioned with their house.
 *
 *  The filter in the top corner narrows the ribbon to one house. The
 *  ribbon is keyed on the choice, so it rebuilds from the new set rather
 *  than trying to swap cards already in flight. */
export function GalleryRibbon({ rooms }: { rooms: readonly GalleryRoom[] }) {
  const [house, setHouse] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  /* The photograph in front, and the frame in it to buy (call, 5 Nov:
     gallery images link to the product; a hover overlay was too heavy,
     and a phone has no hover). Tapping a plate brings it forward; the
     link appears under it, quiet, and goes when the plate is let go. */
  const [front, setFront] = useState<number>(-1);
  const shown = house ? rooms.filter((r) => r.eyebrow === house) : rooms;
  const items = shown.flatMap((room) =>
    room.plates.map((p) => ({
      src: p.src,
      alt: p.alt,
      title: room.eyebrow,
      subtitle: p.colorway ?? room.heading,
      shop: shopFor(room.href, room.eyebrow, p.colorway),
    })),
  );
  const shop = front >= 0 ? items[front]?.shop : undefined;
  const choices: (string | null)[] = [null, ...rooms.map((r) => r.eyebrow)];

  return (
    <section className="on-ink bg-ink relative h-svh w-full">
      <DepthRibbon
        key={house ?? "all"}
        items={items}
        backgroundColor="#000000"
        radius={0}
        speed={1}
        ariaLabel={house ? `Aria Noir gallery, ${house}` : "Aria Noir gallery"}
        className="h-full w-full"
        onFocusChange={(_, i) => setFront(i)}
      />

      {shop ? (
        <div className="absolute inset-x-0 bottom-[14%] z-20 flex justify-center px-4">
          <CtaLink key={shop.href} href={shop.href} kind="secondary">
            {shop.label}
          </CtaLink>
        </div>
      ) : null}

      <div ref={menuRef} className="absolute left-6 top-24 z-20 sm:left-10">
        <button
          type="button"
          className="cta-secondary gap-2.5"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {/* The shop bar's filter mark, knobs on ink. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            className="filter-glyph h-4 w-4 shrink-0"
            data-open={open || undefined}
          >
            <line className="filter-glyph-a" x1="1.5" y1="5" x2="14.5" y2="5" />
            <line className="filter-glyph-b" x1="1.5" y1="11" x2="14.5" y2="11" />
            <circle className="filter-glyph-knob" cx="10.5" cy="5" r="1.75" fill="var(--ink)" />
            <circle className="filter-glyph-knob" cx="5.5" cy="11" r="1.75" fill="var(--ink)" />
          </svg>
          {house ? `Filter: ${house}` : "Filter"}
        </button>
        {open ? (
          <ul
            role="menu"
            className="absolute left-0 mt-2 min-w-full border border-[var(--fg-rule)] bg-ink py-2"
          >
            {choices.map((c) => (
              <li key={c ?? "all"} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={house === c}
                  className={`link-quiet block w-full whitespace-nowrap px-5 py-2 text-left font-ui text-[11px] font-bold uppercase tracking-[0.12em] ${
                    house === c ? "text-[var(--gold)]" : "text-paper"
                  }`}
                  onClick={() => {
                    setFront(-1);
                    setHouse(c);
                    setOpen(false);
                  }}
                >
                  {c ?? "All houses"}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/** The buy page for a room's house, at the acetate when the plate names one.
 *  Rooms link to the story page (/arca-i) or the buy page (/shop/patriarca);
 *  either way the house's slug is the last segment. */
function shopFor(roomHref: string, house: string, colorway?: string) {
  const slug = roomHref.split("/").pop();
  if (!slug) return undefined;
  const q = colorway ? `?colourway=${encodeURIComponent(colorway)}` : "";
  return { href: `/shop/${slug}${q}`, label: colorway ? `Shop ${house} in ${colorway}` : `Shop ${house}` };
}
