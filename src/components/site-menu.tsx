"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { menu } from "@/lib/navigation";
import { CtaLink } from "@/components/cta-link";

/**
 * Full-screen menu overlay.
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
 * Roman numerals are real information: a fixed, ordered set of six, and
 * the numeral says how far down it you are. They hang in a gutter to the
 * left of the centred column rather than sitting inside each item — as a
 * flex sibling a numeral's width would push its word off-centre, and by a
 * different amount for a I than for a VI.
 *
 * Nothing in the stack is underlined. Six rules stacked down the middle of
 * a black page read as a form, not as six invitations — so the items are
 * `bare` CTAs and the wave is the whole affordance. The current page is
 * said in the accent colour instead, which is still the object's own
 * vocabulary and still exactly one of them.
 *
 * There is no Close control in here. Close is the LOWER LINE of the
 * header's Menu button — the same control, lifted — so the header sits
 * above this panel at z-70 rather than being covered by it. That is why
 * the panel opens with header-height padding at the top and nothing in it.
 *
 * The panel rises. Ground, stack and foot all travel upward on open — the
 * same direction the CTA's own glyphs move, so the overlay arrives as one
 * large instance of the gesture it is full of.
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
 * Styling is utilities and inline transitions rather than a class in
 * globals.css: this is the only page-level surface with no shared
 * vocabulary, and keeping it self-contained means the overlay cannot be
 * broken by an edit to a stylesheet it is the sole consumer of. Every
 * value still comes from the token layer.
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
  fontSize: "clamp(1.5rem, 4.6vw, 3rem)",
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

  const panelStyle: CSSProperties = {
    opacity: open ? 1 : 0,
    /* The ground itself rises. Small — this is a lift, not a drawer. */
    transform: open ? "none" : "translateY(1.5rem)",
    visibility: open ? "visible" : "hidden",
    transition: open
      ? "opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), visibility 0s"
      : "opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), visibility 0s linear var(--dur-base)",
  };

  const riseStyle = (i: number): CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? "none" : "translateY(0.8em)",
    transition: `opacity var(--dur-reveal) var(--ease-out) ${i * STEP_MS}ms, transform var(--dur-reveal) var(--ease-out) ${i * STEP_MS}ms`,
  });

  return (
    <div
      ref={panel}
      id="site-menu"
      className="on-ink fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-ink motion-reduce:transform-none motion-reduce:transition-none"
      style={panelStyle}
      /* Boolean, not an empty string: React 19 reads `inert=""` as false,
         which would leave the closed panel focusable. */
      inert={!open}
      aria-hidden={!open}
    >
      {/* px-8 py-6 is the header's own padding, and the empty band at the
          top is the header itself showing through from above — the panel
          reserves its height rather than drawing anything into it. */}
      <div className="flex min-h-full flex-col px-8 py-6">
        <div className="min-h-8" aria-hidden />

        {/* ---- the stack, centred on both axes ---- */}
        <nav
          aria-label="Main"
          className="flex flex-1 flex-col items-center justify-center py-12 sm:py-16"
        >
          {/* Generous vertical air. With the rules gone there is nothing
              between one word and the next but space, so the space has to
              do the separating — and these are the largest CTAs on the
              site, which need room to lift into. */}
          <ul className="flex flex-col items-center gap-10 sm:gap-14">
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
                  <CtaLink
                    href={link.href}
                    onClick={onClose}
                    style={STACK_STYLE}
                    bare
                    /* No rule to hold swept, so "you are here" is the
                       accent colour — the CTA's own hover tone, held. */
                    className={here ? "cta--here" : undefined}
                  >
                    {link.label}
                  </CtaLink>
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
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 motion-reduce:transform-none"
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
