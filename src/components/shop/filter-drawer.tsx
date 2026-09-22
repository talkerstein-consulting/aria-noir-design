"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { CtaButton } from "@/components/cta-link";

/**
 * Everything that changes what the grid holds, in one drawer.
 *
 * ---- Where it comes from ----
 *
 * The Donuts `FilterDrawer`: one pinned control instead of a toolbar and
 * two chip rows, opening the same kind of drawer the cart does and from
 * the same edge, so the panel arrives from where it was pressed. Radio
 * rows with a tick as the only state mark; counts on every row saying
 * what picking it would leave; a footer that clears, or closes with the
 * number it is about to show.
 *
 * ---- What changed ----
 *
 * The surface is the bag's: `.drawer*` in commerce.css, glass over the
 * page, a panel of ink off the right edge, full height. Rows are
 * hairlines and type, and the tick is the one mark — no fill and no ring,
 * because six filled rows in a column read as six separate controls
 * rather than one list with one answer in it. The footer is the two CTAs
 * the site has: the count is the main one, because closing on a number is
 * the one thing this drawer wants done.
 */

/** One choice in a group: what it says, and how many pieces it would leave. */
export type FilterOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

function Row({
  label,
  count,
  checked,
  onSelect,
  multi = false,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onSelect: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={checked}
      onClick={onSelect}
      className="filter-row"
      data-on={checked || undefined}
    >
      <span className="filter-row-label">{label}</span>
      {count !== undefined ? (
        <span className="filter-row-count font-mono tabular-nums">{count}</span>
      ) : null}
      {/* Always in the layout, only painted when chosen: a tick that
          appears and disappears shifts every label by its own width. */}
      <Check aria-hidden="true" className="filter-row-tick" />
    </button>
  );
}

export function FilterGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <section className="filter-group" role="radiogroup" aria-label={title}>
      <h3 className="t-eyebrow t-eyebrow--quiet">{title}</h3>
      {options.map((option) => (
        <Row
          key={option.id}
          label={option.label}
          count={option.count}
          checked={value === option.id}
          onSelect={() => onChange(option.id)}
        />
      ))}
    </section>
  );
}

export function FilterMulti<T extends string>({
  title,
  options,
  value,
  onToggle,
}: {
  title: string;
  options: readonly FilterOption<T>[];
  value: readonly T[];
  onToggle: (next: T) => void;
}) {
  return (
    <section className="filter-group" role="group" aria-label={title}>
      <h3 className="t-eyebrow t-eyebrow--quiet">{title}</h3>
      {options.map((option) => (
        <Row
          key={option.id}
          label={option.label}
          count={option.count}
          checked={value.includes(option.id)}
          multi
          onSelect={() => onToggle(option.id)}
        />
      ))}
    </section>
  );
}

/**
 * The fold at the foot of the drawer.
 *
 * ---- Why two of the five go under it ----
 *
 * The drawer offered five independent axes at once — Collection, Order,
 * Colour, Kind, Stock — over a catalogue of seven pieces. Five ways to cut
 * seven things is not a filter, it is a decision about which filter to
 * use, put to someone who came to look at glasses.
 *
 * Kind and Stock are the two that earn it least. Kind is already answered
 * by Collection, which is the axis above it and the one that decides what
 * the grid is a list of. Stock is a single toggle wearing a group's
 * clothes. Neither is the reason anyone opened this drawer, so neither
 * should be in the way of the three that are.
 *
 * ---- What it does NOT do ----
 *
 * Hide something that is on. A filter folded away while it is still
 * cutting the grid is the worst object in a shop: the reader sees a short
 * list, finds nothing that explains it, and concludes the house is out of
 * stock. So the fold opens itself whenever anything inside it is active,
 * and `canClear` on the drawer's own foot still counts it.
 */
export function FilterMore({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="filter-more" open={defaultOpen}>
      <summary className="filter-more-head t-eyebrow t-eyebrow--quiet">
        More
      </summary>
      {children}
    </details>
  );
}

export function FilterDrawer({
  open,
  onClose,
  showing,
  canClear,
  onClear,
  children,
}: {
  open: boolean;
  onClose: () => void;
  showing: number;
  canClear: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  /* Escape closes, focus moves in, and the page behind stops scrolling —
     the same three things the bag drawer does, for the same reasons. */
  useEffect(() => {
    if (!open) return;

    panel.current
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      root.style.scrollbarGutter = prevGutter;
    };
  }, [open, onClose]);

  return (
    <div
      className="drawer"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="Filter and sort"
    >
      <button
        type="button"
        aria-label="Close the filters"
        onClick={onClose}
        className="drawer-glass"
      />

      <div ref={panel} className="drawer-panel on-ink">
        <div className="flex items-baseline justify-between px-7 pt-28 pb-6">
          <p className="t-eyebrow">Filter and sort</p>
          <button type="button" onClick={onClose} className="link-quiet t-eyebrow">
            Close
          </button>
        </div>

        {/* `data-lenis-prevent`: the page's smooth scroll would otherwise
            take the wheel and scroll the locked page behind the glass
            instead of the rows. */}
        <div className="drawer-lines px-7" data-lenis-prevent>
          {children}
        </div>

        <div className="hairline flex items-center justify-between gap-4 px-7 py-6">
          <CtaButton kind="secondary" onClick={onClear} disabled={!canClear}>
            Clear
          </CtaButton>
          <CtaButton onClick={onClose}>
            {`Show ${showing} ${showing === 1 ? "piece" : "pieces"}`}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
