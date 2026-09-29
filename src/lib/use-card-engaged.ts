"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether the reader has reached for this card yet: a pointer on it, or
 * focus inside it. Latches true.
 *
 * A card's extra photographs (the carousel's later slides, the hover
 * swap) are laid out but invisible, and a laid-out image downloads as
 * soon as it nears the viewport, lazy or not — so a grid of twelve was
 * pulling two to six photographs per card that most readers never see,
 * and a phone never can. They mount on the first sign of interest
 * instead. Listens on the whole card (`.card-link`), because the stretched
 * name link sits over the picture and takes the pointer.
 */
export function useCardEngaged(ref: RefObject<HTMLElement | null>, start = false) {
  const [engaged, setEngaged] = useState(start);
  useEffect(() => {
    if (engaged) return;
    const card = ref.current?.closest(".card-link");
    if (!card) return;
    const go = () => setEngaged(true);
    card.addEventListener("pointerenter", go);
    card.addEventListener("focusin", go);
    return () => {
      card.removeEventListener("pointerenter", go);
      card.removeEventListener("focusin", go);
    };
  }, [ref, engaged]);
  return engaged;
}
