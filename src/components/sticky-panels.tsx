"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef } from "react";
import { CtaLink } from "@/components/cta-link";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * The sticky stage — the home page's collections hijack, lifted out so the
 * eyewear index can be the same object rather than an imitation of it.
 *
 * Panel N+1 always sits above panel N and slides in from the right, so each
 * one covers the previous cover. Panel 01 is not a slide: it IS the plate
 * sitting low under the heading, scaled up until it fills the screen. That
 * asymmetry is the point — the first panel arrives out of the heading, and
 * everything after it arrives out of the panel before.
 *
 * ---- Why the timing is in vh and not in fractions ----
 *
 * It used to be six hand-tuned fractions of the section's own progress,
 * which is fine for exactly three panels and silently wrong for any other
 * number: nine panels sharing the same 0→1 would each get a fifth of the
 * travel the three used to get, and the whole stage would read as a flicker
 * book. So the beats are declared as SCROLL DISTANCE, the section's height
 * is computed from them, and the fractions fall out of that. A panel is
 * worth the same number of wheel turns whether there are three of them or
 * nine.
 *
 * The numbers below are the home page's original six fractions, converted
 * back: at three panels this component produces a 420vh section — the exact
 * height that was hardcoded here — with zones at 0.081/0.400, 0.459/0.659
 * and 0.700/0.900 against the 0.08/0.40, 0.46/0.66, 0.70/0.90 that were
 * there before. Sub-frame differences, and deliberate: the home page is the
 * reference implementation and it must not visibly have moved.
 */

/* All in vh of SCROLLED distance (i.e. section height minus the one screen
   the sticky child is holding). */
const LEAD_VH = 26; // before the plate starts to grow
const PLATE_VH = 102; // the plate, 22% → full bleed
const AFTER_PLATE_VH = 19; // the plate holds, filled, before 02 arrives
const PANEL_VH = 64; // each slide-in
const BETWEEN_VH = 13; // a beat between one panel and the next
const TAIL_VH = 32; // the last panel holds before the section releases

const PLATE_START_SCALE = 0.22; // 22vw × 22vh
const PLATE_REST_Y_VH = 24; // sits LOW, beneath the heading
const HEAD_OFFSET_VH = -16;
const TINT = "bg-ink/45";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type PanelItem = {
  name: string;
  meta: string;
  /** Full-bleed plate. Omit where the house has no photograph yet. */
  image?: string;
  /** Acetate swatch, for the panels with no plate in hand — the same
   *  bargain the index grid strikes rather than borrowing someone else's
   *  photograph and calling it this frame. */
  swatch?: string;
  /** Present only for frames that have a page of their own. */
  href?: string;
  cta?: string;
};

type StickyPanelsProps = {
  items: readonly PanelItem[];
  /** The heading that the first plate grows out of and swallows. */
  preheader?: string;
  heading?: React.ReactNode;
  /** Ties the section into a page's own anchor scheme. */
  id?: string;
  className?: string;
};

/** The section's height and every panel's in/out point, derived from the
 *  beats above and the number of panels. */
function useTiming(count: number) {
  return useMemo(() => {
    const slides = Math.max(0, count - 1);
    const scroll =
      LEAD_VH +
      PLATE_VH +
      (slides > 0
        ? AFTER_PLATE_VH + slides * PANEL_VH + (slides - 1) * BETWEEN_VH
        : 0) +
      TAIL_VH;

    /* Progress is measured across the scrolled distance, not the section
       box — the sticky child holds one screen that never scrolls past. */
    const f = (vh: number) => vh / scroll;

    const zones: [number, number][] = [[f(LEAD_VH), f(LEAD_VH + PLATE_VH)]];
    let cursor = LEAD_VH + PLATE_VH + AFTER_PLATE_VH;
    for (let i = 0; i < slides; i += 1) {
      zones.push([f(cursor), f(cursor + PANEL_VH)]);
      cursor += PANEL_VH + BETWEEN_VH;
    }

    return { heightVh: scroll + 100, zones };
  }, [count]);
}

