"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CtaLink } from "@/components/cta-link";
import { useSession } from "@/lib/session";
import { announceSession, house } from "@/lib/house-api";
import { useHeld } from "@/lib/held";

/**
 * The desk, as a drawer off the right edge.
 *
 * ---- Why the profile glyph opens something now ----
 *
 * It used to be the one control in the band that simply left: /desk for
 * someone known, /access for a stranger. Beside two glyphs that open a
 * panel and close it again with the same tap, a third that navigates away
 * is the reader learning two rules for one row of icons. It is also the
 * errand least worth a page load — "did that ship", "am I even signed in" —
 * and the drawer answers both without taking the page away.
 *
 * ---- Two states, one panel ----
 *
 * A stranger gets the door: what an account is for here, in a line, and the
 * way through it. Someone known gets the errands — orders, addresses, what
 * this browser is holding, and the way out.
 *
 * What it does NOT do is render an orders table. This origin holds no
 * credential for the account host; orders and addresses live there, and a
 * panel that drew an empty table would be inventing a view it cannot fill.
 * Held is the exception and it is here in full, because held is this
 * browser's own. See docs/COMMERCE-FLOWS.md.
 *
 * Surface, glass and slide are `.drawer*` in commerce.css, shared with the
 * bag. Two drawers off the same edge, arriving the same way: the reader
 * learns the gesture once.
 */
export function DeskDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const { signedIn, set } = useSession();
  const { lines, ready } = useHeld();

  /* Escape closes, focus moves in, the page behind holds still, and the
     scrollbar's gutter stays reserved so nothing under the fixed header
     shifts sideways. The same contract the bag drawer and both sheets
     keep — see bag-drawer for the long version. */
  useEffect(() => {
    if (!open) return;

    panel.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
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

  const heldCount = ready ? lines.length : null;

  return (
    <div
      className="drawer"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="The desk"
    >
      <button
        type="button"
        aria-label="Close the desk"
        onClick={onClose}
        className="drawer-glass"
      />

      <div ref={panel} className="drawer-panel on-ink">
        <div className="flex items-baseline justify-between px-7 pt-28 pb-6">
          <p className="t-eyebrow">{signedIn ? "The Desk" : "Access"}</p>
        </div>

        <div className="drawer-lines px-7">
          {signedIn ? (
            <>
              <p className="t-body t-body--lede">Welcome back.</p>
              <p className="t-body t-body--tight mt-2 text-[var(--fg-tertiary)]">
                Orders, addresses and the card on file are on the desk. What
                this browser is holding is below.
              </p>

              <ul className="mt-10">
                <DeskLine
                  href="/desk"
                  onClick={onClose}
                  label="Orders"
                  note="And their tracking"
                />
                <DeskLine
                  href="/desk#addresses"
                  onClick={onClose}
                  label="Addresses"
                  note=""
                />
                <DeskLine
                  href="/desk#profile"
                  onClick={onClose}
                  label="Details"
                  note=""
                />
                <DeskLine
                  href="/desk#held"
                  onClick={onClose}
                  label="Held"
                  note={
                    heldCount === null
                      ? ""
                      : heldCount
                        ? `${heldCount} saved`
                        : "Nothing saved yet"
                  }
                />
                <DeskLine
                  href="/desk"
                  onClick={onClose}
                  label="Open the full desk"
                  note=""
                />
              </ul>
            </>
          ) : (
            <>
              <p className="t-body t-body--lede">Not signed in.</p>
              <p className="t-body t-body--tight mt-2 text-[var(--fg-tertiary)]">
                An account keeps your orders and addresses. Nothing here needs
                one: the bag and the checkout both work without it.
              </p>

              <CtaLink href="/access" onClick={onClose} className="mt-8">
                Sign in
              </CtaLink>

              <ul className="mt-10">
                <DeskLine
                  href="/access?mode=new"
                  onClick={onClose}
                  label="New here"
                  note="Make an account"
                />
                <DeskLine
                  href="/desk#held"
                  onClick={onClose}
                  label="Held"
                  note={
                    heldCount === null
                      ? ""
                      : heldCount
                        ? `${heldCount} saved`
                        : "Nothing saved yet"
                  }
                />
              </ul>
            </>
          )}
        </div>

        {signedIn ? (
          <div className="border-t border-[var(--fg-rule)] px-7 pt-6 pb-8">
            {/* Ends the house API session — the thing that actually ends —
                and drops the header's hint on the way. */}
            <button
              type="button"
              className="link-quiet link-quiet--micro"
              onClick={async () => {
                await house.logout().catch(() => {});
                announceSession();
                set(false);
                onClose();
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * One errand: a word, a hairline under it, and a quiet note on the right
 * saying where it goes or what it holds. The same list the rest of the shop
 * is built from, at the width a drawer can carry.
 */
function DeskLine({
  href,
  label,
  note,
  external,
  onClick,
}: {
  href: string;
  label: string;
  note: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <span className="flex items-baseline justify-between gap-4">
      <span className="t-caption">{label}</span>
      <span className="t-micro text-[var(--fg-quiet)]">{note}</span>
    </span>
  );

  return (
    <li className="border-b border-[var(--fg-rule)] first:border-t">
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="link-quiet block py-4"
        >
          {body}
        </a>
      ) : (
        <Link href={href} onClick={onClick} className="link-quiet block py-4">
          {body}
        </Link>
      )}
    </li>
  );
}
