"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CATALOGUE, type CatalogueEntry } from "@/lib/catalogue";
import { allHouses, type House } from "@/lib/navigation";

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
  qty: number;
};

/** A bag line joined back to the catalogue. Null where the store no longer
 *  carries the line — a colourway can be withdrawn between the day it was
 *  added and the day the tab is reopened. */
export type ResolvedLine = {
  line: BagLine;
  house: House | undefined;
  entry: CatalogueEntry | undefined;
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
    return { line, house, entry };
  });
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

  const add = useCallback((slug: string, colorway: string, qty = 1) => {
    const next = read();
    const found = next.find(
      (l) => l.slug === slug && l.colorway === colorway,
    );
    if (found) found.qty += qty;
    else next.push({ slug, colorway, qty });
    write(next);
  }, []);

  const setQty = useCallback((slug: string, colorway: string, qty: number) => {
    const next = read()
      .map((l) =>
        l.slug === slug && l.colorway === colorway ? { ...l, qty } : l,
      )
      .filter((l) => l.qty > 0);
    write(next);
  }, []);

  const remove = useCallback((slug: string, colorway: string) => {
    write(read().filter((l) => !(l.slug === slug && l.colorway === colorway)));
  }, []);

  /* After an order is placed. The bag was an intention and the intention
     has been acted on; keeping the lines would make the next visit look
     like the order never happened. */
  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);

  return { lines, resolved: resolve(lines), count, ready, add, setQty, remove, clear };
}
