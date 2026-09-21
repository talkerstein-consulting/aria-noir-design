"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { CtaLink } from "@/components/cta-link";
import { addressLine } from "@/components/shop/address-form";
import { AccessForm } from "@/components/shop/access-form";
import type { Address } from "@/lib/house-api";
import { formatPrice } from "@/lib/shop";
import { LineCard } from "@/components/shop/line-card";
import { allHouses } from "@/lib/navigation";
import { countryName } from "@/lib/validation";

/**
 * The confirmation.
 *
 * Everything the Donuts success screen said and everything docs/COMMERCE-
 * FLOWS.md said the host still owed: the order number, the lines, the
 * total, the address, the estimate, the payment summary, a tracking path,
 * a support path, and a way back into the site. And, for a guest, the one
 * offer this page is the right moment for: an account, made from the
 * details the order already has, so the order can be found again.
 *
 * Read once from sessionStorage, where the checkout left it. A reload
 * still shows it; a second tab, or a visit a day later, gets the honest
 * fallback rather than someone else's order.
 */

type Confirmed = {
  id: string;
  total: number;
  currency: string;
  lines: { name: string; slug?: string; colorway: string; qty: number; cents: number }[];
  address: Address;
  contact: { firstName: string; lastName: string; email: string; phone: string };
  estimate: string;
  payment: string;
  guest: boolean;
  quote?: { subtotal?: number; tax?: number; discount?: number; total: number };
};

const noop = () => () => {};
function readRaw() {
  try {
    return window.sessionStorage.getItem("aria-noir:last-order") ?? "";
  } catch {
    return "";
  }
}

export function ConfirmedView() {
  /* sessionStorage is an external store; read it as one. The server
     snapshot is undefined — nothing is drawn until the client knows. */
  const raw = useSyncExternalStore(noop, readRaw, () => undefined);
  const order = useMemo<Confirmed | null | undefined>(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? (JSON.parse(raw) as Confirmed) : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (order === undefined) return null;

  if (!order) {
    return (
      <div className="stack stack--sm">
        <p className="t-eyebrow">Confirmed</p>
        <h1 className="t-display-lg">On the bench.</h1>
        <p className="t-body t-body--lede mt-2 max-w-xl">
          The receipt is in your email, and the order is on your desk if you have one.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/desk">The desk</CtaLink>
          <CtaLink href="/eyewear" kind="secondary">Explore more</CtaLink>
        </div>
      </div>
    );
  }

  const ref = order.id.slice(-8).toUpperCase();

  return (
    <>
      <div className="stack stack--sm mb-16">
        <p className="t-eyebrow">Confirmed · No. {ref}</p>
        <h1 className="t-display-lg">On the bench, {order.contact.firstName}.</h1>
        <p className="t-body t-body--lede mt-2 max-w-xl">
          The workshop has it. A receipt is on its way to {order.contact.email}, and a second
          note follows with the tracking number the day it ships.
        </p>
      </div>

      <div className="confirmed">
        <div>
          {/* h2, not p. The lines beneath are `card-name` h3s, and with
              nothing between them and the page's h1 the outline skipped a
              level — on the region that says what was actually bought. The
              eyebrow class still draws it; only the element changed. Same
              fix as the checkout's order summary. */}
          <h2 className="t-eyebrow">The order</h2>
          {/* `mt-6 sm:mt-8`: the heading had NO space under it and sat
              flush on the first plate — an 11px label touching a 415px
              photograph, at both widths. The checkout's own summary already
              sets its cards `mt-6` below the same heading; this is that
              interval, opened a step further because these plates are the
              larger ones. */}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-8 sm:grid-cols-2">
            {order.lines.map((l) => (
              <LineCard
                key={`${l.name}:${l.colorway}`}
                house={allHouses.find((h) => h.slug === l.slug || h.name === l.name)}
                slug={l.slug ?? l.name}
                colorway={l.colorway}
                qty={l.qty}
                cents={l.cents}
                linked={false}
              />
            ))}
          </div>
          <dl className="summary-money hairline mt-8 pt-8">
            {order.quote?.discount ? (
              <div>
                <dt>Code</dt>
                <dd className="tabular-nums">−{formatPrice(order.quote.discount)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            {typeof order.quote?.tax === "number" ? (
              <div>
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatPrice(order.quote.tax)}</dd>
              </div>
            ) : null}
            <div className="summary-total">
              <dt>Charged</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <p className="t-caption mt-3">{order.payment}.</p>
        </div>

        <dl className="review-facts">
          <div>
            <dt className="t-eyebrow">To</dt>
            <dd className="t-body t-body--tight">
              {order.contact.firstName} {order.contact.lastName}
              <br />
              {addressLine(order.address)}
              <br />
              {countryName(order.address.country)}
            </dd>
          </div>
          <div>
            <dt className="t-eyebrow">Arrives</dt>
            <dd className="t-body t-body--tight">{order.estimate}, by tracked courier.</dd>
          </div>
          <div>
            <dt className="t-eyebrow">If anything</dt>
            <dd className="t-body t-body--tight">
              <Link href="/policies/returns" className="link-quiet">How a return works</Link>
              <br />
              <Link href="/contact" className="link-quiet">Talk to the studio</Link>
            </dd>
          </div>
        </dl>
      </div>

      {order.guest ? (
        <section className="hairline mt-20 pt-10">
          <p className="t-eyebrow">Keep it</p>
          <h2 className="t-display-xs mt-3">A desk for this order.</h2>
          <p className="t-body mt-4 max-w-xl text-[var(--fg-tertiary)]">
            An account was not needed to buy the frame. It is useful afterwards: the order, its
            tracking, and any warranty claim are found by signing in rather than by proving a
            receipt. Made from the details this order already has — only a password is new.
          </p>
          <div className="mt-10 max-w-md">
            <AccessForm
              mode="new"
              prefill={{
                email: order.contact.email,
                firstName: order.contact.firstName,
                lastName: order.contact.lastName,
                phone: order.contact.phone,
              }}
              next="/desk"
            />
          </div>
        </section>
      ) : (
        <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/desk">Orders on your desk</CtaLink>
          <CtaLink href="/eyewear" kind="secondary">Explore more</CtaLink>
        </div>
      )}
    </>
  );
}
