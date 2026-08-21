import Link from "next/link";
import { nav } from "@/lib/content";
import { AriaWordmark } from "@/components/aria-wordmark";

type SiteNavProps = {
  /**
   * The home page holds the nav hidden until the hero choreography goes
   * live, so it fades in with the logo rather than sitting over the
   * loading video. Ordinary pages have nothing to wait for.
   */
  visible?: boolean;
  /**
   * The home page flies its own animated mark from centre-screen into this
   * slot, so it opts out of the static one rather than stacking two marks
   * on the same pixels.
   */
  showMark?: boolean;
};

/**
 * Fixed site header, shared by the home experience and every product page
 * so the chrome is identical across the site.
 *
 * The whole header is set in white and composited with
 * `mix-blend-mode: difference`, so it reads against whatever is underneath
 * — white over the dark photography, inverted to near-black the moment a
 * light section scrolls beneath it — with no scroll listener sampling the
 * backdrop.
 *
 * The blend belongs on the header, NOT on the mark inside it: this element
 * is `fixed` with a `z-index`, which makes it its own stacking context, and
 * a stacking context isolates blending. A child blending inside it would
 * only ever see the header's own (transparent) background and would never
 * pick up the page behind.
 *
 * The mark is an inline SVG for the same reason — its paths ship as
 * `currentColor` so they can be forced to pure white. Through an <img> the
 * file's own black fills are fixed, and differencing against black is a
 * no-op, which would make the mark vanish over dark ground.
 */
export function SiteNav({ visible = true, showMark = true }: SiteNavProps) {
  return (
    <header
      /* grid rather than flex space-between: with three children the middle
         one only sits truly centred if the two flanking it are the same
         width, which they aren't ("Menu" vs "Log in"). 1fr/auto/1fr pins the
         mark to the page's centre regardless. */
      className="fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-8 py-6 font-ui text-sm text-white mix-blend-difference transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <button type="button" className="justify-self-start tracking-wide">
        {nav.left}
      </button>

      {showMark ? (
        <Link
          href="/"
          aria-label="Aria Noir — home"
          className="justify-self-center transition-opacity hover:opacity-70"
        >
          {/* stacked ARIA / NOIR lockup — sized off height with width:auto,
              since a fixed width squashes the two lines at small sizes */}
          <AriaWordmark className="h-7 w-auto sm:h-8" />
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <button type="button" className="justify-self-end tracking-wide">
        {nav.right}
      </button>
    </header>
  );
}
