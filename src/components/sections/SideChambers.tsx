const LINKS = [
  { name: "Journal", note: "Notes from the atelier and the street." },
  { name: "Materials", note: "Acetate, titanium, and the reason both matter." },
  { name: "Fit", note: "Three face shapes. Three honest answers." },
  { name: "Seen in Noir", note: "Real faces. Real rooms. No studio lighting." },
];

export default function SideChambers({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative flex min-h-screen items-center px-6 py-24 md:px-14"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
        <div aria-hidden />

        <div className="relative z-30 rounded-sm bg-cream/95 p-10 shadow-2xl md:p-12">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-noir/50">
            <span className="h-px w-8 bg-noir/30" />
            <span>05 · Proof</span>
          </div>

          <h2 className="text-balance mt-8 font-serif text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-noir sm:text-4xl lg:text-[2.75rem]">
            Both arms out.{" "}
            <span className="italic text-noir/70">Nothing hidden.</span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-noir/60 sm:text-base">
            Most frames save their finish for the side that gets photographed.
            This one doesn&apos;t have a side that was skipped.
          </p>

          <div className="mt-10 grid gap-x-8 gap-y-8 border-t border-noir/15 pt-8 sm:grid-cols-2">
            {LINKS.map((link) => (
              <div key={link.name} className="cursor-pointer">
                <h3 className="font-serif text-xl italic text-noir">
                  {link.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-noir/50">
                  {link.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
