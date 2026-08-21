import { references } from "@/lib/arca-i";

/**
 * "References" — opt-in toggle, unchanged from the approved deck. Plain
 * `<details>` again: it should read as a footnote the page offers, not a
 * section it insists on.
 */
export function ProductReferences() {
  return (
    <section className="relative z-[36] bg-ink px-6 pb-24 sm:px-10 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <details className="group border-t border-paper/15 pt-8">
          <summary className="cursor-pointer list-none font-ui text-[11px] tracking-[0.35em] text-gold uppercase [&::-webkit-details-marker]:hidden">
            {references.label}
          </summary>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-ui text-sm text-paper/60">
            {references.names.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
