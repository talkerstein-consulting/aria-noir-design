import HairlineEyebrow from "@/components/vectors/HairlineEyebrow";

export default function DualityIntro({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative flex min-h-screen justify-center px-6 pb-32 pt-24 md:pt-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <HairlineEyebrow index="02" label="The Acetate" align="center" />

        <h2 className="text-balance mt-8 font-serif text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-cream sm:text-4xl lg:text-[2.75rem]">
          Cast once.{" "}
          <span className="italic text-cream/80">Cut by hand.</span>
        </h2>

        <p className="text-balance mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-cream/60 sm:text-base">
          Sheets pressed into a single block, then cut away until only this
          shape remains. Every edge here was subtracted, not added — watch
          the light find them.
        </p>
      </div>
    </section>
  );
}
