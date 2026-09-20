"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { menu } from "@/lib/navigation";
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
 * numerals, desk details, small print — stays in the UI face, so the
 * exception reads as one deliberate voice rather than the panel drifting.
 *
 * Nothing here is italic.
 *
 * Roman numerals are real information: a fixed, ordered set, and the
 * numeral says how far down it you are. They hang in a gutter to the
 * left of the centred column rather than sitting inside each item — as a
 * flex sibling a numeral's width would push its word off-centre, and by a
 * different amount for a I than for a VI.
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

/** Deliberately small and local — the list is six long and fixed. */
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Per-item entrance delay. The token layer's char stagger, so the menu
 *  wave and the CTA's glyph shuffle stay one gesture. */
const STEP_MS = 22;

/** The stack's exception to the CTA's single size and face. Clamped rather
 *  than stepped so the six items always fill the column without a
 *  breakpoint deciding they suddenly shouldn't. */
const STACK_STYLE: CSSProperties = {
  fontFamily: "var(--font-display-stack)",
  /* Sized off the PANEL, not the page. The sheet is 80vh and does not
     scroll, so the four items and their gaps have to fit inside it at any
     viewport height — `vh` in the size is what makes a short window shrink
     the type instead of hiding the last destination. The vw term keeps a
     wide, short window from setting them at footnote scale, and the rem
     bounds stop both terms at a size that is still Bodoni.

     Four destinations rather than seven is most of the ceiling: the same
     80vh divided four ways carries a word half again as large, and the
     tighter gaps below are what stop the extra size being spent on air. */
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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

        {/* ---- the stack, centred on both axes ---- */}
        <nav
          aria-label="Main"
          /* Left on a phone, centred from `sm` up. A centred stack needs
             the eye to find a new starting point on every line, which is
             what a display face is FOR on a wide screen and what it costs
             on a narrow one — five ragged-both-sides words in a 375px
             column read as a poster rather than a list of places to go. A
             left edge gives the thumb one column to travel and the numerals
             a straight rule to hang off. */
          className="flex flex-1 flex-col items-start justify-center gap-[min(2vh,2.5rem)] py-[min(2vh,2.5rem)] sm:items-center"
        >
          {/* Generous vertical air. With the rules gone there is nothing
              between one word and the next but space, so the space has to
              do the separating — and these are the largest CTAs on the
              site, which need room to lift into. */}
          {/* The left padding is the numerals' gutter. They hang outside
              the word, so a stack flush to the panel's own padding would
              hang them off the edge of the screen; from `sm` the stack is
              centred and there is nothing to reserve. */}
          <ul className="flex flex-col items-start gap-[min(1.6vh,1.5rem)] pl-7 sm:items-center sm:pl-0">
            {menu.primary.map((link, i) => {
              const here = pathname === link.href;
              return (
                <li
                  key={link.href}
                  className="relative motion-reduce:transform-none"
                  style={riseStyle(i)}
                >
                  <span
                    aria-hidden
                    className="t-micro absolute top-[0.55em] right-full mr-3 tabular-nums sm:mr-5"
                  >
                    {NUMERALS[i]}
                  </span>
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

        {/* ---- the foot: one centred line of small print ----
            The desk column that used to sit on the left is gone. Contact is
            already the sixth destination in the stack above it, set at
            display size — repeating the address underneath in label type
            was the menu answering a question it had just answered, and it
            pulled the whole foot off-centre for the privilege.

            What is left is genuinely small print: the pages people go
            looking for rather than browse into, centred under the stack and
            separated by dots. The dots are what stop six short words in a
            row from reading as one sentence, and they are `aria-hidden`
            because they are punctuation for the eye only. */}
        <ul
          /* The small print follows the stack: flush left under it on a
             phone, centred under it above. */
          className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2 motion-reduce:transform-none sm:justify-center"
          style={riseStyle(menu.primary.length)}
        >
          {menu.secondary.map((link, i) => (
            <Fragment key={link.href}>
              {i > 0 ? (
                <li aria-hidden className="link-quiet link-quiet--micro">
                  ·
                </li>
              ) : null}
              <li>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="link-quiet link-quiet--micro"
                >
                  {link.label}
                </Link>
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
