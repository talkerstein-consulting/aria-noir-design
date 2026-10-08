"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * The sort dropdown, in the house's own clothes rather than the browser's.
 *
 * A button that says what the grid is sorted by, and a list that drops
 * under it: Figtree labels, a tick on the current one, square corners, no
 * stroke, a soft shadow. Keyboard: Enter/Space/ArrowDown open it, arrows
 * move, Enter picks, Escape closes and returns focus to the button.
 */
export function SortMenu<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const current = options.find((o) => o.id === value) ?? options[0];

  /* Close on a click anywhere else. */
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);

  /* Focus follows the active option while open. */
  useEffect(() => {
    if (open) items.current[active]?.focus();
  }, [open, active]);

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].id);
    setOpen(false);
    button.current?.focus();
  };

  return (
    <div ref={root} className="sort-menu" data-open={open || undefined}>
      <button
        ref={button}
        type="button"
        className="shop-tool"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openAt(Math.max(0, options.indexOf(current))))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openAt(Math.max(0, options.indexOf(current)));
          }
        }}
      >
        <span className="hidden opacity-60 sm:inline">Sort by</span>
        <span>{current.label}</span>
        <ChevronDown aria-hidden="true" className="sort-menu-chevron" />
      </button>

      <div
        id={listId}
        role="listbox"
        aria-label="Sort by"
        className="sort-menu-list"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            button.current?.focus();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(options.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Tab") {
            setOpen(false);
          }
        }}
      >
        {options.map((o, i) => (
          <button
            key={o.id}
            ref={(el) => {
              items.current[i] = el;
            }}
            type="button"
            role="option"
            aria-selected={o.id === value}
            tabIndex={open ? 0 : -1}
            className="sort-menu-item"
            onClick={() => pick(i)}
          >
            <span>{o.label}</span>
            <Check aria-hidden="true" className="sort-menu-tick" />
          </button>
        ))}
      </div>
    </div>
  );
}
