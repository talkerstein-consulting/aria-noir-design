import { CtaLink } from "@/components/cta-link";

/**
 * The way to the counter, at the foot of a section's copy.
 *
 * ---- Why after the body text ----
 *
 * A story page is long — a hero, the structure, the definition, the band,
 * the approach, the turntable, the numbers, the shoot. A reader can be
 * persuaded at any one of them, and before this the only offers were three
 * quarters of the way down. Somebody convinced by the macro of the hinge
 * had to scroll past four more arguments to find out where to act on it.
 *
 * So the offer follows the argument — INSIDE the section, directly under
 * the paragraph that just made it, where a reader's eye already is when
 * they finish reading. It was briefly a band between sections instead,
 * which put it in the gap between two arguments: attached to neither, and
 * reading as a strip of furniture the page had to be interrupted for.
 *
 * ---- Why it is filled ----
 *
 * It is the purchase, so it takes the main CTA style. It was briefly an
 * outlined `secondary`, which read as an aside rather than the offer.
 *
 * ---- Why it carries no box of its own ----
 *
 * No rule, no band, no ground. It is the last line of the copy block it
 * sits in, and it inherits that block's column and alignment — so on the
 * centred masthead it centres and in the two-column shoot it sits under
 * the left column, without either being told about it.
 */
/* Switched off: the story page's inline CTAs were removed; the pinned
   offer and the buy section carry the purchase. */
const SHOW_STORY_BUY = false;

export function StoryBuy({
  href,
  label,
}: {
  href: string;
  /** What is being bought, where the page knows. "Buy ARCA II" reads as an
   *  offer; a bare "Buy" reads as a button someone forgot to name. */
  label?: string;
}) {
  if (!SHOW_STORY_BUY) return null;
  return (
    <div className="story-buy">
      <CtaLink href={href}>
        {label ? `Buy ${label}` : "See the offer"}
      </CtaLink>
    </div>
  );
}
