"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CATALOGUE, type CatalogueEntry } from "@/lib/catalogue";
import { allHouses, type House } from "@/lib/navigation";

/**
 * What the reader is holding on to without having bought it.
 *
 * ---- Why this is a separate store from the bag ----
 *
 * They answer different questions. The bag is "I am buying this", and it
 * has a quantity and a checkout at the end of it. This is "do not let me
 * lose sight of this", and a quantity would be nonsense on it — nobody
 * saves two of a frame for later. Sharing one store would mean every line
 * carrying a flag saying which kind of line it is, and every read filtering
 * on it. Two keys is cheaper and says what it means.
 *
 * The mechanism is the bag's, deliberately: same localStorage key shape,
 * same `useSyncExternalStore` subscription, same cross-tab event. See
 * lib/cart for why that primitive rather than state-in-an-effect.
 *
 * ---- What this is not ----
 *
 * It is not synced to an account. The list lives in this browser, and the
 * page says so, because a "saved" list that silently fails to follow you to
 * your phone is worse than one that never claimed to. When the account host
 * can hold it, `useHeld` is the seam: its shape does not change.
 */

const KEY = "aria-noir:held";

export type HeldLine = { slug: string; colorway: string };

export type ResolvedHeld = {
  line: HeldLine;
  house: House | undefined;
  entry: CatalogueEntry | undefined;
};

function read(): HeldLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l && typeof l.slug === "string" && typeof l.colorway === "string",
    );
  } catch {
    /* A held list that cannot be parsed empties rather than breaks the
       page it is drawn on. */
    return [];
  }
}

function write(lines: HeldLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* Private mode, or a full quota. The heart will not stick, and that is
       a better outcome than a thrown error on a product page. */
  }
  window.dispatchEvent(new Event("aria-noir:held"));
}

export function resolveHeld(lines: readonly HeldLine[]): ResolvedHeld[] {
  return lines.map((line) => ({
    line,
    house: allHouses.find((h) => h.slug === line.slug),
    entry: (CATALOGUE[line.slug] ?? []).find(
      (e) => e.colorway === line.colorway,
    ),
  }));
}

const EMPTY: HeldLine[] = [];

/* Cached against the raw string, so a new array is minted only when the
   stored value actually changed — otherwise every render is a new identity
   and `useSyncExternalStore` loops. */
let snapshot: HeldLine[] = EMPTY;
let snapshotRaw: string | null = null;

function getSnapshot(): HeldLine[] {
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
  window.addEventListener("aria-noir:held", onChange);
  /* Another tab of the same shop must not disagree about what is held. */
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("aria-noir:held", onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noop = () => () => {};

export function useHeld() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  /* Before mount the list is UNKNOWN, not empty. Rendering "nothing saved"
     and replacing it a frame later reads as the house losing things. */
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const toggle = useCallback((slug: string, colorway: string) => {
    const next = read();
    const at = next.findIndex(
      (l) => l.slug === slug && l.colorway === colorway,
    );
    if (at >= 0) next.splice(at, 1);
    else next.unshift({ slug, colorway });
    write(next);
  }, []);

  const remove = useCallback((slug: string, colorway: string) => {
    write(
      read().filter((l) => !(l.slug === slug && l.colorway === colorway)),
    );
  }, []);

  const holds = useCallback(
    (slug: string, colorway: string) =>
      lines.some((l) => l.slug === slug && l.colorway === colorway),
    [lines],
  );

  return {
    lines,
    resolved: resolveHeld(lines),
    ready,
    count: lines.length,
    toggle,
    remove,
    holds,
  };
}
