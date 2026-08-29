type Row = { term: string; summary: string; detail: string };

/**
 * The bench sheet: term, the one-line claim, and the paragraph that backs
 * it up. Plain markup on purpose — this list carried a scroll-driven
 * highlight for a while, lighting one row at a time off the section's
 * progress, and it was removed because the trigger never landed where a
 * reader's eye actually was. A specification that is 70% dimmed while you
 * are reading it is worse than one that is simply legible.
 *
 * Shared by ProductSpec and the StickyStudy that generalises it, so the
 * two surfaces stay one object rather than a copy.
 */
export function SpecRows({ rows }: { rows: readonly Row[] }) {
  return (
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div key={row.term} className="hairline py-6 sm:py-7">
          <dt className="t-label">{row.term}</dt>
          <dd>
            {/* The claim is set in the DISPLAY face, not the UI one. It is
                the only line in a row that is a statement rather than an
                explanation — "Hand-cut cellulose acetate" is a name for the
                material, and naming is what this face is for on every other
                surface of the site. The paragraph under it stays in the UI
                face, so the two read as claim and evidence rather than as
                one long body. */}
            <p className="mt-2 font-display text-xl leading-snug text-[color:var(--fg-primary)] sm:text-2xl">
              {row.summary}
            </p>
            <p className="t-body t-body--tight mt-2">{row.detail}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
