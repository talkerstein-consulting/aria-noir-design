/**
 * The sizing guide inside the buy page's Fit row (Nov 2026: Raviv on the
 * 5 Nov call, "the how to choose your size guide… make this into a
 * diagram"; Rems, 9 Nov: guide + diagram).
 *
 * The three measurements and their wording come from the house's own Fit &
 * Sizing page (arianoir-showcase.pages.dev/fit/), punctuated to COPY.md.
 * The diagram is the frame itself, drawn to scale from its 3D model.
 */
export type GuideStep = {
  n: string;
  title: string;
  body: string;
  range: string;
};

/** One house's front, for the dimensioned drawing. Measurements in mm
 *  (FRAME_FIT, Jai's numbers from the 3D files). */
export type FrameFront = {
  slug: string;
  name: string;
  eye: number;
  bridge: number;
  lensHeight: number;
  front: number;
  temple: number;
};

export function SizeGuide({ steps, frame }: { steps: readonly GuideStep[]; frame?: FrameFront }) {
  return (
    <div className="stack stack--md">
      {frame && FRONT_ASPECT[frame.slug] ? <FrameDiagram f={frame} /> : null}
      <div>
      <ol className="stack stack--sm">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span className="t-label shrink-0 tabular-nums text-[var(--fg-secondary)]">{s.n}</span>
            <div className="flex flex-col gap-1">
              <p className="t-label text-[var(--fg-primary)]">{s.title}</p>
              <p className="t-body text-[var(--fg-tertiary)]">{s.body}</p>
              <p className="t-caption text-[var(--fg-secondary)]">{s.range}</p>
            </div>
          </li>
        ))}
      </ol>
      </div>
    </div>
  );
}

/** Height ÷ width of each trimmed front in /images/fit/, rendered straight
 *  on with an orthographic camera from the house's hero .glb, so the
 *  picture is to scale and its width is the front width. */
const FRONT_ASPECT: Readonly<Record<string, number>> = {
  "arca-i": 493 / 1524,
  "arca-ii": 452 / 1524,
  ahava: 436 / 1524,
  matriarca: 502 / 1524,
  patriarca: 501 / 1524,
  monarca: 498 / 1524,
};

/** The frame, flat front on, with its measurements drawn to scale: bridge
 *  over the nose, lens height down the left lens, eye width inside the
 *  right lens, overall width underneath. Units in the SVG are millimetres. */
function FrameDiagram({ f }: { f: FrameFront }) {
  const W = f.front;
  const H = W * FRONT_ASPECT[f.slug];
  const top = 14; // room above for the bridge figure
  const bottom = 16; // room below for the overall width
  const side = 14; // room left for the lens height
  const cx = W / 2;
  const cy = top + H / 2;
  const bL = cx - f.bridge / 2;
  const bR = cx + f.bridge / 2;
  const eR = bR + f.eye;
  const lensL = cx - f.bridge / 2 - f.eye / 2; // centre of the left lens
  const hT = cy - f.lensHeight / 2 + 2;
  const hB = cy + f.lensHeight / 2 + 2;
  const yW = top + H + 8;
  const fs = 4.2;
  const tick = 2.2;
  const label = (x: number, y: number, t: string, anchor: "middle" | "end" | "start" = "middle") => (
    <text x={x} y={y} textAnchor={anchor} fontSize={fs} fill="currentColor" stroke="none" className="tabular-nums">
      {t}
    </text>
  );
  const fmt = (n: number) => `${n} mm`;
  return (
    <figure className="stack stack--sm">
      <svg
        viewBox={`${-side} 0 ${W + side * 2} ${top + H + bottom}`}
        role="img"
        aria-label={`${f.name}, front on. Bridge ${fmt(f.bridge)}, lens width ${fmt(f.eye)}, lens height ${fmt(f.lensHeight)}, overall width ${fmt(f.front)}.`}
        className="w-full max-w-[36rem] text-[var(--fg-primary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.35"
        strokeLinecap="round"
      >
        <image href={`/images/fit/${f.slug}.webp`} x="0" y={top} width={W} height={H} preserveAspectRatio="none" />
        {/* bridge */}
        <path d={`M${bL} ${top - 4}H${bR}M${bL} ${top - 4 - tick}v${tick * 2}M${bR} ${top - 4 - tick}v${tick * 2}`} />
        {label(cx, top - 8, fmt(f.bridge))}
        {/* eye width, inside the right lens */}
        <path d={`M${bR} ${cy}H${eR}M${bR} ${cy - tick}v${tick * 2}M${eR} ${cy - tick}v${tick * 2}`} />
        {label((bR + eR) / 2, cy - 2.5, fmt(f.eye))}
        {/* lens height, left of the frame */}
        <path d={`M${-4} ${hT}V${hB}M${-4 - tick} ${hT}h${tick * 2}M${-4 - tick} ${hB}h${tick * 2}`} />
        <path d={`M${-1.5} ${hT}H${lensL}M${-1.5} ${hB}H${lensL}`} strokeDasharray="0.8 1.2" opacity="0.45" />
        <text
          x={-6.5}
          y={(hT + hB) / 2}
          textAnchor="middle"
          fontSize={fs}
          fill="currentColor"
          stroke="none"
          transform={`rotate(-90 ${-6.5} ${(hT + hB) / 2})`}
        >
          {fmt(f.lensHeight)}
        </text>
        {/* overall width */}
        <path d={`M0 ${yW}H${W}M0 ${yW - tick}v${tick * 2}M${W} ${yW - tick}v${tick * 2}`} />
        {label(cx, yW + 6, fmt(f.front))}
      </svg>
      <figcaption className="t-caption text-[var(--fg-secondary)]">
        Overall width: {fmt(f.front)} · Sizing: {f.eye} - {f.bridge} - {f.temple}
      </figcaption>
    </figure>
  );
}

