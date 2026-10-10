"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { house } from "@/lib/house-api";

/**
 * The two things the house asks of a first visit, in order:
 *
 *   1. Cookies. A bar along the foot of the screen, never a wall. Nothing
 *      else is asked until it is answered.
 *   2. The gift. Five seconds after the page settles (and after the
 *      cookie answer), a sheet slides up from the bottom over a tint:
 *      leave an address, receive a code for a complimentary gift with the
 *      next frame. Adapted from DITA's roll-case offer.
 *
 * Both answers live in this browser only. The gift does not ask again for
 * GIFT_QUIET_DAYS once closed, and never again once an address is given.
 */

/* The burn-in. Lazy: three.js only loads when the gift is about to show. */
const EmberReveal = dynamic(() => import("@/components/ember-reveal"), {
  ssr: false,
  loading: () => <div className="ember-placeholder" aria-hidden />,
});

const CONSENT_KEY = "an:consent";
const GIFT_KEY = "an:gift";
const GIFT_DELAY_MS = 5000;
const GIFT_QUIET_DAYS = 14;
/** Where the reader last clicked or tapped: the gift's burn starts there. */
let lastTap: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastTap = { x: e.clientX, y: e.clientY };
    },
    { capture: true, passive: true },
  );
}

/** Rooms where an interruption costs more than it earns. */
const QUIET_ROUTES = ["/checkout", "/sitemap", "/poster"];

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode: the answer lasts the visit */
  }
}

