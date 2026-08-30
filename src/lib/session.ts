"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ACCOUNT_URL } from "@/lib/navigation";

/**
 * Whether this browser has been through the door.
 *
 * ---- What this is NOT ----
 *
 * It is not the session. The session is a Shopify cookie on
 * account.arianoir.com, and this origin cannot read it — that is what
 * cross-origin means, and no amount of wanting changes it. Nothing here
 * grants access to anything: every page that shows real customer data is
 * on Shopify's side of the fence and checks the real session itself.
 *
 * ---- What it is ----
 *
 * A UI mirror, so the header can say Bag instead of Access to someone who
 * has signed in. It is set when the customer comes back from the auth flow
 * on `RETURN_PARAM`, which is the one moment this origin learns anything
 * about the outcome. Treat it exactly as what it is: a hint about which
 * word to draw, safe to be wrong, and cleared the moment the reader says
 * they are done.
 *
 * If it is stale — signed out on Shopify, still flagged here — the worst
 * case is a header that says Bag and a desk whose links bounce the reader
 * through sign-in again. That is a mildly wasted click, not a leak,
 * because there was never anything behind this flag to leak.
 */

/* Renamed from `aria-noir:room` when the Room was removed. A stored flag
   under the old key is simply not found, so anyone carrying one is shown
   ACCESS until their next sign-in — a wasted click for existing visitors
   and nothing more, since the flag never guarded anything. Worth it to
   leave no trace of a route that no longer exists. */
const KEY = "aria-noir:bag";

/** Point Shopify's post-auth redirect at `/bag?welcome=1`. */
export const RETURN_PARAM = "welcome";

/** Where the credential step happens, with the address pre-filled. */
export function signInHref(email?: string) {
  const url = new URL("/authentication/login", ACCOUNT_URL);
  if (email?.trim()) url.searchParams.set("login_hint", email.trim());
  return url.toString();
}

/** Shopify's own sign-out, which ends the thing that actually matters. */
export const SIGN_OUT_URL = new URL("/logout", ACCOUNT_URL).toString();

function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(KEY, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function useSession() {
  /* False on the server and on the hydrating render — the header draws
     Access until proven otherwise, which is the safe way round: showing
     Room to a signed-out reader is a promise the next page cannot keep. */
  const signedIn = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const set = useCallback((on: boolean) => {
    try {
      if (on) window.localStorage.setItem(KEY, "1");
      else window.localStorage.removeItem(KEY);
    } catch {
      /* Storage refused; the header just keeps saying Access. */
    }
    window.dispatchEvent(new Event(KEY));
  }, []);

  return { signedIn, set };
}
