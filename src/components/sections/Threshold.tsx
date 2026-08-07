import HairlineEyebrow from "@/components/vectors/HairlineEyebrow";

export default function Threshold({
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
        <HairlineEyebrow index="01" label="The Spine" align="center" />

        <h2 className="text-balance mt-8 font-serif text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-cream sm:text-4xl lg:text-[2.75rem]">
          Every frame starts as{" "}
          <span className="italic text-cream/80">a single line.</span>
        </h2>

        <p className="text-balance mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-cream/60 sm:text-base">
          Before the acetate, before the hinge, there is the spine — the
          structural bridge that sets the width of the face it will sit on,
          and the angle of everything built around it.
        </p>
      </div>
    </section>
  );
}
