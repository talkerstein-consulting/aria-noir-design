"use client";

import { useEffect, useState } from "react";
import StaggeredText from "@/components/ui/staggered-text";

/** The hero's overlay hold plus the beat the name already waited for, so
 *  the stagger starts on the same cue the RevealText version did. */
const ENTER_MS = 1120;

/**
 * StaggeredText fires off an IntersectionObserver, and the hero name is
 * above the fold — so left alone it would animate immediately and step on
 * the one-second hold the rest of the overlay observes. Gating the mount is
 * the whole job here; every other decision belongs to the component.
 */
export function HeroName({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), ENTER_MS);
    return () => clearTimeout(t);
  }, []);

  /* Reserve the line before it arrives, so the centred column does not jump
     when the name mounts. Invisible, not absent. */
  if (!armed) {
    return (
      <h1 className={className} style={{ visibility: "hidden" }}>
        {text}
      </h1>
    );
  }

  return (
    <StaggeredText
      as="h1"
      text={text}
      className={`justify-center ${className ?? ""}`}
      /* Words, not characters. The hero line is a SENTENCE now rather than
         a two-letter name, and StaggeredText lays its segments out as flex
         items in a wrapping row: at character granularity the line is free
         to break between any two letters, which it did, mid-word. Words
         are the smallest unit that can wrap without cutting one in half,
         and the stagger still reads across four of them. */
      segmentBy="words"
      delay={110}
      duration={0.6}
      /* "bottom" is where the glyphs START, so they travel UPWARD into
         place — "top" dropped them in from above. */
      direction="bottom"
      blur
    />
  );
}
