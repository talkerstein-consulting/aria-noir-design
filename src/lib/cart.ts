"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CATALOGUE, type CatalogueEntry } from "@/lib/catalogue";
import { allHouses, type House } from "@/lib/navigation";
import { apparel, runShot, type ApparelCollection } from "@/lib/apparel";

/**
 * The headless cart.
 *
 * ---- Where it goes ----
 *
 * `/checkout`, on this origin, which settles the order against the house
 * API (lib/house-api). The bag is what that page reads.
 *
 * There is no second road. A Shopify `/cart/<variantId>:<qty>,…`
 * permalink used to be offered when the house API could not be reached;
 * it is gone, because the sale now lives here and a checkout that hands
 * the reader to another store is not this build's checkout failing over,
 * it is this build giving the order away.
 *
 * ---- Why the bag is local ----
 *
 * Nothing about a cart is authoritative here. Price, stock and tax are all
 * decided at checkout, by the house API, against live inventory. What this
 * holds is an INTENTION — "these, this many" — which is exactly the kind of
 * state a browser should own. If it disagrees with the store, the store
 * wins at checkout, which is the correct direction for that argument.
 */

const KEY = "aria-noir:bag";

export type BagLine = {
  slug: string;
  colorway: string;
  /**
   * The garment's size. Absent on eyewear, which is one size.
   *
   * Part of the line's IDENTITY, not a note on it: a Medium and a Large in
   * the same colourway are two different things to own, two different
   * variants to order, and must sit as two lines. Every add, quantity
   * change and removal keys on it — see `same`.
   */
  size?: string;
  qty: number;
};

/** Two lines are the same line when the product, the colour AND the size
 *  agree. Kept here so add, setQty and remove cannot drift apart on what
 *  counts as a match. */
function same(a: BagLine, b: Pick<BagLine, "slug" | "colorway" | "size">) {
  return (
    a.slug === b.slug &&
    a.colorway === b.colorway &&
    (a.size ?? "") === (b.size ?? "")
  );
}

/** A bag line joined back to the catalogue. Null where the store no longer
 *  carries the line — a colourway can be withdrawn between the day it was
 *  added and the day the tab is reopened. */
export type ResolvedLine = {
  line: BagLine;
  house: House | undefined;
  entry: CatalogueEntry | undefined;
  /** The collection, where the line is a garment rather than a frame. */
  garment: ApparelCollection | undefined;
};

function read(): BagLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l &&
        typeof l.slug === "string" &&
        typeof l.colorway === "string" &&
        Number.isFinite(l.qty),
    );
  } catch {
    /* Private windows throw on access, and a half-written value should
       empty the bag rather than break the page. */
    return [];
  }
}

function write(lines: BagLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* Storage refused. The bag still works for this page view. */
  }
  window.dispatchEvent(new Event("aria-noir:bag"));
}

export function resolve(lines: readonly BagLine[]): ResolvedLine[] {
  return lines.map((line) => {
    const house = allHouses.find((h) => h.slug === line.slug);
    const entry = (CATALOGUE[line.slug] ?? []).find(
      (e) => e.colorway === line.colorway,
    );
    if (house || entry) return { line, house, entry, garment: undefined };

    /* ---- The garment resolves too ----
     *
     * This used to look only at `allHouses` and `CATALOGUE`, so a line for
     * El Patrón came back with no house and no entry: it showed a dash
     * where its price should be, counted zero towards the subtotal, and
     * was dropped on the way to checkout. The bag silently refused to sell
     * one of the two things the shop makes.
     *
     * An `ApparelColourway` already carries everything a `CatalogueEntry`
     * does — the colourway, the handle, the variant id, the price and
     * whether it is in stock — so it is handed over AS one. Every surface
     * that reads `entry.cents` or `entry.variantId` therefore works on a
     * sweater without being told sweaters exist: the subtotal adds up, the
     * checkout has a variant to order, and the out-of-stock line says so.
     *
     * `house` stays undefined, because a garment is not one. `garment`
     * carries the name and the photography instead — see `lineName` and
     * `lineImage`. */
    const garment = apparel.find((a) => a.slug === line.slug);
    const colour = garment?.colourways.find((c) => c.name === line.colorway);
    return {
      line,
      house: undefined,
      entry: colour
        ? {
            colorway: colour.name,
            handle: colour.handle,
            variantId: colour.variantId,
            cents: colour.cents,
            available: colour.available,
          }
        : undefined,
      garment,
    };
  });
}

