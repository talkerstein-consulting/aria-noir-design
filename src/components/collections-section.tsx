import { collections } from "@/lib/content";
import { StickyPanels, type PanelItem } from "@/components/sticky-panels";

/**
 * The home page's three collections, on the shared sticky stage.
 *
 * Everything that used to live here — the plate that grows out of the
 * heading, the panels sliding in over one another, the label timing — is
 * now StickyPanels, because the eyewear index needed the same object for
 * nine frames rather than a second copy of it that would drift.
 *
 * The stage's beats are declared in scroll distance rather than fractions,
 * and at three panels they resolve to exactly the section height and zone
 * boundaries this file used to hardcode. This page is the reference
 * implementation; it has not moved.
 */
export function CollectionsSection() {
  const items: PanelItem[] = collections.items.map((item) => ({
    name: item.name,
    meta: item.meta,
    image: item.image,
    href: item.href,
    cta: item.cta,
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
