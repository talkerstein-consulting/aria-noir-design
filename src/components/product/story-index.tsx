"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The story page's pinned offer: a compact pill centred at the foot of the
 * screen with the price and the way to buy, at every width.
 *
 * The chapter sidebar that stood at the right edge on desktop has been
 * removed; the page reads straight down. `chapters` is still taken so the
 * pill knows when the hero has gone: it arrives only then, so the opening
 * plate is never framed by furniture.
 */
export type Chapter = { id: string; label: string };

export function StoryIndex({
  chapters,
  name,
  price,
  buyHref,
}: {
  chapters: readonly Chapter[];
  name?: string;
  price?: string;
  buyHref: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const first = chapters.map((c) => document.getElementById(c.id)).find((el): el is HTMLElement => !!el);
    const onScroll = () =>
      setShown(!!first && first.getBoundingClientRect().bottom < window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapters]);

  return (
    <div className="story-pin fixed bottom-4 left-1/2 z-[60] sm:bottom-6" data-shown={shown}>
      {price ? <span className="story-pin__price t-eyebrow">{price}</span> : null}
      <Link href={buyHref} className="story-pin__buy t-eyebrow">
        {name ? `Buy ${name}` : "Buy"}
      </Link>
    </div>
  );
}
