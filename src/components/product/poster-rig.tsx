"use client";

import { useCallback, useState } from "react";
import { ProductModel, posterFor } from "@/components/product/product-model";

/**
 * Renders one glb at a time, captures it, posts it, moves on.
 *
 * One at a time, not sixteen at once: each scene convolves its own
 * environment map when it is built, and sixteen of those in parallel is a
 * few seconds of a locked tab and, on a laptop, an actual risk of losing
 * the WebGL context mid-run.
 *
 * The stage is SQUARE, and fixed. The viewer fits the object to 86% of the
 * smaller viewport dimension, so a square stage is the one shape whose
 * framing does not depend on the window: a poster made in a 1440x780
 * window would otherwise be cropped differently from one made at
 * 1280x1100, and nobody would notice until two of them sat side by side.
 * 760 CSS pixels at the viewer own dpr cap of 1.5 is a 1140px buffer,
 * which is more than any stage on the site draws the object at.
 *
 * The ground is left transparent. The story page puts these on ink, the buy
 * page puts them on a corridor photograph, and a baked-in black would show
 * as a square on the second one.
 */

/* Every glb the turntable can be pointed at. Listed rather than globbed:
   the client cannot read a directory, and a list that has to be edited when
   a model is added is a list somebody reads. */
const MODELS: readonly string[] = [
  "/models/houses/arca-i-z-white.glb",
  "/models/houses/arca-i-k-black.glb",
  "/models/houses/arca-i-proceso-brown.glb",
  "/models/houses/arca-i-309-blue.glb",
  "/models/houses/arca-ii-noir.glb",
  "/models/houses/arca-ii-dark-tortoise.glb",
  "/models/houses/arca-ii-caramel-stripe.glb",
  "/models/houses/arca-ii-root-beer-float.glb",
  "/models/houses/arca-ii-tutti-frutti.glb",
  "/models/houses/arca-ii-dreamy-rose.glb",
  "/models/houses/arca-ii-velvet-rose.glb",
  "/models/houses/arca-ii-pixie-dust.glb",
  "/models/houses/ahava-noir.glb",
  "/models/houses/matriarca-midnight-noir.glb",
  "/models/houses/monarca-noir.glb",
  "/models/houses/patriarca-midnight-noir.glb",
];

const STAGE = 760;

export function PosterRig() {
  const [at, setAt] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const src = MODELS[at];
  const name = src ? posterFor(src).split("/").pop()!.replace(".webp", "") : "";

  const onCapture = useCallback(
    async (dataUrl: string) => {
      const which = name;
      try {
        const res = await fetch("/api/poster", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: which, dataUrl }),
        });
        const body = await res.json();
        setLog((l) => [
          ...l,
          res.ok
            ? `${which}.webp — ${Math.round(body.bytes / 1024)} KB`
            : `${which} — FAILED: ${body.error}`,
        ]);
      } catch (e) {
        setLog((l) => [...l, `${which} — FAILED: ${String(e)}`]);
      }
      /* Advance only after the write has answered, so a failure is visible
         against the model it belongs to rather than three models later. */
      setAt((n) => n + 1);
    },
    [name],
  );

  return (
    <main id="main" tabIndex={-1} className="min-h-svh bg-ink p-10 text-paper">
      <p className="t-eyebrow">Poster kitchen · development only</p>
      <h1 className="t-display-md mt-3">
        {src ? `${at + 1} of ${MODELS.length}` : "Done."}
      </h1>
      <p className="t-body mt-2 text-[var(--fg-tertiary)]">
        {src
          ? name
          : `${log.filter((l) => !l.includes("FAILED")).length} posters written to /public/images/posters.`}
      </p>

      {/* The stage. Square, fixed, and deliberately on screen: a canvas in
          a display:none subtree is not composited, and toDataURL on it
          comes back blank. */}
      {src ? (
        <div
          className="mt-8 border border-[var(--fg-rule)]"
          style={{ width: STAGE, height: STAGE }}
        >
          {/* Keyed on src, so each model gets a genuinely fresh scene and
              a fresh capture rather than a re-render of the last one. */}
          <ProductModel key={src} src={src} onCapture={onCapture} />
        </div>
      ) : null}

      <ul className="mt-10 font-mono text-xs text-[var(--fg-quiet)]">
        {log.map((line) => (
          <li key={line} className={line.includes("FAILED") ? "text-[var(--fg-accent)]" : ""}>
            {line}
          </li>
        ))}
      </ul>
    </main>
  );
}
