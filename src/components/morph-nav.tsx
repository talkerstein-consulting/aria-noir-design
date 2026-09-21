"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cards that morph into the page they open.
 *
 * A colourway card on the shop and the lead plate on that colourway's buy
 * page are the same photograph — see `squareFor`. This makes the browser
 * animate between the two rather than replacing one page with another, so
 * pressing a frame enlarges it into its own page.
 *
 * ---- Why a delegated listener and not an onClick ----
 *
 * `ProductCard` renders on the server. Giving it a click handler would
 * make it — and every grid that draws it — a client component, which is a
 * real cost in shipped JavaScript for an effect that is decoration. One
 * listener on the document reads `data-morph` off whatever was clicked
 * instead, so the cards stay server-rendered and this is the only
 * component that ships.
 *
 * ---- Why it waits ----
 *
 * `startViewTransition` snapshots the page, runs its callback, then
 * snapshots again — so the callback must resolve only once the NEW page is
 * drawn. `router.push` returns long before React has rendered, and
 * resolving on it captures the old page twice: the transition runs,
 * nothing moves, and the new page appears afterwards. See
 * `waitForArrival`.
 *
 * ---- What it declines to handle ----
 *
 * Modified clicks (new tab, download, middle button) and any browser
 * without `startViewTransition` fall through to the ordinary link. The
 * morph is an enhancement; the navigation works without it.
 */
export function MorphNav() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;

    /* ---- Arrival is the URL matching, then a painted frame ----
     *
     * This watched `usePathname` and that is not enough: pressing a
     * colourway in the run navigates from `?colourway=Noir` to
     * `?colourway=Velvet Rose`, which is the SAME pathname. The hook never
     * fired, the promise sat until its timeout, and the transition ran a
     * second and a bit late every time.
     *
     * Polling the full URL catches a query-only move as well as a route
     * change, and it needs no `useSearchParams` — which in a layout would
     * opt every page underneath it out of static rendering for a value
     * nothing renders.
     *
     * Two frames after the match, not zero: the URL is updated before
     * React has drawn the new page, and snapshotting then captures the old
     * one twice. */
    const waitForArrival = (href: string) =>
      new Promise<void>((resolve) => {
        const started = performance.now();
        const tick = () => {
          const here = window.location.pathname + window.location.search;
          if (here === href) {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            return;
          }
          /* A route that never lands must not leave the page frozen under
             a transition that cannot end. */
          if (performance.now() - started > 1200) return resolve();
          requestAnimationFrame(tick);
        };
        tick();
      });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[data-morph]",
      );
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (link.target && link.target !== "_self") return;

      /* Stopped here, not just prevented. Next's `<Link>` has its own
         handler that will navigate on this same click — without
         `stopPropagation` the route changes twice: once outside the
         transition and once inside it, and the morph animates between two
         copies of the destination. */
      /* ---- Name it now, and only it ----
         A `view-transition-name` costs a snapshot, so the grid does not
         wear thirty of them waiting for one to be used. The pressed card's
         photograph is named here and released when the transition ends,
         which also keeps the name unique: two elements sharing one makes
         the transition ambiguous and the browser skips it entirely. */
      /* The photograph is NOT inside the anchor. The card's link wraps
         only the product name and covers the rest with a stretched
         pseudo-element — see the note in product-card — so looking for an
         image inside the link finds nothing, and the old snapshot came
         back with no named element to morph from. The picture belongs to
         the card, so the card is what gets searched. */
      const card = link.closest(".card-link") ?? link;
      const img = card.querySelector<HTMLElement>("img");
      const name = link.getAttribute("data-morph") || "";
      if (img && name) {
        img.style.viewTransitionName = name;
        /* Forces the style to be committed before the snapshot.
        
           `startViewTransition` captures the OLD state from the rendering
           state as it stands, and a just-written inline style has not been
           recalculated yet — measured, the capture came back with a
           `::view-transition-new` for this frame and no `old` at all, so
           the browser had nothing to morph from and simply faded the new
           page in. Reading a layout property flushes the pending style so
           the name is really on the element when the picture is taken. */
        void img.offsetWidth;
      }
      const release = () => {
        if (img) img.style.viewTransitionName = "";
      };

      e.preventDefault();
      e.stopPropagation();
      const transition = document.startViewTransition(async () => {
        router.push(href);
        await waitForArrival(href);
        /* ---- The new page opens at the top ----
        
           The run sits well down the buy page, so a reader pressing a
           colourway there is a long way from the plate that colourway
           morphs INTO. Without this the frame flies off the top of the
           screen to a destination nobody can see. Scrolled before the
           second snapshot is taken, so the plate is captured where it will
           actually be. */
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      });
      transition.finished.then(release, release);
    };

    /* ---- Capture phase, and that is the whole trick ----
     *
     * React attaches its listeners at the app root, so a bubble-phase
     * listener on the document runs AFTER `<Link>` has already called
     * preventDefault and started its own navigation — measured, the
     * handler saw `defaultPrevented` and bailed every time, and the
     * transition never fired at all. Capture runs before React sees the
     * click, which is the only point at which this can take it over. */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);



  return null;
}
