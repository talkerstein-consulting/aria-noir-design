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

/* ---- `aria-noir:known`, and why it is not `aria-noir:bag` ----

   It was. Renamed from `aria-noir:room` when the Room was removed, the new
   name landed on the key lib/cart.ts stores the BAG under — one
   localStorage key, two owners, holding two different shapes.

   The collision was not theoretical. `getSnapshot` compares the stored
   value to "1", and a bag serialises to a JSON array, so any reader with
   something in their bag read as signed out. Worse in the other
   direction: `set(true)` writes "1" over that key, which is a customer's
   bag being deleted by the act of signing in.

   Renamed again, to a key nothing else claims. A flag under either old
   name is simply not found, which shows ACCESS until the next sign-in —
   a wasted click, and nothing more, since this flag has never guarded
   anything. */
const KEY = "aria-noir:known";

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

/** The same write `useSession().set` does, for callers that are not in a
 *  render — the house API's session fetch mirrors its answer here. */
export function markKnown(on: boolean) {
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* Storage refused; the header just keeps saying Access. */
  }
  window.dispatchEvent(new Event(KEY));
}

export function useSession() {
  /* False on the server and on the hydrating render — the header draws
     Access until proven otherwise, which is the safe way round: showing
     Room to a signed-out reader is a promise the next page cannot keep. */
  const signedIn = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const set = useCallback((on: boolean) => markKnown(on), []);

  return { signedIn, set };
}
