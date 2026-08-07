import HairlineEyebrow from "@/components/vectors/HairlineEyebrow";

export default function MainHall({
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
        <HairlineEyebrow index="03" label="The Finishing" align="center" />

        <h2 className="text-balance mt-8 font-serif text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-cream sm:text-4xl lg:text-[2.75rem]">
          The last hour{" "}
          <span className="italic text-cream/80">is the only one that shows.</span>
        </h2>

        <p className="text-balance mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-cream/60 sm:text-base">
          The gold hairline is set last — cast into the cut, then hand-polished
          until it catches light instead of merely reflecting it.
        </p>
      </div>
    </section>
  );
}
