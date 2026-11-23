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
 * The phone's plate: a different photograph of the stone, not the wide
 * one squeezed (Rems, 23 Nov: "a different photo of the stone on mobile —
 * the image more vertical, the stone more square", then "render an
 * entirely new image").
 *
 * The master is one wide basilica frame whose slab is 2.3:1, and
 * `object-cover` on a phone crops it to the middle of that slab's face:
 * no top edge, no sides, no floor, so the letter floats on a flat dark
 * field. Cropping the master could not fix it — the block is the shape it
 * is. So this is a new plate, rendered with Higgsfield (GPT Image 2.5,
 * 9:16, the master handed in as the reference so the nave, the light and
 * the stone match): the same room, shot portrait, with a near-square
 * block standing square to the camera, all four of its edges in frame,
 * the apse behind it and the marble floor reflecting it.
 *
 * The block sits at 30–75% of the plate's height and 16–85% of its
 * width, centred at 52%. The letter is held to the stone's own width on a
 * phone so no line runs off the block onto the nave.
 */
const STILL_PHONE = { src: "/images/home/gallery/tablet-m.webp" };

/**
 * Where the letter sits on the wide plate, measured off the file: the
 * slab spans 30–70% of its width and 50–88% of its height. Its centre is
 * 69% down, and the letter sits a little above that (Rems, 23 Nov: "move
 * this up … so the alignment looks more balanced") — the block's own
 * weight is in its lower half, so a letter centred on it reads low.
 *
 * This is the WIDE plate's measurement only; the phone has its own crop
 * and its own percentage (STILL_SQUARE, and `top-[63%]` below).
 */
const FACE_CENTRE_Y = "64.5%";

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
    <section aria-labelledby="intake-heading" className="on-ink relative w-full overflow-hidden bg-ink max-sm:aspect-[9/16] sm:h-[100svh] sm:min-h-[620px]">
      {/* Was the WebGL contact sheet, photographs spiralling around the form.
          Jai's review (5 Nov): "too much movement"; "say a lot with silence".
          One still room instead, so the letter is the only thing asking
          for attention. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STILL_PHONE.src}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover sm:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STILL.src}
        alt=""
        loading="lazy"
        className="absolute inset-0 hidden h-full w-full object-cover sm:block"
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
      {/* The phone's plate is built around its block, so the letter sits
          just above the middle of the frame; the wide plate keeps its own
          measurement. Both are a touch above the middle of the stone
          rather than below it (Rems, 23 Nov: "move this up … so the
          alignment looks more balanced"). */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 justify-center px-6 top-[52%] sm:top-[var(--face)]"
        style={{ "--face": FACE_CENTRE_Y } as React.CSSProperties}
      >
        <div className="pointer-events-auto flex w-full max-w-[34rem] flex-col items-center gap-5 text-center max-sm:max-w-[68vw]">
          <h2 id="intake-heading" className="t-display-lg engraved">
            The house letter.
          </h2>
          <p className="t-body engraved text-paper/70">New collections reach this list first.</p>
          {/* Two rows (Rems, 23 Nov): the chiselled line belongs to the
              field alone, so it is the FIELD that carries `chisel` now
              and not the form, and Join stands on its own line under
              it rather than sitting on the end of the cut. */}
          {state === "sent" ? (
            <p role="status" className="t-display-xs engraved">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="flex w-full flex-col items-stretch gap-4">
              <label htmlFor="intake-email" className="sr-only">
                Email address
              </label>
              <div className="chisel w-full">
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
                className="chisel-field w-full min-w-0 !bg-transparent px-1 py-3 text-center text-paper placeholder:text-paper/45 focus:outline-none"
              />
              </div>
              <button
                type="submit"
                className="chisel-submit engraved self-center"
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
