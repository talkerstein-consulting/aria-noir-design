"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

type CtaCommon = {
  children: string;
  /**
   * Which half of the page this sits on. Prefer leaving it alone and
   * declaring `.on-ink` / `.on-paper` on the section instead — the CTA
   * reads its colours from the ground it inherits. `"dark"` is for the
   * closing block, which sets its ground on the CTA itself.
   */
  variant?: "light" | "dark";
  /** Secondary voice, for a second action that must not fight the first. */
  tone?: "primary" | "quiet";
  /**
   * Drops the rule entirely — label and glyph wave only.
   *
   * The header chrome and the menu stack use it. In both places the CTA is
   * the only thing on its ground, so the rule is not distinguishing it from
   * anything; it just draws a line under the site's own furniture. The wave
   * is still the affordance, and colour still answers hover and focus.
   */
  bare?: boolean;
  /**
   * A DIFFERENT word on the lower line, so the lift is a swap rather than a
   * refresh of the same glyphs. Menu/Close is the only user: the control
   * does not move, does not re-render into a second object, and does not
   * cross-fade — the letters simply travel up and the other word is what
   * was underneath them all along.
   *
   * On a button this also turns the lift into a FLIP — see CtaButton.
   */
  alt?: string;
  /**
   * Which of the two words should currently be showing: `false` for
   * `children`, `true` for `alt`. The control animates to it; it does not
   * jump. Owned by the parent, because the thing the label describes (an
   * open overlay) is the parent's state, not the button's.
   */
  swapped?: boolean;
  /**
   * Chrome voice: `--quiet`'s size, but bold and at full foreground. For
   * the header's two controls, which are the only words in the band.
   */
  strong?: boolean;
  className?: string;
  /**
   * Size and face overrides, for the places a CTA is the page rather than
   * an action on it — the header chrome and the menu stack. Inline rather
   * than modifier classes so the recipe keeps exactly one size and the
   * exceptions have to say so at the call site. `--cut` rides the font
   * size, so the rule and the letter-spacing scale with it for free.
   */
  style?: CSSProperties;
};

type CtaLinkProps = CtaCommon & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Opens in a new tab — the account surface lives on another origin. */
  external?: boolean;
};

