import Link from "next/link";
import { RevealText } from "@/components/reveal";

export type ProseSection = {
  id: string;
  title: string;
  /** Paragraphs. A nested array renders as a list — see below. */
  body: readonly (string | readonly string[])[];
};

/**
 * The policy layout: sticky contents on the left, prose on the right.
 *
 * These pages are `on-paper` from the first line, with no hero plate and no
 * iris. That is the point of them — a warranty read on black over
 * photography is a page asking to be admired while someone is trying to
 * find out whether their hinge is covered. The house voice survives in the
 * type, not in the theatre.
 *
 * The contents column is the same sticky-left shape the studies use, so a
 * long document keeps its map in view. It collapses to a plain scrolling
 * list under `lg` rather than becoming a horizontal rail: a rail hides how
 * many sections there are, which on a legal page is the one thing the
 * reader wants to know before they start.
 *
 * A body item that is an array renders as a `<ul>` — the exclusions and
 * prohibited-use clauses are genuinely lists, and setting them as run-on
 * prose is how the live store's versions became unreadable.
 */
export function ProsePage({
  updated,
  sections,
}: {
  updated: string;
  sections: readonly ProseSection[];
}) {
  return (
    <section className="on-paper section bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-[16rem_1fr] lg:gap-20">
        <nav aria-label="On this page" className="lg:sticky lg:top-28">
          <div className="stack stack--sm">
            <p className="t-eyebrow">Contents</p>
            <ul className="flex flex-col gap-3 border-l border-[color:var(--fg-rule)] pl-5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="link-quiet t-caption">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-micro mt-4">Last updated {updated}</p>
          </div>
        </nav>

        <div className="flex flex-col gap-14 sm:gap-20">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="stack stack--sm scroll-mt-28">
              <RevealText as="h2" text={s.title} className="t-display-xs" />
              {s.body.map((block, i) =>
                Array.isArray(block) ? (
                  <ul key={i} className="flex flex-col gap-2 pt-1">
                    {block.map((item) => (
                      <li key={item} className="t-body flex gap-3">
                        <span aria-hidden className="text-[color:var(--fg-accent)]">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={i} className="t-body">
                    {block as string}
                  </p>
                ),
              )}
            </div>
          ))}

          <p className="t-micro">
            Questions about this document?{" "}
            <Link href="/contact" className="link-quiet link-quiet--accent">
              Contact the studio
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
