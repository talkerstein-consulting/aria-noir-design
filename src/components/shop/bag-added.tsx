"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { ShoppingBag, X } from "lucide-react";
import type { House } from "@/lib/navigation";
import {
  formatPrice,
  galleryFor,
  plateRatio,
  priceOf,
  swatchFor,
} from "@/lib/shop";
import { subtotal, useBag } from "@/lib/cart";
import { CtaButton, CtaLink } from "@/components/cta-link";

/**
 * What the reader sees the moment something goes in the bag.
 *
 * ---- What it is for ----
 *
 * One question, answered: did that take, and did it take the right thing.
 * A person who has just spent two minutes turning a frame and choosing an
 * acetate needs to see THAT acetate, by name, with a photograph of it, or
 * the click was an act of faith. Everything here exists to answer that and
 * then get out of the way.
 *
 * ---- What is deliberately not here ----
 *
 * No "you might also like". No free-shipping threshold, no countdown, no
 * discount prompt, no "only two left". The house does not ask, and a
 * confirmation that immediately starts selling again tells the reader the
 * first sale was never the point. See COPY.md.
 *
 * No auto-dismiss either. A sheet that leaves on its own leaves a person
 * wondering what it said, which is the same doubt this screen exists to
 * settle. It goes when it is sent away.
 *
 * ---- Two ways out, and they are not equal ----
 *
 * Checkout is the offer. Explore more is the way back to exactly where
 * they were, same page, same scroll, same colourway still selected, which
 * is why this is a sheet over the page rather than a route: a confirmation
 * that navigates has thrown away the state the reader built.
 *
 * Where the store no longer carries a single sellable line, the sheet
 * offers the bag instead, which is the surface that can actually show
 * which line is the problem.
 */
export function BagAdded({
  house,
  colorway,
  qty,
  onClose,
}: {
  house: House;
  colorway: string;
  qty: number;
  onClose: () => void;
}) {
  const { resolved, count } = useBag();
  const panel = useRef<HTMLDivElement>(null);
  /* Where the focus was when this opened, so it can be put back. Losing
     focus to the top of the document on close is how a keyboard reader
     gets sent back to the start of a page they were halfway down. */
  const opener = useRef<HTMLElement | null>(null);

  const shot = galleryFor(house, colorway)[0];
  const acetate = swatchFor(colorway);
  const total = subtotal(resolved);
  /* Whether there is anything to check out — the same test the permalink
     used to make, kept because the answer still decides which of the two
     CTAs below is shown. A bag whose every line has gone out of the
     workshop should offer the bag, not a checkout with nothing in it. */
  const sellable = resolved.some((r) => r.entry?.available);

  const close = useCallback(() => {
    onClose();
    opener.current?.focus?.();
  }, [onClose]);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    /* The page behind does not scroll while this is up. Lenis is driving
       that scroll, so the class is what stops it rather than a style on
       the body — see `.bag-added-open` in commerce.css. */
    document.documentElement.classList.add("bag-added-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("bag-added-open");
    };
  }, [close]);

  return (
    <div
      className="bag-added"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-added-title"
    >
      {/* The scrim is the dismiss target as well as the ground. A sheet
          with no way out but a button is a sheet people feel trapped by. */}
      <button
        type="button"
        className="bag-added-scrim"
        aria-label="Close"
        onClick={close}
      />

      <div className="bag-added-panel on-ink" ref={panel} tabIndex={-1}>
        {/* The way out, drawn where a reader looks for it. The scrim and
            Escape already close this; a sheet still needs a visible exit,
            because neither of those two is a thing anyone can see. Same
            glyph box as the header's controls — this band has one icon
            language and there is no reason for a second. */}
        <button
          type="button"
          className="nav-icon bag-added-close"
          aria-label="Close"
          onClick={close}
        >
          <X aria-hidden />
        </button>

        {/* ---- the proof ---- */}
        <div
          className="bag-added-shot"
          /* The box takes the PLATE's ratio rather than forcing 16:9 on
             it. Four of the six houses lead with a portrait plate, and a
             portrait plate in a landscape box on `contain` was a narrow
             photograph between two bars of acetate colour. Measured at
             author time, so nothing jumps when the picture lands. */
          style={{
            background: acetate,
            aspectRatio: shot ? (plateRatio(shot) ?? 16 / 9) : 16 / 9,
          }}
        >
          {shot ? (
            <Image
              src={shot}
              alt={`${house.name} in ${colorway}`}
              fill
              sizes="(min-width: 640px) 22rem, 40vw"
              /* Contain, like the rest of the buy page: this is the shot
                 that proves which colour was taken, and a crop is the one
                 thing that could make it prove the wrong one. */
              className="object-contain"
            />
          ) : null}
        </div>

        {/* ---- what it is ---- */}
        <div className="bag-added-body">
          <p className="t-eyebrow">In the bag</p>
          {/* Sized to the column it is in, not to the page. At the page's
              display size a nine-letter name is wider than the 300px this
              column has, and a single word cannot wrap — it pushed the
              column out of the panel and the prices out of view. See
              .bag-added-title. */}
          <h2 id="bag-added-title" className="t-display-md bag-added-title mt-3">
            {house.name}
          </h2>
          <p className="buy-colourway mt-2">{colorway}</p>

          <dl className="bag-added-rows hairline mt-6 pt-6">
            <div>
              <dt className="t-label">Quantity</dt>
              <dd className="t-body tabular-nums">{qty}</dd>
            </div>
            <div>
              <dt className="t-label">This piece</dt>
              <dd className="t-body tabular-nums">{priceOf(house, colorway)}</dd>
            </div>
            {/* Where the bag now stands, so the reader knows without
                opening it. It is the whole bag, not this line: someone on
                their third frame is owed the running total. */}
            <div>
              <dt className="t-label">
                The bag{count > qty ? `, ${count} pieces` : ""}
              </dt>
              <dd className="t-body tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>

        </div>

        {/* ---- the ways on, across the whole sheet ----

            A child of the PANEL rather than of the body column beside the
            photograph. The panel is capped at 46rem and the plate holds
            20rem of that, so the body column is about 306px at every
            width — three controls abreast never fit in it, at any screen
            size. Spanning both columns is what lets the row be a row. */}
        <div className="bag-added-actions hairline">
          {sellable ? (
            <CtaLink href="/checkout">Checkout</CtaLink>
          ) : (
            <CtaLink href="/bag">Open the bag</CtaLink>
          )}
          {/* Outlined, not quiet: it is the likelier of the two choices,
              and the reader should not have to hunt below the fold of a
              sheet for the way back to the page they were on. One filled
              and one outlined is the house's pair. */}
          <CtaButton kind="secondary" onClick={close}>
            Explore more
          </CtaButton>

          {/* The bag itself, as the glyph the header already uses for it.
              It was a word sitting beside two other words, and three
              labels in a row made the reader read all three to find the
              one that was not a decision. */}
          <Link
            href="/bag"
            className="nav-icon bag-added-bag"
            aria-label="View the bag"
          >
            <ShoppingBag aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
