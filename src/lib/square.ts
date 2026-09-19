"use client";

/**
 * The Square Web Payments SDK, loaded once and only when a card form is
 * about to be drawn. Nothing on the site pays for this script until the
 * reader has reached the payment step.
 */
let loading: Promise<void> | undefined;

export function ensureSquare(environment: "sandbox" | "production") {
  if (typeof window === "undefined") return Promise.reject(new Error("No window."));
  if (window.Square) return Promise.resolve();
  if (!loading)
    loading = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        "script[data-aria-square]",
      );
      const fail = () => {
        loading = undefined;
        reject(new Error("Secure payment could not load. Check the connection and try again."));
      };
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", fail, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.dataset.ariaSquare = "true";
      script.src =
        environment === "sandbox"
          ? "https://sandbox.web.squarecdn.com/v1/square.js"
          : "https://web.squarecdn.com/v1/square.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = fail;
      document.head.appendChild(script);
    });
  return loading;
}

/* The card iframe takes the house's type and ground, so the one field on
   the site the house does not draw still looks drawn by it. Colours are the
   ink tokens by value — the iframe cannot read CSS variables. */
export const CARD_STYLE = {
  ".input-container": {
    borderColor: "transparent",
    borderRadius: "0px",
    borderWidth: "0px",
  },
  ".input-container.is-focus": { borderColor: "transparent" },
  ".input-container.is-error": { borderColor: "transparent" },
  /* --text-quiet-dark, --gold, --paper, at their rendered values. */
  ".message-text": { color: "#666666" },
  ".message-icon": { color: "#666666" },
  ".message-text.is-error": { color: "#c6a664" },
  ".message-icon.is-error": { color: "#c6a664" },
  input: {
    backgroundColor: "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontFamily: "helvetica, arial, sans-serif",
  },
  "input::placeholder": { color: "#666666" },
  "input.is-error": { color: "#ffffff" },
};

/** Square's messages are written for a developer console; these are for
 *  the person holding the card. */
export function cardErrorMessage(message?: string) {
  const text = (message || "").toLowerCase();
  if (text.includes("cvv")) return "Check the security code on the back of the card.";
  if (text.includes("expir")) return "Check the expiry date.";
  if (text.includes("postal") || text.includes("zip")) return "Check the postal code on the card.";
  if (text.includes("number")) return "Check the card number.";
  if (text.includes("declin")) return "The card was declined. Try another card, or contact the bank.";
  if (text.includes("insufficient")) return "The card was declined for insufficient funds.";
  return message || "The card could not be authorised.";
}
