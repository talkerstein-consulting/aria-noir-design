"use client";

import Image, { getImageProps } from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/shop";
import { SortMenu } from "@/components/shop/sort-menu";
import { allHouses } from "@/lib/navigation";
import { CtaButton, CtaLink } from "@/components/cta-link";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";
import { ProductCard } from "@/components/product-card";
import {
  FilterDrawer,
  FilterGroup,
  FilterMore,
  FilterMulti,
  type FilterOption,
} from "@/components/shop/filter-drawer";
import { useBag } from "@/lib/cart";
import { TURNTABLE } from "@/lib/turntable";
import {
  activeFilters,
  collections,
  countInCollection,
  countInFamily,
  countInKind,
  countInStock,
  EMPTY_QUERY,
  FAMILIES,
  fallback,
  pieces,
  queryFromParams,
  shown as shownFor,
  SORTS,
  type Family,
  type Kind,
  type Piece,
  type Query,
  type Sort,
} from "@/lib/shop-all";

/**
 * Shop All: the rail, the pinned filter, the grid.
 *
 * ---- Where it comes from ----
 *
 * The Donuts catalogue page. The rail of counters under the banner, the
 * one button that holds every narrowing control, the dividers that group
 * the unfiltered grid, tiles that arrive from the right and leave to the
 * left when the collection changes, a search that says how many of how
 * many, and an empty result that offers four things rather than a
 * sentence. All of it is here. What is not is any of its surface: the
 * rail is the site's outline CTA (the same tab the desk uses), the drawer
 * is the bag's, and the grid is `ProductCard`, which every other grid on
 * the site already renders.
 *
 * ---- The arithmetic lives in lib/shop-all ----
 *
 * This file holds the one piece of state (the query), reads the URL into
 * it once, and draws. Every count, every sort and every rule about what a
 * family is lives beside the catalogue, where it can be read without a
 * browser.
 */

/**
 * How a tile enters and leaves when the collection changes: in from the
 * right, out to the left. The same direction the rest of the site moves
 * in, so a filter change reads as the next set arriving rather than the
 * current set rearranging itself in place.
 *
 * The stagger is capped: a forty-tile grid must not leave its tail
 * waiting on a delay that grows with the index.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const slide = (i: number) => ({
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  /* ---- The stagger is for ARRIVING, not for leaving ----
  
     The shared `transition` below staggers by index, which is what makes
     a filter change read as a run of tiles rather than a flash. On the
     way OUT it is dead time: the last tile would not begin its 350ms
     exit until 240ms after the first, so the grid took about 0.6s to
     clear before anything could take its place. The exit carries its own
     transition — no delay, and shorter — because leaving is not a
     performance. */
  exit: {
    opacity: 0,
    x: -48,
    transition: { duration: 0.18, delay: 0, ease: EASE },
  },
  transition: {
    layout: { type: "spring" as const, stiffness: 260, damping: 30 },
    duration: 0.35,
    ease: EASE,
    delay: Math.min(i, 12) * 0.02,
  },
});

/**
 * What can sit in the grid.
 *
 * Three kinds rather than just pieces: the dividers and the one promo
 * span every column, so the grid's row flow does the placement and
 * neither needs to know how many columns there are.
 */
/* The promo tile is gone with the lookbook it advertised — a full-width
   band two rows into the grid, pointing at /lookbook/ss26. The page it
   sold no longer exists, and a shop that interrupts itself to advertise
   nothing is worse than one that just shows the shelf. */
/**
 * One collection's stretch of the page: the cover, and the frames.
 *
 * This was a flat list of five tile kinds flowing through one wrapping
 * row. Three of the five -- `highlight`, `family`, `heading` -- had not
 * been emitted by the builder in some time; they were a 2x2 hero image, a
 * one-card-per-model grouping and a plain text divider, each still
 * carrying its render branch, its slice of the type and in one case a
 * fifty-line component nothing reached. They are gone with the flat list.
 *
 * What is left says what the page actually is: a run per collection.
 */
type Run = {
  slug: string;
  name: string;
  /** The wide band, for the phone's cover. 2400x914. */
  image: string;
  /** The upright worn shot, for the full-height cover. See COVER. */
  portrait: string | null;
  /** The acetate in that photograph, where it is known. See WORN. */
  worn: string | null;
  href: string;
  pieces: Piece[];
};

