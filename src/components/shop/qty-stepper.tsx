"use client";

/**
 * How many. A minus, a number, a plus.
 *
 * It is an `<input type="number">` under the arrows rather than a label
 * beside them, because someone buying four of something should be able to
 * type four instead of pressing a button four times. The native spinner is
 * hidden (see .qty in interactions.css) — two arrows that match the rest of
 * the page beat two that the browser drew.
 *
 * Clamped at both ends: one, because a bag line of zero is a removal and
 * this control is not where things are removed, and ten, because past that
 * it is a wholesale order and the studio would rather be emailed. An empty
 * field is allowed WHILE typing — clearing it to type "12" would otherwise
 * snap back to 1 between the two keystrokes — and settles on blur.
 */
export const QTY_MIN = 1;
export const QTY_MAX = 10;

export function QtyStepper({
  value,
  onChange,
  label = "Quantity",
}: {
  value: number;
  onChange: (qty: number) => void;
  label?: string;
}) {
  const clamp = (n: number) => Math.min(QTY_MAX, Math.max(QTY_MIN, n));

  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        className="qty-step"
        aria-label="One fewer"
        disabled={value <= QTY_MIN}
        onClick={() => onChange(clamp(value - 1))}
      >
        <span aria-hidden>−</span>
      </button>

      <input
        type="number"
        className="qty-field"
        inputMode="numeric"
        min={QTY_MIN}
        max={QTY_MAX}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10);
          if (Number.isNaN(next)) return;
          onChange(clamp(next));
        }}
        onBlur={(e) => {
          const next = Number.parseInt(e.target.value, 10);
          onChange(Number.isNaN(next) ? QTY_MIN : clamp(next));
        }}
      />

      <button
        type="button"
        className="qty-step"
        aria-label="One more"
        disabled={value >= QTY_MAX}
        onClick={() => onChange(clamp(value + 1))}
      >
        <span aria-hidden>+</span>
      </button>
    </div>
  );
}
