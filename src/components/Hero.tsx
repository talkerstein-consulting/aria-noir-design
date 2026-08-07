"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import CornerMarks from "@/components/vectors/CornerMarks";
import RailText from "@/components/vectors/RailText";

export default function Hero({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        copyRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.8, ease: "power2.out", delay: 0.3 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [sectionRef]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative h-[220vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <CornerMarks />

        <RailText className="absolute right-6 top-6 hidden text-right md:right-14 md:top-16 md:block">
          Private Collection
          <br />
          MMXXVI
        </RailText>
        <RailText className="absolute bottom-24 right-6 hidden text-right md:right-14 md:block">
          ⌀ 54 — 21 — 145
        </RailText>

        <div
          ref={copyRef}
          className="mx-auto flex h-full max-w-2xl flex-col items-center px-6 pt-28 text-center sm:pt-36"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg tracking-[0.2em] text-cream">
              ARIA
            </span>
            <span className="h-3 w-px bg-cream/30" />
            <span className="text-[10px] tracking-[0.45em] text-cream/60">
              NOIR
            </span>
          </div>

          <h1 className="text-balance mt-6 font-serif text-4xl font-normal leading-[1.1] tracking-[-0.01em] text-cream sm:text-5xl lg:text-[3.5rem]">
            Enter{" "}
            <span className="italic text-gold/90">Differently.</span>
          </h1>

          <p className="text-balance mt-4 max-w-md text-[15px] leading-relaxed text-cream/60 sm:text-base">
            One frame, cast once, worn by people who no longer need to prove
            anything.
          </p>

          <div className="mt-auto pb-10">
            <span className="text-[10px] uppercase tracking-[0.35em] text-cream/40">
              Scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
