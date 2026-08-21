"use client";

import { useEffect, useRef, useState } from "react";
import { FRAMES_PER_VH, TRIGGERS } from "@/lib/timeline";

/**
 * Dev HUD pinned to the scrollbar edge. Reads the same TRIGGERS table the
 * choreography derives from, so the labels can't drift from actual behaviour.
 * 100 frames == 1 viewport height. Press "f" to toggle.
 */
export function ScrollHud() {
  const [visible, setVisible] = useState(true);
  const frameEl = useRef<HTMLDivElement>(null);
  const markerEl = useRef<HTMLDivElement>(null);
  const activeEl = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const update = () => {
      const vh = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - vh;
      const frame = (window.scrollY / vh) * FRAMES_PER_VH;
      const totalFrames = (maxScroll / vh) * FRAMES_PER_VH;

      if (frameEl.current) frameEl.current.textContent = String(Math.round(frame));
      if (markerEl.current) {
        markerEl.current.style.top = `${(frame / totalFrames) * 100}%`;
      }

      let activeIdx = -1;
      for (let i = 0; i < TRIGGERS.length; i++) {
        if (frame >= TRIGGERS[i].frame) activeIdx = i;
      }
      if (activeEl.current) {
        activeEl.current.textContent =
          activeIdx >= 0 ? TRIGGERS[activeIdx].label : "—";
      }
      tickRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = i === activeIdx ? "1" : "0.42";
        el.style.color = i === activeIdx ? "var(--gold)" : "var(--paper)";
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [visible]);

  if (!visible) return null;

  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const total =
    typeof document !== "undefined"
      ? ((document.documentElement.scrollHeight - vh) / vh) * FRAMES_PER_VH
      : 550;

  return (
    /* dev-only overlay — it would cover half a phone screen, so it is
       desktop-only */
    <div className="pointer-events-none fixed top-0 right-0 z-[60] hidden h-screen w-52 font-mono text-[10px] select-none lg:block">
      {/* rail */}
      <div className="absolute top-0 right-3 h-full w-px bg-paper/20" />

      {/* current-frame marker */}
      <div
        ref={markerEl}
        className="absolute right-0 flex w-full items-center justify-end gap-1"
        style={{ top: "0%" }}
      >
        <div
          ref={frameEl}
          className="bg-gold px-1.5 py-0.5 font-bold text-ink tabular-nums"
        >
          0
        </div>
        <div className="h-px w-3 bg-gold" />
      </div>

      {/* trigger ticks */}
      {TRIGGERS.map((t, i) => (
        <div
          /* NOT keyed by frame: two triggers legitimately share one (rotation
             completing and the scene starting to move are both 560), and a
             duplicate key lets React drop or duplicate the tick. */
          key={`${t.frame}-${t.label}`}
          ref={(el) => {
            tickRefs.current[i] = el;
          }}
          className="absolute right-3 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap"
          style={{ top: `${(t.frame / total) * 100}%`, opacity: 0.42 }}
        >
          <span className="text-right leading-none">{t.label}</span>
          <span className="tabular-nums opacity-70">{t.frame}</span>
          <span className="block h-px w-2 bg-current" />
        </div>
      ))}

      {/* active readout */}
      <div className="absolute right-8 bottom-4 max-w-40 text-right leading-tight text-gold">
        <div ref={activeEl}>—</div>
        <div className="mt-1 text-paper/40">f · toggle</div>
      </div>
    </div>
  );
}
