"use client";

import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import { preorderModal as copy } from "@/lib/content";
import { CtaButton } from "@/components/cta-link";

/**
 * The private-access sign-up, grown out of its own CTA.
 *
 * Tapping the button does not open anything over the page. The solid block
 * the reader just pressed widens in place, its fill drains to a rule, and
 * the two fields arrive inside the box the button was. One object, three
 * states — the offer, the form, the receipt — and the reader never leaves
 * the film behind it.
 *
 * Both states are laid in the same grid cell so the box can transition its
 * width between them; a wrapper that swapped children would jump.
 */
export function AccessIntake({ cta }: { cta: string }) {
  const [phase, setPhase] = useState<"cta" | "form" | "done">("cta");
  const name = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const emailId = useId();

  const open = useCallback(() => {
    setPhase("form");
    /* Focus after the box has begun to widen, not before: an input focused
       inside a zero-opacity panel scrolls nothing and reads as a tap that
       did nothing. */
    window.setTimeout(() => name.current?.focus(), 220);
  }, []);

  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* Nothing is sent yet; see the note in lib/content. When there is an
       endpoint, POST `name` and `email` from here. */
    setPhase("done");
  }, []);

  const asking = phase !== "cta";

  return (
    <div
      className="access-intake pointer-events-auto mt-6"
      data-phase={phase}
    >
      <div className="access-intake__cta" inert={asking}>
        <CtaButton onClick={open} aria-expanded={asking}>
          {cta}
        </CtaButton>
      </div>

      <div className="access-intake__panel" aria-hidden={!asking} inert={!asking}>
        <div className="access-intake__inner">
        {phase === "done" ? (
          <div className="text-left">
            <p className="t-eyebrow">{copy.done.heading}</p>
            <p className="t-body t-body--tight">{copy.done.body}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="text-left">
            <div className="field-row">
              <label htmlFor={nameId} className="sr-only">
                Name
              </label>
              <input
                ref={name}
                id={nameId}
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Name"
                className="field"
              />
            </div>
            <div className="field-row">
              <label htmlFor={emailId} className="sr-only">
                {copy.label}
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={copy.label}
                className="field"
              />
              <button type="submit" aria-label={copy.cta} className="field-submit">
                <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <p className="access-intake__note font-ui text-xs text-paper/55">
              {copy.note}
            </p>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
