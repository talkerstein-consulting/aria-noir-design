type Variant = "fan" | "crystalline";

function FanField() {
  const apex = { x: 200, y: 70 };
  const rayTargets = [10, 55, 95, 130, 160, 185, 215, 240, 270, 305, 345, 390];

  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {rayTargets.map((x) => (
        <line
          key={x}
          x1={apex.x}
          y1={apex.y}
          x2={x}
          y2={0}
          stroke="currentColor"
          strokeWidth="0.75"
        />
      ))}

      <rect
        x={140}
        y={70}
        width={120}
        height={130}
        stroke="currentColor"
        strokeWidth="1"
      />

      {Array.from({ length: 8 }).map((_, i) => {
        const offset = i * 20 - 20;
        return (
          <line
            key={`ls-${i}`}
            x1={offset}
            y1={0}
            x2={offset + 140}
            y2={260}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        );
      })}

      {Array.from({ length: 8 }).map((_, i) => {
        const offset = i * 20 - 20;
        return (
          <line
            key={`rs-${i}`}
            x1={400 - offset}
            y1={0}
            x2={400 - offset - 140}
            y2={260}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        );
      })}
    </svg>
  );
}

const CRYSTAL_LINES: [number, number, number, number][] = [
  [0, 60, 220, 0],
  [0, 60, 180, 260],
  [180, 260, 0, 420],
  [0, 420, 140, 600],
  [220, 0, 460, 40],
  [220, 0, 380, 220],
  [180, 260, 380, 220],
  [380, 220, 460, 40],
  [460, 40, 700, 0],
  [380, 220, 620, 300],
  [620, 300, 460, 40],
  [700, 0, 800, 140],
  [620, 300, 800, 140],
  [620, 300, 560, 520],
  [560, 520, 380, 220],
  [140, 600, 380, 600],
  [380, 600, 560, 520],
  [800, 140, 800, 400],
  [560, 520, 800, 400],
  [800, 400, 700, 600],
  [560, 520, 700, 600],
];

function CrystallineField() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {CRYSTAL_LINES.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function GeometricField({
  variant,
  className = "",
  style,
}: {
  variant: Variant;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={style} aria-hidden>
      {variant === "fan" ? <FanField /> : <CrystallineField />}
    </div>
  );
}
