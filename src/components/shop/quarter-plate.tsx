"use client";

import NextImage from "next/image";
import type { CSSProperties } from "react";
import { spinFrame, spinScaleFor } from "@/lib/turntable";

/**
 * The turntable, standing still, at the quarter.
 *
 * ---- What it is for ----
 *
 * The story page closes on the frame and then walks into the buy page as
 * the reader keeps scrolling (see StoryHandoff). That walk was carrying a
 * still of the FRONT cut while the counter showed a turntable at whatever
 * angle it had drifted to and the buy page opened on the quarter — three
 * views of the same object inside one continuous move, covered up by a
 * cross-fade. A still of the quarter is what makes it seamless: the
 * closing section, the thing that travels, and the plate the buy page
 * opens on are now the same photograph at the same angle.
 *
 * ---- Why it is drawn like the canvas and not like the cut-out ----
 *
 * Edge to edge with `object-contain` and no padding, multiplied onto the
 * ground, and scaled by the per-house knob — exactly what SpinPlate's
 * canvas does. The `fronts-cut` still is inset by 8% and would land a
 * visibly smaller frame in the same box.
 *
 * `unoptimized`: these are the turntable's own AVIF frames, and the
 * turntable fetches them raw. Sending one of them through the image
 * optimizer would put a second, re-encoded copy of the same picture in
 * flight for the plate the reader is about to see twice.
 */
export function QuarterPlate({
  stem,
  alt,
  priority = false,
}: {
  stem: string;
  /** Empty where the plate is decorative — a copy that travels is not a
   *  second picture of the frame, it is the same one, moving. */
  alt: string;
  priority?: boolean;
}) {
  const scale = spinScaleFor(stem);
  return (
    <NextImage
      src={spinFrame(stem)}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      fill
      unoptimized
      priority={priority}
      sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
      className="object-contain mix-blend-multiply [transform:scale(var(--spin-m,1))] lg:[transform:scale(var(--spin-d,1))]"
      style={
        {
          "--spin-m": scale.mobile,
          "--spin-d": scale.desktop,
        } as CSSProperties
      }
    />
  );
}
