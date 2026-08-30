"use client";

import Image from "next/image";
import { kickPlay } from "@/lib/autoplay";
import { useState } from "react";
import { CtaLink } from "@/components/cta-link";

/**
 * What a buyer checks before spending money, as an FAQ beside the film.
 *
 * ---- An accordion, not a tab strip ----
 *
 * These four are questions, and questions are asked one at a time. A tab
 * strip shows four labels and one answer with no sense of how much is
 * behind the other three; an accordion shows all four questions at once
 * and opens the one that was actually asked, which is the shape every
 * shipping-and-returns block on every shop already has. It is also the
 * shape that survives a narrow screen, where four tabs wrap into two rows
 * of orphaned words.
 *
 * One open at a time. Independent toggling lets a reader open all four and
 * push the column past the film into a wall of text — this is a panel of
 * answers, not a document.
 *
 * ---- The panels are always mounted ----
 *
 * Closed rows are collapsed with a grid-row transition rather than removed,
 * so find-in-page still reaches the shipping times while the description is
 * showing, and the height animates instead of jumping.
 *
 * ---- The film is not decoration ----
 *
 * It is the house's campaign cut, and only ARCA I has one. A house without
 * one gets its quietest plate at the same size in the same place rather
 * than an empty box or a player that will not play — the same ladder the
 * rest of the catalogue climbs down.
 */
export type DetailTab = {
  id: string;
  label: string;
  paragraphs: readonly string[];
};

export function BuyDetail({
  tabs,
  video,
  poster,
  image,
  alt,
}: {
  tabs: readonly DetailTab[];
  video?: string;
  poster?: string;
  image?: string | null;
  alt: string;
}) {
  const [open, setOpen] = useState(tabs[0]?.id ?? "");

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
      {/* ---- left: the questions ---- */}
      <div>
        <ul>
          {tabs.map((tab) => {
            const on = tab.id === open;
            return (
              <li key={tab.id} className="faq-row">
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={on}
                    aria-controls={`panel-${tab.id}`}
                    id={`q-${tab.id}`}
                    /* Clicking the open row closes it. A reader who opened
                       Shipping to check one line should be able to put it
                       away again without opening something else instead. */
                    onClick={() => setOpen(on ? "" : tab.id)}
                  >
                    <span>{tab.label}</span>
                    {/* One glyph that rotates, rather than swapping + for −:
                        the mark is the same object throughout, so the row
                        reads as opening rather than as being replaced. */}
                    <span aria-hidden className="faq-mark" data-on={on} />
                  </button>
                </h3>

                <div
                  id={`panel-${tab.id}`}
                  role="region"
                  aria-labelledby={`q-${tab.id}`}
                  className="faq-panel"
                  data-on={on}
                >
                  <div className="faq-panel-inner">
                    <div className="stack stack--sm">
                      {tab.paragraphs.map((line) => (
                        <p key={line} className="t-body text-[var(--fg-tertiary)]">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* The errand that belongs to the questions rather than to the
            offer: fit is the one thing the rows above cannot settle, and a
            reader asks it INSTEAD of opening another row. */}
        <div className="mt-12">
          <CtaLink href="/care">Read the fit guide</CtaLink>
        </div>
      </div>

      {/* ---- right: the film ---- */}
      {/* `buy-film` is a HANDLE, not a style: the buy control pinned to the
          foot of a phone's screen reads this element's position to know
          when it has been scrolled past, and takes itself away after it.
          The class carries no rules of its own — see buy-hero. */}
      <div className="buy-film relative aspect-[4/5] overflow-hidden bg-ink">
        {video ? (
          <video
            ref={kickPlay}
            className="h-full w-full object-cover"
            src={video}
            poster={poster}
            /* Muted is what makes autoplay legal in every browser; a buy
               page that starts talking at someone is worse than one that
               does not move. Playsinline keeps iOS from taking it
               fullscreen the moment it starts. */
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : image ? (
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
