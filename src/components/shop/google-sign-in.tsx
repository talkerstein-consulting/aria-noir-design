"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Sign in with Google.
 *
 * ---- What this is ----
 *
 * Google Identity Services, rendered as Google's own button. The house
 * does not draw this one: the mark, the wording and the proportions are
 * Google's to specify, and a hand-made "G" button is both a brand
 * violation and the thing readers have learned not to trust.
 *
 * What the button returns is an ID token — a JWT naming the account,
 * signed by Google. It is handed straight to the house API, which checks
 * the signature and the audience and sets the same session cookie an
 * email sign-in gets. This origin never trusts the token itself; see
 * `googleLogin` in lib/house-api.
 *
 * ---- Why it can render nothing ----
 *
 * The client id is `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and without one there
 * is no sign-in to offer. A button that opens a Google dialog saying
 * "invalid client" is worse than no button, so with no id configured this
 * renders null and the form is exactly what it was. That is also why the
 * rest of the page never assumes this is here.
 *
 * ---- The one visual concession ----
 *
 * `theme: "filled_black"` and a pill shape, because the page is ink and
 * Google's white default would be the brightest object on a screen whose
 * one filled element is meant to be the house's own CTA.
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

const SRC = "https://accounts.google.com/gsi/client";

export function GoogleSignIn({
  onCredential,
  label = "signin_with",
}: {
  /** Handed the ID token. Errors are the caller's to show — it owns the
   *  form's error line. */
  onCredential: (credential: string) => void;
  /** Google's own wording key: `signin_with` or `signup_with`, so the
   *  button reads correctly beside Sign in and beside New here. */
  label?: "signin_with" | "signup_with";
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const id = useId();

  /* The callback has to survive a re-render without re-initialising
     Google's SDK, which is a global and does not like being set up twice. */
  const handler = useRef(onCredential);
  handler.current = onCredential;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const start = () => {
      if (cancelled || !window.google || !box.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => handler.current(response.credential),
      });
      box.current.replaceChildren();
      window.google.accounts.id.renderButton(box.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: label,
        width: 320,
        logo_alignment: "center",
      });
      setReady(true);
    };

    if (window.google) {
      start();
      return () => {
        cancelled = true;
      };
    }

    /* One script tag for the document, however many times this mounts. */
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`,
    );
    const el = existing ?? document.createElement("script");
    if (!existing) {
      el.src = SRC;
      el.async = true;
      el.defer = true;
      document.head.appendChild(el);
    }
    el.addEventListener("load", start);
    return () => {
      cancelled = true;
      el.removeEventListener("load", start);
    };
  }, [clientId, label]);

  if (!clientId) return null;

  return (
    <div className="access-google">
      {/* The rule and the word, so the two doors read as alternatives
          rather than as a stack of buttons. */}
      <p className="access-google__or" aria-hidden>
        or
      </p>
      <div ref={box} id={id} data-ready={ready} />
    </div>
  );
}
