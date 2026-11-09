"use client";

import { useState } from "react";
import { house } from "@/lib/house-api";

/**
 * The intake: the house letter over one still photograph, the PATRIARCA
 * basilica, empty. Decorative, so no alt: the heading carries the section.
 */
const STILL = { src: "/images/home/gallery/04.webp" };

export function HomeIntake() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      await house.subscribe(email.trim());
      setState("sent");
      setMessage("You are on the list.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "That didn't go through. Try again.");
    }
  }

  return (
    <section aria-labelledby="intake-heading" className="on-ink relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
      {/* Was the WebGL contact sheet, photographs spiralling around the form.
          Jai's review (5 Nov): "too much movement"; "say a lot with silence".
          One still room under a veil instead, so the letter is the only
          thing asking for attention. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STILL.src}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-ink/70" />

      {/* The centre the sheet leaves blank. Only the form takes the pointer. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
          <h2 id="intake-heading" className="t-display-lg">
            The house letter.
          </h2>
          <p className="t-body text-paper/75">New collections reach this list first.</p>
          {state === "sent" ? (
            <p role="status" className="t-display-xs">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
              <label htmlFor="intake-email" className="sr-only">
                Email address
              </label>
              <input
                id="intake-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                aria-invalid={state === "error" || undefined}
                aria-describedby="intake-status"
                /* No grey: transparent, with a hairline box so the field
                   still reads as a place to type on the photographs. */
                className="min-w-0 flex-1 border border-paper/35 !bg-transparent px-4 py-3 text-paper placeholder:text-paper/50 focus:border-paper focus:outline-none"
              />
              <button type="submit" className="cta-main" disabled={state === "busy"} aria-busy={state === "busy"}>
                Join
              </button>
            </form>
          )}
          <p id="intake-status" role="status" aria-live="polite" className="t-caption min-h-[1lh] text-paper/80">
            {state === "error" ? message : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
