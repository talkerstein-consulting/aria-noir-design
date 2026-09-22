/**
 * The shop, before the shop.
 *
 * ---- Why the black rectangle was not enough ----
 *
 * `ShopAll` reads the URL, so it is a client component behind a Suspense
 * boundary, and that boundary suspends on every cold entry to /shop. What
 * it used to hand over in the meantime was `min-h-screen bg-ink`: one
 * black rectangle the height of the window.
 *
 * A reader who lands on that cannot tell which of three things has
 * happened — the shop is loading, the shop is empty, or the shop is
 * broken. Waiting is not the problem; UNSHAPED waiting is, because a wait
 * you cannot read the end of is longer than the same wait with a shape in
 * it. The page already knows the shape: a head, the sticky rail, and a
 * grid of square cards. Drawing that costs one static component and
 * answers all three questions before any data arrives.
 *
 * ---- It has to be the SAME shape ----
 *
 * Every measurement here is copied from `ShopAll`'s own markup rather
 * than approximated: the section's padding, the `stack--sm` head, the
 * `shop-bar` band outside the `max-w-7xl` wrapper, and the grid's exact
 * column counts and gaps. A skeleton that is close but not equal is worse
 * than none, because the swap then lands as a jump — which is the one
 * thing the reader is guaranteed to notice.
 *
 * The tile count is 8: enough to fill the fold at every width the grid
 * has a rule for, and a whole number of rows at 1, 3 and 4 columns.
 */

const TILES = 8;

/* The rail's chips are not all one width in the real bar — they are named
   colours — so the placeholder is not either. Fixed rather than random:
   a fallback that renders differently on the server and the client is a
   hydration mismatch. */
const CHIP_WIDTHS = ["5.5rem", "4rem", "9rem", "4.5rem"];

export function ShopSkeleton() {
  return (
    <section
      className="on-ink section relative bg-ink pt-20 sm:pt-40"
      /* The whole region is one status: the marks inside it carry no
         information of their own, so they are hidden from the reader who
         is being read to and the region says the one true thing instead. */
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading the shop</span>

      <div className="mx-auto max-w-7xl" aria-hidden>
        <div className="stack stack--sm mb-12">
          <span className="skeleton skeleton--eyebrow" />
          <span className="skeleton skeleton--display" />
        </div>
      </div>

      {/* Outside the wrapper, exactly as the real bar is: it carries its
          own negative gutter margins and would be inset by one here. */}
      <div className="shop-bar on-ink" aria-hidden>
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          {CHIP_WIDTHS.map((w) => (
            <span key={w} className="skeleton skeleton--chip" style={{ width: w }} />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl" aria-hidden>
        <div className="shop-grid mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: TILES }, (_, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* `card-shot` is the real class, so the square is the
                  card's own aspect ratio rather than a guess at it. */}
              <div className="skeleton card-shot" />
              <div>
                <span className="skeleton skeleton--name mt-5" />
                <span className="skeleton skeleton--caption mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
