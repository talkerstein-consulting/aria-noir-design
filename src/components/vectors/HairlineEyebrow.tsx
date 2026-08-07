export default function HairlineEyebrow({
  index,
  label,
  tone = "gold",
  align = "left",
}: {
  index: string;
  label: string;
  tone?: "gold" | "noir";
  align?: "left" | "center";
}) {
  const color = tone === "gold" ? "text-gold/70" : "text-noir/60";
  const line = tone === "gold" ? "bg-gold/40" : "bg-noir/30";

  return (
    <div
      className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] ${color} ${
        align === "center" ? "justify-center" : ""
      }`}
    >
      <span className={`h-px w-8 ${line}`} />
      <span>
        {index} · {label}
      </span>
    </div>
  );
}
