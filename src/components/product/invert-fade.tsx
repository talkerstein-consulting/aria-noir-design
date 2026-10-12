"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The end of a lookbook story, opened through a pinhole.
 *
 * The counter's first screen (`reveal`) rises under a sheet of ink laid
 * over it, and a hole at the sheet's centre opens as it rises until it
 * clears the corners just as the counter reaches the top, so the hole uncovers the counter rather than filling the
 * screen with white: the frame on its turntable sits at the centre and is
 * the first thing through. Once the hole is past the corners the sheet is
 * gone and the counter scrolls on like any section, followed by
 * `children` (the other collections, the footer) on the same paper.
 *
 * The sheet carries `.on-ink` and takes pointer hits while it is up, so
 * the nav's tone probe reads ink through the whole opening and turns the
 * bar white only once the screen is filled. Progress is written straight
 * to `--hole`; scrolling never renders.
 */
export function InvertFade({
  reveal,
  children,
}: {
  reveal: ReactNode;
  children?: ReactNode;
}) {
  const pin = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pin.current;
    const sh = sheet.current;
    if (!el || !sh) return;
    const update = () => {
      /* Opens while the counter rises into view, no pin: 0 as its top
         clears ~85% of the screen, 1 once it sits at the top. The scroll
         never stops for it. */
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, 1 - el.getBoundingClientRect().top / (vh * 0.85)));
      sh.style.setProperty("--hole", p.toFixed(4));
      sh.dataset.open = p > 0.99 ? "true" : "false";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="on-paper relative bg-paper">
      <div ref={pin} className="pinhole">
        <div ref={sheet} aria-hidden className="pinhole__sheet on-ink" data-open="false" />
        {reveal}
      </div>
      {children}
    </div>
  );
}
