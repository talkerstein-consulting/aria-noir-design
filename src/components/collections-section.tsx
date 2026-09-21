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
export function CollectionsSection() {
  const items: PanelItem[] = houses.map((house) => ({
    name: house.name,
    /* The house's own cover plate, whichever shoot it came from. Every
       one of the six has a photograph of its own now — the four that used
       to fall back to a flat acetate swatch were shot for their own
       campaigns, so the swatch fallback below is dead weight kept only
       for a house added before its photography lands. Borrowing was the
       thing worth forbidding, and nothing borrows: each panel shows the
       plate belonging to the house it names. */
    image: house.plate ?? undefined,
    imageNarrow: house.plateNarrow,
    narrowZoom: house.plateNarrowZoom,
    swatch: house.swatch,
    /* The house's own page where there is one; the index otherwise. NOT
       the buy page — that sits after the story, and a home page panel is
       the furthest point from a checkout on the whole site. */
    href: house.href ?? "/eyewear",
    cta: house.href ? `View ${house.name}` : "See it on the index",
  }));

  return (
    <StickyPanels
      labels="split"
      items={items}
      /* The first section the reader reaches after the opening, so its
         leading plates are the ones the loader has to have covered. Two:
         the one on screen when the section arrives, and the one a single
         slide behind it. See `eager` on StickyPanelsProps. */
      eager={2}
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
