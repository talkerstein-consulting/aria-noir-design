"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type MouseEvent } from "react";
import "./tcg-badge.css";

const HREF = "https://talkerstein.ca";

/** Long enough for the coin to fade in and turn once before a tap on a
 *  touch screen, which has no hover, follows the link. */
const TOUCH_BEAT_MS = 1400;

/** The coin is a WebGL canvas and a model; neither is fetched until the
 *  plaque is first hovered, so the footer ships nothing for it. */
const LionCoin = dynamic(() => import("@/components/lion-coin"), {
  ssr: false,
});

/**
 * The credit line, with the Talkerstein coin over it on hover.
 *
 * At rest: the glyph as a mask painted in `currentColor`, inside a link,
 * and nothing else. Hovered: the lettering goes gold, and the coin fades
 * in over the middle of the line, spinning, for as long as the pointer
 * stays. Leave, and it fades out and unmounts.
 *
 * The plaque's hit area is padded well past the lettering (see
 * .tcg-plaque in the CSS): a 16:1 strip of 10px capitals is not a target
 * anyone can land on a phone, and the padding is what makes it one.
 *
 * On a touch screen there is no hover, so the first tap shows the coin
 * for a beat and then follows the link; a second tap follows it at once.
 */
export function TcgBadge({ tone = "ink" }: { tone?: "paper" | "ink" } = {}) {
  const [hot, setHot] = useState(false);
  /* Once hovered, the coin stays mounted so leaving fades it out rather
     than cutting it; it only spins while hot. */
  const [seen, setSeen] = useState(false);
  const armed = useRef(false);
  const heat = (on: boolean) => {
    setHot(on);
    if (on) setSeen(true);
  };

  const onClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia("(hover: none)").matches || armed.current) return;
    e.preventDefault();
    armed.current = true;
    heat(true);
    window.setTimeout(() => {
      window.location.href = HREF;
    }, TOUCH_BEAT_MS);
  }, []);

  return (
    <div className={`tcg-footer tcg-footer--${tone}`}>
      <a
        className={`tcg-plaque${hot ? " is-hot" : ""}`}
        href={HREF}
        onClick={onClick}
        onPointerEnter={() => heat(true)}
        onPointerLeave={() => {
          if (!armed.current) heat(false);
        }}
        onFocus={() => heat(true)}
        onBlur={() => {
          if (!armed.current) heat(false);
        }}
        aria-label="Handcrafted by Talkerstein Consulting Group"
      >
        <span className="tcg-text" aria-hidden="true" />
        <span className="tcg-coin" aria-hidden="true">
          {seen ? <LionCoin spin={hot} /> : null}
        </span>
      </a>
    </div>
  );
}
