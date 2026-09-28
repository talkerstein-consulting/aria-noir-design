"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { house } from "@/lib/house-api";

/**
 * The footer's house-letter field. Its own client island so the footer
 * stays a server component. It was a bare <form> with no handler, so
 * pressing the chevron reloaded the page and sent nothing; now it posts
 * to the house API and says what happened, in the line under the field.
 */
export function NewsletterField({ placeholder }: { placeholder: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      await house.subscribe(email.trim());
      setState("sent");
      setMessage("You're on the list. The next letter comes to you.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "That didn't go through. Try again.");
    }
  }

  return (
    <>
      <form className="field-row" onSubmit={onSubmit} noValidate={false}>
        <label htmlFor="footer-email" className="sr-only">
          {placeholder}
        </label>
        <input
          id="footer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error" || undefined}
          aria-describedby="footer-email-status"
          placeholder={placeholder}
          className="field"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="field-submit"
          disabled={state === "busy"}
          aria-busy={state === "busy"}
        >
          <ChevronRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      </form>
      <p id="footer-email-status" role="status" aria-live="polite" className="t-caption min-h-[1lh]">
        {state === "sent" || state === "error" ? message : ""}
      </p>
    </>
  );
}
