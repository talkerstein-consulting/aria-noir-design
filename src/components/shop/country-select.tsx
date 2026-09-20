"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, dialCode } from "@/lib/validation";

/**
 * A country picker with a search field and a flag against every row.
 *
 * ---- Why this is not a <select> ----
 *
 * It was one, and a native select is usually the right answer: it is the
 * platform's own control, it is accessible for free, and on a phone it
 * opens the system wheel. What it cannot do is let someone type "por" to
 * reach Portugal, which is the whole point of a list this long. Browsers
 * offer type-ahead on the first letter only, so the twelve countries
 * between Germany and Mexico were a scroll.
 *
 * So this is a combobox, built to the pattern rather than invented: the
 * button carries `aria-haspopup="listbox"` and `aria-expanded`, the list
 * carries `role="listbox"`, each row `role="option"` with `aria-selected`,
 * and the active row is named by `aria-activedescendant` so a screen
 * reader hears the same row the eye is on. Arrow keys move, Enter and
 * Space choose, Escape closes and returns focus to the button, and typing
 * filters. Nothing here asks the reader to learn a new gesture.
 *
 * ---- The flags ----
 *
 * Emoji, derived from the ISO code by offsetting each letter into the
 * regional-indicator block, so there is no image to download, nothing to
 * keep in sync with COUNTRIES, and no flag asset in the repository. They
 * are `aria-hidden`: the country's NAME is the label, and a flag that
 * announced itself would have a screen reader read every row twice.
 * Windows renders these as letter pairs rather than flags, which is why
 * the code is never the only thing distinguishing a row.
 */
const flag = (code: string) =>
  String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((ch) => 0x1f1a5 + ch.charCodeAt(0)),
  );

export function CountrySelect({
  value,
  onChange,
  disabled,
  id,
  /** Show the dialling code beside the name, for a phone field. */
  dial = false,
  /** What the button reads when it is not the visible label of a field. */
  label,
  /** The autofill token for the mirrored native control. A phone's
   *  country is not the address's country, so a dial picker takes
   *  `off` rather than competing for the same fill. */
  autoComplete = "country",
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  id?: string;
  dial?: boolean;
  label?: string;
  autoComplete?: string;
}) {
  const auto = useId();
  const listId = `${id ?? auto}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const button = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().startsWith(q) ||
        /* "+33" and "33" both find France. */
        dialCode(c.code).replace("+", "").startsWith(q.replace("+", "")),
    );
  }, [query]);

  const chosen = COUNTRIES.find((c) => c.code === value);

  /* Opening puts the highlight on the country already chosen, so Enter
     twice is a no-op rather than a change the reader did not ask for.
     Set HERE and not in an effect: the highlight is part of opening, and
     an effect would render the list once on the wrong row and again on
     the right one. */
  const show = () => {
    const at = COUNTRIES.findIndex((c) => c.code === value);
    setActive(at < 0 ? 0 : at);
    setQuery("");
    setOpen(true);
  };

  /* The caret, though, has to wait for the field to exist. */
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  /* The highlight stays in view while the arrows move it. */
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, query]);

  /* A click outside, or focus leaving altogether, closes it. Pointerdown
     rather than click: a mousedown on the page should not have to wait
     for the mouseup to dismiss this. */
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("focusin", away);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("focusin", away);
    };
  }, [open]);

  const choose = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
    button.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      button.current?.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!shown.length) return;
      const here = shown.findIndex((c) => c.code === COUNTRIES[active]?.code);
      const from = here < 0 ? 0 : here;
      const next = e.key === "ArrowDown" ? Math.min(from + 1, shown.length - 1) : Math.max(from - 1, 0);
      setActive(COUNTRIES.findIndex((c) => c.code === shown[next].code));
      return;
    }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      if (!shown.length) return;
      const edge = e.key === "Home" ? shown[0] : shown[shown.length - 1];
      setActive(COUNTRIES.findIndex((c) => c.code === edge.code));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const pick = COUNTRIES[active];
      if (pick && shown.some((c) => c.code === pick.code)) choose(pick.code);
      else if (shown.length === 1) choose(shown[0].code);
    }
  };

  const activeCode = COUNTRIES[active]?.code;

  return (
    <div className="country" ref={root}>
      {/* ---- The browser's own address autofill ----

          A custom combobox is a <button> and a <ul>, and no browser has
          ever filled one. Replacing the native <select> here quietly cost
          this form `autocomplete="country"`, and with it the one-tap fill
          of a whole address from the reader's address book, which is by
          far the fastest way through this step.

          So the native control is still here, off screen and mirrored.
          Autofill writes to it and fires `change`; that is read back into
          the real value. It is `aria-hidden` and out of the tab order so
          a keyboard or screen-reader user meets the combobox and never
          this, and it carries no label of its own for the same reason. */}
      <select
        className="country-autofill"
        autoComplete={autoComplete}
        tabIndex={-1}
        aria-hidden
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        ref={button}
        id={id}
        className="country-button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            show();
          }
        }}
      >
        <span className="country-flag" aria-hidden>
          {chosen ? flag(chosen.code) : ""}
        </span>
        <span className="country-value">
          {dial ? dialCode(value) : (chosen?.name ?? value)}
        </span>
        <ChevronDown className="country-caret" aria-hidden />
      </button>

      {open ? (
        <div className="country-sheet" onKeyDown={onKey}>
          <div className="country-search">
            <Search aria-hidden />
            <input
              ref={field}
              type="text"
              value={query}
              placeholder="Search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search countries"
              aria-controls={listId}
              aria-activedescendant={activeCode ? `${listId}-${activeCode}` : undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                const first = e.target.value.trim() ? 0 : COUNTRIES.findIndex((c) => c.code === value);
                setActive(first < 0 ? 0 : first);
              }}
            />
          </div>

          <ul className="country-list" role="listbox" id={listId} ref={list} aria-label="Countries">
            {shown.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  id={`${listId}-${c.code}`}
                  role="option"
                  aria-selected={c.code === value}
                  data-active={c.code === activeCode}
                  className="country-option"
                  /* The search field keeps the caret; this must not take
                     it away on the way to the click. */
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(COUNTRIES.findIndex((x) => x.code === c.code))}
                  onClick={() => choose(c.code)}
                >
                  <span className="country-flag" aria-hidden>{flag(c.code)}</span>
                  <span className="country-option-name">{c.name}</span>
                  <span className="country-option-code">{dial ? dialCode(c.code) : c.code}</span>
                </button>
              </li>
            ))}
            {shown.length ? null : (
              <li className="country-empty t-caption" role="presentation">
                The house does not send there yet.
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
