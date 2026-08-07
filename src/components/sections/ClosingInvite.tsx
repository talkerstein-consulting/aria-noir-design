import HairlineEyebrow from "@/components/vectors/HairlineEyebrow";
import CornerMarks from "@/components/vectors/CornerMarks";

const TEXT_SHADOW = "0 2px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95)";

const TICK = "absolute h-3 w-3 border-gold/70";

export default function ClosingInvite({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      // Exactly one viewport tall on desktop: the scroll timeline finishes as
      // this section's bottom meets the viewport bottom, so at 100vh the
      // section's centre *is* the viewport centre — which is where the frame
      // comes to rest. Any extra height and the vitrine drifts off it.
      className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-16 md:h-screen"
    >
      <CornerMarks />

      {/* The vitrine the frame settles into */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[34vh] w-[min(28rem,84vw)] -translate-x-1/2 -translate-y-1/2 border border-gold/30"
      >
        <div className="absolute inset-2 border border-gold/12" />
        <span className={`${TICK} -left-px -top-px border-l border-t`} />
        <span className={`${TICK} -right-px -top-px border-r border-t`} />
        <span className={`${TICK} -bottom-px -left-px border-b border-l`} />
        <span className={`${TICK} -bottom-px -right-px border-b border-r`} />
      </div>

      <div
        className="relative z-30 mx-auto max-w-2xl text-center"
        style={{ textShadow: TEXT_SHADOW }}
      >
        <HairlineEyebrow index="06" label="The Acquisition" align="center" />

        <h2 className="text-balance mx-auto mt-6 max-w-xl font-serif text-4xl font-normal leading-[1.08] tracking-[-0.01em] text-cream sm:text-5xl">
          Ready to{" "}
          <span className="italic text-gold/90">enter differently?</span>
        </h2>

        <p className="text-balance mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-cream/70">
          The frame is open now. What happens next is yours to decide, not
          ours to sell you.
        </p>
      </div>

      <div className="relative z-30 flex flex-wrap items-center justify-center gap-3">
        <button className="pointer-events-none inline-block border border-gold/50 bg-noir/40 px-8 py-3 text-[11px] uppercase tracking-[0.35em] text-gold/90 backdrop-blur-sm">
          Reserve
        </button>
        <button className="pointer-events-none inline-block border border-cream/25 px-8 py-3 text-[11px] uppercase tracking-[0.35em] text-cream/70">
          Find Your Fit
        </button>
      </div>
    </section>
  );
}
