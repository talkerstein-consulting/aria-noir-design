"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A card's picture, when the product has more than one.
 *
 * ---- Why this is its own file ----
 *
 * `ProductCard` is a server component, and it is one deliberately: the
 * hover swap is two stacked images and a `group-hover` class, so a grid of
 * forty products ships no JavaScript. Paging through a set needs state, so
 * the state lives here and the card renders this only for the products
 * that have a set. Every other card on the site is unchanged and still
 * server-rendered.
 *
 * ---- The chevrons are spans, not buttons ----
 *
 * The card is a link from edge to edge, and a `<button>` inside an `<a>`
 * is invalid markup — the browser is entitled to hoist it out, which is
 * how a control ends up outside the card it belongs to. These are spans
 * that swallow the click instead, and they are not focusable: a keyboard
 * reader tabs to the card and follows it to the product's own page, where
 * the whole shoot is on screen at full size rather than in a square an
 * inch wide. Nothing is reachable by pointer alone that is not reachable
 * some other way.
 *
 * ---- One picture at a time, cross-faded ----
 *
 * All of the set is in the DOM and the current one is the only one at full
 * opacity, so a step is a fade rather than a load — the next photograph is
 * already decoded by the time it is asked for. Only the first is eager;
 * the rest carry `loading="lazy"` by Next's default.
 */
export function CardShots({
  images,
  alt,
  sizes,
  focal,
  priority = false,
}: {
  images: readonly string[];
  alt: string;
  sizes: string;
  focal?: string;
  priority?: boolean;
}) {
  const [at, setAt] = useState(0);

  /* Wraps, both ways. A set this short has no end worth defending, and a
     dead arrow on the last picture is a control that has to be looked at
     to be used. */
  const step = (by: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAt((i) => (i + by + images.length) % images.length);
  };

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          /* The alt rides the card's own name, and only the picture being
             shown carries it: five photographs of one frame announced five
             times is the card read as five products. */
          alt={i === at ? alt : ""}
          fill
          sizes={sizes}
          priority={priority && i === 0}
          style={focal ? { objectPosition: focal } : undefined}
          className={`object-cover transition-[transform,opacity] duration-500 group-hover:scale-[1.03] ${
            i === at ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Held until the pointer is on the card: at rest the card is the
          photograph and the name, which is what the grid is for. */}
      <span className="card-chevrons" aria-hidden>
        <span role="button" className="card-chevron" onClick={step(-1)}>
          <ChevronLeft />
        </span>
        <span role="button" className="card-chevron" onClick={step(1)}>
          <ChevronRight />
        </span>
      </span>
    </>
  );
}
