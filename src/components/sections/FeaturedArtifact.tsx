import HairlineEyebrow from "@/components/vectors/HairlineEyebrow";

export default function FeaturedArtifact({
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

        <div className="relative z-30 flex flex-col justify-center">
          <HairlineEyebrow index="04" label="The Right Hinge" />

          <h2 className="text-balance mt-8 font-serif text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-cream sm:text-4xl lg:text-[2.75rem]">
            One side opens.{" "}
            <span className="italic text-cream/80">Then the other.</span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/60 sm:text-base">
            Titanium, not brass. The difference doesn&apos;t show on day one —
            it shows after three years of being opened and closed without
            complaint.
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-cream/35">
            Drawing II — Obsidian · ⌀ 54 — 21 — 145
          </p>
        </div>
      </div>
    </section>
  );
}
