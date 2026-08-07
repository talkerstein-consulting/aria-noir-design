const MARK = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 1V17M1 9H17" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default function CornerMarks({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "noir";
}) {
  const color = tone === "gold" ? "text-gold/50" : "text-noir/40";

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      <div className={`absolute left-4 top-4 md:left-6 md:top-6 ${color}`}>
        {MARK}
      </div>
      <div className={`absolute right-4 top-4 md:right-6 md:top-6 ${color}`}>
        {MARK}
      </div>
      <div className={`absolute bottom-4 left-4 md:bottom-6 md:left-6 ${color}`}>
        {MARK}
      </div>
      <div className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 ${color}`}>
        {MARK}
      </div>
    </div>
  );
}
