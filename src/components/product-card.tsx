import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { RevealPlate } from "@/components/reveal";
import { SWATCH_FALLBACK } from "@/lib/shop";

/**
 * ============================================================
 *  ONE CARD. Every grid of products on this site renders it.
 * ============================================================
 *
 * A house on the index, a house on the eyewear grid, the garment, a
 * cross-sell under a buy page, a single acetate on the colourway wall —
 * they were five components that each drew a square picture, a name, a
 * meta line and a price, and they had drifted: three different hover
 * behaviours, two different heading sizes, a hairline footer on one grid
 * and not on the one beside it. A catalogue whose cards disagree reads as
 * several shops.
 *
 * So the card is an OBJECT now, and the grids decide only what goes in it.
 * The square proportion still comes from `.card-shot` in interactions.css
 * — that number was already shared and stays shared.
 *
 * ---- What is uniform, and what the caller may vary ----
 *
 * Uniform, always: the square, the object-cover crop, the lift on hover,
 * the name's typeface and size, the hairline that separates the facts from
 * the picture, and the order the facts are read in — name, then what it is,
 * then how deep it goes, then what it costs.
 *
 * The caller varies the CONTENT and nothing else: a card with no price
 * simply has no price, and the hairline row disappears with it rather than
 * printing an empty rule. That is the only branch in here worth the name.
 *
 * ---- The hover swap is CSS, so this stays a server component ----
 *
 * Two images stacked in the same box, the second at opacity 0 until
 * `group-hover`. No state, no client bundle, and the swap survives a
 * pointer arriving before hydration. A card with one photograph has no
 * second layer and drifts on the scale transform instead, which reads as
 * the same gesture at lower volume rather than as a card that is broken.
 *
 * ---- A card without a link is still a card ----
 *
 * The garment on `/house/about` has no page to go to yet. It renders as a
 * plain container rather than as a dead link, because a link that does not
 * move is worse than no link — and it keeps the same shape as the six
 * beside it, which is the whole point of this file.
 */
export type ProductCardProps = {
  /** Where the card goes. Omitted for a product with no page yet. */
  href?: string;
  /** Leaves the site — the storefront. Rendered as a plain anchor. */
  external?: boolean;
  /** The card's photograph. Null falls back to the acetate. */
  image: string | null | undefined;
  /** The second photograph, shown on hover where one exists. */
  hoverImage?: string;
  /** The acetate, for a product with no photograph of itself. */
  swatch?: string;
  /** What is shown over the acetate when there is no photograph at all. */
  swatchNote?: string;
  name: string;
  /** The name's level in the page's outline. The SIZE never changes. */
  as?: "h2" | "h3";
  /** What it is: "06 · Block acetate". */
  meta?: string;
  /** How deep it goes: "One cut · seven colourways". */
  detail?: string;
  /** What it costs, already formatted — this file does no arithmetic. */
  price?: string;
  /** A sentence under the facts, where the grid is an argument rather than
   *  a list. The eyewear grid uses it; a cross-sell rail does not. */
  note?: string;
  /** Struck through and dimmed: the house makes it, not right now. */
  soldOut?: boolean;
  /**
   * Where the FRAME sits in the photograph, as an `object-position`.
   *
   * The card is square and the colourway shoot is 16:9, so cropping to it
   * throws away nearly half the width. Left on `center` that crop is
   * decided by the middle of the PICTURE — the table, the candle, the
   * doorway behind — and the temples go off both sides. This points the
   * crop at the object being sold instead.
   *
   * Default is the centre, which is right for a plate already composed
   * square. See COLOURWAY_FOCAL in shop/colourway-cards for the one
   * measurement the campaign run needs.
   */
  focal?: string;
  /** The `sizes` hint, which only the grid knows. */
  sizes?: string;
  /** Fade the picture up on scroll, staggered by index. Off by default:
   *  a cross-sell five rows down does not need choreography. */
  reveal?: boolean;
  revealDelay?: number;
  priority?: boolean;
};

const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export function ProductCard({
  href,
  external = false,
  image,
  hoverImage,
  swatch,
  swatchNote,
  name,
  as: Heading = "h3",
  meta,
  detail,
  price,
  note,
  soldOut = false,
  focal,
  sizes = DEFAULT_SIZES,
  reveal = false,
  revealDelay = 0,
  priority = false,
}: ProductCardProps) {
  const shot = (
    <>
      {image ? (
        <>
          <Image
            src={image}
            alt={meta ? `${name} — ${meta}` : name}
            fill
            sizes={sizes}
            priority={priority}
            style={focal ? { objectPosition: focal } : undefined}
            className={`object-cover transition-[transform,opacity] duration-700 group-hover:scale-[1.03] ${
              hoverImage ? "group-hover:opacity-0" : ""
            }`}
          />
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              style={focal ? { objectPosition: focal } : undefined}
              className="object-cover opacity-0 transition-[transform,opacity] duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : null}
        </>
      ) : (
        /* Not a grey box and not a borrowed photograph of a different
           colour: the acetate itself, which is the last honest thing the
           card can say about a product nobody has shot yet. */
        <div
          className="flex h-full w-full items-end p-6"
          style={{
            background: `linear-gradient(160deg, ${swatch ?? SWATCH_FALLBACK} 0%, var(--ink) 82%)`,
          }}
        >
          {swatchNote ? <span className="t-micro">{swatchNote}</span> : null}
        </div>
      )}
    </>
  );

  const body: ReactNode = (
    <>
      {reveal ? (
        <RevealPlate delay={revealDelay} className="card-shot bg-ink">
          {shot}
        </RevealPlate>
      ) : (
        <div className="card-shot bg-ink">{shot}</div>
      )}

      <div className="stack stack--sm">
        <Heading className="t-display-xs">{name}</Heading>
        {meta ? <p className="t-label">{meta}</p> : null}
        {note ? <p className="t-body t-body--tight mt-2">{note}</p> : null}
      </div>

      {/* The hairline only exists where there is something to separate.
          An empty rule under a card is a fact the card does not have. */}
      {detail || price ? (
        <div className="hairline mt-auto flex items-baseline justify-between gap-4 pt-3">
          <p className="t-caption">{detail}</p>
          {price ? (
            <p
              className={`t-caption tabular-nums ${
                soldOut ? "text-[var(--fg-quiet)] line-through" : ""
              }`}
            >
              {price}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  /* `w-full` is not decoration: the grids hand this a flex cell, and a
     flex child sizes to its CONTENT unless told otherwise — which is how
     three cards in a row ended up three different widths, each as wide as
     its own longest colourway name. The card fills the cell it is given,
     always; the grid decides how wide that is. */
  const shell = "card-link group flex h-full w-full min-w-0 flex-col gap-4";

  if (!href) return <div className={`${shell} pointer-events-none`}>{body}</div>;

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={shell}
      data-out={soldOut || undefined}
    >
      {body}
    </a>
  ) : (
    <Link href={href} className={shell}>
      {body}
    </Link>
  );
}
