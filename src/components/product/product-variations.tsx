import type { Variations } from "@/lib/product";
import { StickyPanels, type PanelItem } from "@/components/sticky-panels";

/**
 * "The Variations" — the colourways, on the shared sticky stage.
 *
 * The same object the home page's collections run on: the first plate grows
 * out of the heading until it fills the screen, and every colour after it
 * slides in over the one before. It was a grid of cards with a lightbox
 * behind them, which asked the reader to open four separate viewers to see
 * four photographs of the same frame. On the stage each acetate simply
 * arrives at full bleed, named, with somewhere to go.
 *
 * That "somewhere" is the point of the rebuild. Every panel carries a CTA
 * to the buy page WITH THE COLOURWAY ALREADY CHOSEN — see `buyColour` in
 * lib/arca-i — so the colour a reader was just shown at full screen is the
 * colour waiting for them when they arrive.
 *
 * A colourway with no photograph falls through to StickyPanels' own
 * treatment: its acetate as a ground, rather than a borrowed plate. That
 * is what keeps this usable for ARCA II's eight, seven of which have never
 * been shot.
 *
 * The stage costs roughly one screen of scroll per panel. Four is what
 * this house holds; a house with eight would want a grid instead, and the
 * day one ships that is a different component rather than a flag on this
 * one.
 */
export function ProductVariations({ variations }: { variations: Variations }) {
  const items: PanelItem[] = variations.colorways.map((c) => ({
    name: c.name,
    meta: variations.preheader,
    image: c.image,
    swatch: c.swatch,
    href: c.href,
    cta: c.cta,
  }));

  return (
    <StickyPanels
      items={items}
      /* The name goes UNDER the frame here, on a gradient of its own. These
         plates are the product, centred and filling the screen: the
         collections treatment — name across the middle, an even tint over
         the whole plate — would put type across the lenses of the thing
         being sold and a veil over the acetate whose colour is the point. */
      labels="foot"
      /* Held inside the page's gutter rather than run to the edges. The
         home page's stage IS the home page and earns the full screen; this
         one is a section of a product story, and the black around it is
         what says so. */
      inset
      preheader={variations.preheader}
      /* Same masthead as the collections stage — centred, display face, at
         the size a full screen with nothing else on it can carry. */
      heading={
        <h2 className="max-w-4xl text-center font-display text-5xl leading-[1.02] tracking-tight text-balance text-paper sm:text-7xl">
          {typeof variations.heading === "string"
            ? variations.heading
            : variations.heading.map((seg) => (
                <span key={seg.text} className={seg.italic ? "italic" : ""}>
                  {seg.text}{" "}
                </span>
              ))}
        </h2>
      }
    />
  );
}
