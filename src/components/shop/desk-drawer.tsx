"use client";

import { useEffect, useRef } from "react";
import { Bookmark, UserRoundPlus } from "lucide-react";
import { CtaLink } from "@/components/cta-link";
import { VIEWS } from "@/components/shop/desk-view";
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
  /* One hairline's worth of nothing until the store is ready, never the
     empty state: a "Nothing saved yet" that becomes "3 saved" a frame
     later reads as the shop finding things it had lost. STYLE-GUIDE 10. */
  const heldNote =
    heldCount === null ? "" : heldCount ? `${heldCount} saved` : "Nothing saved yet";

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

        {/* `data-lenis-prevent`: the page's own smooth scroll captures the
            wheel document-wide, so without this the panel simply does not
            scroll — the list is clipped at the fold and the wheel moves the
            page behind the glass instead. The filter drawer has carried
            this since it was built; these two did not, which is why a bag
            with more lines than fit could not be reached. */}
        <div className="drawer-lines px-7 pb-10" data-lenis-prevent>
          {signedIn ? (
            <>
              <p className="t-body t-body--lede">Welcome back.</p>
              <p className="t-body t-body--tight mt-2 text-[var(--fg-tertiary)]">
                Orders, addresses and the card on file are on the desk. What
                this browser is holding is below.
              </p>

              {/* Read from the desk's own VIEWS rather than restated.
                  This list used to be four rows written by hand, and the
                  desk has five rooms: Payment was missing, although the
                  line above this one promises the card on file. It also
                  ended with "Open the full desk", which went to the same
                  place as Orders and so was the same row twice. */}
              <ul className="desk-rooms mt-10">
                {VIEWS.map(({ id, label, Icon }) => (
                  <DeskRoom
                    key={id}
                    href={id === "orders" ? "/desk" : `/desk#${id}`}
                    onClick={onClose}
                    label={label}
                    Icon={Icon}
                    note={id === "held" ? heldNote : ""}
                  />
                ))}
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

              <ul className="desk-rooms mt-10">
                <DeskRoom
                  href="/access?mode=new"
                  onClick={onClose}
                  label="New here"
                  Icon={UserRoundPlus}
                  note="Make an account"
                />
                <DeskRoom
                  href="/desk#held"
                  onClick={onClose}
                  label="Held"
                  Icon={Bookmark}
                  note={heldNote}
                />
              </ul>
            </>
          )}
        </div>

        {signedIn ? (
          <div className="border-t border-[var(--fg-rule)] px-7 pt-6 pb-8">
            {/* Ends the house API session — the thing that actually ends —
                and drops the header's hint on the way.

                Not a CTA at either weight: signing out is the one control
                in the drawer nobody came here to press, and an outlined
                box under five outlined rooms reads as a sixth room. It is
                `link-quiet` at eyebrow scale — the same quiet word the
                filter drawer closes with — so the boxes above it stay the
                things being offered. */}
            <button
              type="button"
              className="link-quiet t-eyebrow"
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
 * One room of the desk, as the site's own CTA at its second weight.
 *
 * It used to be a hairline row: a glyph, a word in caption type, a quiet
 * note pushed to the right edge, and `link-quiet` underneath the lot. That
 * made the drawer's list a fourth interactive object — not a CTA, not a
 * nav link, not a field — and it was the only place on the site where the
 * way into a room looked like that.
 *
 * So the row kept its anatomy and changed its object: the glyph, the
 * label and the note are exactly where they were, inside the standard
 * outlined box, with the states and the glyph shuffle every other CTA
 * has. The desk's own subnav goes to these same five rooms and is built
 * from the same box.
 */
function DeskRoom({
  href,
  label,
  note,
  Icon,
  onClick,
}: {
  href: string;
  label: string;
  note: string;
  /** The desk's own glyph for this room, so the drawer and the desk
   *  name it the same way twice. Chrome weight, per STYLE-GUIDE 4. */
  Icon?: typeof Bookmark;
  onClick?: () => void;
}) {
  return (
    <li>
      <CtaLink
        href={href}
        onClick={onClick}
        kind="secondary"
        icon={Icon ? <Icon /> : undefined}
        trailing={note || undefined}
      >
        {label}
      </CtaLink>
    </li>
  );
}
