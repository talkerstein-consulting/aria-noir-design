/**
 * The brutalist ground behind the turntable: concentric openings, stepping
 * back on the centre line.
 *
 * This is the corridor the whole ARCA I campaign is shot in, reduced to its
 * plan — one opening inside the next, each inset and lifted a little less
 * than the last, which is what makes the set read as depth rather than as
 * boxes drawn around a middle. The object stands in the mouth of it.
 *
 * It is drawn rather than photographed because it sits behind a black
 * object on a black page and has to carry almost no light: a real plate at
 * three per cent is mud, while a hairline still holds its shape.
 *
 * A facade of scattered rectangles was tried in its place and lost. Off-
 * centre shapes give the eye somewhere else to be — the composition starts
 * competing with the frame instead of receding behind it. Concentric
 * openings have their vanishing point exactly where the object is, so
 * everything in the picture points at the thing being sold.
 *
 * ---- The fade ----
 *
 * It clears BOTH ends, and each end for its own reason.
 *
 * The bottom, so the type has black under it: an offer set over a field of
 * lines is an offer nobody reads.
 *
 * The top, because the section's first inch has to be the same colour as
 * the page above it. The mask used to open at full strength, which put the
 * lintel and the outermost opening hard against the section's top edge — so
 * the seam where this section meets the last one had a band of faintly
 * lighter architecture lying in it, and the join read as a change of colour
 * rather than as nothing at all. It now starts at zero and is not fully up
 * until 16% down, which is clear of both that seam and the fixed header
 * floating over it.
 */

/** How many openings, where the outermost sits, and how far the first step
 *  travels. */
const OPENINGS = 6;
const BASE_INSET = 150;
const BASE_TOP = 54;
const INSET_STEP = 150;
const TOP_STEP = 96;

/**
 * How much of the previous step each next one is worth.
 *
 * This is the whole of the perspective. Equal steps are what an elevation
 * drawing does — a set of rectangles, evenly spaced, reading as a target
 * rather than a corridor. In a photograph of a real colonnade each opening
 * is further away than the last, so it subtends less: the gaps close up
 * toward the vanishing point, and they close geometrically, each one a
 * fixed fraction of the one before.
 *
 * 0.68 is a corridor you are standing at the mouth of. Nearer 1 flattens
 * back to a target; much lower and the far openings pile into a smudge at
 * the centre.
 */
const FALLOFF = 0.68;

/** The openings, precomputed: each one inset and lowered by a step that is
 *  FALLOFF times the last. */
const OPENING_RECTS = Array.from({ length: OPENINGS }, (_, i) => {
  let inset = BASE_INSET;
  let top = BASE_TOP;
  for (let n = 0; n < i; n += 1) {
    inset += INSET_STEP * Math.pow(FALLOFF, n);
    top += TOP_STEP * Math.pow(FALLOFF, n);
  }
  return { inset, top, i };
});

export function ConcreteField({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 text-paper ${className}`}
      style={{
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 16%, rgba(0,0,0,0.6) 42%, rgba(0,0,0,0) 76%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 16%, rgba(0,0,0,0.6) 42%, rgba(0,0,0,0) 76%)",
      }}
    >
      <svg
        viewBox="0 0 1600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        /* Fills the window the way a photograph would, rather than
           stretching the geometry to fit it. */
        preserveAspectRatio="xMidYMid slice"
      >
        {/* The poured mass either side. Kept well outboard, so the object is
            never standing in front of a lighter panel. */}
        <rect x={0} y={0} width={96} height={900} fill="currentColor" fillOpacity={0.038} />
        <rect x={1504} y={0} width={96} height={900} fill="currentColor" fillOpacity={0.038} />
        <rect x={110} y={0} width={34} height={620} fill="currentColor" fillOpacity={0.022} />
        <rect x={1456} y={0} width={34} height={620} fill="currentColor" fillOpacity={0.022} />

        {/* The openings. Each one fainter than the one outside it, so the
            set reads as light falling away down a corridor rather than as
            six equal frames — the same job the closing gaps are doing, said
            in tone instead of in geometry. */}
        {OPENING_RECTS.map(({ inset, top, i }) => (
          <rect
            key={i}
            x={inset}
            y={top}
            width={1600 - inset * 2}
            height={900 - top - i * 22}
            stroke="currentColor"
            strokeOpacity={0.17 * Math.pow(0.82, i)}
            strokeWidth={1}
          />
        ))}

        {/* The lintel over the mouth: one horizontal that stops the openings
            reading as a tunnel in perspective and makes them read as a
            building seen head on. */}
        <rect
          x={BASE_INSET}
          y={BASE_TOP}
          width={1600 - BASE_INSET * 2}
          height={58}
          stroke="currentColor"
          strokeOpacity={0.13}
          strokeWidth={1}
        />

        {/* The ledge the frame is lit as though resting on — the same eye
            line as the colourway plates, where every frame sits on a poured
            shelf. */}
        <rect x={264} y={640} width={1072} height={12} fill="currentColor" fillOpacity={0.05} />
      </svg>
    </div>
  );
}