type CtaButtonProps = CtaCommon & {
  onClick: MouseEventHandler<HTMLButtonElement>;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

/**
 * Per-letter shuffle stagger. Read from the token layer so the CTA wave
 * and the scroll reveals stay the same gesture.
 */
const STEP_MS = 22; // --stagger-char

function classes(
  {
    variant = "light",
    tone = "primary",
    bare = false,
    strong = false,
    className = "",
  }: CtaCommon,
) {
  return [
    "cta",
    variant === "dark" && "cta--dark",
    tone === "quiet" && "cta--quiet",
    bare && "cta--bare",
    strong && "cta--strong",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * The label itself: every glyph stacked over a duplicate of itself inside
 * its own clip box, so hover lifts one out and the other in, a beat apart.
 *
 * Shared by the link and the button so the two are genuinely one object —
 * the header's Menu control is a button because it opens an overlay rather
 * than going anywhere, and that is the only thing about it that differs.
 */
function CtaChars({
  children,
  alt,
  columns,
}: {
  children: string;
  alt?: string;
  /**
   * Reserve this many glyph columns whatever the label currently says.
   *
   * A flipping control renders one word at a time, so its width was the
   * width of whichever word was showing — MENU is four columns, CLOSE is
   * five. The button is right-aligned, so the right edge held and the
   * LETTERS jumped eight pixels sideways the instant the flip armed, then
   * back again when it landed. The travel is meant to be vertical; a
   * horizontal shove underneath it is the one thing that makes a swap read
   * as a re-render.
   *
   * Holding the wider word's column count at all times makes the control a
   * fixed object that the labels move through.
   */
  columns?: number;
}): ReactNode {
  const top = Array.from(children);
  const bottom = Array.from(alt ?? children);
  const len = Math.max(columns ?? 0, top.length, bottom.length);

  /* Padding goes at the START, not the end. This control is pinned to the
     right of the header, so the meaningful edge is the last glyph — pad
     the short word in front and MENU's U sits exactly where CLOSE's E
     does. Trailing padding would hold the box still and float the word
     away from the edge it is aligned to, which is the same jitter wearing
     a different hat. */
  const glyph = (word: string[], i: number) => {
    const ch = word[i - (len - word.length)];
    return !ch || ch === " " ? " " : ch;
  };

  return (
    <span className="cta-chars">
      {Array.from({ length: len }, (_, i) => (
        <span
          key={i}
          className="cta-char"
          style={{ "--d": `${i * STEP_MS}ms` } as CSSProperties}
        >
          <span className="cta-char-clip">
            <span className="cta-char-line">{glyph(top, i)}</span>
            {/* Always hidden from the a11y tree, even when it carries a
                different word: the swap is a visual state of one control,
                and `aria-expanded` is what actually says which way it is
                pointing. Exposing both lines would name the button
                "MENUCLOSE". */}
            <span className="cta-char-line" aria-hidden="true">
              {glyph(bottom, i)}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Underline-only CTA — no fill, no border, no pill.
 *
 * One continuous rule runs under the whole label; on hover a gold rule
 * sweeps across it left to right while the glyphs lift and swap, each
 * letter a beat behind the last (`--d`, set per index above), so the word
 * reads as a wave rather than a single jump-cut.
 *
 * `variant="dark"` is for the closing section (light --paper background,
 * --ink text); everywhere else sits on --ink.
 */
export function CtaLink({
  href,
  children,
  onClick,
  external,
  style,
  alt,
  ...rest
}: CtaLinkProps) {
  const common = {
    style,
    className: classes({ children, style, alt, ...rest }),
  };

  /* An off-origin destination is a plain anchor: next/link's prefetching
     and client transitions have nothing to do on a different host. */
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...common}>
        <CtaChars alt={alt}>{children}</CtaChars>
      </a>
    );
  }

  /* next/link rather than a bare anchor: the menu navigates between real
     routes, and a full document load there would throw away the smooth
     scroll and re-run the page's entrance choreography from cold. Hash
     hrefs still behave as plain in-page jumps. */
  return (
    <Link href={href} onClick={onClick} {...common}>
      <CtaChars alt={alt}>{children}</CtaChars>
    </Link>
  );
}

/**
 * The flip's own duration: the glyph shuffle plus the stagger the last
 * letter is waiting out. Short words only — this is the header, not the
 * menu stack — so the arithmetic stays honest at five or six characters.
 *
 * Kept in sync with `--dur-base` (450ms) by hand. A CSS variable read would
 * be more honest and is not worth a getComputedStyle on every click; if the
 * token moves, this moves.
 */
const DUR_BASE_MS = 450;
const FLIP_TAIL_MS = 40; // a frame or two of margin before the re-stack

/**
 * Where a flipping button is in its one gesture.
 *
 *   idle  — at rest. Both lines carry the SAME word, so hover is the
 *           house's ordinary glyph shuffle and nothing else.
 *   arm   — the incoming word has just been dealt onto the lower line and
 *           the label snapped back to rest, transitions off, in a single
 *           unpainted frame. Nothing has moved yet.
 *   lift  — the travel. This is the only phase the reader sees as motion.
 *   land  — arrived: both lines now carry the new word, transitions off
 *           again while the transform is cleared underneath it.
 */
type FlipPhase = "idle" | "arm" | "lift" | "land";

/** Two rAFs, not one: a single frame fires BEFORE paint, so a class removed
 *  in it is gone by the time the browser draws the state it was suppressing
 *  — and the thing it was suppressing animates after all. */
function useAfterPaint(active: boolean, then: () => void) {
  useEffect(() => {
    if (!active) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(then);
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
    /* `then` is a fresh closure every render and re-running this effect on
       it would restart the frame pair forever. The phase is the real
       input. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

/**
 * The same object, for an action that opens something instead of going
 * somewhere. Used by the header's Menu control.
 *
 * ---- The flip ----
 *
 * Given an `alt` word, a press swaps the label: MENU lifts out, CLOSE lifts
 * in, and pressing again does the identical thing in the identical
 * direction. Closing is not the opening played backwards — a rewind reads
 * as an undo, and the reader pressed the same button both times.
 *
 * HOVER IS UNTOUCHED BY ANY OF THIS. At rest both lines carry the same
 * word, so a pointer gets the standard shuffle every CTA on the site gives,
 * and the label says CLOSE only once the button has actually been pressed.
 * The second word exists on the lower line for the length of one flip and
 * no longer.
 *
 * Without `alt` this is an ordinary CTA and none of the above runs.
 */
export function CtaButton({
  children,
  onClick,
  style,
  alt,
  swapped = false,
  "aria-expanded": expanded,
  "aria-controls": controls,
  ...rest
}: CtaButtonProps) {
  const settled = swapped && alt ? alt : children;

  /* [showing, beneath]. Equal at rest — see the doc comment. */
  const [lines, setLines] = useState<[string, string]>([settled, settled]);
  const [phase, setPhase] = useState<FlipPhase>("idle");

  /* What `swapped` was on the last commit, so a change can be detected
     without the parent having to tell us it is one. */
  const shown = useRef(swapped);

  /* ── press: deal the incoming word onto the lower line, at rest ── */
  useEffect(() => {
    if (!alt || shown.current === swapped) return;
    shown.current = swapped;
    setLines(([top]) => [top, swapped ? alt : children]);
    setPhase("arm");
  }, [swapped, alt, children]);

  /* ── arm → lift, once the armed frame has actually been painted ── */
  useAfterPaint(phase === "arm", () => setPhase("lift"));

  /* ── lift → land, when the last letter has finished travelling ── */
  useEffect(() => {
    if (phase !== "lift") return;
    const word = shown.current && alt ? alt : children;
    const settle = window.setTimeout(
      () => {
        /* Arrive and clear the transform in ONE commit, transitions off.
           Both lines carry the new word from here, so hover is ordinary
           again the moment the gesture ends. */
        setLines([word, word]);
        setPhase("land");
      },
      DUR_BASE_MS +
        (Math.max(children.length, (alt ?? children).length) - 1) * STEP_MS +
        FLIP_TAIL_MS,
    );
    return () => window.clearTimeout(settle);
  }, [phase, alt, children]);

  /* ── land → idle, once the cleared transform has been painted ── */
  useAfterPaint(phase === "land", () => setPhase("idle"));

  /* Reserved for the life of the control, not just during a flip — see
     CtaChars. Both rest states are this wide. */
  const columns = alt
    ? Math.max(children.length, alt.length)
    : undefined;

  const flip = alt
    ? [
        "cta--flip",
        phase !== "idle" && "is-flipping",
        phase === "lift" && "is-lifted",
        (phase === "arm" || phase === "land") && "is-instant",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      style={style}
      className={`${classes({ children, style, alt, ...rest })} ${flip}`.trim()}
    >
      {/* Without `alt` the two lines are never anything but `children`, and
          reading them out of state would just make an ordinary CTA's label
          stale the first time a caller changed it. */}
      <CtaChars alt={alt ? lines[1] : undefined} columns={columns}>
        {alt ? lines[0] : children}
      </CtaChars>
    </button>
  );
}