export function StickyPanels({
  items,
  preheader,
  heading,
  id,
  className = "",
}: StickyPanelsProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  const { heightVh, zones } = useTiming(items.length);

  /* `zones` is memoised on the panel count, so this identity only changes
     when the number of panels does — which is the one case the scroll
     subscription genuinely does need to be rebuilt for. */
  const onProgress = useCallback((p: number) => {
    const eased = zones.map(([a, b]) =>
      easeInOutCubic(clamp01((p - a) / (b - a))),
    );
    const [plateP, ...slide] = eased;

    if (head.current) head.current.style.opacity = String(1 - plateP);
    if (plate.current) {
      plate.current.style.transform = `translateY(${lerp(PLATE_REST_Y_VH, 0, plateP)}vh) scale(${lerp(PLATE_START_SCALE, 1, plateP)})`;
    }

    panels.current.forEach((el, i) => {
      if (el) el.style.transform = `translateX(${(1 - (slide[i] ?? 0)) * 100}%)`;
    });

    labels.current.forEach((el, i) => {
      if (!el) return;
      const o = clamp01((eased[i] - 0.75) / 0.25);
      el.style.opacity = String(o);
      /* Only the panel that has actually arrived is clickable. Without this
         a label still at opacity 0 mid-slide would keep a full-screen link
         over the stage and swallow clicks meant for the panel on top. */
      el.style.pointerEvents = o > 0.9 ? "auto" : "none";
    });
  }, [zones]);

  useScrollProgress(wrap, onProgress);

  const [first, ...rest] = items;
  if (!first) return null;

  return (
    <section
      ref={wrap}
      id={id}
      className={`relative z-[35] bg-ink ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* preheader + heading — rides above the plate and is swallowed by it */}
        {preheader || heading ? (
          <div
            ref={head}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          >
            <div
              className="flex flex-col items-center gap-5 px-8"
              style={{ transform: `translateY(${HEAD_OFFSET_VH}vh)` }}
            >
              {preheader ? (
                <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
                  {preheader}
                </p>
              ) : null}
              {heading}
            </div>
          </div>
        ) : null}

        {/* 01 — the expanding plate */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            ref={plate}
            className="relative h-screen w-screen origin-center overflow-hidden will-change-transform"
            style={{
              transform: `translateY(${PLATE_REST_Y_VH}vh) scale(${PLATE_START_SCALE})`,
            }}
          >
            <Ground item={first} />
            <Label
              refCb={(el) => {
                labels.current[0] = el;
              }}
              item={first}
            />
          </div>
        </div>

        {/* 02… — each above the last, sliding right → left */}
        {rest.map((item, i) => (
          <div
            key={item.name}
            ref={(el) => {
              panels.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
            style={{ zIndex: 21 + i, transform: "translateX(100%)" }}
          >
            <Ground item={item} />
            <Label
              refCb={(el) => {
                labels.current[i + 1] = el;
              }}
              item={item}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/** The panel's surface: a photograph where one exists, and the house's own
 *  acetate otherwise. Never a borrowed plate. */
function Ground({ item }: { item: PanelItem }) {
  if (!item.image) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${item.swatch ?? "#2a2a2a"} 0%, var(--ink) 85%)`,
        }}
      />
    );
  }
  return (
    <>
      <Image
        src={item.image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className={`absolute inset-0 ${TINT}`} />
    </>
  );
}

function Label({
  refCb,
  item,
}: {
  refCb: (el: HTMLDivElement | null) => void;
  item: PanelItem;
}) {
  const { meta, name, href, cta } = item;
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
        /* mt-6 rather than leaning on the stack's gap: a CTA needs more air
           above it than a caption does, or the rule-less label and the
           action underneath it read as one three-line block. */
        <CtaLink href={href} className="mt-6">
          {cta}
        </CtaLink>
      ) : null}
    </div>
  );
}
