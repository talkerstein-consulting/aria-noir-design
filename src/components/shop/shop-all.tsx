"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
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
  | { kind: "heading"; slug: string; name: string };



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

  /* Grouped only while the grid is showing everything. A picked
     collection is already one group and the heading above says which; a
     search is a relevance list that happens to span collections, and
     cutting it into labelled runs would bury the best match under a
     subheading. */
  const grouped = !query.collection && !query.q;

  const tiles = useMemo<Tile[]>(() => {
    const items: Tile[] = list.map((piece) => ({ kind: "piece", piece }));
    if (grouped) {
      const out: Tile[] = [];
      for (const c of collections) {
        const run = list.filter((p) => p.collection === c.slug);
        if (!run.length) continue;
        out.push({ kind: "heading", slug: c.slug, name: c.name });
        run.forEach((piece) => out.push({ kind: "piece", piece }));
      }
      return out;
    }
    return items;
  }, [list, grouped]);

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
    <section className="on-ink section relative bg-ink pt-20 sm:pt-40" aria-labelledby="shop-heading">
      <div className="mx-auto max-w-7xl">
        {/* ---- the head ---- */}
        <div className="stack stack--sm mb-12">
          <CrumbEyebrow label="Shop all" className="t-eyebrow" />
          <h1 id="shop-heading" className="t-display-lg">
            {heading}
          </h1>
        </div>
      </div>

      {/* ---- the rail and the pin ----
          Sticky under the header, at every width. The rail is browsing,
          not filtering: it answers "what is there", which a first-time
          visitor asks before they have anything to narrow. Picking a tab
          sets the same state the drawer's Collections group does, so the
          two always agree. */}
      <div ref={sentinel} aria-hidden="true" />
      <div ref={barRef} className="shop-bar on-ink" data-stuck={stuck || undefined}>
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          {/* ---- The rail asks what COLOUR, not which product ----
          
              It used to be the seven collections, which is the question the
              menu already answers and the one a reader arriving at "shop
              all" has least need of: they came here to see everything, and
              the first cut they want is by eye. The houses are still a
              filter — they are in the drawer, under Collections — so
              nothing was taken away, only reordered by how often it is
              wanted.
          
              Multi-select, because colour is: noir AND tortoise is a real
              thing to ask for, where two collections at once rarely is.
              Pressing a lit chip clears it; Everything clears them all. */}
          <nav ref={railRef} className="shop-rail" aria-label="Filter by colour">
            <CtaButton
              kind="secondary"
              current={!query.families.length}
              onClick={() => patch({ families: [] })}
            >
              Everything
            </CtaButton>
            {FAMILIES.map((f) => {
              const on = query.families.includes(f.id);
              return (
                <CtaButton
                  key={f.id}
                  kind="secondary"
                  current={on}
                  onClick={() =>
                    patch({
                      families: on
                        ? query.families.filter((x) => x !== f.id)
                        : [...query.families, f.id],
                    })
                  }
                  /* The acetate itself, in the CTA's own glyph slot —
                     which is already `aria-hidden`, and keeps the label a
                     plain string for the character flip.
                  
                     Never the swatch ALONE: these are five browns and
                     blacks at chip size, and a reader who cannot separate
                     #141416 from #4a3220 would be guessing which filter
                     they had pressed. Colour is the mark, the word is the
                     label — the same rule the colourway picker follows. */
                  icon={
                    <span
                      className="shop-chip-swatch"
                      style={{ background: f.swatch }}
                    />
                  }
                >
                  {f.label}
                </CtaButton>
              );
            })}
          </nav>
          {/* The rail's handles: two squares, then the filter box. They sit
              on the right because that is the edge the rail runs off, and
              before Filter because they belong to the rail rather than to
              the drawer. `aria-hidden` is wrong here — they do something a
              keyboard cannot otherwise do on a horizontally scrolled
              region — so they are labelled buttons. */}
          <div className="shop-nudge">
            <button
              type="button"
              onClick={() => nudgeRail(-1)}
              aria-label="Scroll the colours left"
            >
              <ChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => nudgeRail(1)}
              aria-label="Scroll the colours right"
            >
              <ChevronRight aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="shop-filter-pin"
            aria-label="Filter and sort"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal aria-hidden="true" />
            <span className="t-eyebrow">Filter</span>
            {active > 0 ? (
              <span className="font-mono tabular-nums text-[0.5625rem]">{active}</span>
            ) : null}
          </button>
        </div>
      </div>

      <FilterDrawer
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
        <FilterGroup
          title="Order"
          options={sortOptions}
          value={query.sort}
          onChange={(sort) => patch({ sort })}
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
          className="shop-grid mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {tiles.map((tile, i) =>
              tile.kind === "heading" ? (
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
                  className="relative flex"
                  {...slide(i)}
                >
                  <ProductCard {...tile.piece.card} />
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
