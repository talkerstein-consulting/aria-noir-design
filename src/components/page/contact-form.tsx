"use client";

import { useState } from "react";
import { contact } from "@/lib/pages";

/**
 * The one input object on the site, promoted from a single newsletter row
 * to a form.
 *
 * Every row is `field-row` / `field` — the CTA's underline standing still —
 * because the site has exactly one input treatment and a contact page is
 * not the place to invent a second. Labels are real `<label>` elements
 * rather than placeholders doing double duty: a placeholder disappears the
 * moment someone starts typing, which is precisely when they need to know
 * which box they are in.
 *
 * No backend yet. Rather than pretend, the submit hands off to `mailto:`
 * with the message pre-filled, which is honest about where the reply comes
 * from and works with nothing deployed behind it. When a real endpoint
 * exists, this is the only function that changes.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "—"}`,
      "",
      String(data.get("message") ?? ""),
    ].join("\n");

    window.location.href = `mailto:support@arianoir.com?subject=${encodeURIComponent(
      `Enquiry from ${data.get("name")}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="stack stack--sm w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="c-name" className="t-label">
            {contact.form.name}
          </label>
          <div className="field-row">
            <input id="c-name" name="name" required className="field" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="c-email" className="t-label">
            {contact.form.email}
          </label>
          <div className="field-row">
            <input
              id="c-email"
              name="email"
              type="email"
              required
              className="field"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="c-phone" className="t-label">
          {contact.form.phone}
        </label>
        <div className="field-row">
          <input id="c-phone" name="phone" type="tel" className="field" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="c-message" className="t-label">
          {contact.form.message}
        </label>
        <div className="field-row">
          <textarea
            id="c-message"
            name="message"
            rows={4}
            required
            className="field resize-none"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <p className="t-micro" role="status">
          {sent ? "Opening your mail client…" : contact.form.note}
        </p>
        <button type="submit" className="field-submit t-label">
          {contact.form.submit} →
        </button>
      </div>
    </form>
  );
}
