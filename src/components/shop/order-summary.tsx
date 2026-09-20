"use client";

import { useState } from "react";
import { house, type Quote } from "@/lib/house-api";
import type { ResolvedLine } from "@/lib/cart";
import { formatPrice } from "@/lib/shop";
import { LineCard } from "@/components/shop/line-card";

/**
 * The right-hand column of the checkout: what is being bought, what it
 * costs, and the one field that can change the number.
 *
 * The lines here are the bag's, drawn as the product cards they were
 * chosen from; the money is the house API's.
 * Until an address is known there is no tax and no total, and the column
 * says "subtotal" rather than pretending. The promo code is checked on
 * its own against the API before it is applied to the quote, so a wrong
 * code is answered at the field and not by a total that quietly did not
 * move.
 */
export function OrderSummary({
  lines,
  subtotal,
  quote,
  quoteError,
  pending,
  promo,
  onPromo,
  estimate,
}: {
  lines: readonly ResolvedLine[];
  subtotal: number;
  quote?: Quote;
  quoteError?: string;
  pending?: boolean;
  promo: string;
  onPromo: (code: string) => void;
  estimate?: string;
}) {
  const [draft, setDraft] = useState(promo);
  const [checking, setChecking] = useState(false);
  const [promoNote, setPromoNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(
    promo ? { tone: "ok", text: `${promo.toUpperCase()} applied.` } : null,
  );

  const apply = async () => {
    const code = draft.trim().toUpperCase();
    if (!code) {
      onPromo("");
      setPromoNote(null);
      return;
    }
    setChecking(true);
    try {
      const result = await house.promoCode(code);
      if (!result.valid) {
        setPromoNote({ tone: "bad", text: "That code is not one the house knows." });
        onPromo("");
      } else {
        setPromoNote({ tone: "ok", text: `${result.code}${result.name ? ` · ${result.name}` : ""} applied.` });
        onPromo(result.code);
      }
    } catch (cause) {
      setPromoNote({
        tone: "bad",
        text: cause instanceof Error ? cause.message : "The code could not be checked.",
      });
    } finally {
      setChecking(false);
    }
  };

  const o = quote?.order;
  const discount = o?.discount ?? 0;
  const tax = o?.tax ?? 0;

  return (
    <div className="summary" id="your-order">
      <p className="t-eyebrow">Your order</p>

      <div className="summary-cards mt-6">
        {lines.map(({ line, house: h, entry }) => (
          <LineCard
            key={`${line.slug}:${line.colorway}`}
            house={h}
            slug={line.slug}
            colorway={line.colorway}
            qty={line.qty}
            cents={entry?.cents}
          />
        ))}
      </div>

      <form
        className="hairline mt-8 pt-8"
        onSubmit={(e) => {
          e.preventDefault();
          void apply();
        }}
      >
        <label className="field" data-invalid={promoNote?.tone === "bad"}>
          <span>
            Code
            <em className="not-italic opacity-60"> · optional</em>
          </span>
          <div className="flex items-end gap-6">
            <input
              value={draft}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(e) => {
                setDraft(e.target.value);
                if (promoNote?.tone === "bad") setPromoNote(null);
              }}
            />
            <button type="submit" className="link-quiet link-quiet--micro shrink-0 pb-3" disabled={checking}>
              {checking ? "Checking" : promo && draft.trim().toUpperCase() === promo ? "Applied" : "Apply"}
            </button>
          </div>
          {promoNote ? (
            <em
              className={promoNote.tone === "bad" ? "field-error" : "t-caption mt-2 block not-italic"}
              role={promoNote.tone === "bad" ? "alert" : "status"}
            >
              {promoNote.text}
            </em>
          ) : null}
        </label>
      </form>

      <dl className="summary-money hairline mt-8 pt-8">
        <div>
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discount ? (
          <div>
            <dt>Code</dt>
            <dd className="tabular-nums">−{formatPrice(discount)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Shipping</dt>
          <dd>
            Free
            {estimate ? <span className="t-caption block text-right">{estimate}</span> : null}
          </dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd className="tabular-nums">
            {o ? formatPrice(tax) : pending ? "…" : <span className="t-caption">At the address</span>}
          </dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd className="tabular-nums">{o ? formatPrice(o.total) : pending ? "…" : formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {quoteError ? (
        <p className="field-error mt-4" role="alert">{quoteError}</p>
      ) : o ? null : (
        <p className="t-caption mt-4">The total is settled once the address is known.</p>
      )}
    </div>
  );
}
