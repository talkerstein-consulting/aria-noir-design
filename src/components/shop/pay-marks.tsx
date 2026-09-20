/**
 * The payment marks.
 *
 * ---- Why these are drawn here and not imported ----
 *
 * lucide carries no brand marks; it dropped them deliberately. So Apple
 * Pay and Google Pay are inline SVG, monochrome, set to `currentColor` so
 * they take the card's own state the way every other glyph on the site
 * does. The house has one foreground per ground and these are not an
 * exception: a four-colour Google G on this page would be the only
 * saturated object on a black screen.
 *
 * ---- Before this goes in front of a paying customer ----
 *
 * Apple and Google both require their SUPPLIED artwork for payment marks,
 * under their respective brand guidelines, and both have rules about
 * clear space and minimum size that a hand-drawn path cannot promise to
 * keep. These are faithful and they are stand-ins. Swap them for the
 * official assets before launch, which is a file drop and no change here:
 * same box, same sizing, same `currentColor`.
 */

const box = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false as const,
};

/** The Apple mark, as Apple Pay uses it. */
export function ApplePayMark() {
  return (
    <svg {...box} className="pay-mark">
      <path d="M16.9 12.6c0-2 1.6-3 1.7-3-0.9-1.4-2.4-1.5-2.9-1.6-1.2-0.1-2.4 0.7-3 0.7-0.6 0-1.6-0.7-2.6-0.7-1.3 0-2.6 0.8-3.3 2-1.4 2.4-0.4 6 1 8 0.7 1 1.5 2.1 2.5 2 1 0 1.4-0.6 2.6-0.6 1.2 0 1.5 0.6 2.6 0.6 1.1 0 1.8-1 2.4-2 0.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-0.8-2.1-3.1z" />
      <path d="M15 6.6c0.5-0.7 0.9-1.6 0.8-2.6-0.8 0-1.8 0.5-2.4 1.2-0.5 0.6-1 1.6-0.8 2.5 0.9 0.1 1.8-0.4 2.4-1.1z" />
    </svg>
  );
}

/** The Google G, in one colour. */
export function GooglePayMark() {
  return (
    <svg {...box} className="pay-mark">
      <path d="M12.2 10.5v3h4.2c-0.2 1.1-1.3 3.2-4.2 3.2-2.5 0-4.6-2.1-4.6-4.7s2.1-4.7 4.6-4.7c1.4 0 2.4 0.6 3 1.2l2-2C15.9 5.3 14.2 4.5 12.2 4.5c-4.2 0-7.6 3.4-7.6 7.5s3.4 7.5 7.6 7.5c4.4 0 7.3-3.1 7.3-7.4 0-0.5-0.1-0.9-0.1-1.3h-7.2z" />
    </svg>
  );
}

/** A card, for every brand the house takes. Not one issuer's mark: the
 *  field behind it accepts them all, and showing Visa alone would be a
 *  claim about what is accepted. */
export function CardMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      className="pay-mark"
    >
      <rect x="2" y="5" width="20" height="14" />
      <path d="M2 10h20" />
    </svg>
  );
}
