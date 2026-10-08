"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { menu } from "@/lib/navigation";
import { Search, UserRound, X } from "lucide-react";
import { NO_RESULT_ROUTES, query } from "@/lib/search";
import { NavShuffleLink } from "@/components/cta-link";

/**
 * The menu sheet: four fifths of the viewport, dropped from the top, with
 * the rest of the page left visible under frosted glass beneath it.
 *
 * One centred stack of destinations, each one a CTA rather than a link.
 * That is the whole design: the site has three interactive objects, and a
 * menu entry is the most primary action there is — so it gets the primary
 * object, at the size the page can carry. Every item is a spaced serif cap
 * over a hairline, and on hover the gold rule sweeps left to right while
 * the glyphs lift and swap a beat apart. The wave was already the house's
 * one gesture; here it runs six times over.
 *
 * The stack is set in the DISPLAY face, at the CTA's tracking and case.
 * The CTA is normally a UI-face object, and this is the one place it is
 * not: at menu scale these words are the panel's only typography, and
 * Bodoni caps are what the house sounds like. Everything around them —
 * desk details, small print — stays in the UI face, so the
 * exception reads as one deliberate voice rather than the panel drifting.
 *
 * Nothing here is italic.
 *
 * Nothing in the stack is a CTA. The CTA vocabulary is two styles — filled
 * and outlined — and six filled blocks stacked down the middle of a black
 * page is a form, not a menu. These are `.menu-link`: the house's glyph
 * shuffle and nothing else, with the current page said in the accent colour
 * via `aria-current="page"`.
 *
 * There is no Close control drawn in here. Close is the LOWER LINE of the
 * header's Menu button, or a click on the glass below the sheet — the same control, lifted — so the header sits
 * above this panel at z-70 rather than being covered by it. That is why
 * the panel opens with header-height padding at the top and nothing in it.
 *
 * The sheet slides down from above the top edge and goes back up the same
 * way. Inside it, the stack and foot still rise a beat behind — the same
 * direction the CTA's own glyphs move, so the contents settle into a panel
 * that has already arrived rather than travelling with it.
 *
 * Sits at z-60, above the header's z-50, so it carries its own close
 * control rather than leaving the header showing through. Covering the
 * header is also what keeps the tone probe honest: it samples
 * `.on-paper` / `.on-ink` under the header band, and a header floating
 * over an overlay would keep reporting the ground of the page behind it.
 *
 * The panel is always mounted, so the links stay in the DOM for crawlers
 * and the transition has something to animate. `inert` plus `visibility`
 * take it out of the tab order and the a11y tree when closed, which
 * `pointer-events: none` alone would not do, and `visibility` is why the
 * closed state can be transitioned at all — `display: none` has nothing to
 * animate from. Its transition is un-eased and delayed to the end of the
 * close, so the panel finishes leaving before it stops existing.
 *
 * The panel itself — its 80vh, its slide, its glass and the delayed
 * `visibility` that lets a closed sheet still be transitioned — is
 * `.sheet` / `.sheet-glass` / `.sheet-panel` in commerce.css, shared with
 * the search sheet so the two arrive and leave identically. What stays
 * inline here is only what is this menu's own: the stack's fluid size and
 * the per-item entrance stagger, neither of which search has any use for.
 */

/** Per-item entrance delay. The token layer's char stagger, so the menu
 *  wave and the CTA's glyph shuffle stay one gesture. */
const STEP_MS = 22;

/** The stack's exception to the CTA's single size and face. Clamped rather
 *  than stepped so the six items always fill the column without a
 *  breakpoint deciding they suddenly shouldn't. */
const STACK_STYLE: CSSProperties = {
  fontFamily: "var(--font-display-stack)",
  /* Sized off the PANEL, not the page. The sheet is 80vh and does not
     scroll, so the six items and their gaps have to fit inside it at any
     viewport height — `vh` in the size is what makes a short window shrink
     the type instead of hiding the last destination. The vw term keeps a
     wide, short window from setting them at footnote scale, and the rem
     bounds stop both terms at a size that is still Bodoni.

     Six destinations rather than seven is part of the ceiling: fewer
     lines in the same 80vh carry a larger word, and the tighter gaps
     below are what stop the extra size being spent on air. */
  fontSize: "clamp(1.35rem, min(6.4vw, 7.4vh), 4rem)",
  /* Stated, not inherited. At this size the body's line-height would set
     the items nearly two words apart, and the gap below is doing that job
     — but it has to be the ONLY thing doing it, or tightening the stack
     pulls the glyphs into each other instead of the words together. */
  lineHeight: 1.04,
  fontWeight: 400,
};

