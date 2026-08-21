import type { CSSProperties } from "react";

type CtaLinkProps = {
  href: string;
  children: string;
  variant?: "light" | "dark";
  className?: string;
};

/** Per-letter shuffle stagger, in ms. */
const STEP_MS = 22;

/**
 * Underline-only CTA — no fill, no border, no pill.
 *
 * One continuous rule runs under the whole label; on hover a gold rule
 * sweeps across it left to right while the glyphs lift and swap, each
 * letter a beat behind the last (`--d`, set per index below), so the word
 * reads as a wave rather than a single jump-cut.
 *
 * `variant="dark"` is for the closing section (light --paper background,
 * --ink text); everywhere else sits on --ink.
 */
export function CtaLink({
  href,
  children,
  variant = "light",
  className = "",
}: CtaLinkProps) {
  const letters = Array.from(children);

  return (
    <a
      href={href}
      className={`cta-link ${variant === "dark" ? "cta-link--dark" : ""} ${className}`.trim()}
    >
      <span className="cta-link-chars">
        {letters.map((ch, i) => {
          const isSpace = ch === " ";
          return (
            <span
              key={i}
              className="cta-link-char"
              style={{ "--d": `${i * STEP_MS}ms` } as CSSProperties}
            >
              <span className="cta-link-char-clip">
                <span className="cta-link-char-line">
                  {isSpace ? " " : ch}
                </span>
                <span className="cta-link-char-line" aria-hidden="true">
                  {isSpace ? " " : ch}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </a>
  );
}
