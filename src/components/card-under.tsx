"use client";

import Image from "next/image";
import { useRef } from "react";
import { useCardEngaged } from "@/lib/use-card-engaged";

/**
 * The hover swap's second photograph, mounted on the card's first hover or
 * focus rather than with the grid. See useCardEngaged. `eager` mounts it at
 * once, for a caller that has already warmed the card (the search sheet).
 */
export function CardUnder({
  src,
  sizes,
  focal,
  eager = false,
}: {
  src: string;
  sizes?: string;
  focal?: string;
  eager?: boolean;
}) {
  const mark = useRef<HTMLSpanElement>(null);
  const engaged = useCardEngaged(mark, eager);
  return (
    <>
      <span ref={mark} hidden />
      {engaged ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          style={focal ? { objectPosition: focal } : undefined}
          className="card-img card-img--under"
        />
      ) : null}
    </>
  );
}