export function SiteMenu({
  open,
  onClose,
  onSearch,
  onAccount,
}: {
  open: boolean;
  onClose: () => void;
  /* Phones only: the bar keeps just the bag, so search and the account
     are reached from here. */
  onSearch?: () => void;
  onAccount?: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* ---- phone: search in place ----
     The search bar at the top of the panel turns into the field itself
     rather than handing over to the search sheet: the destinations step
     aside and text results take their place, no image previews. Closing
     the menu resets it. */
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => query(q), [q]);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setSearching(false);
      setQ("");
    }
  }
  const startSearch = () => {
    setSearching(true);
    /* Focus inside the tap, so iOS raises the keyboard. */
    field.current?.focus();
  };
  const stopSearch = () => {
    setSearching(false);
    setQ("");
  };

  /* Escape closes; focus moves into the panel on open; the page behind
     stops scrolling. Lenis drives real document scroll, so locking the
     documentElement is what actually holds it. */
  useEffect(() => {
    if (!open) return;

    /* Focus the first destination. The close control is the header's own
       button, which is outside this element and stays reachable — the trap
       below deliberately does not include it, since Escape and a click on
       the same corner both already close the panel. */
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.scrollbarGutter;

    /* Reserving the gutter is not cosmetic. Hiding overflow removes the
       scrollbar, the viewport gets that width back, and every fixed
       element — this panel and the header underneath it — grows by it. The
       visible symptom was Close landing ten pixels off the spot Menu had
       just been on, and the whole page shifting sideways behind the
       overlay. `stable` keeps the space whether or not a bar is drawn in
       it, so nothing reflows in either direction. */
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      /* Trap: with the rest of the page still rendered underneath, Tab
         would otherwise walk out of the overlay into content the reader
         cannot see. */
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      root.style.scrollbarGutter = prevGutter;
    };
  }, [open, onClose]);

  /* The items rise in on open. On close they do NOT play in reverse: the
     sheet is sliding up and taking them with it, and a stack dissolving
     inside a panel that is already leaving reads as two exits for one
     gesture. Instead they hold, and snap back to their start state at the
     exact moment the overlay goes invisible — so the reset is never seen
     and the next open has something to rise from. */
  const riseStyle = (i: number): CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? "none" : "translateY(0.8em)",
    transition: open
      ? `opacity var(--dur-reveal) var(--ease-out) ${i * STEP_MS}ms, transform var(--dur-reveal) var(--ease-out) ${i * STEP_MS}ms`
      : "opacity 0s linear var(--dur-base), transform 0s linear var(--dur-base)",
  });

  return (
    <div
      ref={panel}
      id="site-menu"
      className="sheet"
      data-open={open}
      /* Boolean, not an empty string: React 19 reads `inert=""` as false,
         which would leave the closed panel focusable. */
      inert={!open}
      aria-hidden={!open}
    >
      {/* The rest of the page, held under glass, and also the close
          control: a click anywhere off the sheet dismisses it, the same as
          Escape and the same as the header's own control. */}
      <button
        type="button"
        aria-label={menu.close}
        onClick={onClose}
        className="sheet-glass"
      />

      {/* The padding mirrors the header's own, step for step, and the empty band at the
          top is the header itself showing through from above — the panel
          reserves its height rather than drawing anything into it.

          Nothing in here is set at a fixed size: the stack, its gaps and
          the padding are all fluid in `vh`, so a short window shrinks the
          menu rather than pushing the small print off the bottom of it.
          The panel's own overflow is the safety net under that, for the
          landscape phone where no type size would fit. */}
      <div className="sheet-panel on-ink px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6">
        <div className="min-h-8" aria-hidden />

        {/* ---- phone: search first ----
            Jakob's law: a phone menu opens on its search field. A full-width,
            48px-tall bar is also the largest target in the panel (Fitts),
            set where the eye lands first. It opens the search sheet. */}
        {onSearch ? (
          <div
            className="search-box mt-6 sm:hidden"
            data-active={searching}
            style={riseStyle(0)}
            onClick={() => !searching && startSearch()}
          >
            <Search aria-hidden size={18} strokeWidth={1.5} className="shrink-0" />
            <input
              ref={field}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearching(true)}
              onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), stopSearch())}
              placeholder={searching ? "Frame, colour or page" : "Search frames, pages"}
              aria-label="Search"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent font-ui text-sm text-paper outline-none placeholder:text-[var(--fg-quiet)]"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                stopSearch();
              }}
              aria-label="Cancel search"
              tabIndex={searching ? 0 : -1}
              className="search-box-cancel"
            >
              <X aria-hidden size={18} strokeWidth={1.5} />
            </button>
          </div>
        ) : null}

        {searching ? (
          <div className="search-results mt-4 flex-1 overflow-y-auto sm:hidden" aria-live="polite">
            {q.trim().length < 2 ? (
              <p className="t-micro py-3 text-[var(--fg-quiet)]">Type two letters or more.</p>
            ) : hits.length ? (
              <ul>
                {hits.map((h) => (
                  <li key={h.href + h.label}>
                    <Link
                      href={h.href}
                      onClick={onClose}
                      className="flex min-h-12 items-center justify-between gap-4 border-b border-[var(--fg-rule)] py-3"
                    >
                      <span className="font-display text-lg text-paper">{h.label}</span>
                      <span className="t-micro shrink-0 text-[var(--fg-quiet)]">{h.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-3">
                <p className="t-micro text-[var(--fg-quiet)]">Nothing by that name. Try:</p>
                <ul className="mt-2">
                  {NO_RESULT_ROUTES.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} onClick={onClose} className="flex min-h-12 items-center border-b border-[var(--fg-rule)] font-display text-lg text-paper">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* ---- the stack, centred on both axes ---- */}
        <nav
          aria-label="Main"
          data-hidden-mobile={searching || undefined}
          /* Left on a phone, centred from `sm` up. A centred stack needs
             the eye to find a new starting point on every line, which is
             what a display face is FOR on a wide screen and what it costs
             on a narrow one — five ragged-both-sides words in a 375px
             column read as a poster rather than a list of places to go. A
             left edge gives the thumb one column to travel. */
          className="flex flex-1 flex-col items-start justify-center gap-[min(2vh,2.5rem)] py-[min(2vh,2.5rem)] sm:items-center"
        >
          {/* Generous vertical air. With the rules gone there is nothing
              between one word and the next but space, so the space has to
              do the separating — and these are the largest CTAs on the
              site, which need room to lift into. */}
          {/* On a phone each destination is a full-width row at least 48px
              tall, so the whole line is the target, not just the word. */}
          <ul className="flex w-full flex-col items-stretch gap-[min(1.6vh,1.5rem)] max-sm:gap-1 sm:w-auto sm:items-center">
            {menu.primary.map((link, i) => {
              const here = pathname === link.href;
              return (
                <li
                  key={link.href}
                  className="relative flex min-h-12 items-center motion-reduce:transform-none sm:block sm:min-h-0"
                  style={riseStyle(i)}
                >
                  <NavShuffleLink
                    href={link.href}
                    onClick={onClose}
                    style={STACK_STYLE}
                    current={here}
                    /* Apparel, Best Sellers and Blog & Press are still
                       on the storefront. The link already knows what to do
                       with an off-origin destination: a plain anchor in a
                       new tab, since next/link has nothing to prefetch on
                       another host. */
                    external={link.external}
                  >
                    {link.label}
                  </NavShuffleLink>
                </li>
              );
            })}
          </ul>

        </nav>

        {/* ---- phone: the account, in the thumb zone ----
            The bottom of the panel is the easiest reach for one hand, and
            the last item is the second one remembered (serial position).
            Full width and 48px tall, the secondary CTA shape. */}
        {onAccount ? (
          <div
            className={`mt-6 border-t border-[var(--fg-rule)] pt-5 pb-3 sm:hidden ${searching ? "hidden" : ""}`}
            style={riseStyle(menu.primary.length)}
          >
            <button
              type="button"
              onClick={onAccount}
              className="flex min-h-12 w-full items-center justify-center gap-3 border border-paper/40 font-ui text-xs tracking-[0.25em] text-paper uppercase transition-colors hover:border-paper focus-visible:outline focus-visible:outline-1 focus-visible:outline-paper"
            >
              <UserRound aria-hidden size={18} strokeWidth={1.5} />
              Sign in / Account
            </button>
          </div>
        ) : null}

        {/* The small print (care, policies) used to sit under the stack.
            It lives in the footer, where readers look for it, so the
            menu is the six destinations and nothing else. */}
      </div>
    </div>
  );
}
