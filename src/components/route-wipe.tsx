"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The black screen leaving.
 *
 * ---- Why this is not part of the loading screen ----
 *
 * `app/loading.tsx` is a Suspense FALLBACK. React renders it while the
 * route is still arriving and then replaces it with the page the moment
 * the page is ready, in one commit, with no unmounting animation of any
 * kind. Measured on a warm dev server: the sheet was on screen for 117ms
 * and then gone between two frames. There is no hook, no class and no
 * transition that can be attached to LoadingScreen to change that, because
 * by the time the wipe would play the component no longer exists.
 *
 * So the wait and the exit are owned by two different things. The fallback
 * holds the black while the route loads; this component, which lives in
 * the root layout and therefore survives every route change, puts its own
 * black sheet up at the instant the new route commits and wipes it off the
 * top of the screen. Both sheets are `var(--ink)` at the same z-index, so
 * the handover between them is not visible: one black rectangle is
 * replaced by an identical black rectangle, and then that one leaves.
 *
 * ---- useLayoutEffect, not useEffect ----
 *
 * `usePathname` changes when the new route commits. A passive effect runs
 * AFTER the browser has painted, which means one frame of the new page is
 * shown before the sheet arrives to cover it up: the page flashes, then
 * goes black, then wipes. A layout effect runs before that paint, so the
 * cover is up in the same frame the fallback left in.
 *
 * ---- Two frames before it lifts ----
 *
 * The sheet has to be committed at translateY(0) and THEN told to move, or
 * the browser coalesces both into one style resolution, sees only the end
 * state and skips the transition entirely. One rAF is not reliably enough
 * under load; two is, and 32ms is not a wait anyone can see.
 *
 * ---- The first render does nothing ----
 *
 * A full page load has no previous pathname to have changed from. Wiping
 * on it would mean every cold arrival at the site begins by clearing a
 * black screen that was never there, which is also the home page's own
 * opening, twice.
 */

/** Matches the transition in `.route-wipe` (interactions.css). Two numbers
 *  for one duration, so they are named here and there rather than guessed. */
const WIPE_MS = 620;

export function RouteWipe() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const [phase, setPhase] = useState<"off" | "cover" | "lift">("off");

  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setPhase("cover");

    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase("lift"));
    });
    /* A little past the transition, so the sheet is unmounted rather than
       left sitting off-screen holding a compositor layer for the rest of
       the visit. */
    const done = window.setTimeout(() => setPhase("off"), WIPE_MS + 80);

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(done);
    };
  }, [pathname]);

  if (phase === "off") return null;

  return (
    <div
      aria-hidden
      className="route-wipe"
      /* Inert for its whole life. The page underneath is already
         interactive by the time this is on screen, and a sheet that ate
         the first click of every route change would be a worse bug than
         the one it is here to fix. */
      data-lift={phase === "lift" ? "" : undefined}
    />
  );
}
