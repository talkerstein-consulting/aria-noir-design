"use client";

import { Heart } from "lucide-react";
import { useHeld } from "@/lib/held";

/**
 * Hold this, or stop holding it.
 *
 * One control, two states, and the state is carried by the fill rather than
 * by a word that changes — see STYLE-GUIDE.md. The word beside it does
 * change, because the fill alone would be colour and shape doing the work
 * of a label, and a reader who cannot see the difference between a filled
 * and an outlined heart at 16px is not an edge case.
 *
 * Before mount the list is unknown, so the heart renders outlined and the
 * word renders "Hold". That is the safe direction to be wrong in: the worst
 * case is one extra press on something already held, which is a toggle, not
 * a loss.
 */
export function HoldToggle({
  slug,
  colorway,
  className = "",
}: {
  slug: string;
  colorway: string | null;
  className?: string;
}) {
  const { holds, toggle, ready } = useHeld();
  const held = Boolean(colorway) && ready && holds(slug, colorway as string);

  return (
    <button
      type="button"
      className={`hold-toggle t-eyebrow ${className}`}
      data-held={held}
      disabled={!colorway}
      aria-pressed={held}
      onClick={() => colorway && toggle(slug, colorway)}
    >
      <Heart aria-hidden />
      <span>{held ? "Held" : "Hold this"}</span>
    </button>
  );
}
