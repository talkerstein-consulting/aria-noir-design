import { atelier } from "@/lib/content";
import { StickyFeature } from "@/components/page/sticky-feature";

/**
 * The home page's atelier beat.
 *
 * The object itself — sticky plate on the left, argument scrolling past it
 * on the right — is StickyFeature now, because The House needed the same
 * section and a second copy of it would have drifted within a month. This
 * file is just the home page's content bound to it.
 */
export function AtelierSection() {
  return (
    <StickyFeature
      preheader={atelier.preheader}
      heading={atelier.heading}
      stickyImage={atelier.stickyImage}
      pairOne={atelier.pairOne}
      pairTwo={atelier.pairTwo}
      feature={{ ...atelier.feature, href: "#process" }}
      quote={atelier.quote}
      quoteAttribution={atelier.quoteAttribution}
    />
  );
}
