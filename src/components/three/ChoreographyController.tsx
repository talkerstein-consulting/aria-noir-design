"use client";

import { useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { TempleRefs } from "./ArcaModel";

gsap.registerPlugin(ScrollTrigger);

export type Pose = {
  x: number;
  /** World-space height. The hero drops the frame below its headline; the
   * later sections centre it. */
  y?: number;
  rotY: number;
  scale?: number;
  /** Fold magnitude per arm, so each side can open on its own beat.
   * 0 = fully open, ~1.45 = folded shut. */
  templeL?: number;
  templeR?: number;
  /** 0..1 — where the raking light sits across the frame. Sweeping this
   * while the frame itself holds still is what reveals the bridge detail. */
  lightSweep?: number;
};

export type TempleRefsRef = React.RefObject<TempleRefs>;
export type SweepLightRef = React.RefObject<THREE.PointLight | null>;

export type SectionKeyframe = {
  ref: React.RefObject<HTMLElement | null>;
  pose: Pose;
  /** "reveal" = the transition finishes as this section's top reaches the
   * viewport top. "intro" = plays out across this section's own full height. */
  mode: "intro" | "reveal";
};

const TRANSITION_PX = 450;

// World-space travel of the sweeping light, left edge to right edge.
const SWEEP_MIN_X = -0.34;
const SWEEP_MAX_X = 0.34;
const sweepToX = (t: number) => SWEEP_MIN_X + t * (SWEEP_MAX_X - SWEEP_MIN_X);

export default function ChoreographyController({
  groupRef,
  templesRef,
  sweepLightRef,
  keyframes,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  templesRef: TempleRefsRef;
  sweepLightRef: SweepLightRef;
  keyframes: SectionKeyframe[];
}) {
  useEffect(() => {
    const group = groupRef.current;
    const firstEl = keyframes[0]?.ref.current;
    const lastEl = keyframes[keyframes.length - 1]?.ref.current;
    if (!group || !firstEl || !lastEl) return;

    const ctx = gsap.context(() => {
      // A SINGLE timeline driven by ONE ScrollTrigger spanning the whole
      // choreographed range. Using one independent ScrollTrigger-scrub tween
      // per keyframe on the same properties does NOT work — each new tween's
      // creation render stomps the previous one's value.
      const totalStart = firstEl.getBoundingClientRect().top + window.scrollY;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: firstEl,
          start: "top top",
          endTrigger: lastEl,
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      keyframes.forEach(({ ref, pose, mode }) => {
        const el = ref.current;
        if (!el) return;

        const heroHeightPx = firstEl.getBoundingClientRect().height;
        const elTop = el.getBoundingClientRect().top + window.scrollY;

        const endPos = mode === "intro" ? heroHeightPx : elTop - totalStart;
        const duration = mode === "intro" ? heroHeightPx : TRANSITION_PX;
        const startPos = endPos - duration;

        tl.to(
          group.position,
          {
            x: pose.x,
            y: pose.y ?? group.position.y,
            duration,
            ease: "none",
          },
          startPos
        )
          .to(
            group.rotation,
            { y: pose.rotY, duration, ease: "none" },
            startPos
          )
          .to(
            group.scale,
            {
              x: pose.scale ?? 1,
              y: pose.scale ?? 1,
              z: pose.scale ?? 1,
              duration,
              ease: "none",
            },
            startPos
          );

        // Each arm runs along -Z from its hinge, so folding inward is -angle
        // on the left and +angle on the right.
        const { left, right } = templesRef.current;
        if (left && pose.templeL !== undefined) {
          tl.to(
            left.rotation,
            { y: -pose.templeL, duration, ease: "none" },
            startPos
          );
        }
        if (right && pose.templeR !== undefined) {
          tl.to(
            right.rotation,
            { y: pose.templeR, duration, ease: "none" },
            startPos
          );
        }

        if (sweepLightRef.current && pose.lightSweep !== undefined) {
          tl.to(
            sweepLightRef.current.position,
            { x: sweepToX(pose.lightSweep), duration, ease: "none" },
            startPos
          );
        }
      });
    });

    return () => ctx.revert();
  }, [groupRef, templesRef, sweepLightRef, keyframes]);

  return null;
}
