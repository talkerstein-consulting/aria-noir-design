"use client";

import { useSyncExternalStore } from "react";

/**
 * Which acetate the story page's counter is currently offering.
 *
 * ---- Why a store and not a prop ----
 *
 * `StoryPage` is a server component, so it cannot hold the state; the
 * counter (`ProductBuy`) owns `chosen` and sits in the middle of the page,
 * while the threshold that carries a reader into the buy page sits at the
 * foot of it, below Other Collections. They are siblings with a server
 * component between them, which is the one shape a prop cannot cross.
 *
 * Lifting the state would mean wrapping half the page in a client
 * component and passing the rest through as children — a restructure of
 * the page to move one string. This is the string, moved.
 *
 * It is DELIBERATELY not persisted. The question it answers is "what is on
 * screen right now", which is meaningless after a reload; the `?colourway=`
 * search param is the durable form, and it is what the threshold hands to
 * the buy page.
 */

export type StoryOffer = { slug: string; colourway: string | null };

let offer: StoryOffer = { slug: "", colourway: null };
const listeners = new Set<() => void>();

/** Called by the counter whenever its picker moves. */
export function setStoryOffer(next: StoryOffer) {
  if (next.slug === offer.slug && next.colourway === offer.colourway) return;
  offer = next;
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/* One frozen object for the server and the first client render, so the two
   agree and `useSyncExternalStore` has nothing to complain about. */
const EMPTY: StoryOffer = { slug: "", colourway: null };

export function useStoryOffer(): StoryOffer {
  return useSyncExternalStore(
    subscribe,
    () => offer,
    () => EMPTY,
  );
}
