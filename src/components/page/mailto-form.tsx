"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CtaButton } from "@/components/cta-link";

/**
 * A one-screen form that hands off to mail.
 *
 * The same arrangement as the contact intake (components/page/contact-
 * intake): this build has no endpoint to post to, so Send opens a letter
 * with everything filled in. That is honest about where the reply comes
 * from, and it works with nothing deployed behind it. When a real endpoint
 * exists, `submit` is the only function that changes.
 *
 * Used by Press (enquiries) and Registration. Every row is `field-row` /
 * `field`, the site's one input treatment; the one CTA is the main CTA.
 */
export type MailtoField = {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "textarea" | "select";
  required?: boolean;
  autoComplete?: string;
  options?: readonly string[];
  /** Half width from `sm` up, so two short fields share a row. */
  half?: boolean;
};

export function MailtoForm({
  to,
  subject,
  fields,
  send,
  sent: sentLabel,
  fallback,
  note,
}: {
  to: string;
  /** The subject line; the first field's value is appended after a colon. */
  subject: string;
  fields: readonly MailtoField[];
  send: string;
  sent: string;
  fallback: string;
  note?: string;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<false | "opening" | "fallback">(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = fields
      .map((f) =>
        f.type === "textarea"
          ? `\n${values[f.name] ?? ""}`
          : `${f.label}: ${values[f.name] || "not given"}`,
      )
      .join("\n");
    const first = values[fields[0]?.name ?? ""] ?? "";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(
      first ? `${subject}: ${first}` : subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent("opening");
    /* A mailto that found a mail app takes focus away from the page. If the
       page still has it a moment later, nothing opened: say where to write
       instead of claiming the letter is on its way. */
    window.setTimeout(() => {
      if (document.hasFocus()) setSent("fallback");
    }, 1200);
  };

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));

  return (
    <form ref={formRef} onSubmit={submit} className="stack stack--sm w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {fields.map((f) => {
          const fid = `${id}-${f.name}`;
          const span = f.half ? "" : "sm:col-span-2";
          return (
            <div key={f.name} className={`flex flex-col gap-2 ${span}`}>
              <label htmlFor={fid} className="t-label">
                {f.label}
                {f.required ? null : <span className="text-[var(--fg-tertiary)]"> (optional)</span>}
              </label>
              <div className="field-row">
                {f.type === "textarea" ? (
                  <textarea
                    id={fid}
                    rows={5}
                    required={f.required}
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="field resize-none"
                  />
                ) : f.type === "select" ? (
                  <select
                    id={fid}
                    required={f.required}
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="field bg-transparent [&_option]:bg-ink [&_option]:text-paper"
                  >
                    <option value="">Choose one</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={fid}
                    type={f.type ?? "text"}
                    required={f.required}
                    autoComplete={f.autoComplete}
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="field"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="t-micro" role="status" aria-live="polite">
        {sent === "fallback" ? (
          <>
            {fallback}{" "}
            <a href={`mailto:${to}`} className="link-quiet link-quiet--micro">
              {to}
            </a>
            .
          </>
        ) : sent ? (
          sentLabel
        ) : (
          note ?? null
        )}
      </p>

      <div className="mt-2 flex justify-end">
        {/* CtaButton is `type="button"` by design, so it asks the form to
            submit: the browser's own `required` check stays in the loop. */}
        <CtaButton onClick={() => formRef.current?.requestSubmit()} className="w-full sm:w-auto">
          {send}
        </CtaButton>
      </div>
    </form>
  );
}
