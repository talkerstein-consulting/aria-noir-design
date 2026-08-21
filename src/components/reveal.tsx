"use client";

import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/** Per-word stagger, in ms — matches the CTA's per-letter step in feel. */
const STEP_MS = 60;

/**
 * Reveals run off THREE independent triggers, deliberately overlapping.
 *
 * That redundancy isn't belt-and-braces for its own sake — each one has a
 * real environment where it alone goes silent, and a reveal that never
 * fires doesn't look like a broken animation, it looks like a missing
 * image. This module has now been through all three failure modes:
 *
 *   IntersectionObserver — the tidy default, and correct in a normal tab.
 *   Silent in a tab that never composites.
 *
 *   scroll — catches anything IO misses, and fires under Lenis, which
 *   drives real document scroll. But scroll events are dispatched during
 *   the rendering steps, so a non-compositing tab emits none at all even
 *   while scrollY changes underneath.
 *
 *   setTimeout — the only clock that runs everywhere. Covers mount (a page
 *   loaded already scrolled to a plate) and the genuinely-backgrounded
 *   case, where nothing else will ever run.
 *
 * Whichever fires first wins; `reveal` is idempotent and drops the element
 * from the pending set, so the others become no-ops.
 *
 * Note the absence of a requestAnimationFrame throttle on the scroll pass.
 * That is the reflex, and it is a trap: rAF does not fire in a
 * non-compositing tab, so an "already queued" latch would set once, never
 * clear, and swallow every subsequent scroll event. The sweep is a bounded
 * run of getBoundingClientRect reads over a set that only shrinks, so it
 * is cheap enough to run unthrottled.
 */
const pending = new Set<Element>();
let observer: IntersectionObserver | null = null;
let listening = false;

function reveal(el: Element) {
  el.classList.add("is-revealed");
  pending.delete(el);
  observer?.unobserve(el);
  if (pending.size === 0) stopListening();
}

/** Slightly inset at the foot so a plate commits once it is properly in,
 *  not the instant its first pixel clips the bottom edge. */
function isOnScreen(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

function sweep() {
  for (const el of [...pending]) if (isOnScreen(el)) reveal(el);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", sweep);
  window.removeEventListener("resize", sweep);
}

function observe(el: Element) {
  pending.add(el);
  startListening();

  if (typeof IntersectionObserver !== "undefined") {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) reveal(e.target);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    observer.observe(el);
  }

  // Mount pass, deferred by a beat rather than run inline. The delay is
  // load-bearing: revealing before the browser has painted the closed
  // starting state even once leaves the CSS transition nothing to animate
  // FROM, so it doesn't glitch — it silently never plays, which reads as
  // "the animation was never written". Twice, because layout (images,
  // fonts, the sticky columns) can still be settling after the first.
  for (const delay of [80, 500]) {
    setTimeout(() => {
      if (!el.classList.contains("is-revealed") && isOnScreen(el)) reveal(el);
    }, delay);
  }

  // Genuinely-backgrounded tab: no rAF, no scroll events, and IO may never
  // report. Rechecked rather than acted on at mount, because a tab can
  // report hidden for a moment during load and be visible microseconds
  // later — reacting immediately would throw the animation away for every
  // one of those.
  setTimeout(() => {
    if (!el.classList.contains("is-revealed") && document.visibilityState === "hidden") {
      reveal(el);
    }
  }, 1200);
}

function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    observe(el);
    return () => {
      pending.delete(el);
      if (pending.size === 0) stopListening();
    };
  }, []);
  return ref;
}

type Segment = { text: string; italic?: boolean };

type RevealTextProps = {
  /** Rendered element — the caller owns the semantics (h1/h2/p/…). */
  as?: ElementType;
  /** A plain string, or segments so a heading can mix roman and italic. */
  text: string | readonly Segment[];
  className?: string;
  /** Delay before the first word, in ms. */
  delay?: number;
  step?: number;
};

/**
 * Word-by-word rise, using the CTA's hover mechanic: every word sits in its
 * own clip box and travels up from below the baseline, one beat behind the
 * last. Splitting per word (not per letter) keeps long headings readable and
 * the text selectable/announced as ordinary prose.
 */
export function RevealText({
  as = "span",
  text,
  className = "",
  delay = 0,
  step = STEP_MS,
}: RevealTextProps) {
  const ref = useReveal<HTMLElement>();
  const segments: readonly Segment[] =
    typeof text === "string" ? [{ text }] : text;

  let word = 0;
  const children: ReactNode[] = [];

  segments.forEach((seg, si) => {
    const words = seg.text.split(/\s+/).filter(Boolean);
    words.forEach((w, wi) => {
      children.push(
        <span
          key={`${si}-${wi}`}
          className={`reveal-word${seg.italic ? " italic" : ""}`}
        >
          <span style={{ "--d": `${delay + word * step}ms` } as CSSProperties}>
            {w}
          </span>
        </span>,
      );
      word += 1;
      // A real space between inline-block words — a flex gap would collapse
      // the natural word spacing the font already carries.
      if (wi < words.length - 1) children.push(" ");
    });
    if (si < segments.length - 1) children.push(" ");
  });

  return createElement(
    as,
    { ref, "data-reveal": "", className: className || undefined },
    children,
  );
}

type RevealPlateProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Image entrance: a double wipe opening from the centre line outward, the
 * top and bottom halves travelling in opposite directions at once. Wraps
 * the plate rather than the <Image>, so `fill` still resolves against a
 * positioned box.
 */
export function RevealPlate({
  children,
  className = "",
  delay = 0,
}: RevealPlateProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal-plate ${className}`.trim()}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