/* ---- The four read-helpers take less than a bag line ----
 *
 * `Displayable`, not `ResolvedLine`: the held list resolves to the same
 * shape WITHOUT a quantity (nobody saves two of a frame for later), and
 * these four read nothing but the slug, the colour, the size and which
 * kind of product it is. Typing them to the narrower thing lets the bag,
 * the held list and anything later share one set of answers instead of
 * each growing its own name-and-picture logic. */
export type Displayable = {
  line: { slug: string; colorway: string; size?: string };
  house: House | undefined;
  garment: ApparelCollection | undefined;
};

/** What to call a line, whichever kind of product it is. */
export function lineName(r: Displayable) {
  return r.house?.name ?? r.garment?.name ?? r.line.slug;
}

/** The colour, and the size where there is one. */
export function lineMeta(r: Displayable) {
  return r.line.size
    ? `${r.line.colorway} · ${r.line.size}`
    : r.line.colorway;
}

/** The line's photograph: the colourway's own where the shoot has one. */
export function lineImage(r: Displayable) {
  /* The run, never the packshot series — see `runShot`. */
  if (r.garment) return runShot(r.garment, r.line.colorway);
  return undefined;
}

/** Where the line's product lives on this site. */
export function lineHref(r: Displayable) {
  const slug = r.house?.slug ?? r.garment?.slug ?? r.line.slug;
  return `/shop/${slug}?colourway=${encodeURIComponent(r.line.colorway)}`;
}

export function subtotal(resolved: readonly ResolvedLine[]) {
  return resolved.reduce(
    (n, r) => n + (r.entry ? r.entry.cents * r.line.qty : 0),
    0,
  );
}

/* ── The store ───────────────────────────────────────────────────────
   `useSyncExternalStore` rather than state-in-an-effect. localStorage IS
   an external store — it can change from another tab, and React has a
   primitive for exactly that which also solves the server snapshot and
   tearing. Reading it into state inside an effect is the same thing done
   by hand, one render later, and wrong the moment two tabs disagree. */

const EMPTY: BagLine[] = [];

/* Snapshots must be REFERENTIALLY stable or the store re-renders forever:
   `read()` parses fresh objects every call. Cached against the raw string,
   so a new array is minted only when the stored value actually changed. */
let snapshot: BagLine[] = EMPTY;
let snapshotRaw: string | null = null;

function getSnapshot(): BagLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = read();
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  window.addEventListener("aria-noir:bag", onChange);
  /* `storage` fires in the OTHER tabs, which is what keeps two windows of
     the same shop from disagreeing about the bag. */
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("aria-noir:bag", onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noop = () => () => {};

export function useBag() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  /* False on the server and on the hydrating render, true from the first
     client render onward. The bag is UNKNOWN until then, not empty —
     rendering "nothing here" and replacing it a frame later reads as the
     cart losing things. */
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  /* `size` is last and optional on all three, so every existing eyewear
     call site keeps working unchanged. */
  const add = useCallback(
    (slug: string, colorway: string, qty = 1, size?: string) => {
      const next = read();
      const found = next.find((l) => same(l, { slug, colorway, size }));
      if (found) found.qty += qty;
      else next.push(size ? { slug, colorway, size, qty } : { slug, colorway, qty });
      write(next);
    },
    [],
  );

  const setQty = useCallback(
    (slug: string, colorway: string, qty: number, size?: string) => {
      const next = read()
        .map((l) => (same(l, { slug, colorway, size }) ? { ...l, qty } : l))
        .filter((l) => l.qty > 0);
      write(next);
    },
    [],
  );

  const remove = useCallback(
    (slug: string, colorway: string, size?: string) => {
      write(read().filter((l) => !same(l, { slug, colorway, size })));
    },
    [],
  );

  /* After an order is placed. The bag was an intention and the intention
     has been acted on; keeping the lines would make the next visit look
     like the order never happened. */
  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);

  return { lines, resolved: resolve(lines), count, ready, add, setQty, remove, clear };
}
