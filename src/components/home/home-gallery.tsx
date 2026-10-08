"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { house } from "@/lib/house-api";

/**
 * The intake: the house letter, set in the blank centre of React Bits'
 * Contact Sheet (`components/contact-sheet.tsx`), with the shoot's
 * photographs spiralling out around it. Square corners (radius 0).
 * WebGL, so lazy and in an explicitly sized box.
 */
const ContactSheet = dynamic(() => import("@/components/contact-sheet"), { ssr: false });

const ITEMS = [
  "AHAVA, the gilt mirror",
  "MATRIARCA, the hypostyle hall",
  "MONARCA, rain on the window",
  "PATRIARCA, the basilica",
  "AHAVA, the curtain",
  "MONARCA, from below",
  "ARCA II, the corridor",
  "PATRIARCA, among the columns",
  "MATRIARCA, the fallen statue",
  "AHAVA, the facade in the morning",
].map((alt, i) => ({ src: `/images/home/gallery/${String(i + 1).padStart(2, "0")}.webp`, alt }));

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
      <ContactSheet
        items={ITEMS}
        radius={0}
        develop={0.3}
        edgeFade={0.15}
        shadow={0.3}
        blankArea={0.34}
        captions={false}
        backgroundColor="#000000"
        ariaLabel="Photographs from the house"
        className="absolute inset-0 h-full w-full"
      />

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
