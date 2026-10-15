"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Camera, ChevronDown, ChevronUp, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { CtaButton, CtaLink } from "@/components/cta-link";
import {
  NO_NUDGE,
  NUDGE_LIMIT,
  NUDGE_STEP,
  TRY_ON_PREVIEW,
  type TryOnHouse,
  type TryOnNudge,
} from "@/lib/try-on";
import { AppPreview } from "./app-preview";
import type { TryOnEngine, TryOnError, TryOnStatus } from "./engine";

/**
 * The live try-on.
 *
 * Four states, one stage. IDLE asks for the camera and says what happens
 * to the picture; nothing is requested until the reader presses the
 * button, because a permission prompt on arrival is the browser speaking
 * before the house has. OPENING holds while the camera and the network
 * load. LIVE is the mirror with the house and colour rail under it.
 * FAILED says which thing failed, in one line, and offers the button again.
 *
 * The engine (./engine) is imported on press, not at the top: it pulls in
 * WebAR.rocks and three, about 2MB with the network, and none of that is
 * worth a byte to a reader who never opens the camera.
 */

type Phase = "idle" | "opening" | "live" | "failed";

const ERRORS: Record<string, string> = {
  WEBCAM_UNAVAILABLE: "The camera is closed to this page. Allow it in the browser, then try again.",
  INSECURE: "The mirror needs a secure connection.",
  GL_INCOMPATIBLE: "This browser cannot draw the mirror. A current Chrome or Safari can.",
  MODEL_FAILED: "The frame did not load. Choose it again.",
};
const ERROR_FALLBACK = "The mirror did not open. Try again.";

/** The reader's fit, kept on this device for the next visit. */
const NUDGE_KEY = "an:tryon-fit";
function readNudge(): TryOnNudge {
  if (typeof window === "undefined") return NO_NUDGE;
  try {
    const v = JSON.parse(window.localStorage.getItem(NUDGE_KEY) ?? "null");
    if (v && [v.y, v.z, v.scale].every((n) => typeof n === "number")) return v;
  } catch {
    /* private mode, or something else wrote there */
  }
  return NO_NUDGE;
}
function writeNudge(n: TryOnNudge) {
  try {
    window.localStorage.setItem(NUDGE_KEY, JSON.stringify(n));
  } catch {
    /* the fit lasts the visit */
  }
}
const clamp = (v: number, limit: number, around = 0) =>
  Math.min(around + limit, Math.max(around - limit, v));

/** Read in the browser, not on the server: a page that reads its query
 *  string on the server is a function on Vercel, and this site is static
 *  (see DEPLOY.md). Server render gets the defaults. */
function param(name: string) {
  return typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get(name);
}
const noSubscribe = () => () => {};