/* ---- The cover is a lifestyle shot, upright ----
 *
 * Twice wrong before this. The band it started as (`shop/breakers`, all
 * 2400x914) IS the right picture, the house worn in its setting, but
 * standing full height in half the screen `object-cover` scales a 2.63
 * photograph until its height fits and shows about a quarter of its width.
 * Swapping in `cover/mobile.webp` fixed the crop and lost the subject: that
 * cut is the still life, the frames alone on concrete, which is not a cover.
 *
 * The answer was already in `navigation.ts`. Every house carries a
 * `lifestyle` plate, upright at 1547x1920, and five of the six are exactly
 * the shot this wants. So the cover reads that field, and this map holds
 * only the two it cannot:
 *
 *   matriarca  its `lifestyle` plate is the obelisk courtyard, and Aria is
 *              not wearing the frames in it. A cover for an eyewear house
 *              with no eyewear in it cannot carry the line below either,
 *              so the run takes the golden profile, where the acetate and
 *              its plaque are the subject.
 *   the knit   apparel has no `lifestyle` field; the run's own hero stands in.
 *
 * The wide band stays as the phone's cover, where its shape is the shape of
 * the hole. Not `house.plate`: that is `cover/square.webp`, the same still
 * life the collection tiles want and this does not.
 */
const COVER: Record<string, string> = {
  matriarca: "/images/matriarca/campaign/worn-aria-closeup-02-profile-golden.webp",
  "alpaca-sweater": "/images/alpaca-sweater/run/hero-aria-solo-gallery.webp",
};

/* ---- Which acetate is in the picture ----
 *
 * Nothing in the build records this. The campaign data carries `src` and
 * `alt` only, and the alt says who and where ("Aria on the lantern
 * bridge"), never which frame. `heroColorway` is the nearest thing and it
 * is NOT this: it is the acetate the buy page opens on, and on the
 * PATRIARCA plate it is demonstrably not the one being worn.
 *
 * So each line below was read off the photograph against that house's own
 * cut-out renders in /images/fronts-cut, and only where the answer is not
 * in doubt:
 *
 *   arca-i     black acetate, gold plaque. The only black ARCA I makes
 *              (309 Blue, K Black, Proceso Brown, Z White).
 *   arca-ii    black. The only plain black in a run of stripes and roses,
 *              and `pages.ts` calls this same plate "ARCA II Noir, in the
 *              cloister".
 *   ahava      black, gold plaque. The only black AHAVA makes.
 *   matriarca  warm wood grain under heavy gold, which is the `brown`
 *              render and not the `noir` one. Black Wood is the house's
 *              other wood, it is black, and it is out of the workshop.
 *   monarca    black. The only plain black MONARCA makes.
 *
 * PATRIARCA is left out on purpose. Its plaque is gold, which rules
 * `midnight-noir` out (that render's plaque is black), but low sun on the
 * staircase leaves Black and Brown apart only in a light nobody can judge
 * from, and the shoot has no worn closeup to settle it. A collection with
 * nothing certain to say says nothing.
 */
const WORN: Record<string, string> = {
  "arca-i": "K Black",
  "arca-ii": "Noir",
  ahava: "Noir",
  matriarca: "Brown",
  monarca: "Noir",
};

/* ---- The product tile ----
   DITA's: light grey ground, the frame alone from the front (the
   turntable's frame 000, cut out), and the name, colourway and price
   inside the tile. Hover turns it to the quarter view (frame 014).

   Only the renders that exist are used; anything without one (the
   knitwear, Black Wood, AHAVA Dark Tortoise) keeps its photograph on the
   same grey. Keyed `collection/colourway`; the value is the file stem in
   /images/fronts-cut/. */
