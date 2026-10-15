"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { CtaButton, CtaLink } from "@/components/cta-link";
import type { TryOnHouse } from "@/lib/try-on";
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

export function TryOn({
  houses,
  initialHouse,
  initialColour,
  fitCheck = false,
}: {
  houses: TryOnHouse[];
  initialHouse?: string;
  initialColour?: string;
  /** Development only: no camera, the frame on the tracker's reference
   *  head. See TryOnEngine.startFitCheck. */
  fitCheck?: boolean;
}) {
  const startHouse = houses.find((h) => h.slug === initialHouse) ?? houses[0];
  const startColour =
    startHouse.colours.find((c) => c.name === initialColour) ?? startHouse.colours[0];

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TryOnStatus>("searching");
  const [houseSlug, setHouseSlug] = useState(startHouse.slug);
  const [colourName, setColourName] = useState(startColour.name);
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TryOnEngine | null>(null);

  const house = houses.find((h) => h.slug === houseSlug) ?? startHouse;
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
      className="on-ink relative h-[100svh] min-h-[560px] overflow-hidden bg-ink"
      aria-label="Live try-on"
    >
      {/* ---- the mirror ---- */}
      <div ref={stageRef} className="absolute inset-0" aria-hidden={!live}>
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
        <div className="absolute inset-0 flex items-end sm:items-center">
          <Image
            src="/images/arca-ii/worn-noir-front.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          <div className="section relative w-full pb-[max(3rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-6xl">
              <h1 className="t-display-lg">The mirror.</h1>
              <p className="t-body t-body--lede mt-6 max-w-md">
                Every frame in the house, worn live. Turn your head. It follows.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <CtaButton onClick={open} disabled={phase === "opening"}>
                  {phase === "opening" ? "Opening the camera" : phase === "failed" ? "Try again" : fitCheck ? "Fit check" : "Open the camera"}
                </CtaButton>
              </div>

              <p className="t-caption mt-6" role={phase === "failed" ? "alert" : undefined}>
                {phase === "failed" && error
                  ? error
                  : "The camera stays on this device. Nothing is recorded or sent."}
              </p>
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
