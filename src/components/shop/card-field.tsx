"use client";

import { useEffect, useId, useRef, useState, type MutableRefObject } from "react";
import type { Config } from "@/lib/house-api";
import { CARD_STYLE, ensureSquare } from "@/lib/square";

/**
 * The card, as a field.
 *
 * The number, expiry, CVV and postal code are Square's iframe — this origin
 * never sees them, which is the point. What the house draws is the label
 * above it, the rule under it, and the words around it; `CARD_STYLE` makes
 * the iframe's own text match.
 *
 * Mounted only when this component is, which the checkout does only once
 * the address step has folded. A card form on arrival is "choose how to
 * pay" answered before the question was asked.
 *
 * `cardRef` is handed back to the caller so the tokenize happens where the
 * order is placed, with the amount and the billing contact in hand.
 */
export function CardField({
  config,
  cardRef,
  onReady,
  onError,
}: {
  config: Config;
  cardRef: MutableRefObject<SquareCard | undefined>;
  onReady?: (ready: boolean) => void;
  onError?: (message: string) => void;
}) {
  const id = useId().replace(/:/g, "");
  const selector = `square-card-${id}`;
  const [squareState, setState] = useState<"loading" | "ready" | "failed">("loading");
  const mounted = useRef(false);

  /* No Square application id means the local mock API (scripts/
     mock-house-api.mjs): a stand-in is drawn that authorises anything and
     charges nothing, so the whole flow can be walked without a card. Type
     DECLINE to see the failure path. */
  const local = config.testMode && !config.applicationId;
  const [localValue, setLocalValue] = useState("");
  const state = local ? "ready" : squareState;

  useEffect(() => {
    if (local) {
      cardRef.current = {
        attach: async () => {},
        destroy: async () => true,
        tokenize: async () => ({ status: "OK", token: localValue.trim().toUpperCase() === "DECLINE" ? "DECLINE" : "LOCAL_CARD" }),
      };
      onReady?.(true);
      return () => {
        cardRef.current = undefined;
        onReady?.(false);
      };
    }
    let cancelled = false;
    mounted.current = true;
    const mount = async () => {
      await ensureSquare(config.environment);
      if (cancelled || !window.Square) return;
      const card = await window.Square.payments(config.applicationId, config.locationId).card({
        style: CARD_STYLE,
      });
      if (cancelled) {
        void card.destroy().catch(() => {});
        return;
      }
      await card.attach(`#${selector}`);
      if (cancelled) return;
      cardRef.current = card;
      setState("ready");
      onReady?.(true);
    };
    void mount().catch((cause) => {
      if (cancelled) return;
      setState("failed");
      onError?.(cause instanceof Error ? cause.message : "Secure payment could not load.");
    });
    return () => {
      cancelled = true;
      mounted.current = false;
      onReady?.(false);
      void cardRef.current?.destroy().catch(() => {});
      cardRef.current = undefined;
    };
    // The config is stable for the life of the page; remounting on the
    // callbacks would destroy the iframe on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.applicationId, config.locationId, config.environment, selector, local, localValue]);

  if (local) {
    return (
      <label className="field">
        <span>Card · local preview</span>
        <input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Nothing is charged. Type DECLINE to see a refusal."
          autoComplete="off"
        />
      </label>
    );
  }

  return (
    <div className="field">
      <span>Card</span>
      <div id={selector} className="square-card" data-state={state} />
      {state === "loading" ? (
        <em className="t-caption mt-2 block not-italic text-[var(--fg-quiet)]" role="status">
          Loading the secure card field
        </em>
      ) : null}
      {state === "failed" ? (
        <em className="field-error" role="alert">
          The secure card field could not load. Check the connection and reload this page.
        </em>
      ) : null}
    </div>
  );
}
