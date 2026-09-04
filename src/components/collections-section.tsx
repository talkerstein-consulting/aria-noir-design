import { collections } from "@/lib/content";
import { houses } from "@/lib/navigation";
import { StickyPanels, type PanelItem } from "@/components/sticky-panels";

/**
 * The home page's collections, on the shared sticky stage.
 *
 * ALL SIX HOUSES, in the order the bench cut them. It showed three, under
 * a heading that said three, while the catalogue held six — so the home
 * page was quietly presenting a third of the range as the whole of it, and
 * the two most recent houses were reachable only by opening the menu. The
 * stage costs one screen of scroll per panel and the section is the reason
 * anybody is on this page; six is what it is for.
 *
 * The panel content is READ FROM THE CATALOGUE rather than written here.
 * The old hand-written objects had drifted into describing frames the
 * house does not make — PATRIARCA as titanium, AHAVA as solid gold.
 * Everything a panel shows is a fact `houses` already holds, so nothing
 * about the set is decided in this file.
 *
 * Every panel is a link. The two houses with a page of their own go to it;
 * the other four go to the index, where they are a card among six.
 *
 * The stage object itself — the plate that grows out of the heading, the
 * panels sliding over one another, the label timing — is StickyPanels,
 * shared with the eyewear index.
 */
/** Photography from the Arca I / Arca II batch, by path. */
const ARCA_SHOOT = /^\/images\/arca-(i|ii)\//;

export function CollectionsSection() {
  const items: PanelItem[] = houses.map((house) => ({
    name: house.name,
    /* Middot, not an em-dash. The house does not use em-dashes in
       copy, and this line is copy: it is set under the house's name on
       every panel. The same separator the buy pages already use. */
    meta: `${house.index} · ${house.material}`,
    /* The home page is dressed out of the Arca I and Arca II shoot and
       nothing else, so a plate from any other campaign is not eligible
       here. Four of the six houses have no photograph in that shoot, and
       they cannot borrow one: a panel captioned AHAVA showing an ARCA
       frame is the home page naming the wrong product. Those four fall
       back to their own acetate swatch, which is the fallback StickyPanels
       already carries for a house that has not been shot yet.

       Scoped to this file rather than done by emptying `plate` in
       lib/navigation, because the eyewear index and The House both show
       those same photographs and both are right to. */
    image: house.plate && ARCA_SHOOT.test(house.plate) ? house.plate : undefined,
    swatch: house.swatch,
    /* The house's own page where there is one; the index otherwise. NOT
       the buy page — that sits after the story, and a home page panel is
       the furthest point from a checkout on the whole site. */
    href: house.href ?? "/eyewear",
    cta: house.href ? `View ${house.name}` : "See it on the index",
  }));

  return (
    <StickyPanels
      items={items}
      preheader={collections.preheader}
      heading={
        <h2 className="text-center font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl">
          {collections.heading.map((seg) => (
            <span key={seg.text} className={seg.italic ? "italic" : ""}>
              {seg.text}{" "}
            </span>
          ))}
        </h2>
      }
    />
  );
}
