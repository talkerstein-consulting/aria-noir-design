"use client";

import { useRef, useState } from "react";
import { CtaButton } from "@/components/cta-link";

/**
 * The profile, as a format.
 *
 * ---- What this is ----
 *
 * The house's details form: the shape, the order, the labels, the
 * validation and the one save. It is the pattern every account field on
 * this site should be cut from, and the reference the account host's own
 * theme is meant to match — see docs/COMMERCE-FLOWS.md.
 *
 * ---- What it does not do ----
 *
 * Persist. Accounts live at account.arianoir.com, and this origin has no
 * credential and no API to write to. Rather than pretend, the form takes an
 * `onSave` and the desk passes it nothing: the fields render as the record
 * the reader already has, disabled, with the one link that can actually
 * change them. The day there is an endpoint, `onSave` is where it goes and
 * nothing above this line moves.
 *
 * ---- The rules it demonstrates ----
 *
 *  · One underline per field, label above it, always visible. A label that
 *    vanishes when you type is a label you cannot check your answer
 *    against.
 *  · Optional is marked; required is not. Most fields are required, so
 *    marking those would be marking almost everything.
 *  · Validation on blur, never on keystroke. Telling someone their email
 *    is wrong while they are still typing the @ is a scold.
 *  · The message says what to do, and the rule goes accent WITH it. Colour
 *    is never the only carrier.
 */

export type Profile = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

export const BLANK_PROFILE: Profile = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal: "",
  country: "",
};

/** What a field is allowed to complain about, and in what words. */
function complaint(key: keyof Profile, value: string): string {
  const v = value.trim();
  if (key === "line2") return "";
  if (!v) return "This one is needed before an order can be sent.";
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    return "An address with an @ and a domain, so the studio can write back.";
  }
  if (key === "phone" && v.replace(/\D/g, "").length < 7) {
    return "A number the courier can reach on the day.";
  }
  return "";
}

type Field = {
  key: keyof Profile;
  label: string;
  type?: string;
  autoComplete: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  optional?: boolean;
};

/** Rows, so two fields that belong together sit on one line on a desk and
 *  stack on a phone. The pairing is meaning, not space: name with email,
 *  city with region. */
const ROWS: readonly (readonly Field[])[] = [
  [
    { key: "name", label: "Name", autoComplete: "name" },
    { key: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
  ],
  [
    { key: "phone", label: "Telephone", type: "tel", autoComplete: "tel", inputMode: "tel" },
  ],
  [
    { key: "line1", label: "Address", autoComplete: "address-line1" },
    { key: "line2", label: "Apartment, floor", autoComplete: "address-line2", optional: true },
  ],
  [
    { key: "city", label: "City", autoComplete: "address-level2" },
    { key: "region", label: "State or province", autoComplete: "address-level1" },
  ],
  [
    { key: "postal", label: "Postal code", autoComplete: "postal-code" },
    { key: "country", label: "Country", autoComplete: "country-name" },
  ],
];

export function ProfileForm({
  value = BLANK_PROFILE,
  onSave,
  note,
  lockedKeys,
}: {
  value?: Profile;
  /** Absent means the record is not this origin's to change. */
  onSave?: (next: Profile) => Promise<void> | void;
  /** One line under the heading, if the caller has something to explain. */
  note?: string;
  /** Fields that read but do not write even when the form saves — the
   *  email, which IS the account and is changed at the studio. */
  lockedKeys?: readonly (keyof Profile)[];
}) {
  const [draft, setDraft] = useState<Profile>(value);
  const [touched, setTouched] = useState<Partial<Record<keyof Profile, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const readOnly = !onSave;
  const formRef = useRef<HTMLFormElement>(null);

  const errorFor = (key: keyof Profile) =>
    touched[key] ? complaint(key, draft[key]) : "";

  return (
    <form
      ref={formRef}
      className="max-w-2xl"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!onSave) return;
        /* Everything is touched on submit, so a field nobody visited still
           gets to say what is wrong with it. */
        setTouched(
          Object.fromEntries(ROWS.flat().map((f) => [f.key, true])),
        );
        if (ROWS.flat().some((f) => complaint(f.key, draft[f.key]))) return;
        setBusy(true);
        try {
          await onSave(draft);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2400);
        } finally {
          setBusy(false);
        }
      }}
    >
      {note ? (
        <p className="t-body mb-10 max-w-xl text-[var(--fg-tertiary)]">{note}</p>
      ) : null}

      <div className="stack">
        {ROWS.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2"
          >
            {row.map((f) => {
              const error = errorFor(f.key);
              return (
                <label
                  key={f.key}
                  className="field"
                  data-invalid={Boolean(error)}
                >
                  <span>
                    {f.label}
                    {f.optional ? (
                      <em className="not-italic opacity-60"> · optional</em>
                    ) : null}
                  </span>
                  <input
                    type={f.type ?? "text"}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    value={draft[f.key]}
                    disabled={readOnly || lockedKeys?.includes(f.key)}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    onBlur={() =>
                      setTouched((t) => ({ ...t, [f.key]: true }))
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `err-${f.key}` : undefined}
                  />
                  {error ? (
                    <em className="field-error" id={`err-${f.key}`} role="alert">
                      {error}
                    </em>
                  ) : null}
                </label>
              );
            })}
          </div>
        ))}
      </div>

      {readOnly ? null : (
        <div className="mt-12 flex items-center gap-8">
          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
            Save
          </button>
          <CtaButton disabled={busy} onClick={() => formRef.current?.requestSubmit()}>
            {busy ? "Saving" : "Save details"}
          </CtaButton>
          {/* The success state is a word beside the button, not a banner
              that pushes the form down and then takes the space back. */}
          <span className="t-caption" role="status">
            {saved ? "Saved." : ""}
          </span>
        </div>
      )}
    </form>
  );
}
