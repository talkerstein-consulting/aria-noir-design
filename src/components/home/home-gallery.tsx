"use client";

import { useState } from "react";
import { house } from "@/lib/house-api";

/**
 * The intake: the house letter cut into a stone tablet.
 *
 * Raviv, 20 Nov: "this image and this text should be an extension of each
 * other … really it should be a stone tablet, and the field is in the
 * image, and you just type over it."
 *
 * So the slab is IN the photograph rather than drawn over it. The plate is
 * the same basilica as before, shot with a blank basalt tablet standing in
 * the nave: generated to leave the middle of the frame clear, which is
 * what lets the heading and the field sit on it unobstructed. Nothing in
 * this component draws a panel any more — the words are set straight onto
 * the stone that is already there.
 *
 * Decorative, so no alt: the heading carries the section.
 */
const STILL = { src: "/images/home/gallery/tablet.webp" };

/**
 * Where the tablet's readable face sits in the plate, measured off the
 * file: the face spans 29–72% of its width and 56–79% of its height, so
 * its centre is 67.3% down. The section is `object-cover`, which crops the
 * SIDES at every viewport this site supports and leaves the vertical
 * alignment intact — so one percentage holds from 390px to 1440px, and
 * the block only has to stay narrow enough to live inside the face.
 */
const FACE_CENTRE_Y = "67.3%";

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
          One still room instead, so the letter is the only thing asking
          for attention. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STILL.src}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* No flat veil over the whole plate any more: it greyed the stone
          the words are cut into, which is the one thing in the frame that
          has to hold them. A scrim at the head and foot instead — enough
          to carry the fixed nav and to land the section into the black
          above and below it, and nothing across the tablet itself. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/15 to-ink/80"
      />

      {/* The words, set on the face of the tablet in the photograph.

          Positioned off the plate rather than centred in the section: the
          slab's face sits below the middle of the frame, so a block
          centred on the section would float above it on the architecture.
          Only the form takes the pointer. */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 justify-center px-6"
        style={{ top: FACE_CENTRE_Y }}
      >
        <div className="pointer-events-auto flex w-full max-w-[34rem] flex-col items-center gap-5 text-center">
          <h2 id="intake-heading" className="t-display-lg engraved">
            The house letter.
          </h2>
          <p className="t-body engraved text-paper/70">New collections reach this list first.</p>
          {state === "sent" ? (
            <p role="status" className="t-display-xs engraved">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="chisel flex w-full items-center gap-3">
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
                /* No box at all: the letters are cut into the slab, on the
                   chiselled line the form draws under them. */
                className="chisel-field min-w-0 flex-1 !bg-transparent px-1 py-3 text-center text-paper placeholder:text-paper/45 focus:outline-none sm:text-left"
              />
              <button
                type="submit"
                className="chisel-submit engraved"
                disabled={state === "busy"}
                aria-busy={state === "busy"}
              >
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