export function TryOn({ houses }: { houses: TryOnHouse[] }) {
  /* `?fit=1`, development only: no camera, the frame on the tracker's
     reference head. See TryOnEngine.startFitCheck. Read through
     useSyncExternalStore so hydration sees the server's `false` first. */
  const fitCheck = useSyncExternalStore(
    noSubscribe,
    () => process.env.NODE_ENV !== "production" && param("fit") === "1",
    () => false,
  );

  /* `?house=<slug>&colour=<name>` opens on that frame. Nothing the idle
     screen draws depends on it, so the server's default and the client's
     choice render the same markup. */
  const [houseSlug, setHouseSlug] = useState(() => {
    const slug = param("house");
    return (houses.find((h) => h.slug === slug) ?? houses[0]).slug;
  });
  const startHouse = houses.find((h) => h.slug === houseSlug) ?? houses[0];
  const [colourName, setColourName] = useState(() => {
    const name = param("colour");
    return (startHouse.colours.find((c) => c.name === name) ?? startHouse.colours[0]).name;
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TryOnStatus>("searching");
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TryOnEngine | null>(null);
  const finePrintRef = useRef<HTMLDialogElement>(null);
  const [nudge, setNudge] = useState<TryOnNudge>(readNudge);
  const [fitOpen, setFitOpen] = useState(false);

  const house = startHouse;
  const colour = house.colours.find((c) => c.name === colourName) ?? house.colours[0];

  /* ---- put the chosen frame on, whenever the choice changes ---- */
  useEffect(() => {
    const engine = engineRef.current;
    if (phase !== "live" || !engine) return;
    let stale = false;
    setLoadingFrame(true);
    engine
      .wear(colour.model, house.fit)
      .catch((code: TryOnError) => {
        if (!stale) setError(ERRORS[code] ?? ERROR_FALLBACK);
      })
      .finally(() => {
        if (!stale) setLoadingFrame(false);
      });
    return () => {
      stale = true;
    };
  }, [phase, colour.model, house.fit]);

  /* ---- the reader's fit: applied live, kept for next time ---- */
  useEffect(() => {
    if (phase !== "live") return;
    engineRef.current?.setNudge(nudge);
    writeNudge(nudge);
  }, [phase, nudge]);

  const move = (axis: keyof TryOnNudge, dir: 1 | -1) =>
    setNudge((n) => ({
      ...n,
      [axis]:
        axis === "scale"
          ? Number(clamp(n.scale + dir * NUDGE_STEP.scale, NUDGE_LIMIT.scale, 1).toFixed(2))
          : clamp(n[axis] + dir * NUDGE_STEP[axis], NUDGE_LIMIT[axis]),
    }));

  /* ---- keep the URL on the frame being worn, so it can be sent ---- */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("house", house.slug);
    url.searchParams.set("colour", colour.name);
    window.history.replaceState(null, "", url);
  }, [house.slug, colour.name]);

  /* ---- resize, and close the camera on the way out ---- */
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => engineRef.current?.resize(), 150);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const open = useCallback(async () => {
    if (!fitCheck && !window.isSecureContext) {
      setError(ERRORS.INSECURE);
      setPhase("failed");
      return;
    }
    setError(null);
    setPhase("opening");
    try {
      const { TryOnEngine } = await import("./engine");
      const engine = new TryOnEngine({
        faceCanvas: faceRef.current!,
        threeCanvas: threeRef.current!,
        onStatus: setStatus,
      });
      engineRef.current = engine;
      await (fitCheck ? engine.startFitCheck() : engine.start());
      window.scrollTo(0, 0);
      setPhase("live");
    } catch (code) {
      await engineRef.current?.destroy();
      engineRef.current = null;
      setError(ERRORS[String(code)] ?? ERROR_FALLBACK);
      setPhase("failed");
    }
  }, [fitCheck]);

  const close = useCallback(async () => {
    await engineRef.current?.destroy();
    engineRef.current = null;
    setShot(null);
    setStatus("searching");
    setPhase("idle");
  }, []);

  const capture = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setShot(engine.capture().toDataURL("image/jpeg", 0.92));
  }, []);

  const fileName = `aria-noir-${house.slug}-${colour.name.toLowerCase().replace(/\s+/g, "-")}.jpg`;

  const save = () => {
    if (!shot) return;
    const a = document.createElement("a");
    a.href = shot;
    a.download = fileName;
    a.click();
  };

  const chooseHouse = (slug: string) => {
    const next = houses.find((h) => h.slug === slug);
    if (!next) return;
    setHouseSlug(next.slug);
    /* Keep the acetate if the next house is poured in it too. */
    setColourName(
      (next.colours.find((c) => c.name === colourName) ?? next.colours[0]).name,
    );
  };

  const live = phase === "live";

  return (
    <section
      className={`on-ink relative bg-ink ${live ? "h-[100svh] min-h-[560px] overflow-hidden" : ""}`}
      aria-label="Live try-on"
    >
      {/* ---- the mirror ----
          Fixed to the viewport and laid out even while hidden, so the
          engine measures the screen it will draw on, not the landing. */}
      <div
        ref={stageRef}
        className={`fixed inset-0 bg-ink ${live ? "" : "invisible"}`}
        aria-hidden={!live}
      >
        <canvas
          ref={faceRef}
          className="absolute inset-0 h-full w-full -scale-x-100"
        />
        <canvas
          ref={threeRef}
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
        />
      </div>

      {/* ---- before the camera ---- */}
      {!live && (
        <div className="relative isolate overflow-hidden">
          <Image
            src="/images/arca-ii/ground-hall.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 scale-110 object-cover opacity-30 blur-md"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/85 to-black" />

          <div className="section mx-auto grid min-h-[100svh] max-w-6xl content-center items-center gap-x-20 gap-y-12 pt-28 lg:grid-cols-[1fr_minmax(0,24rem)] lg:pt-32">
            <div>
              <h1 className="t-display-xl rise-now">The mirror.</h1>
              <p className="t-body t-body--lede rise-now mt-6 max-w-md">
                Every frame in the house, on your face, live.
              </p>
              <div className="mt-10">
                <CtaButton
                  onClick={open}
                  disabled={phase === "opening"}
                  icon={<Camera size={16} strokeWidth={1.5} />}
                >
                  {phase === "opening" ? "Opening the camera" : phase === "failed" ? "Try again" : fitCheck ? "Fit check" : "Open the camera"}
                </CtaButton>
              </div>
              {phase === "failed" && error && (
                <p className="t-caption mt-6" role="alert">
                  {error}
                </p>
              )}

              {/* ---- the fine print ----
                  One line where the camera is asked for; the whole of it a
                  press away. See FinePrint below and docs/TRY-ON.md. */}
              <p className="t-micro mt-5 normal-case tracking-normal">
                Nothing leaves this device.{" "}
                <button
                  type="button"
                  onClick={() => finePrintRef.current?.showModal()}
                  className="underline underline-offset-2 hover:text-[var(--fg-primary)]"
                >
                  Details
                </button>
              </p>
              <FinePrint ref={finePrintRef} />
            </div>

            <div>
              <AppPreview houses={houses} slides={TRY_ON_PREVIEW} />
            </div>
          </div>
        </div>
      )}

      {/* ---- in the mirror ---- */}
      {live && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center px-6">
            {(status === "searching" || loadingFrame || error) && (
              <p
                className="t-label bg-black/60 px-4 py-2 text-[var(--fg-primary)] backdrop-blur"
                role="status"
              >
                {error ?? (loadingFrame ? "Bringing the frame" : "Face the camera")}
              </p>
            )}
          </div>

          {/* ---- the fit ----
              The tracker places every frame on a mean face; a real face is
              not one. Three corrections, each a millimetre or two a press:
              height on the nose, distance from the face, size. */}
          <button
            type="button"
            onClick={() => setFitOpen((o) => !o)}
            aria-expanded={fitOpen}
            aria-controls="try-on-fit"
            className={`absolute left-4 top-24 flex h-11 items-center gap-2 px-4 text-[var(--fg-primary)] backdrop-blur transition-colors sm:left-8 ${
              fitOpen ? "bg-white/20" : "bg-black/50 hover:bg-black/80"
            }`}
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden />
            <span className="t-label text-[var(--fg-primary)]">Fit</span>
          </button>
          {fitOpen && (
            <div
              id="try-on-fit"
              /* A row across the top on a phone, where a column would sit
                 over the face; a column down the left on anything wider. */
              className="absolute inset-x-4 top-[8.25rem] flex items-end justify-between gap-2 bg-black/70 px-3 py-3 backdrop-blur sm:inset-x-auto sm:left-8 sm:w-44 sm:flex-col sm:items-stretch sm:gap-3 sm:p-4"
              role="group"
              aria-label="Fit"
            >
              <FitRow
                label="Height"
                less={{ label: "Lower", icon: <ChevronDown size={16} strokeWidth={1.5} />, on: () => move("y", -1), off: nudge.y <= -NUDGE_LIMIT.y }}
                more={{ label: "Higher", icon: <ChevronUp size={16} strokeWidth={1.5} />, on: () => move("y", 1), off: nudge.y >= NUDGE_LIMIT.y }}
              />
              <FitRow
                label="Depth"
                less={{ label: "Closer to the face", icon: <Minus size={16} strokeWidth={1.5} />, on: () => move("z", -1), off: nudge.z <= -NUDGE_LIMIT.z }}
                more={{ label: "Further from the face", icon: <Plus size={16} strokeWidth={1.5} />, on: () => move("z", 1), off: nudge.z >= NUDGE_LIMIT.z }}
              />
              <FitRow
                label="Size"
                less={{ label: "Smaller", icon: <Minus size={16} strokeWidth={1.5} />, on: () => move("scale", -1), off: nudge.scale <= 1 - NUDGE_LIMIT.scale }}
                more={{ label: "Larger", icon: <Plus size={16} strokeWidth={1.5} />, on: () => move("scale", 1), off: nudge.scale >= 1 + NUDGE_LIMIT.scale }}
              />
              <button
                type="button"
                onClick={() => setNudge(NO_NUDGE)}
                disabled={nudge.y === 0 && nudge.z === 0 && nudge.scale === 1}
                className="t-label pb-2 text-[var(--fg-secondary)] underline underline-offset-2 hover:text-[var(--fg-primary)] disabled:no-underline disabled:opacity-40 sm:w-full sm:pb-0 sm:pt-1 sm:text-left"
              >
                Reset
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-24 grid size-11 place-items-center bg-black/50 text-[var(--fg-primary)] backdrop-blur transition-colors hover:bg-black/80 sm:right-8"
            aria-label="Close the camera"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* houses */}
            <div
              className="flex gap-6 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] sm:justify-center"
              role="tablist"
              aria-label="House"
            >
              {houses.map((h) => {
                const on = h.slug === house.slug;
                return (
                  <button
                    key={h.slug}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => chooseHouse(h.slug)}
                    className={`t-label shrink-0 border-b py-2 transition-colors ${
                      on
                        ? "border-[var(--fg-primary)] text-[var(--fg-primary)]"
                        : "border-transparent hover:text-[var(--fg-secondary)]"
                    }`}
                  >
                    {h.name}
                  </button>
                );
              })}
            </div>

            {/* colours */}
            <div
              className="mt-4 flex gap-3 overflow-x-auto px-[var(--gutter)] py-1 [scrollbar-width:none] sm:justify-center"
              role="radiogroup"
              aria-label="Colourway"
            >
              {house.colours.map((c) => {
                const on = c.name === colour.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColourName(c.name)}
                    className={`size-8 shrink-0 border transition-[box-shadow] ${
                      on
                        ? "border-white/80 shadow-[0_0_0_3px_#000,0_0_0_4px_rgba(255,255,255,0.8)]"
                        : "border-white/25 hover:border-white/60"
                    }`}
                    style={{ background: c.swatch }}
                  />
                );
              })}
            </div>

            {/* the frame being worn */}
            <div className="mx-auto mt-5 flex max-w-6xl flex-wrap items-center justify-between gap-4 px-[var(--gutter)]">
              <div>
                <p className="t-display-xs">{house.name}</p>
                <p className="t-label mt-1">
                  {colour.name} · {colour.price}
                  {!colour.available && " · Out of the workshop"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CtaButton kind="secondary" onClick={capture}>
                  Capture
                </CtaButton>
                <CtaLink href={colour.href}>View the frame</CtaLink>
              </div>
            </div>
          </div>

          {/* ---- the capture ---- */}
          {shot && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-black/90 p-6"
              role="dialog"
              aria-label="Capture"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a data URL, nothing to optimise */}
              <img
                src={shot}
                alt={`${house.name} in ${colour.name}, worn`}
                className="max-h-[65svh] w-auto max-w-full"
              />
              <div className="flex gap-3">
                <CtaButton onClick={save}>Save</CtaButton>
                <CtaButton kind="secondary" onClick={() => setShot(null)}>
                  Back to the mirror
                </CtaButton>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * The fine print, in a native <dialog>: modal, Escape closes it, focus is
 * trapped and returned by the browser. Said where the camera is asked
 * for, not only in a policy: what the camera is for, that nothing leaves
 * the device, that opening it is the agreement, and that a likeness is
 * not a fitting. Reviewed wording belongs to counsel; see docs/TRY-ON.md.
 */
function FinePrint({ ref }: { ref: React.Ref<HTMLDialogElement> }) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="try-on-fine-print"
      className="on-ink m-auto w-[min(32rem,calc(100vw-2rem))] border border-[var(--fg-rule)] bg-ink p-0 text-[var(--fg-secondary)] backdrop:bg-black/70"
      onClick={(e) => {
        /* A press on the backdrop lands on the dialog itself. */
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <h2 id="try-on-fine-print" className="t-display-xs">
            The camera
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className="-m-2 grid size-9 place-items-center text-[var(--fg-primary)]"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </form>
        </div>
        <div className="t-body t-body--tight mt-5 space-y-4">
          <p>
            The camera is used only to place the frame on your face. Tracking runs on this
            device. No image, video or facial data is recorded, stored or sent. Opening the
            camera means you agree to this.
          </p>
          <p>
            A capture is made in the browser and saved only where you save it.
          </p>
          <p>
            The try-on is a likeness, not a fitting. Colour, size and fit can differ from the
            frame in hand. It is not a prescription or pupillary distance measurement.
          </p>
          <p>The preview on this page uses campaign photography.</p>
          <p className="t-caption">
            Face tracking by WebAR.rocks, under the MIT licence.{" "}
            <Link href="/policies/privacy" className="underline underline-offset-2">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/policies/terms" className="underline underline-offset-2">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </dialog>
  );
}

type FitStep = { label: string; icon: React.ReactNode; on: () => void; off: boolean };

/** One correction: its name, and a press each way. */
function FitRow({ label, less, more }: { label: string; less: FitStep; more: FitStep }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between sm:gap-3">
      <span className="t-label text-[var(--fg-secondary)]">{label}</span>
      <div className="flex gap-1">
        {[less, more].map((step) => (
          <button
            key={step.label}
            type="button"
            onClick={step.on}
            disabled={step.off}
            aria-label={step.label}
            title={step.label}
            className="grid size-9 place-items-center border border-white/25 text-[var(--fg-primary)] transition-colors hover:border-white/70 disabled:opacity-30"
          >
            {step.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
