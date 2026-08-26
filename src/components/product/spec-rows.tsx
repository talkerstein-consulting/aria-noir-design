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
            <p className="t-body t-body--tight mt-2 text-[color:var(--fg-primary)]">
              {row.summary}
            </p>
            <p className="t-body t-body--tight mt-2">{row.detail}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
