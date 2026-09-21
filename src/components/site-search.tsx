"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { GROUPS, NO_RESULT_ROUTES, query, type Hit } from "@/lib/search";
import { CtaLink } from "@/components/cta-link";
import { ProductCard } from "@/components/product-card";

/**
 * The search sheet.
 *
 * ---- Why a sheet and not a results page ----
 *
 * The answers arrive as the reader types, from an index that is already in
 * the bundle, so there is nothing for a /search route to wait for and
 * nothing it could show that is not already on screen. The query stays
 * visible in the field above its own answers, which is the thing a results
 * page is usually for.
 *
 * It is never a dead end: with nothing typed it offers the catalogue, and
 * with a query that matches nothing it says so in words and then offers
 * three routes out rather than an empty box.
 *
 * It is the same object as the menu: `.sheet` / `.sheet-glass` /
 * `.sheet-panel` in commerce.css, so both come down four fifths of the
 * viewport over frosted glass, slide rather than fade, and close on a click
 * outside. Two panels that arrive the same way are one panel the reader has
 * already learned.
 *
 * The sheet is always mounted and hidden with `visibility`, not
 * conditionally rendered: `visibility` is what actually takes it out of
 * hit-testing and out of the accessibility tree, and keeping the element
 * means the field does not remount and lose what was typed when the header
 * re-renders underneath it.
 */
export function SiteSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => query(term), [term]);
  const asked = term.trim().length >= 2;

  /* Focus follows the sheet, both ways. Opening a field nobody is typing
     in is the commonest way a search icon turns into a decoration; and
     leaving focus inside a hidden sheet is how a keyboard reader ends up
     tabbing through a panel that is not on screen. */
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    /* Left open, the last query would greet the next reader as if it were
       theirs. Cleared on the way out rather than on the way in, so the
       closing animation is not a field emptying itself in public. */
    const t = window.setTimeout(() => setTerm(""), 400);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    /* The same lock the menu overlay takes, for the same reason: hiding
       overflow takes the scrollbar's width back, and every fixed element —
       this sheet and the header over it — grows by it unless the gutter is
       reserved. See site-menu. */
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      root.style.scrollbarGutter = prevGutter;
    };
  }, [open, onClose]);

  return (
    <div
      className="sheet"
      data-open={open}
      /* Not `aria-hidden`: `visibility: hidden` already removes it, and
         declaring both is how you end up with an element that is hidden
         from a screen reader while still holding focus. */
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* The page, held under glass, and the way out of here. The sheet
          carries its own Close beside the field as well — a reader who has
          just typed something should not have to aim at the background to
          undo it. */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="sheet-glass"
      />

      <div className="sheet-panel sheet-panel--fixed on-ink">
        <div className="search-inner">
          <div className="search-field">
            <Search aria-hidden />
            <input
              ref={inputRef}
              type="search"
              /* `search` for the keyboard and the clear affordance a phone
                 puts in the field for free; the enter key has nothing to
                 submit to, so there is no form around it. */
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="A frame, a colour, a question"
              aria-label="Search the house"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            <button
              type="button"
              onClick={onClose}
              className="t-eyebrow text-[var(--fg-quiet)] transition-colors hover:text-[var(--fg-primary)]"
            >
              Close
            </button>
          </div>

          <div className="search-results" aria-live="polite">
            {!asked ? (
              <Suggested onGo={onClose} />
            ) : hits.length ? (
              <Answered hits={hits} onGo={onClose} />
            ) : (
              <Empty term={term} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nothing typed yet. The catalogue is small enough to simply offer. */
function Suggested({ onGo }: { onGo: () => void }) {
  const frames = useMemo(() => query("arca"), []);
  return (
    <div className="search-group">
      <p className="t-eyebrow mb-4 text-[var(--fg-quiet)]">The whole house</p>
      <Hits hits={frames.filter((h) => h.kind === "frame")} onGo={onGo} />
      <div className="mt-8">
        <CtaLink href="/eyewear">Browse all frames</CtaLink>
      </div>
    </div>
  );
}

function Answered({
  hits,
  onGo,
}: {
  hits: readonly Hit[];
  onGo: () => void;
}) {
  return (
    <>
      {GROUPS.map(({ kind, title }) => {
        const group = hits.filter((h) => h.kind === kind);
        if (!group.length) return null;
        return (
          <div key={kind} className="search-group">
            <p className="t-eyebrow mb-4 text-[var(--fg-quiet)]">
              {title}
              {/* The count, because a reader who typed two letters wants to
                  know how much of the house answered before they read it. */}
              <span className="ml-3 opacity-60">{group.length}</span>
            </p>
            <Hits hits={group} onGo={onGo} />
          </div>
        );
      })}
    </>
  );
}

/**
 * A group's answers.
 *
 * A product is shown, not described: frames and colourways come back as
 * the same `ProductCard` the eyewear grid and the colourway wall draw, so
 * the picture a reader recognises the acetate by is the thing they are
 * choosing from. Pages have no photograph and stay as rows — a policy
 * given a tile would be the sheet pretending a sentence is merchandise.
 */
function Hits({ hits, onGo }: { hits: readonly Hit[]; onGo: () => void }) {
  const cards = hits.filter((h) => h.card);
  if (!cards.length) {
    return (
      <>
        {hits.map((hit) => (
          <HitRow key={hit.href} hit={hit} onGo={onGo} />
        ))}
      </>
    );
  }
  return (
    /* The click is caught on the way up rather than on each card:
       `ProductCard` is a shared object and giving it an `onClick` for this
       one caller's sake would put the sheet's business inside every grid
       on the site. */
    <div className="search-cards" onClick={onGo}>
      {cards.map((hit) => (
        <ProductCard key={hit.href} {...hit.card!} />
      ))}
    </div>
  );
}

function HitRow({ hit, onGo }: { hit: Hit; onGo: () => void }) {
  return (
    <Link href={hit.href} className="search-hit" onClick={onGo}>
      <span className="t-body">{hit.label}</span>
      <span className="search-hit-note t-caption">{hit.note}</span>
    </Link>
  );
}

/** A miss, said in words, with somewhere to go. */
function Empty({ term }: { term: string }) {
  return (
    <div className="search-group">
      <p className="t-body t-body--lede">
        Nothing in the house answers to &ldquo;{term.trim()}&rdquo;.
      </p>
      <p className="t-body mt-3 max-w-xl text-[var(--fg-tertiary)]">
        The house keeps two frames and fourteen colourways, so the catalogue
        is short enough to read rather than search.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
        {NO_RESULT_ROUTES.map((route) => (
          <CtaLink key={route.href} href={route.href}>
            {route.label}
          </CtaLink>
        ))}
      </div>
    </div>
  );
}
