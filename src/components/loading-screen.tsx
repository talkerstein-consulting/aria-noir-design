/**
 * The wait, for a whole route.
 *
 * One asset, on ink, centred: `/logo/aria-loader.svg`, which is the mark
 * drawing itself in over two seconds. The animation lives INSIDE the file as
 * CSS keyframes, so an <img> is enough to play it and there is nothing to
 * orchestrate from out here — which is the point, because this component is
 * what Next renders while the real one is still arriving and it cannot
 * afford to be the thing that needs JavaScript.
 *
 * Why an <img> here and an inlined fetch in FooterMark: the footer mark has
 * to take its colour from whichever ground it lands on and has to be
 * inspectable when the draw-in fails to start. This one is always white on
 * always-black and nobody is watching it long enough to debug it.
 *
 * `stage-loader` (interactions.css) is the same idea scoped to one canvas —
 * a word, a hairline, a number. This is its full-screen sibling: no word and
 * no bar, because a route change has no progress anyone can honestly report.
 */
export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="site-loading" role="status" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element --
          next/image would optimise the SVG into a raster and lose the
          keyframes with it. This is the one asset on the site that has to
          arrive as the file it was authored as. */}
      <img
        src="/logo/aria-loader.svg"
        alt=""
        aria-hidden
        className="site-loading-mark"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
