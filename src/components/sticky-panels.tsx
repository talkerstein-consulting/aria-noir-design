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

/**
 * Where a panel's name sits, and what the plate is dimmed with.
 *
 * `center` is the collections treatment: the name in the middle of the
 * screen over a plate tinted evenly, because those plates are campaign
 * photographs with room in the middle and the name is the subject.
 *
 * `foot` is for plates that ARE the product — the colourway stage, where
 * the frame is centred and filling the screen and an even tint over it is
 * a veil across the thing being sold. The name goes under it instead, on a
 * gradient that only touches the bottom of the frame.
 */
export type LabelPlacement = "center" | "foot";

type StickyPanelsProps = {
  items: readonly PanelItem[];
  /** See LabelPlacement. Defaults to the collections treatment. */
  labels?: LabelPlacement;
  /**
   * Hold the stage inside the page's gutter instead of letting it run to
   * the edges of the screen.
   *
   * The mechanism is identical either way — the plate still grows, the
   * panels still slide over one another, the timing is untouched. What
   * changes is what the stage is: full bleed it is the page, taking the
   * screen over; inset it is an object ON the page, with the site's own
   * black around it. The colourway stage wants the second, because it is
   * one section of a product story rather than the reason the page exists.
   */
  inset?: boolean;
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
  labels: placement = "center",
  inset = false,
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
      <div
        className={`sticky top-0 h-screen ${
          inset ? "p-5 sm:p-12 lg:p-16" : "overflow-hidden"
        }`}
      >
        {/* When the stage is inset, the CLIP moves in here with it: the
            panels slide in from the right and have to be cut off at the
            frame's edge, not the screen's, or the next colourway is
            visible in the margin before it arrives. */}
        <div className={inset ? "relative h-full w-full overflow-hidden" : "contents"}>
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
            /* h-full rather than h-screen: the same box either way when
               the stage is full bleed, and the framed box when it is not. */
            className="relative h-full w-full origin-center overflow-hidden will-change-transform"
            style={{
              transform: `translateY(${PLATE_REST_Y_VH}vh) scale(${PLATE_START_SCALE})`,
            }}
          >
            <Ground item={first} placement={placement} />
            <Label
              refCb={(el) => {
                labels.current[0] = el;
              }}
              item={first}
              placement={placement}
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
            <Ground item={item} placement={placement} />
            <Label
              refCb={(el) => {
                labels.current[i + 1] = el;
              }}
              item={item}
              placement={placement}
            />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

/** The panel's surface: a photograph where one exists, and the house's own
 *  acetate otherwise. Never a borrowed plate. */
function Ground({
  item,
  placement,
}: {
  item: PanelItem;
  placement: LabelPlacement;
}) {
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
      {/* A foot label needs no veil over the plate — the gradient under
          its own type is the whole of the dimming. */}
      {placement === "center" ? (
        <div className={`absolute inset-0 ${TINT}`} />
      ) : null}
    </>
  );
}

function Label({
  refCb,
  item,
  placement,
}: {
  refCb: (el: HTMLDivElement | null) => void;
  item: PanelItem;
  placement: LabelPlacement;
}) {
  const { meta, name, href, cta } = item;
  const foot = placement === "foot";
  return (
    <div
      ref={refCb}
      /* pointer-events are driven from the same progress value as opacity
         (see onProgress) — a label still at opacity 0 mid-slide would
         otherwise keep a full-screen link over the stage and swallow clicks
         meant for the panel on top of it. */
      className="pointer-events-none absolute inset-0"
      style={{ opacity: 0 }}
    >
      {/* The gradient belongs to the LABEL, not the plate: it exists to seat
          the type, so it is only as tall as the type needs and it is absent
          entirely when the name is centred.

          It sits at z-0 with the content lifted to z-10 above it, NOT at
          -z-10. Negative z only stays behind its own siblings while this
          label is a stacking context, and it stops being one the moment its
          opacity finishes animating to 1 — at which point the scrim drops
          behind the panel's photograph and the type is left sitting on bare
          concrete. Which is exactly what it did. */}
      {foot ? (
        <div
          aria-hidden
          /* Weighted to the bottom third rather than a plain half-height
             ramp: the gold eyebrow is the palest thing in the label and it
             sits highest, so it is the line that decides how far up the
             ink has to reach. */
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-3/5 bg-gradient-to-t from-ink from-15% via-ink/75 via-45% to-transparent"
        />
      ) : null}

      <div
        /* A foot label is centred on the plate's own axis, not pushed into
           the left corner: the frame in these photographs is centred, and a
           caption hanging off one side of it reads as two things on a page
           rather than one thing and its name. */
        className={`relative z-10 flex h-full w-full flex-col gap-3 ${
          foot
            ? "items-center justify-end px-6 pb-16 text-center sm:px-10 sm:pb-20"
            : "items-center justify-center"
        }`}
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
          /* mt-6 rather than leaning on the stack's gap: a CTA needs more
             air above it than a caption does, or the rule-less label and
             the action underneath it read as one three-line block. */
          <CtaLink href={href} className="mt-6">
            {cta}
          </CtaLink>
        ) : null}

      </div>
    </div>
  );
}
