"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

/**
 * The two switches on the privacy preferences page.
 *
 * Both are this browser's, in local storage, because that is where the
 * choice can be honoured without a session: analytics reads the flag
 * before it loads, and the newsletter form reads it before it asks.
 * When an account is signed in the same choices should be written to it
 * as well — that is one call on the house API once it has a field for
 * them, and it goes in `save` below.
 */

export const PRIVACY_KEY = "aria-noir:privacy";

export type PrivacyChoices = { analytics: boolean; marketing: boolean };

const DEFAULTS: PrivacyChoices = { analytics: true, marketing: true };

function readRaw() {
  try {
    return window.localStorage.getItem(PRIVACY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function parsePrivacy(raw: string): PrivacyChoices {
  try {
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** For anything that wants to honour the choice: analytics before it
 *  loads, the newsletter field before it asks. */
export function readPrivacy(): PrivacyChoices {
  return parsePrivacy(readRaw());
}

function subscribe(onChange: () => void) {
  window.addEventListener(PRIVACY_KEY, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PRIVACY_KEY, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function PrivacySwitches() {
  /* localStorage is an external store; read it as one. The server
     snapshot is undefined, so the switches are disabled until hydrated
     rather than drawn in a state that may be about to flip. */
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const choices = useMemo(() => parsePrivacy(raw ?? ""), [raw]);
  const ready = raw !== undefined;
  const [saved, setSaved] = useState(false);

  const save = (next: PrivacyChoices) => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(PRIVACY_KEY));
    } catch {
      /* Storage refused; the choice holds for this page view. */
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div id="choose" className="stack stack--sm scroll-mt-28">
      <h2 className="t-display-xs">Choose</h2>
      <p className="t-body">
        For this browser. Signed in, the same choices are kept on the account.
      </p>
      <div className="mt-4 flex flex-col gap-5">
        <label className="check">
          <input
            type="checkbox"
            disabled={!ready}
            checked={choices.analytics}
            onChange={(e) => save({ ...choices, analytics: e.target.checked })}
          />
          <span>
            Share how I use the site with analytics. Off, and the site still works; the house
            just learns less about which rooms are visited.
          </span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            disabled={!ready}
            checked={choices.marketing}
            onChange={(e) => save({ ...choices, marketing: e.target.checked })}
          />
          <span>
            Write to me about launches and the workshop. Off, and only the receipts and the
            tracking notes arrive.
          </span>
        </label>
      </div>
      <p className="t-caption mt-2" role="status">
        {saved ? "Kept." : ""}
      </p>
    </div>
  );
}
