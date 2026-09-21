import "./tcg-badge.css";

const HREF = "https://talkerstein.ca";

/**
 * The credit line, and nothing else.
 *
 * ---- What was here ----
 *
 * A particle morph: on hover, particles flew in from the four edges of the
 * VIEWPORT, gathered into a solid block behind this line, and the glyphs
 * inverted to read out of it. It shipped a WebGL canvas fixed over the
 * whole page, a per-frame idle drift, and two data-URL targets redrawn on
 * every scroll and resize so the block would still land where the plaque
 * had moved to.
 *
 * All of that for the last line of the footer — the agency credit, the
 * least important text on the site, and the only element anywhere in the
 * house that answered a pointer with a full-screen effect. It is gone.
 *
 * ---- What is left ----
 *
 * The glyph, as a mask painted in `currentColor`, inside a link. No state,
 * no effect, no canvas — so this is a server component again and the
 * footer ships nothing for it.
 *
 * The CSS keeps the `:hover` rule that flips the lettering to the ground
 * colour, which is an ordinary link hover and costs nothing; every rule
 * that referenced the canvas is dead and has gone with it.
 */
export function TcgBadge({ tone = "ink" }: { tone?: "paper" | "ink" } = {}) {
  return (
    <div className={`tcg-footer tcg-footer--${tone}`}>
      <a
        className="tcg-plaque"
        href={HREF}
        aria-label="Handcrafted by Talkerstein Consulting Group"
      >
        <span className="tcg-text" aria-hidden="true" />
      </a>
    </div>
  );
}
