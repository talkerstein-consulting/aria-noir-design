"use client";

import { useEffect, useState } from "react";

/* The slice of Apple's JS SDK this uses. Popup mode resolves the
   sign-in in place, so there is no redirect route to host — the page
   stays static, as DEPLOY.md requires. */
type AppleSignInResult = {
  authorization: { id_token: string; code: string };
  /* Sent on the FIRST sign-in only, and never again: Apple does not put
     the name in the token. */
  user?: { name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<AppleSignInResult>;
      };
    };
  }
}

const SRC =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

export type AppleName = { firstName?: string; lastName?: string };

/**
 * Sign in with Apple, beside Google's button and the same size as it.
 *
 * Apple hands back an ID token exactly as Google does, and it is treated
 * the same way: passed straight through to the house API, which verifies
 * it against Apple's keys. Nothing on this origin trusts it.
 *
 * Needs a Services ID (`NEXT_PUBLIC_APPLE_CLIENT_ID`) whose return URL
 * is this origin; `NEXT_PUBLIC_APPLE_REDIRECT_URI` overrides it. Unset,
 * it renders nothing — see SignInOptions for the development stand-in.
 */
export function AppleSignIn({
  onCredential,
  label = "Sign in with Apple",
  disabled,
}: {
  onCredential: (idToken: string, name?: AppleName) => void;
  label?: string;
  disabled?: boolean;
}) {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const start = () => {
      if (cancelled || !window.AppleID) return;
      window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI:
          process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || window.location.origin,
        usePopup: true,
      });
      setReady(true);
    };

    if (window.AppleID) {
      start();
      return () => {
        cancelled = true;
      };
    }

    /* One script tag for the document, however many times this mounts. */
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const el = existing ?? document.createElement("script");
    if (!existing) {
      el.src = SRC;
      el.async = true;
      document.head.appendChild(el);
    }
    el.addEventListener("load", start);
    return () => {
      cancelled = true;
      el.removeEventListener("load", start);
    };
  }, [clientId]);

  if (!clientId) return null;

  const press = async () => {
    if (!window.AppleID) return;
    try {
      const result = await window.AppleID.auth.signIn();
      onCredential(result.authorization.id_token, result.user?.name);
    } catch {
      /* Closing the popup rejects too; that is the reader changing their
         mind, not an error to show them. */
    }
  };

  return (
    <AppleButton disabled={disabled || !ready} onClick={() => void press()}>
      {label}
    </AppleButton>
  );
}

/** Apple's mark and the label, in the black, outlined style Apple's
 *  guidelines allow on a dark ground. Shared with the dev stand-in. */
export function AppleButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="access-apple"
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <svg viewBox="0 0 814 1000" width="14" height="17" aria-hidden fill="currentColor">
        <path d="M788 341c-6 4-107 62-107 190 0 148 130 200 134 201-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-165-40c-77 0-104 41-167 41s-106-57-156-128C44 790 0 671 0 557c0-183 119-280 236-280 62 0 114 41 153 41 37 0 95-43 166-43 27 0 124 2 188 97zM554 170c29-35 50-83 50-131 0-7-1-14-2-19-47 2-104 32-138 72-27 30-52 78-52 127 0 7 1 15 2 17 3 1 8 1 13 1 43 0 97-29 127-67z" />
      </svg>
      <span>{children}</span>
    </button>
  );
}
