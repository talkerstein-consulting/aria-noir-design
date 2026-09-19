"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CtaButton } from "@/components/cta-link";
import { announceSession, house } from "@/lib/house-api";
import { useSession } from "@/lib/session";
import { emailError, isValidEmail, phoneError } from "@/lib/validation";

/**
 * The door: sign in, make an account, or recover one.
 *
 * ---- Where it comes from ----
 *
 * The Donuts `AuthModal`: three modes on one surface (in / new / forgot),
 * a reset form reached from the email, and a session cookie set by the
 * house API on success. What was taken is the modes and the calls. What
 * changed: it is a page, not a modal — a door is a place, not an
 * interruption — and every field is the house's `.field` object, because a
 * sign-in is not a special kind of form and should not look like one.
 *
 * ---- What this replaced ----
 *
 * A single email field that redirected to Shopify's customer accounts. The
 * house API owns the credential now (a password, hashed there; a session
 * cookie, httpOnly, first-party through the `/api/house` rewrite), so the
 * desk on this origin can read real orders. Nothing here is stored by the
 * page; the password goes to the API and nowhere else.
 *
 * `mode` and `prefill` let the confirmation page offer an account made
 * from the order's own details. `next` is where to go afterwards.
 */

type Mode = "in" | "new" | "forgot" | "reset";

const noop = () => () => {};

export function AccessForm({
  mode: initialMode = "in",
  prefill,
  next,
  resetToken,
}: {
  mode?: Mode;
  prefill?: { email?: string; firstName?: string; lastName?: string; phone?: string };
  next?: string;
  resetToken?: string;
}) {
  const known = useSession();
  const router = useRouter();
  /* The query, as an external store with an empty server snapshot: the
     page that renders this form is static and never sees it, and reading
     it this way hydrates without a mismatch. */
  const search = useSyncExternalStore(noop, () => window.location.search, () => "");
  const query = new URLSearchParams(search);
  const token = resetToken ?? query.get("reset") ?? undefined;
  const [modeDraft, setMode] = useState<Mode | null>(null);
  const mode: Mode = modeDraft ?? (token ? "reset" : query.get("mode") === "new" ? "new" : initialMode);
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState(prefill?.firstName ?? "");
  const [lastName, setLastName] = useState(prefill?.lastName ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  /* The destination survives a mode change; the complaint does not. */
  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNote("");
    setTouched({});
  };

  const destination = () => {
    const wanted = next || new URLSearchParams(window.location.search).get("next");
    /* Same-origin paths only: an open redirect on the sign-in page is a
       phishing lesson taught by the brand. */
    return wanted && wanted.startsWith("/") && !wanted.startsWith("//") ? wanted : "/desk";
  };

  const arrive = () => {
    announceSession();
    known.set(true);
    router.push(destination());
  };

  const submit = async () => {
    setError("");
    setNote("");
    setTouched({ email: true, password: true, confirm: true, firstName: true, lastName: true, phone: true });
    setBusy(true);
    try {
      if (mode === "in") {
        if (!isValidEmail(email) || !password) throw new Error("An email and a password, both.");
        await house.login(email.trim(), password);
        arrive();
      } else if (mode === "new") {
        if (!firstName.trim() || !lastName.trim()) throw new Error("A first and a last name.");
        if (!isValidEmail(email)) throw new Error(emailError(email) || "An email address.");
        if (phone && phoneError(phone)) throw new Error(phoneError(phone));
        if (password.length < 8) throw new Error("A password of at least eight characters.");
        if (password !== confirm) throw new Error("The two passwords do not match.");
        await house.register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        });
        arrive();
      } else if (mode === "forgot") {
        if (!isValidEmail(email)) throw new Error("The address the account was made with.");
        const result = await house.forgotPassword(email.trim());
        setNote(result.message || "If an account exists for that address, a reset link is on its way.");
      } else if (mode === "reset") {
        if (password.length < 8) throw new Error("A password of at least eight characters.");
        if (password !== confirm) throw new Error("The two passwords do not match.");
        await house.resetPassword(token!, password);
        setNote("Changed. Sign in with the new one.");
        setPassword("");
        setConfirm("");
        setMode("in");
        setTouched({});
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  };

  const field = (
    key: string,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    value: string,
    set: (v: string) => void,
    complaint = "",
    optional = false,
  ) => {
    const bad = Boolean(touched[key] && complaint);
    return (
      <label className="field" data-invalid={bad}>
        <span>
          {label}
          {optional ? <em className="not-italic opacity-60"> · optional</em> : null}
        </span>
        <input
          {...props}
          value={value}
          onChange={(e) => set(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
          aria-invalid={bad}
        />
        {bad ? <em className="field-error" role="alert">{complaint}</em> : null}
      </label>
    );
  };

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {mode !== "reset" ? (
        <nav className="access-modes" aria-label="Sign in or create an account">
          <button type="button" aria-current={mode === "in"} onClick={() => switchMode("in")}>Sign in</button>
          <button type="button" aria-current={mode === "new"} onClick={() => switchMode("new")}>New here</button>
        </nav>
      ) : null}

      {mode === "new" ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {field("firstName", "First name", { autoComplete: "given-name" }, firstName, setFirstName, firstName.trim() ? "" : "Needed.")}
          {field("lastName", "Last name", { autoComplete: "family-name" }, lastName, setLastName, lastName.trim() ? "" : "Needed.")}
        </div>
      ) : null}

      {mode !== "reset"
        ? field(
            "email",
            "Email",
            { type: "email", inputMode: "email", autoComplete: "email", required: true },
            email,
            setEmail,
            email.trim() ? emailError(email) : "Needed.",
          )
        : null}

      {mode === "new"
        ? field("phone", "Telephone", { type: "tel", inputMode: "tel", autoComplete: "tel" }, phone, setPhone, phoneError(phone), true)
        : null}

      {mode === "in" || mode === "new" || mode === "reset"
        ? field(
            "password",
            mode === "reset" ? "New password" : "Password",
            {
              type: "password",
              autoComplete: mode === "in" ? "current-password" : "new-password",
              minLength: mode === "in" ? undefined : 8,
              required: true,
            },
            password,
            setPassword,
            mode === "in" ? (password ? "" : "Needed.") : password.length >= 8 ? "" : "At least eight characters.",
          )
        : null}

      {mode === "new" || mode === "reset"
        ? field(
            "confirm",
            "Again",
            { type: "password", autoComplete: "new-password", minLength: 8, required: true },
            confirm,
            setConfirm,
            confirm && confirm !== password ? "The two do not match." : "",
          )
        : null}

      {mode === "forgot" ? (
        <p className="t-caption max-w-md">A link that works once, for an hour, goes to this address.</p>
      ) : null}

      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {note ? <p className="t-caption" role="status">{note}</p> : null}

      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        {/* The form still submits on Enter; the CTA is the build's. */}
        <CtaButton disabled={busy} onClick={() => void submit()}>
          {busy
            ? "One moment"
            : mode === "in"
              ? "Sign in"
              : mode === "new"
                ? "Make the account"
                : mode === "forgot"
                  ? "Send the link"
                  : "Change it"}
        </CtaButton>
        {mode === "in" ? (
          <button type="button" className="link-quiet" onClick={() => switchMode("forgot")}>
            Forgotten the password
          </button>
        ) : null}
        {mode === "forgot" ? (
          <button type="button" className="link-quiet" onClick={() => switchMode("in")}>
            Back to sign in
          </button>
        ) : null}
      </div>
    </form>
  );
}
