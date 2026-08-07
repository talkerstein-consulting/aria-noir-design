"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function RailText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, {
      opacity: 0.35,
      duration: 3.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <span
      ref={ref}
      className={`text-[10px] uppercase tracking-[0.35em] text-cream/70 ${className}`}
    >
      {children}
    </span>
  );
}
