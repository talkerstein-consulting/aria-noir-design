"use client";

import Image from "next/image";
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
import { framingFor } from "@/lib/card-framing";
import {
  FilterDrawer,
  FilterGroup,
  FilterMore,
  FilterMulti,
  type FilterOption,
} from "@/components/shop/filter-drawer";
import { useBag } from "@/lib/cart";
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
type Tile =
  | { kind: "piece"; piece: Piece }
  | { kind: "family"; slug: string; pieces: Piece[] }
  | { kind: "heading"; slug: string; name: string }
  | { kind: "highlight" }
  | { kind: "breaker"; slug: string; name: string; image: string | null | undefined; href: string };

/** The highlight image takes the first 2x2 of the grid, but only when there
 *  are enough products to flow around it. */
const HIGHLIGHT_MIN = 6;

/* ---- The product tile ----
   DITA's: light grey ground, the frame alone from the front (the
   turntable's frame 000, cut out), and the name, colourway and price
   inside the tile. Hover turns it to the quarter view (frame 014).

   Only the renders that exist are used; anything without one (the
   knitwear, Black Wood, AHAVA Dark Tortoise) keeps its photograph on the
   same grey. Keyed `collection/colourway`; the value is the file stem in
   /images/fronts-cut/. */
const TURNTABLE: Record<string, string> = {
  "arca-i/309 Blue": "arca-i-309-blue",
  "arca-i/K Black": "arca-i-k-black",
  "arca-i/Proceso Brown": "arca-i-proceso-brown",
  "arca-i/Z White": "arca-i-z-white",
  "arca-ii/Caramel Stripe": "arca-ii-caramel-stripe",
  "arca-ii/Dark Tortoise": "arca-ii-dark-tortoise",
  "arca-ii/Dreamy Rose": "arca-ii-dreamy-rose",
  "arca-ii/Noir": "arca-ii-noir",
  "arca-ii/Pixie Dust": "arca-ii-pixie-dust",
  "arca-ii/Root Beer Float": "arca-ii-root-beer-float",
  "arca-ii/Tutti Frutti": "arca-ii-tutti-frutti",
  "arca-ii/Velvet Rose": "arca-ii-velvet-rose",
  "ahava/Caramel Stripe": "ahava-caramel-stripe",
  "ahava/Dark Tortoise": "ahava-dark-tortoise",
  "ahava/Noir": "ahava-noir",
  "ahava/Root Beer Float": "ahava-root-beer-float",
  "ahava/Rose": "ahava-rose",
  "ahava/Tutti Frutti": "ahava-tutti-frutti",
  "monarca/Caramel Stripe": "monarca-caramel-stripe",
  "monarca/Dark Tortoise": "monarca-dark-tortoise",
  "monarca/Dreamy Rose": "monarca-dreamy-rose",
  "monarca/Noir": "monarca-noir",
  "monarca/Pixie Dust": "monarca-pixie-dust",
  "monarca/Tutti Frutti": "monarca-tutti-frutti",
  "monarca/Velvet Rose": "monarca-velvet-rose",
  "matriarca/Brown": "matriarca-brown",
  "matriarca/Midnight Noir": "matriarca-noir",
  "patriarca/Black": "patriarca-black",
  "patriarca/Brown": "patriarca-brown",
  "patriarca/Midnight Noir": "patriarca-midnight-noir",
};

