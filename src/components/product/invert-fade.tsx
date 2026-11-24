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
 * Progress is written straight to `--hole`; scrolling never renders.
 *
 * ---- The sheet stops answering for the nav once the hole is under it ----
 *
 * The sheet carries `.on-ink`, and the nav's tone probe works by asking
 * what is under the band (site-nav.tsx). A mask does not affect hit
 * testing, so a sheet whose hole had already opened past the top of the
 * screen still answered "ink" — and the bar kept its wash of ink over
 * what was by then the counter's paper. On a phone that is a grey smear
 * across the wordmark for the whole opening (Rems, 24 Nov).
 *
 * So the sheet stops taking hits the moment the hole reaches the band:
 * the probe falls through to the paper underneath and the wash goes out
 * on its own transition. It is still drawn — this is about what it
 * ANSWERS, not about what it covers.
 *
 * ---- Nothing snaps here any more ----
 *
 * A reader who stopped part-way through the opening used to be carried
 * the rest of the way by an animated scroll, so the counter came to rest
 * at the top (Jai, review PDF: snap to the store section after the
 * dark-to-light transition).
 *
 * That snap was written when the counter was a destination. It is not
 * one now: it is the buy page's first screen, and scrolling on at it
 * changes the route (see StoryHandoff). The ink opening, the counter
 * rising and the hand-off are one continuous move driven by nothing but
 * scroll position, and a 0.9s animated scroll in the middle of it was
 * the one thing in the sequence that took the scroll away from the
 * reader. The intent behind the note is still met — a reader going down
 * this passage lands on the store — by the hand-off at the end of it.
 */
/** Where the nav takes its reading, in pixels from the top of the screen:
 *  the middle of a 68px band. The probe's own line, in one number, so the
 *  sheet below steps aside at the moment the bar would otherwise still be
 *  washed in ink. */
const NAV_PROBE_Y = 34;

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

      /* Is the nav's band standing over the hole? The mask is a circle at
         the sheet's own centre whose radius is the same `75vmax` the
         stylesheet draws it with, and the band probes down its middle a
         few pixels from the top of the screen. Inside the circle — or the
         sheet gone up past the band altogether — and the sheet stands
         aside, so what answers for the ground is the paper it is
         uncovering. */
      const r = sh.getBoundingClientRect();
      const vmax = Math.max(window.innerWidth, vh);
      const radius = p * 0.75 * vmax;
      const dx = window.innerWidth / 2 - (r.left + r.width / 2);
      const dy = NAV_PROBE_Y - (r.top + r.height / 2);
      const uncovered =
        Math.hypot(dx, dy) < radius || r.bottom < NAV_PROBE_Y || r.top > vh;
      sh.style.pointerEvents = uncovered ? "none" : "";
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
