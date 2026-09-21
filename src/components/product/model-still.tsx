"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductModel, posterFor } from "@/components/product/product-model";
import { MODEL_AIR } from "@/lib/model-fit";

/**
 * The turntable, with a photograph of itself underneath.
 *
 * ---- The two failures this covers ----
 *
 * 1. **The wait.** The scene is not mounted until the reader is a screen
 *    and a half away, and once mounted it has a glb to fetch and an
 *    environment map to convolve. On a phone on a train that is seconds of
 *    an empty black stage under a section whose whole argument is the
 *    object. A still of the same frame at the same angle is not a
 *    placeholder in the spinner sense — it is the section, arriving early.
 *
 * 2. **The never.** WebGL can be unavailable, the context can be lost, the
 *    glb can 404 after a rename, and `useGLTF` suspends forever behind a
 *    boundary whose fallback is `null`. In every one of those cases the
 *    poster is simply never covered up, and the page still shows the frame.
 *    That is the failsafe, and it needs no error handling to work: nothing
 *    is hidden until something has actually been drawn.
 *
 * ---- Why a crossfade and not a swap ----
 *
 * The still and the first drawn frame are the same object at the same
 * angle under the same light — they are supposed to be the same picture.
 * Fading rather than cutting hides the pixel-level differences (tone
 * mapping at a different dpr, the anti-aliasing) that a hard swap would
 * announce as a flicker.
 *
 * The posters are made by `/poster` in development. See scripts/POSTERS.md.
 */
export function ModelStill({
  src,
  alt,
  /** The section's own mount gate. Until it is true, the still is all
   *  there is — and that is the point of it. */
  built,
  air,
}: {
  src: string;
  alt: string;
  built: boolean;
  /** Passed straight to `ProductModel`, and used here to size the STILL to
   *  match. The two are supposed to be one picture — see the note on the
   *  crossfade — so a stage that enlarges the model has to enlarge the
   *  photograph of it by the same amount, or the fade becomes a jump. */
  air?: number;
}) {
  /* What has been drawn is a FILENAME, not a boolean, and `drawn` is
     derived from it during render.

     A new acetate is a new fetch and a new first frame, so the still has to
     come back for it — otherwise swapping colourway leaves the previous
     colour's canvas over the new colour's still. Storing which src was
     drawn makes that fall out of a comparison. A boolean would need an
     effect to reset it on every `src` change, which is a second render for
     a value this one already knows. */
  const [drawnFor, setDrawnFor] = useState<string | null>(null);
  const drawn = drawnFor === src;

  return (
    <div className="relative h-full w-full">
      <Image
        src={posterFor(src)}
        alt={alt}
        fill
        sizes="100vw"
        /* contain and the same padding as the plate fallback: this is a
           still life of one object, and cropping it to fill a screen cuts
           the temples off the frame being sold. */
        className="object-contain transition-opacity duration-700"
        /* The poster was captured with the frame at the house margin
           inside a square, so the padding here is what re-states that
           margin on a stage of a different shape — and it scales with
           `air` rather than being two fixed Tailwind steps. */
        style={{
          opacity: drawn ? 0 : 1,
          padding: `${(2.5 * MODEL_AIR) / (air ?? MODEL_AIR)}rem`,
        }}
        /* The one image on the section that is worth fetching before the
           reader reaches it: it is what they will see if anything at all
           goes wrong with the scene. */
        priority
      />

      {built ? (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: drawn ? 1 : 0 }}
        >
          <ProductModel src={src} air={air} onReady={() => setDrawnFor(src)} />
        </div>
      ) : null}
    </div>
  );
}
