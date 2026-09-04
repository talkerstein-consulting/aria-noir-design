"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { preorderModal as copy, privateAccess } from "@/lib/content";
import { CtaLink } from "@/components/cta-link";

/**
 * The sign-up for private access, as a modal.
 *
 * ---- Why a modal, here of all places ----
 *
 * The private-access section's CTA used to leave for /contact, which is a
 * page with a form that can take a commission — a longer, heavier
 * conversation than this offer is asking for. The section makes a small
 * ask: leave an address, hear first. Sending someone off the home page to
 * fill in a contact form is answering a small ask with a large one, and it
 * costs the reader the section they were standing in.
 *
 * ---- Why a portal ----
 *
 * This is not a preference, it is the only thing that works. The trigger
 * lives inside PrivateAccessSection, which is a stack of `sticky` and
 * `absolute` layers inside a section with its own height and z-index, and
 * the page's scrubbed film sets `will-change: transform` nearby. Any one
 * of those makes an ancestor a containing block for `position: fixed`, so
 * a dialog rendered in place is positioned against a sticky stage rather
 * than the viewport, and clipped by it. That exact bug cost a day on the
 * buy page's pinned row. So the dialog is rendered into `document.body`,
 * where `fixed` means what it says.
 *
 * ---- The scroll underneath ----
 *
 * Lenis owns the scroll on this page, so `overflow: hidden` alone does not
 * stop it — Lenis writes transforms off its own rAF loop and does not
 * consult the document's overflow. It has to be told. But Lenis is
 * deliberately absent on touch and under reduced motion (see
 * use-smooth-scroll), so the overflow lock has to be there as well for the
 * devices that never had it. Both, every time; neither is sufficient
 * alone.
 */

/** Everything focusable, in DOM order, for the tab cycle. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * ---- Why this takes no `open` prop ----
 *
 * The parent mounts it when it is wanted and unmounts it when it is not,
 * so "open" is the same fact as "exists". That is not a style choice, it
 * is what makes the component honest: an always-mounted dialog holding an
 * `open` flag needs one effect to reset its confirmation state when it
 * closes and another to decide whether it may touch the DOM yet, and both
 * are setState-inside-an-effect, which React's own lint rule refuses on
 * the grounds that they cascade renders. Unmounting resets everything for
 * free, because that is what unmounting is.
 */
export function PreorderModal({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  /** Where focus was before the dialog took it. */
  const returnTo = useRef<HTMLElement | null>(null);
  const [done, setDone] = useState(false);
  const headingId = useId();
  const bodyId = useId();

  /* ---- the scroll underneath, and the focus ---- */
  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement | null;

    const lenis = window.__lenis;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Focused straight from the effect, not out of a rAF callback.
       React attaches refs before effects run and the portal's content is
       already committed, so the input is there to receive it — and a rAF
       would have made this the one piece of the dialog that silently does
       not happen in a background or hidden tab, where the callback never
       fires. The close button is not the target: the reader opened this
       to type. */
    field.current?.focus();

    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      returnTo.current?.focus?.();
    };
  }, []);

  /* ---- Escape, and the tab cycle ---- */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      /* Wrap by hand. A dialog that lets Tab walk out into the page behind
         it is a dialog in name only: the reader is still "in" it visually
         while operating something they cannot see. */
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /* ---- THE INTEGRATION POINT ----
     *
     * Nothing is sent. There is no endpoint on this site yet: every form
     * here — the footer's, the finale's, the contact page's desk — is
     * furniture, and this one is deliberately no more dishonest than its
     * neighbours. What it does NOT do is pretend: the address is read, the
     * panel says it was noted, and that is the whole truth of it.
     *
     * To make it real, POST `data.get("email")` from here. Shopify's
     * customer-create endpoint is the obvious destination, since the
     * catalogue already lives there and a marketing consent flag on a
     * customer record is what "the list" would actually mean. Until then
     * this must not be described to anyone as a working sign-up.
     */
    setDone(true);
  }, []);

  /* A portal needs somewhere to go. This component only ever mounts from a
     click, so `document` is there — the guard is for the case where it is
     rendered from somewhere that has no DOM at all, where returning null
     is the correct answer rather than a crash. */
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      /* `on-ink` is what the field and the CTA read to know their ground —
         see the token notes in interactions.css. */
      className="on-ink fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center sm:p-6"
      onKeyDown={onKeyDown}
    >
      {/* The backdrop is its own element and its own button, so dismissing
          by clicking away is a real control rather than a click handler on
          a div that a keyboard cannot reach. It is aria-hidden because the
          close button below says the same thing to a screen reader. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm motion-safe:animate-[fade-in_var(--dur-instant)_ease]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        className="relative w-full max-w-md border border-[var(--fg-rule)] bg-ink p-8 motion-safe:animate-[panel-in_var(--dur-fast)_var(--ease-out)] sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 font-ui text-[10px] tracking-[0.3em] text-paper/55 uppercase transition-colors hover:text-paper"
        >
          {copy.close}
        </button>

        {done ? (
          <div className="stack stack--sm pt-4">
            <h2 id={headingId} className="t-display-md">
              {copy.done.heading}
            </h2>
            <p id={bodyId} className="t-body t-body--tight mt-2">
              {copy.done.body}
            </p>
          </div>
        ) : (
          <>
            <div className="stack stack--sm pt-4">
              <p className="t-eyebrow">{copy.eyebrow}</p>
              <h2 id={headingId} className="t-display-md">
                {copy.heading}
              </h2>
              <p id={bodyId} className="t-body t-body--tight mt-2">
                {copy.body}
              </p>
            </div>

            <form onSubmit={submit} className="field-row mt-8">
              <label htmlFor="preorder-email" className="sr-only">
                {copy.label}
              </label>
              <input
                ref={field}
                id="preorder-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={copy.label}
                className="field"
              />
              <button
                type="submit"
                aria-label={copy.cta}
                className="field-submit"
              >
                &#8594;
              </button>
            </form>

            <p className="mt-5 font-ui text-xs text-paper/45">{copy.note}</p>

            {/* The other door. A list is not what everyone came for, and
                the contact desk is a real page with a real form. It is
                also what keeps the tab cycle worth trapping. */}
            <div className="mt-7">
              <CtaLink href={privateAccess.href} tone="quiet">
                {copy.alt}
              </CtaLink>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
