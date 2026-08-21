"use client";

import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/cta-link";
import { useCallback, useRef } from "react";
import { collections } from "@/lib/content";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/* zones within the section's own 0→1 progress */
const PLATE_IN = 0.08;
const PLATE_OUT = 0.4; // plate has filled the screen
const P2_IN = 0.46;
const P2_OUT = 0.66;
const P3_IN = 0.7;
const P3_OUT = 0.9;

const PLATE_START_SCALE = 0.22; // 22vw × 22vh
const PLATE_REST_Y_VH = 24; // sits LOW, beneath the heading
const HEAD_OFFSET_VH = -16;
const TINT = "bg-ink/45";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Sticky stage. Panel N+1 always sits above panel N (z 20 / 21 / 22) and
 * slides in from the right, so each covers the previous cover.
 *
 * Panel 01 is not a slide — it IS the plate sitting low under the heading,
 * scaled up until it fills the screen.
 */
export function CollectionsSection() {
  const wrap = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  const onProgress = useCallback((p: number) => {
    const plateP = easeInOutCubic(
      clamp01((p - PLATE_IN) / (PLATE_OUT - PLATE_IN)),
    );
    const p2 = easeInOutCubic(clamp01((p - P2_IN) / (P2_OUT - P2_IN)));
    const p3 = easeInOutCubic(clamp01((p - P3_IN) / (P3_OUT - P3_IN)));

    if (head.current) head.current.style.opacity = String(1 - plateP);
    if (plate.current) {
      plate.current.style.transform = `translateY(${lerp(PLATE_REST_Y_VH, 0, plateP)}vh) scale(${lerp(PLATE_START_SCALE, 1, plateP)})`;
    }

    const slide = [p2, p3];
    panels.current.forEach((el, i) => {
      if (el) el.style.transform = `translateX(${(1 - slide[i]) * 100}%)`;
    });

    const labelP = [plateP, p2, p3];
    labels.current.forEach((el, i) => {
      if (!el) return;
      const o = clamp01((labelP[i] - 0.75) / 0.25);
      el.style.opacity = String(o);
      /* Only the panel that has actually arrived is clickable. Without this
         a label still at opacity 0 mid-slide would keep a full-screen link
         over the stage and swallow clicks meant for the panel on top. */
      el.style.pointerEvents = o > 0.9 ? "auto" : "none";
    });
  }, []);

  useScrollProgress(wrap, onProgress);

  const [first, ...rest] = collections.items;

  return (
    <section ref={wrap} className="relative z-[35] h-[420vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* preheader + italic/caps heading — rides above the plate */}
        <div
          ref={head}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        >
          <div
            className="flex flex-col items-center gap-5 px-8"
            style={{ transform: `translateY(${HEAD_OFFSET_VH}vh)` }}
          >
            <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
              {collections.preheader}
            </p>
            <h2 className="text-center font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl">
              {collections.heading.map((seg) => (
                <span key={seg.text} className={seg.italic ? "italic" : ""}>
                  {seg.text}{" "}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* collection 01 — the expanding plate */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            ref={plate}
            className="relative h-screen w-screen origin-center overflow-hidden will-change-transform"
            style={{
              transform: `translateY(${PLATE_REST_Y_VH}vh) scale(${PLATE_START_SCALE})`,
            }}
          >
            <Image
              src={first.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className={`absolute inset-0 ${TINT}`} />
            <Label
              refCb={(el) => {
                labels.current[0] = el;
              }}
              meta={first.meta}
              name={first.name}
              href={first.href}
              cta={first.cta}
            />
          </div>
        </div>

        {/* 02 / 03 — each above the last, sliding right → left */}
        {rest.map((item, i) => (
          <div
            key={item.name}
            ref={(el) => {
              panels.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
            style={{ zIndex: 21 + i, transform: "translateX(100%)" }}
          >
            <Image
              src={item.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className={`absolute inset-0 ${TINT}`} />
            <Label
              refCb={(el) => {
                labels.current[i + 1] = el;
              }}
              meta={item.meta}
              name={item.name}
              href={item.href}
              cta={item.cta}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Label({
  refCb,
  meta,
  name,
  href,
  cta,
}: {
  refCb: (el: HTMLDivElement | null) => void;
  meta: string;
  name: string;
  /** Present only for collections that have a page of their own. */
  href?: string;
  cta?: string;
}) {
  return (
    <div
      ref={refCb}
      /* pointer-events are driven from the same progress value as opacity
         (see onProgress) — a label still at opacity 0 mid-slide would
         otherwise keep a full-screen link over the stage and swallow clicks
         meant for the panel on top of it. */
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3"
      style={{ opacity: 0 }}
    >
      <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
        {meta}
      </p>
      {href ? (
        <Link href={href} className="transition-opacity hover:opacity-80">
          <h3 className="font-display text-6xl tracking-tight text-paper sm:text-8xl">
            {name}
          </h3>
        </Link>
      ) : (
        <h3 className="font-display text-6xl tracking-tight text-paper sm:text-8xl">
          {name}
        </h3>
      )}
      {href && cta ? (
        <CtaLink href={href} className="mt-6">
          {cta}
        </CtaLink>
      ) : null}
    </div>
  );
}
