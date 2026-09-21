"use client";

import { Bookmark } from "lucide-react";
import { useHeld } from "@/lib/held";

/**
 * Hold this, or stop holding it.
 *
 * A BOOKMARK, not a heart. A heart says "I love this", which is a feeling
 * about a frame; this list is business unfinished — a thing set aside to
 * come back to. The bookmark says that, and it stops the held list reading
 * as a favourites wall.
 *
 * One control, two states, and the state is carried by the fill rather than
 * by a word that changes — see STYLE-GUIDE.md. The word beside it does
 * change, because the fill alone would be colour and shape doing the work
 * of a label, and a reader who cannot see the difference between a filled
 * and an outlined bookmark at 16px is not an edge case.
 *
 * Before mount the list is unknown, so the bookmark renders outlined and the
 * word renders "Hold". That is the safe direction to be wrong in: the worst
 * case is one extra press on something already held, which is a toggle, not
 * a loss.
 */
export function HoldToggle({
  slug,
  colorway,
  className = "",
  compact = false,
  label,
}: {
  slug: string;
  colorway: string | null;
  className?: string;
  /**
   * The bookmark alone, for a grid.
   *
   * ---- This is a concession, and it is worth naming ----
   *
   * The argument above — that a fill is colour and shape doing a label's
   * work — has not stopped being true. It is overruled in ONE place: a
   * grid of cards, where the word would repeat beside every name and the
   * control is secondary to the product it sits on.
   *
   * What is bought back: the button still carries `aria-pressed`, so a
   * screen reader is told held or not held regardless of the fill, and its
   * `aria-label` names the PRODUCT rather than the gesture, so a reader
   * tabbing a grid of twelve bookmarks can tell them apart. `title` gives a
   * sighted reader the same sentence on hover. Only the printed word goes.
   *
   * On a product page — one control, all the room in the world — keep the
   * word: pass nothing and this stays false.
   */
  compact?: boolean;
  /** What this holds, for the label a compact bookmark cannot print. */
  label?: string;
}) {
  const { holds, toggle, ready } = useHeld();
  const held = Boolean(colorway) && ready && holds(slug, colorway as string);

  const says = held
    ? `Held${label ? ` — ${label}` : ""}`
    : `Hold this${label ? ` — ${label}` : ""}`;

  return (
    <button
      type="button"
      className={`hold-toggle t-eyebrow ${compact ? "hold-toggle--compact " : ""}${className}`}
      data-held={held}
      disabled={!colorway}
      aria-pressed={held}
      aria-label={compact ? says : undefined}
      title={compact ? says : undefined}
      onClick={() => colorway && toggle(slug, colorway)}
    >
      <Bookmark aria-hidden />
      {compact ? null : <span>{held ? "Held" : "Hold this"}</span>}
    </button>
  );
}