function ShopTile({ piece }: { piece: Piece }) {
  const stem = TURNTABLE[piece.id];
  const href = piece.card.href ?? `/shop/${piece.collection}`;
  return (
    /* The garment stands taller than a frame does. The square cell cut
       El Patrón off at the hem — "this shirt can be made taller" (Raviv,
       20 Nov) — so apparel takes a portrait cell and the frames keep the
       square one they are shot for. */
    <Link
      href={href}
      className={`shop-tile group relative block w-full overflow-hidden ${
        piece.kind === "apparel" ? "aspect-[3/4]" : "aspect-[7/8] sm:aspect-square"
      }`}
    >
      {stem ? (
        <>
          <Image
            src={`/images/fronts-cut/${stem}.webp`}
            alt={`${piece.collectionName}, ${piece.name}, from the front`}
            fill
            sizes="50vw"
            className="scale-110 object-cover pb-[34%] sm:pb-[22%] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0"
          />
          <Image
            src={`/images/fronts-cut/${stem}-quarter.webp`}
            alt=""
            fill
            sizes="50vw"
            className="scale-110 object-cover pb-[34%] sm:pb-[22%] opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
          />
          {/* No mark on the tile. There was a RotateHint and a "3D"
              label in the top-left corner of every tile with a rendered
              turn behind it, put there on 24 Nov because the buy page's
              plate had stopped turning by itself and the invitation had
              to be made before the reader arrived.

              The plate turns on its own again (see SpinPlate), so the
              invitation makes itself on the page that can answer it. A
              badge on a grid of eight tiles was eight copies of a promise
              about somewhere else, in the corner of a photograph of the
              thing being sold. The buy page still wears the mark at the
              foot of its plate, where there is something to drag. */}
        </>
      ) : piece.card.image ? (
        <Image
          src={piece.card.image}
          alt={`${piece.collectionName}, ${piece.name}`}
          fill
          sizes="50vw"
          /* The garment's photographs are rooms, not packshots, and in the
             taller cell they ran under the name. More ground reserved
             below the picture rather than a scrim over it: nothing of the
             photograph is covered, and the label sits on the tile's own
             grey like the frames' labels do. */
          className={
            piece.kind === "apparel"
              ? "object-contain px-[6%] pt-[3%] pb-[30%]"
              : "object-contain px-[6%] pt-[2%] pb-[20%]"
          }
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-2 pb-4 text-center sm:px-3 sm:pb-7">
        <p className="font-display text-base leading-tight text-ink sm:text-xl">
          {piece.collectionName}{" "}
          <span className="block italic sm:inline">{piece.name}</span>
        </p>
        <p className="price t-caption tabular-nums text-ink/65">{formatPrice(piece.cents)}</p>
        {!piece.available ? <p className="t-caption text-ink/45">Sold out</p> : null}
      </div>
    </Link>
  );
}



/**
 * Whether the bar has stuck.
 *
 * The Donuts `useStickyCategoryBar`, reduced to the one bit it needs: a
 * sentinel just above the bar, watched through a root margin equal to
 * the bar's `top`, so the moment the sentinel passes under the header the
 * bar is known to be holding and can paint the band behind the header.
 * Read from the bar's computed `top` rather than repeated here, so the
 * three breakpoints live in the CSS alone.
 */
function useStuck(bar: React.RefObject<HTMLDivElement | null>) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    const band = bar.current;
    if (!el || !band) return;
    let io: IntersectionObserver | undefined;
    const watch = () => {
      io?.disconnect();
      const top = parseFloat(getComputedStyle(band).top) || 0;
      io = new IntersectionObserver(
        ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < top),
        { rootMargin: `-${Math.ceil(top)}px 0px 0px 0px`, threshold: 0 },
      );
      io.observe(el);
    };
    watch();
    /* The `top` changes with the breakpoint, so the margin has to. */
    window.addEventListener("resize", watch);
    return () => {
      window.removeEventListener("resize", watch);
      io?.disconnect();
    };
  }, [bar]);
  return { sentinel, stuck };
}

/** The filter mark: two sliders that fold into an X while the sidebar is
 *  open. Two rules turn about their centres; the knobs fade out. */
function FilterGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      className="filter-glyph"
      data-open={open || undefined}
    >
      <line className="filter-glyph-a" x1="1.5" y1="5" x2="14.5" y2="5" />
      <line className="filter-glyph-b" x1="1.5" y1="11" x2="14.5" y2="11" />
      <circle className="filter-glyph-knob" cx="10.5" cy="5" r="1.75" fill="var(--paper)" />
      <circle className="filter-glyph-knob" cx="5.5" cy="11" r="1.75" fill="var(--paper)" />
    </svg>
  );
}

