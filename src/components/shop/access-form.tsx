"use client";

import { useState } from "react";
import { ACCOUNT_URL } from "@/lib/navigation";

/**
 * The sign-in field.
 *
 * One input on a rule — the site's `.field` object, unchanged, because a
 * sign-in is not a special kind of form and should not look like one.
 *
 * ---- The submit is a redirect, deliberately ----
 *
 * Shopify's customer-account authentication runs the whole credential step:
 * it sends the code, checks it, and sets the session. This form's only job
 * is to carry the address the reader typed so they do not type it twice.
 *
 * Nothing is stored, nothing is posted anywhere else, and there is no
 * password field on this site by design — see the note on the page. The
 * `login_hint` parameter is standard OIDC and is the whole payload.
 */
export function AccessForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSending(true);
        const url = new URL("/authentication/login", ACCOUNT_URL);
        if (email.trim()) url.searchParams.set("login_hint", email.trim());
        /* A full navigation, not a fetch. The authentication flow is a
           redirect chain that has to own the address bar — intercepting it
           would break the callback it eventually comes back on. */
        window.location.assign(url.toString());
      }}
      className="stack stack--sm"
    >
      <label htmlFor="access-email" className="t-eyebrow">
        Email
      </label>
      <div className="field-row mt-2">
        <input
          id="access-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <button
          type="submit"
          aria-label="Continue"
          className="field-submit"
          disabled={sending}
        >
          →
        </button>
      </div>

      <p className="t-caption mt-4">
        {sending
          ? "Taking you to the code…"
          : "We will send a six-digit code to this address."}
      </p>
    </form>
  );
}