export function HouseNotices() {
  const pathname = usePathname();
  const quiet = QUIET_ROUTES.some((r) => pathname.startsWith(r));

  const [consent, setConsent] = useState<string | null | undefined>(undefined);
  const [gift, setGift] = useState(false);

  useEffect(() => setConsent(read(CONSENT_KEY)), []);

  /* The gift waits for the cookie answer, then five seconds. */
  useEffect(() => {
    if (quiet || consent === undefined || consent === null) return;
    const g = read(GIFT_KEY);
    if (g === "joined") return;
    if (g && Date.now() - Number(g) < GIFT_QUIET_DAYS * 864e5) return;
    const t = window.setTimeout(() => setGift(true), GIFT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [consent, quiet]);

  const answer = (v: "all" | "necessary") => {
    write(CONSENT_KEY, v);
    setConsent(v);
  };

  return (
    <>
      {consent === null && !quiet ? <CookieNotice onAnswer={answer} /> : null}
      <GiftSheet
        open={gift}
        onClose={(joined) => {
          write(GIFT_KEY, joined ? "joined" : String(Date.now()));
          setGift(false);
        }}
      />
    </>
  );
}

/* ── Cookies ───────────────────────────────────────────────────────── */

function CookieNotice({ onAnswer }: { onAnswer: (v: "all" | "necessary") => void }) {
  return (
    <div
      role="region"
      aria-label="Cookies"
      className="notice-in fixed inset-x-0 bottom-0 z-[90] bg-ink/45 text-paper backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="max-w-2xl">
          <p className="t-display-xs">Cookies</p>
          <p className="t-caption mt-1 text-paper/70">
            The house keeps what the site needs to work. With your yes, it also keeps a record of
            what is looked at, to know which frames to show first.{" "}
            <Link href="/policies/privacy" className="underline underline-offset-4 hover:text-paper">
              Privacy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="cta-secondary notice-btn" onClick={() => onAnswer("necessary")}>
            Necessary only
          </button>
          <button type="button" className="cta-main notice-btn" onClick={() => onAnswer("all")}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── The gift ──────────────────────────────────────────────────────── */

function GiftSheet({ open, onClose }: { open: boolean; onClose: (joined: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const field = useRef<HTMLInputElement>(null);
  /* ---- The inverse burn ----
     The page stays as it is. An ember starts at the centre and, where it
     passes, the sheet exists. Done by rasterising the card, burning that
     picture INTO an empty canvas (EmberReveal, burnThrough="form"), then
     swapping in the real, live card when the burn completes.

       raster  card laid out, invisible; html-to-image takes its picture
       burn    the picture burns in from the last click (else the centre)
       shown   the live card; the overlay is gone */
  const card = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "raster" | "burn" | "shown">("idle");
  const [picture, setPicture] = useState<string | null>(null);
  const [origin, setOrigin] = useState<readonly [number, number]>([0.5, 0.5]);
  /* The burn layer stays invisible until its WebGL canvas exists and has
     drawn: before that it showed as a black box for a beat. */
  const burnLayer = useRef<HTMLDivElement>(null);
  const [inked, setInked] = useState(false);
  useEffect(() => {
    if (phase !== "burn") {
      setInked(false);
      return;
    }
    let raf = 0;
    let frames = 0;
    const wait = () => {
      if (burnLayer.current?.querySelector("canvas")) frames += 1;
      if (frames >= 3) setInked(true);
      else raf = requestAnimationFrame(wait);
    };
    raf = requestAnimationFrame(wait);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("shown");
      return;
    }
    setPhase("raster");
    let cancelled = false;
    (async () => {
      try {
        const node = card.current;
        if (!node) throw new Error("no card");
        await document.fonts.ready;
        await Promise.all(
          Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)),
        );
        const { toPng } = await import("html-to-image");
        const png = await toPng(node, {
          pixelRatio: Math.min(2, window.devicePixelRatio || 1),
          style: { opacity: "1" },
        });
        if (cancelled) return;
        /* The last click, as a fraction of the card; past its edge it is
           pinned to the nearest side, so the burn still enters from the
           direction the reader was working in. Centre if nothing yet. */
        const box = node.getBoundingClientRect();
        const frac = (v: number) => Math.min(1, Math.max(0, v));
        setOrigin(
          lastTap && box.width && box.height
            ? [frac((lastTap.x - box.left) / box.width), frac((lastTap.y - box.top) / box.height)]
            : [0.5, 0.5],
        );
        setPicture(png);
        setPhase("burn");
      } catch {
        if (!cancelled) setPhase("shown");
      }
    })();
    /* Never leave the sheet unseen: no WebGL, a slow raster, a failed burn. */
    const t = window.setTimeout(() => setPhase("shown"), 7000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(state === "sent");
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => field.current?.focus({ preventScroll: true }), 500);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose, state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      await house.subscribe(email.trim());
      setState("sent");
      setMessage("Your code is on its way.");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "That didn't go through. Try again.");
    }
  }

  return (
    <div
      className="gift-root fixed inset-0 z-[95]"
      data-open={open || undefined}
      aria-hidden={!open}
      inert={!open}
    >
      {/* The tint. A click on it is a no. */}
      <div className="gift-tint absolute inset-0 bg-ink/65" onClick={() => onClose(state === "sent")} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-heading"
        data-phase={phase}
        className="gift-sheet absolute inset-x-0 bottom-0 mx-auto w-full max-w-4xl"
      >
        {/* The card burns in from its centre. The overlay holds the
            card's picture; the live card stays invisible until it is done. */}
        {phase === "burn" && picture ? (
          <div
            ref={burnLayer}
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: inked ? 1 : 0 }}
          >
            <EmberReveal
              images={[picture, picture]}
              burnThrough="form"
              igniteAt={origin}
              aspectRatio={0}
              radius={0}
              hover={false}
              clickToBurn={false}
              autoplay={false}
              burnDuration={0.8}
              roughness={0.6}
              emberColor="#FFFFFF"
              charColor="#121110"
              smoke={0.3}
              sparks={0.7}
              onChange={() => setPhase("shown")}
              className="!cursor-default"
            />
          </div>
        ) : null}

        <div
          ref={card}
          className="gift-card grid max-h-[92svh] w-full overflow-y-auto bg-paper text-ink md:grid-cols-[1fr_1.1fr]"
        >
        <div className="relative hidden aspect-[4/5] md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/home/gift-36.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <div className="on-paper relative flex flex-col gap-5 px-6 pt-12 pb-8 sm:px-10">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onClose(state === "sent")}
            className="absolute top-4 right-4 p-2 text-ink/70 hover:text-ink"
          >
            <X aria-hidden size={20} strokeWidth={1.25} />
          </button>

          <h2 id="gift-heading" className="t-display-md">
            Something new is taking shape.
          </h2>
          <p className="t-body text-ink/75">
            Join the list for a complimentary gift with your frame and first access to what comes
            next.
          </p>

          {state === "sent" ? (
            <p role="status" className="t-display-xs py-6">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <label htmlFor="gift-email" className="sr-only">
                Email address
              </label>
              <input
                ref={field}
                id="gift-email"
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
                aria-describedby="gift-status"
                className="field w-full px-4 py-3"
              />
              <button type="submit" className="cta-main w-full" disabled={state === "busy"} aria-busy={state === "busy"}>
                Send my code
              </button>
              <label className="t-caption flex items-start gap-3 text-ink/75">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 size-4 accent-ink"
                />
                Write to me about new frames and the house.
              </label>
              <p id="gift-status" role="status" aria-live="polite" className="t-caption min-h-[1lh] text-ink/80">
                {state === "error" ? message : ""}
              </p>
            </form>
          )}

          {/* Plain fine print: normal spacing and case, not the spaced caps
              the micro style carries. */}
          <p className="font-ui text-xs leading-relaxed tracking-normal normal-case text-ink/55">
            Unsubscribe at any time from any letter. See the{" "}
            <Link href="/policies/privacy" className="underline underline-offset-2">
              privacy policy
            </Link>
            . Questions: support@arianoir.com
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
