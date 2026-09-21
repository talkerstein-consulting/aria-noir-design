"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CtaButton } from "@/components/cta-link";
import { contact } from "@/lib/pages";

/**
 * The contact intake, one question per screen.
 *
 * Three steps: what it is about, who is asking, the message. Splitting it
 * is not decoration. The first answer decides which desk the mail goes
 * to, which is the thing the old six-route block existed to explain; now
 * nobody has to read six paragraphs to find out that a hinge is warranty
 * and a bite at the temple is support. They say what it is, and the
 * address follows.
 *
 * Every row is `field-row` / `field`, the site's one input treatment.
 * Everything pressable is the site's CTA object, and only that: the
 * choices on the first step are secondary (outlined), the chosen one
 * holds `aria-current` and goes gold the way the desk's rooms do; the way
 * on is the one main CTA on the screen, and Back is secondary beside it.
 * No third style, no arrows. The step that is not on screen is not in
 * the DOM at all, so Tab never lands in a hidden field and a screen
 * reader hears one question at a time. The step counter is a live region
 * so the change is announced.
 *
 * No backend yet. Rather than pretend, Send hands off to `mailto:` with
 * everything filled in, which is honest about where the reply comes from
 * and works with nothing deployed behind it. When a real endpoint exists,
 * `submit` is the only function that changes.
 */
export function ContactIntake() {
  const { form, intake } = contact;
  const id = useId();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState<number | null>(null);
  const [who, setWho] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const last = intake.steps.length - 1;
  const chosen = subject == null ? null : intake.subjects[subject];

  /* The way on is a CtaButton, which is `type="button"` by design, so it
     asks the current step's form to submit: that keeps the browser's own
     `required` check in the loop. */
  const formRef = useRef<HTMLFormElement>(null);
  const go = () => formRef.current?.requestSubmit();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chosen) return;
    const body = [
      `Name: ${who.name}`,
      `Email: ${who.email}`,
      `Phone: ${who.phone || "not given"}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${chosen.to}?subject=${encodeURIComponent(
      `${chosen.label}: ${who.name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  /* Each step is its own <form>, so the browser's own `required` check
     runs per step and Enter in a field means "continue", not "send". */
  const advance = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep((s) => Math.min(last, s + 1));
  };

  return (
    <div className="stack stack--sm w-full">
      <p className="t-label" aria-live="polite">
        <span className="text-[var(--fg-accent)]">
          {String(step + 1).padStart(2, "0")}
        </span>
        <span className="text-[var(--fg-tertiary)]">
          {" / "}
          {String(intake.steps.length).padStart(2, "0")}
        </span>
        <span className="ml-4">{intake.steps[step]}</span>
      </p>

      {step === 0 ? (
        <form ref={formRef} onSubmit={advance} className="stack stack--sm mt-4">
          <div
            role="group"
            aria-label={intake.steps[0]}
            className="flex flex-wrap gap-3"
          >
            {intake.subjects.map((s, i) => (
              <CtaButton
                key={s.label}
                kind="secondary"
                current={i === subject}
                onClick={() => setSubject(i)}
              >
                {s.label}
              </CtaButton>
            ))}
          </div>
          <Nav
            step={step}
            last={last}
            disabled={subject == null}
            onBack={() => setStep((s) => Math.max(0, s - 1))}
            onNext={go}
          />
        </form>
      ) : null}

      {step === 1 ? (
        <form ref={formRef} onSubmit={advance} className="stack stack--sm mt-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field
              id={`${id}-name`}
              label={form.name}
              value={who.name}
              onChange={(v) => setWho({ ...who, name: v })}
              required
              autoComplete="name"
            />
            <Field
              id={`${id}-email`}
              label={form.email}
              type="email"
              value={who.email}
              onChange={(v) => setWho({ ...who, email: v })}
              required
              autoComplete="email"
            />
          </div>
          <Field
            id={`${id}-phone`}
            label={form.phone}
            type="tel"
            value={who.phone}
            onChange={(v) => setWho({ ...who, phone: v })}
            autoComplete="tel"
          />
          <Nav
            step={step}
            last={last}
            onBack={() => setStep((s) => Math.max(0, s - 1))}
            onNext={go}
          />
        </form>
      ) : null}

      {step === 2 ? (
        <form ref={formRef} onSubmit={submit} className="stack stack--sm mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-message`} className="t-label">
              {form.message}
            </label>
            <div className="field-row">
              <textarea
                id={`${id}-message`}
                name="message"
                rows={5}
                required
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="field resize-none"
              />
            </div>
          </div>
          <p className="t-micro" role="status">
            {sent ? intake.sent : form.note}
          </p>
          <Nav
            step={step}
            last={last}
            onBack={() => setStep((s) => Math.max(0, s - 1))}
            onNext={go}
          />
        </form>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="t-label">
        {label}
      </label>
      <div className="field-row">
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      </div>
    </div>
  );
}

/** Back on the left, the way on at the right: one main CTA, one
 *  secondary, the pair the whole site uses. Back is absent on the first
 *  step rather than disabled: a disabled control is a question. */
function Nav({
  step,
  last,
  disabled,
  onBack,
  onNext,
}: {
  step: number;
  last: number;
  disabled?: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const { intake } = contact;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      {step > 0 ? (
        <CtaButton kind="secondary" onClick={onBack}>
          {intake.back}
        </CtaButton>
      ) : (
        <span />
      )}
      <CtaButton onClick={onNext} disabled={disabled}>
        {step === last ? intake.send : intake.next}
      </CtaButton>
    </div>
  );
}
