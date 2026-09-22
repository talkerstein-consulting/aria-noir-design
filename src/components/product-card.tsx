import Image from "next/image";
import Link from "next/link";
import { HoldToggle } from "@/components/shop/hold-toggle";
import type { ReactNode } from "react";
import { CardShots } from "@/components/card-shots";
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
  /**
   * The whole set, where the card is meant to be paged through.
   *
   * Given two or more, the card draws chevrons and steps between them
   * instead of doing the hover swap — the swap is one picture's worth of
   * the same idea, and a card that both swaps and pages would be two
   * answers to the same gesture. It also costs the card its server
   * rendering (see `CardShots`), so a grid asks for it only where the
   * reader is choosing between products rather than reading a page.
   */
  images?: readonly string[];
  /** The acetate, for a product with no photograph of itself. */
  swatch?: string;
  /** What is shown over the acetate when there is no photograph at all. */
  swatchNote?: string;
  name: string;
  /** The name's level in the page's outline. The SIZE never changes. */
  as?: "h2" | "h3";
  /**
   * The bookmark, beside the name.
   *
   * Both are needed or neither is drawn: the held list is keyed by house
   * AND colourway, so a card that knows only the house has nothing to put
   * on the list. A house-level card passes its default colourway — see
   * `houseCard` in lib/product-cards.
   */
  holdSlug?: string;
  holdColorway?: string | null;
  /**
   * A control the card carries in its foot — "Add to bag" on the held
   * list, and nothing at all in a plain grid.
   *
   * A slot rather than a boolean, because the card has no business knowing
   * what the action DOES. It is rendered outside the stretched link, so a
   * button here is a real button and not a press that also navigates.
   */
  action?: ReactNode;
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
  images,
  swatch,
  swatchNote,
  name,
  as: Heading = "h3",
  holdSlug,
  holdColorway,
  action,
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
      {images && images.length > 1 ? (
        <CardShots
          images={images}
          alt={meta ? `${name} — ${meta}` : name}
          sizes={sizes}
          focal={focal}
          priority={priority}
        />
      ) : image ? (
        <>
          <Image
            src={image}
            /* Empty when the picture has nothing to add over the name
               printed directly beneath it. The card already renders the
               name as text, so `alt={name}` made a screen reader say it
               twice — once for the photograph, once for the title — which
               is the card announcing itself as two products.

               Where there IS a `meta` (a colourway, a cut) the alt earns
               its place: it says WHICH of the house's photographs this is,
               and that is not written anywhere else on the card. */
            alt={meta ? `${name} — ${meta}` : ""}
            fill
            sizes={sizes}
            priority={priority}
            style={focal ? { objectPosition: focal } : undefined}
            /* A card with a second photograph lifts a little under the
               pointer and swaps. A card with ONE photograph has only the
               lift to say the same thing with, so it goes further — the
               colourway wall is the whole of this case, and there the zoom
               is the gesture rather than an accent on it. */
            className={`card-img ${hoverImage ? "card-img--swaps" : "card-img--zooms"}`}
          />
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              style={focal ? { objectPosition: focal } : undefined}
              className="card-img card-img--under"
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
        {/* ---- The name carries the link; the bookmark sits outside it ----
        
            The whole card used to BE the anchor, which made a button
            inside it impossible: interactive content cannot nest in a
            link, and a press would have toggled the hold and navigated in
            the same gesture.
        
            So the anchor moved to the name and grew a stretched overlay
            (`.card-name-link::after`) that covers the card. The card is
            still clickable everywhere it was. Two things improve on the
            way: the link's accessible name is now the PRODUCT, where it
            used to be the name plus the meta plus the note plus the price
            read out as one string; and the bookmark can be a real button,
            lifted above the overlay by `.card-hold`. */}
        <div className="card-name-row">
          <Heading className="t-display-xs min-w-0">
            {href ? (
              <Link
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="card-name-link"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </Heading>
          {holdSlug && holdColorway ? (
            <HoldToggle
              slug={holdSlug}
              colorway={holdColorway}
              /* Name AND meta: on the shop list every card in a run is
                 titled with the same house, so a bookmark labelled by the
                 name alone would read "Save: AHAVA" eight times
                 over. The acetate is what tells them apart. */
              label={meta ? `${name}, ${meta}` : name}
              compact
              className="card-hold"
            />
          ) : null}
        </div>
        {/* ---- Second line: which one, and what it costs ----
        
            The acetate on the left, the price across from it on the right.
            They belong together — the price is the price OF THIS COLOURWAY,
            and a card in a run differs from the card beside it in exactly
            these two values while the name above stays the same.
        
            It also puts the number under the bookmark rather than beside
            it, so the card's right edge reads mark-then-price down a single
            column. */}
        {meta || price ? (
          <div className="card-meta-row">
            {meta ? <p className="t-label">{meta}</p> : <span />}
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
        {note ? <p className="t-body t-body--tight mt-2">{note}</p> : null}
      </div>

      {/* The hairline only exists where there is something to separate.
          An empty rule under a card is a fact the card does not have. */}
      {/* The price used to live down here beside the detail. It reads
          across from the NAME now, so what is left is the detail line and
          whatever the caller hangs off the card. */}
      {detail || action ? (
        <div className="hairline mt-auto flex items-baseline justify-between gap-4 pt-3">
          <p className="t-caption">{detail}</p>
          {action ? <div className="card-action">{action}</div> : null}
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

  /* A div, not an anchor. The link is on the name now and covers the card
     from there; wrapping this in a second one would nest them. */
  return (
    <div className={shell} data-out={soldOut || undefined}>
      {body}
    </div>
  );
}