function ShopTile({ piece }: { piece: Piece }) {
  const stem = TURNTABLE[piece.id];
  const href = piece.card.href ?? `/shop/${piece.collection}`;
  return (
    <Link href={href} className="shop-tile group relative block aspect-[7/8] w-full overflow-hidden sm:aspect-square">
      {stem ? (
        <>
          <Image
            src={`/images/fronts-cut/${stem}.webp`}
            alt={`${piece.collectionName}, ${piece.name}, from the front`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="scale-110 object-cover pb-[34%] sm:pb-[22%] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0"
          />
          <Image
            src={`/images/fronts-cut/${stem}-quarter.webp`}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="scale-110 object-cover pb-[34%] sm:pb-[22%] opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
          />
        </>
      ) : piece.card.image ? (
        <Image
          src={piece.card.image}
          alt={`${piece.collectionName}, ${piece.name}`}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain px-[6%] pt-[2%] pb-[20%]"
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-2 pb-4 text-center sm:px-3 sm:pb-7">
        <p className="font-display text-base leading-tight text-ink sm:text-xl">
          {piece.collectionName}{" "}
          <span className="block italic sm:inline">{piece.name}</span>
        </p>
        <p className="t-caption tabular-nums text-ink/65">{formatPrice(piece.cents)}</p>
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
     each one (so sort and search still decide what leads): a full-width
     breaker image for the collection, then its frames. */
  const tiles = useMemo<Tile[]>(() => {
    const order: string[] = [];
    const by = new Map<string, Piece[]>();
    for (const piece of list) {
      if (!by.has(piece.collection)) {
        by.set(piece.collection, []);
        order.push(piece.collection);
      }
      by.get(piece.collection)!.push(piece);
    }
    return order.flatMap((slug): Tile[] => {
      const group = by.get(slug)!;
      const house = allHouses.find((h) => h.slug === slug);
      /* A wide lifestyle photograph per collection (public/images/shop/breakers). */
      const image = `/images/shop/breakers/${slug}.webp`;
      return [
        { kind: "breaker", slug, name: group[0].collectionName, image, href: house?.href ?? `/shop/${slug}` },
        ...group.map((piece) => ({ kind: "piece" as const, piece })),
      ];
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
    <section className="on-paper section relative bg-paper !pt-10 sm:!pt-14" aria-labelledby="shop-heading">
      {/* The page's heading lives in app/shop/page.tsx, above the
          collection tiles. When a collection is chosen its name is said
          here, so the grid below is never anonymous. */}
      {current ? (
        <div className="mx-auto max-w-7xl">
          <h2 id="shop-heading" className="t-display-md mb-8">
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
        className="shop-bar on-paper"
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
                <h2 className="t-display-xs mt-20">The house leads with these.</h2>
                <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
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

        {/* ---- the grid ----
            One grid, whatever the grouping: the dividers are grid children
            spanning every column, so the pieces stay in one set of columns
            across every collection. Seven separate grids would each solve
            their own last row and the page would step in and out. */}
        <div
          ref={gridRef}
          /* DITA's grid: four across, narrow gaps, light grey tiles; the
             highlight image takes the first 2x2. */
          className="shop-grid -mx-[17px] mt-4 flex flex-wrap justify-center gap-1.5 sm:mx-0 sm:mt-8"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {tiles.map((tile, i) =>
              tile.kind === "breaker" ? (
                /* The grid breaker: one per collection, every column wide,
                   its photograph and its name, before its frames. */
                <motion.figure
                  key={`breaker-${tile.slug}`}
                  id={`run-${tile.slug}`}
                  layout
                  className="shop-breaker relative w-full overflow-hidden"
                  {...slide(i)}
                >
                  <Link href={tile.href} className="group block">
                    <div className="relative aspect-[16/9] w-full sm:aspect-[21/8]">
                      {tile.image ? (
                        <Image
                          src={tile.image}
                          alt=""
                          fill
                          sizes="100vw"
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      ) : null}
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                      <figcaption className="absolute inset-x-0 bottom-0 flex justify-center p-6 sm:p-10">
                        <h2 className="font-display text-3xl text-paper sm:text-5xl">{tile.name}</h2>
                      </figcaption>
                    </div>
                  </Link>
                </motion.figure>
              ) : tile.kind === "highlight" ? (
                /* The image that breaks the grid: two columns by two rows,
                   first in the grid, the products flowing around it. */
                <motion.figure
                  key="highlight"
                  layout
                  className="shop-highlight relative col-span-2 overflow-hidden lg:row-span-2"
                  {...slide(i)}
                >
                  <Link href="/arca-ii" className="group block h-full">
                    <div className="relative aspect-square h-full w-full">
                      <Image
                        src="/images/home/hero-m.webp"
                        alt="Aria and Noir, together, in ARCA I"
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    </div>
                  </Link>
                </motion.figure>
              ) : tile.kind === "family" ? (
                <motion.article
                  key={`family-${tile.slug}`}
                  layout
                  className="relative flex"
                  {...slide(i)}
                >
                  <FamilyCard
                    pieces={tile.pieces}
                    inBag={(id) => ready && inBag.has(id)}
                  />
                </motion.article>
              ) : tile.kind === "heading" ? (
                <motion.h2
                  key={`heading-${tile.slug}`}
                  id={`run-${tile.slug}`}
                  layout
                  className="shop-divider t-display-md"
                  {...slide(i)}
                >
                  {tile.name}
                </motion.h2>
              ) : (
                <motion.article
                  key={tile.piece.id}
                  layout
                  className="shop-cell relative flex"
                  {...slide(i)}
                >
                  <ShopTile piece={tile.piece} />
                  {/* Already chosen. Said in words, at the corner of the
                      picture, and only once the bag is known: a mark that
                      appears a frame after the card reads as the shop
                      finding things it had lost. */}
                  {ready && tile.piece.bagKey && inBag.has(tile.piece.id) ? (
                    <span className="shop-in-bag t-eyebrow">In the bag</span>
                  ) : null}
                </motion.article>
              ),
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/**
 * One model with its colourways. The big card is the chosen colour;
 * the row underneath is every colour this list holds for the model, as
 * small product shots. Tapping one swaps the card (picture, name, price,
 * the heart, the link) to that colour, so saving and buying stay per
 * colour.
 */
function FamilyCard({
  pieces,
  inBag,
}: {
  pieces: Piece[];
  inBag: (id: string) => boolean;
}) {
  const [at, setAt] = useState(0);
  const piece = pieces[Math.min(at, pieces.length - 1)];
  return (
    <div className="flex w-full flex-col">
      <div className="relative flex">
        <ProductCard {...piece.card} />
        {piece.bagKey && inBag(piece.id) ? (
          <span className="shop-in-bag t-eyebrow">In the bag</span>
        ) : null}
      </div>
      {pieces.length > 1 ? (
        <div
          role="radiogroup"
          aria-label={`${piece.collectionName} colours`}
          className="family-thumbs mt-4"
          /* Every colour visible, spanning the photo's width: one row up
             to five, then two even rows (eight colours = 4 + 4). Never
             fewer than four columns, so a two-colour model keeps small
             thumbnails, flush left. */
          style={
            {
              "--thumb-cols":
                pieces.length <= 5
                  ? Math.max(4, pieces.length)
                  : Math.max(4, Math.ceil(pieces.length / 2)),
            } as React.CSSProperties
          }
        >
          {pieces.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={i === at}
              aria-label={p.name}
              title={p.name}
              data-on={i === at}
              onClick={() => setAt(i)}
              className="family-thumb"
            >
              {p.card.image ? (
                <Image
                  src={p.card.image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  /* The same measured crop as the big card, so the
                     thumbnails line up with it and with each other. */
                  style={(() => {
                    /* Tighter than the card: at thumbnail size the frame
                       is the whole point, the room around it is noise. */
                    const [z, x, y] = framingFor(p.card.image);
                    const k = 1.45;
                    return { scale: String(z * k), translate: `${x * k}% ${y * k}%` };
                  })()}
                />
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: p.card.swatch }}
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
