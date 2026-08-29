import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/cta-link";
import { houses, shopPath, type House } from "@/lib/navigation";
import { SHOP_ALL_URL, swatchFor } from "@/lib/shop";

/**
 * The rest of the catalogue, one card each, second photograph on hover.
 *
 * ---- The hover swap is CSS, so this stays a server component ----
 *
 * Two images stacked in the same box, the second at opacity 0 until
 * `group-hover`. No state, no client bundle, and the swap survives a
 * pointer arriving before hydration — which on a page this far down is
 * most of them. A house with only one photograph simply has no second
 * layer and drifts on the scale transform instead, which reads as the same
 * gesture at lower volume rather than as a card that is broken.
 *
 * ---- These link to another BUY page, not to the story ----
 *
 * They used to go to the house's story, and to `/eyewear` for the four
 * houses that have none — so a reader comparing frames on a shop page was
 * put back on the index by four of the five cards, having asked to see a
 * frame and been shown the shelf.
 *
 * The argument-before-price rule still stands; this is just not where it
 * applies. It governs the way IN to the shop — the index sends a reader to
 * the story where one exists — and by the time these cards are on screen
 * the reader is already inside, has already been argued to, and is
 * shopping. Sideways from a buy page is another buy page. The story is
 * still one link away from each of them.
 */
export function AlsoLike({ current }: { current: House }) {
  const others = houses.filter((h) => h.slug !== current.slug);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="hairline flex flex-wrap items-end justify-between gap-6 pt-10">
        <h2 className="t-display-md">You may also like</h2>
        <CtaLink href={SHOP_ALL_URL} external tone="quiet">
          Shop all
        </CtaLink>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {others.map((other) => {
          /* The house's own card picture, not galleryFor: that now returns
             the CHOSEN COLOURWAY's frames and nothing else, which is right
             for the column being scrolled and empty for a card that has no
             colourway selected. The second picture is the house's editorial
             set, which is a fair thing to show on a card — it is not
             claiming to be any particular acetate. */
          const front = other.plate;
          const hover = other.gallery?.[0];
          return (
            <li key={other.slug}>
              <Link
                href={shopPath(other)}
                className="card-link group flex flex-col gap-3"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  {front ? (
                    <>
                      <Image
                        src={front}
                        alt={other.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, 45vw"
                        className="object-cover transition-[transform,opacity] duration-700 group-hover:scale-[1.03] group-hover:opacity-0"
                      />
                      {hover ? (
                        <Image
                          src={hover}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 20vw, 45vw"
                          className="object-cover opacity-0 transition-[transform,opacity] duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                        />
                      ) : null}
                    </>
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(160deg, ${other.swatch ?? swatchFor(other.colorwayNames[0])} 0%, var(--ink) 82%)`,
                      }}
                    />
                  )}
                </div>
                {/* The name, and nothing under it. A price and a colourway
                    count on a cross-sell card is a second offer competing
                    with the one being made above; the card's whole job is
                    to be a picture worth following. */}
                <h3 className="card-name">{other.name}</h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