export function ShopAll() {
  const params = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const { sentinel, stuck } = useStuck(barRef);
  /* Read once, in the initialiser: an effect would paint the unfiltered
     grid first and then visibly filter it. */
  const [query, setQuery] = useState<Query>(() => queryFromParams(params));
  /* The rail scrolls; the chevrons are its handles. A pointer can drag it
     and a trackpad can swipe it, but a mouse on a desktop has neither —
     and the rail's own right-edge mask says there is more without giving
     anyone a way to reach it. */
  const railRef = useRef<HTMLElement>(null);
  const nudgeRail = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    /* Two thirds of what is showing: enough to feel like a page, little
       enough that the chip you were reading is still on screen. */
    el.scrollBy({ left: dir * el.clientWidth * 0.66, behavior: "smooth" });
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  /* The toolbar stays above the open sidebar; the rows start under it. */
  const [filtersTop, setFiltersTop] = useState(0);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const gridRef = useRef<HTMLDivElement>(null);

  /* Which pieces are already in the bag, so the grid can say so. */
  const { lines, ready } = useBag();
  const inBag = useMemo(
    () => new Set(lines.map((l) => `${l.slug}/${l.colorway}`)),
    [lines],
  );

  const patch = (next: Partial<Query>) => setQuery((q) => ({ ...q, ...next }));

  /* Picking a collection from the rail scrolls the grid back under the
     bar, so the first tiles of the new run are the first thing seen
     rather than whatever row the reader had reached in the old one. */
  const pickCollection = (slug: string | null) => {
    patch({ collection: slug });
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const top = grid.getBoundingClientRect().top + window.scrollY - 160;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.scrollTo({ top });
        } else if (window.__lenis) {
          window.__lenis.scrollTo(top);
        } else {
          window.scrollTo({ top, behavior: "smooth" });
        }
      }),
    );
  };

  const list = useMemo(() => shownFor(query), [query]);
  const active = activeFilters(query);
  const current = collections.find((c) => c.slug === query.collection);


  /* One card per model, its colours as thumbnails under it (the
     Matsuda pattern Raviv referenced): a run of four ARCA I cards that
     differ only by acetate is one product, not four. Grouped in the
     order the filtered list first meets each model, so sorting and
     search still decide what comes first. */
  /* Individual product cards, one per colourway (the collections are
     already shown as tiles above the shop). A single highlight image
     breaks the grid after the first two rows, when there are enough
     cards for it to sit between. */
  /* Divided by collection, in the order the filtered list first meets
     each one, so sort and search still decide what leads. */
  const runs = useMemo<Run[]>(() => {
    const order: string[] = [];
    const by = new Map<string, Piece[]>();
    for (const piece of list) {
      if (!by.has(piece.collection)) {
        by.set(piece.collection, []);
        order.push(piece.collection);
      }
      by.get(piece.collection)!.push(piece);
    }
    return order.map((slug): Run => {
      const group = by.get(slug)!;
      const house = allHouses.find((h) => h.slug === slug);
      return {
        slug,
        name: group[0].collectionName,
        /* A wide lifestyle photograph per collection
           (public/images/shop/breakers). */
        image: `/images/shop/breakers/${slug}.webp`,
        /* The upright worn shot for the full-height cover; see COVER.
           Any collection without one falls back to the band at both
           widths rather than to a crop nobody chose. */
        portrait: COVER[slug] ?? house?.lifestyle ?? null,
        worn: WORN[slug] ?? null,
        href: house?.href ?? `/shop/${slug}`,
        pieces: group,
      };
    });
  }, [list]);

  /* ---- the drawer's groups ----
     Each always has an answer, so "everything" is a real option inside
     it rather than the absence of one. */
  const collectionOptions: FilterOption<string>[] = [
    { id: "all", label: "Everything", count: countInCollection(query, null) },
    ...collections.map((c) => ({
      id: c.slug,
      label: c.name,
      count: countInCollection(query, c.slug),
    })),
  ];
  const kindOptions: FilterOption<Kind | "any">[] = [
    { id: "any", label: "Both", count: countInKind(query, null) },
    { id: "eyewear", label: "Eyewear", count: countInKind(query, "eyewear") },
    { id: "apparel", label: "Apparel", count: countInKind(query, "apparel") },
  ];
  /* Families that would leave nothing are dropped rather than shown at
     zero: five dead ends under a one-colour house is five rows that cost
     more than they say. The current answer always survives the cut, or
     picking one would make the row vanish from under its own tick. */
  const familyOptions: FilterOption<Family>[] = FAMILIES.map((f) => ({
    id: f.id,
    label: f.label,
    count: countInFamily(query, f.id),
  })).filter((o) => (o.count ?? 0) > 0 || query.families.includes(o.id));
  const stockOptions: FilterOption<"all" | "in">[] = [
    { id: "all", label: "Everything the house makes", count: countInKind(query, null) },
    { id: "in", label: "In the workshop now", count: countInStock(query) },
  ];
  const sortOptions: FilterOption<Sort>[] = SORTS.map((s) => ({ id: s.id, label: s.label }));

  const heading = current ? current.name : "Shop all";
  const suggestions = useMemo(() => fallback(), []);

  return (
    <section
      /* The room above the bar is ink, in app/shop/page.tsx; only a named
         collection's heading needs paper above the bar. */
      className={`shop-section on-paper section relative bg-paper ${current ? "!pt-10 sm:!pt-14" : "!pt-0"}`}
      aria-labelledby="shop-heading"
    >
      {/* The page's heading lives in app/shop/page.tsx, above the
          collection tiles. When a collection is chosen its name is said
          here, so the grid below is never anonymous. */}
      {current ? (
        <div className="mx-auto max-w-7xl">
          <h2 id="shop-heading" className="t-display-lg mb-8">
            {heading}
          </h2>
        </div>
      ) : (
        <span id="shop-heading" className="sr-only">
          {heading}
        </span>
      )}

      {/* ---- the toolbar ----
          Filters on the left (opening the sidebar from the left), sort on
          the right. Sticky under the header, at every width. */}
      <div ref={sentinel} aria-hidden="true" />
      <div
        ref={barRef}
        /* Inverted: black strip, paper type (Rems, 9 Nov). */
        className="shop-bar on-ink"
        data-stuck={stuck || undefined}
        data-filters={filtersOpen || undefined}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 items-center sm:flex sm:justify-between sm:gap-4">
          <div className="flex items-center gap-6 sm:gap-10">
          <button
            type="button"
            onClick={() => {
              setFiltersTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
              setFiltersOpen((o) => !o);
            }}
            className="shop-tool"
            aria-expanded={filtersOpen}
          >
            <FilterGlyph open={filtersOpen} />
            <span className="sm:hidden">Filters</span>
            <span className="hidden sm:inline">{filtersOpen ? "Hide filters" : "Show filters"}</span>
            {active > 0 ? <span className="tabular-nums opacity-70">({active})</span> : null}
          </button>
          <span className="shop-tool shop-count pointer-events-none opacity-60" aria-live="polite">
            {list.length} {list.length === 1 ? "product" : "products"}
          </span>
          </div>

          <div className="justify-self-end">
            <SortMenu value={query.sort} options={sortOptions} onChange={(sort) => patch({ sort })} />
          </div>
        </div>
      </div>

      <FilterDrawer
        side="left"
        top={filtersTop}
        open={filtersOpen}
        onClose={closeFilters}
        showing={list.length}
        canClear={active > 0 || query.sort !== "featured"}
        onClear={() => setQuery({ ...EMPTY_QUERY, q: query.q })}
      >
        {/* Collections first: it decides what the grid is a list OF. Sort
            decides only the order of whatever that turns out to be. Colour
            is the second thing anyone knows about what they came for, so
            it sits directly under; kind and stock are the tiebreaks. */}
        <FilterGroup
          title="Collection"
          options={collectionOptions}
          value={query.collection ?? "all"}
          onChange={(next) => pickCollection(next === "all" ? null : next)}
        />
        <FilterMulti
          title="Colour"
          options={familyOptions}
          value={query.families}
          onToggle={(f) =>
            patch({
              families: query.families.includes(f)
                ? query.families.filter((x) => x !== f)
                : [...query.families, f],
            })
          }
        />
        {/* Under the fold, and open already if either one is cutting the
            grid — see FilterMore. */}
        <FilterMore defaultOpen={Boolean(query.kind) || query.inStock}>
          <FilterGroup
            title="Kind"
            options={kindOptions}
            value={query.kind ?? "any"}
            onChange={(next) => patch({ kind: next === "any" ? null : next })}
          />
          <FilterGroup
            title="Stock"
            options={stockOptions}
            value={query.inStock ? "in" : "all"}
            onChange={(next) => patch({ inStock: next === "in" })}
          />
        </FilterMore>
      </FilterDrawer>

      <div className="mx-auto max-w-7xl">
        {/* The search, and the way out of it. A page silently showing six
            pieces because a query arrived in the URL has to say why, and
            has to offer a way back. */}
        {query.q ? (
          <p className="t-caption mt-10" role="status">
            Showing {list.length} of {pieces.length} for{" "}
            <span className="text-[var(--fg-primary)]">&ldquo;{query.q}&rdquo;</span>.{" "}
            <button
              type="button"
              onClick={() => patch({ q: "" })}
              className="link-quiet underline underline-offset-4"
            >
              Clear
            </button>
          </p>
        ) : null}

        {/* Nothing matched. The sentence, then four pieces drawn as real
            cards, so nobody has to go back to the top and start again. */}
        {list.length === 0 ? (
          <div className="mt-10">
            <p className="t-body t-body--lede">
              {query.q
                ? `Nothing here is called “${query.q}”.`
                : `Nothing in ${current ? current.name : "the house"} answers to that.`}
            </p>
            <div className="mt-6">
              <CtaLink href="/shop" onClick={() => setQuery(EMPTY_QUERY)} kind="secondary">
                Shop all
              </CtaLink>
            </div>
            {suggestions.length ? (
              <>
                <h2 className="t-display-lg mt-20">The house leads with these.</h2>
                <ul className="mt-8 grid grid-cols-2 gap-[var(--grid-gutter)] lg:grid-cols-4">
                  {suggestions.map((piece) => (
                    <li key={piece.id} className="flex">
                      <ProductCard {...piece.card} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

      </div>

      {/* ---- the grid ----
          One run per collection, and it is the only thing on this page
          that leaves the column: each run is two halves OF THE SCREEN.
          The cover holds the left half at full height and stays there
          while its own frames scroll past it on the right, two across,
          each one square — so their height follows the half it is in.
          See `.shop-run` in styles/commerce.css. */}
      <div ref={gridRef} className="shop-grid mt-4 grid gap-[var(--grid-gutter)] sm:mt-8">
        <AnimatePresence mode="popLayout" initial={false}>
          {runs.map((run, r) => {
            /* Art direction, the documented way: one <picture>, and the
               browser picks the cut BEFORE it requests anything. Two
               <Image>s with one hidden would have the phone paying for
               the upright plate and the desktop for the band. */
            const band = getImageProps({
              alt: "",
              fill: true,
              sizes: "100vw",
              src: run.image,
            }).props;
            const tall = run.portrait
              ? getImageProps({ alt: "", fill: true, sizes: "50vw", src: run.portrait }).props
              : null;
            return (
            <motion.div
              key={`run-${run.slug}`}
              /* The anchor the collection tiles above jump to. */
              id={`run-${run.slug}`}
              layout
              className="shop-run"
              {...slide(r)}
            >
              <figure className="shop-run__cover">
                <Link href={run.href} className="group block h-full">
                  {/* Full height where it sticks, a band where it does
                      not: the 16/9 is the phone's, stacked above its
                      frames. */}
                  <div className="relative h-full w-full max-lg:aspect-[16/9]">
                    <picture>
                      {tall ? (
                        <source media="(min-width: 1024px)" srcSet={tall.srcSet} sizes={tall.sizes} />
                      ) : null}
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img
                        {...band}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    </picture>
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-6 text-center sm:p-10">
                      {/* White over the photograph: the paper section's
                          heading colour was winning over text-paper and
                          setting it black. */}
                      <h2 className="t-display-md" style={{ color: "#fff" }}>
                        {run.name}
                      </h2>
                      {/* The acetate in the picture, stated once and
                          quietly. Only where WORN knows it: a line naming
                          the wrong frame under a photograph of the right
                          one is worse than no line at all. */}
                      {run.worn ? (
                        <p className="t-caption italic" style={{ color: "rgb(255 255 255 / 0.78)" }}>
                          Worn in {run.worn}
                        </p>
                      ) : null}
                    </figcaption>
                  </div>
                </Link>
              </figure>

              {/* Its own presence boundary, not the outer one: with the
                  frames nested a level down, `initial={false}` on the run
                  list no longer reaches them, and thirty-five tiles would
                  cascade in on first paint. */}
              <div className="shop-run__items">
                <AnimatePresence mode="popLayout" initial={false}>
                  {run.pieces.map((piece, i) => (
                    <motion.article
                      key={piece.id}
                      layout
                      className="shop-cell relative flex"
                      {...slide(i)}
                    >
                      <ShopTile piece={piece} />
                      {/* Already chosen. Said in words, at the corner of
                          the picture, and only once the bag is known: a
                          mark that appears a frame after the card reads
                          as the shop finding things it had lost. */}
                      {ready && piece.bagKey && inBag.has(piece.id) ? (
                        <span className="shop-in-bag t-eyebrow">In the bag</span>
                      ) : null}
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
