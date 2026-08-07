const CORNERS: [number, number, number, number][] = [
  [40, 60, 24, 24],
  [360, 60, -24, 24],
  [40, 380, 24, -24],
  [360, 380, -24, -24],
];

export default function GalleryFrame({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 400 500"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[50, 120, 200, 280, 350].map((x) => (
          <line
            key={x}
            x1={200}
            y1={0}
            x2={x}
            y2={60}
            stroke="currentColor"
            strokeWidth="0.6"
            opacity={0.55}
          />
        ))}

        <rect
          x={40}
          y={60}
          width={320}
          height={320}
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.7}
        />
        <rect
          x={58}
          y={78}
          width={284}
          height={284}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity={0.35}
        />

        {CORNERS.map(([x, y, dx, dy], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x + dx} y2={y} stroke="currentColor" strokeWidth="1.6" />
            <line x1={x} y1={y} x2={x} y2={y + dy} stroke="currentColor" strokeWidth="1.6" />
          </g>
        ))}

        <line x1={200} y1={380} x2={200} y2={440} stroke="currentColor" strokeWidth="0.6" opacity={0.5} />
      </svg>
    </div>
  );
}
