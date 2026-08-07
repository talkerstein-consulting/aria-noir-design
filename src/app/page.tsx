"use client";

import { useRef } from "react";
import * as THREE from "three";
import PersistentScene from "@/components/PersistentScene";
import type { SectionKeyframe } from "@/components/three/ChoreographyController";
import Hero from "@/components/Hero";
import Threshold from "@/components/sections/Threshold";
import DualityIntro from "@/components/sections/DualityIntro";
import MainHall from "@/components/sections/MainHall";
import FeaturedArtifact from "@/components/sections/FeaturedArtifact";
import SideChambers from "@/components/sections/SideChambers";
import ClosingInvite from "@/components/sections/ClosingInvite";
import Footer from "@/components/Footer";

// Fold magnitude for a shut arm (~83°, how real glasses sit folded).
const CLOSED = 1.45;
const OPEN = 0;

// Held position for the hero + the three light-sweep beats: dead centre,
// front-facing, dropped below the headline.
const HOLD = { x: 0, y: -0.025, rotY: 0, scale: 1 } as const;

// Offset for the two unfold beats. Kept modest — with an arm swung open and
// the frame turned, a larger value runs the silhouette off the left edge.
const LEFT_COL = -0.09;
const CENTERED_Y = 0.02;

export default function Home() {
  const groupRef = useRef<THREE.Group>(null);

  const heroRef = useRef<HTMLElement>(null);
  const thresholdRef = useRef<HTMLElement>(null);
  const dualityRef = useRef<HTMLElement>(null);
  const mainHallRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const sideChambersRef = useRef<HTMLElement>(null);
  const closingRef = useRef<HTMLElement>(null);

  // The frame itself holds completely still through the first four beats —
  // only the raking light moves, revealing the bridge and hairline. It then
  // opens one arm per section and finally settles dead centre, fully open.
  const keyframes: SectionKeyframe[] = [
    {
      ref: heroRef,
      mode: "intro",
      pose: { ...HOLD, templeL: CLOSED, templeR: CLOSED, lightSweep: 0.18 },
    },
    {
      // The Spine — light rakes in from the left
      ref: thresholdRef,
      mode: "reveal",
      pose: { ...HOLD, lightSweep: 0.4 },
    },
    {
      // The Acetate — light crosses the bridge
      ref: dualityRef,
      mode: "reveal",
      pose: { ...HOLD, lightSweep: 0.62 },
    },
    {
      // The Finishing — light exits right along the hairline
      ref: mainHallRef,
      mode: "reveal",
      pose: { ...HOLD, lightSweep: 0.86 },
    },
    {
      // Right arm opens, frame turns to show that side
      ref: featuredRef,
      mode: "reveal",
      pose: {
        x: LEFT_COL,
        y: CENTERED_Y,
        rotY: -0.45,
        scale: 1.02,
        templeR: OPEN,
        lightSweep: 0.62,
      },
    },
    {
      // Left arm opens, frame turns the other way
      ref: sideChambersRef,
      mode: "reveal",
      pose: {
        x: LEFT_COL,
        y: CENTERED_Y,
        rotY: 0.45,
        scale: 1.02,
        templeL: OPEN,
        lightSweep: 0.38,
      },
    },
    {
      // Pinned inside the rectangle at the origin, fully open. Held just off
      // dead-on: at a true 0 the open arms point straight away from camera
      // and the unfolded state doesn't read.
      ref: closingRef,
      mode: "reveal",
      pose: {
        x: 0,
        y: CENTERED_Y,
        rotY: 0.2,
        scale: 1,
        templeL: OPEN,
        templeR: OPEN,
        lightSweep: 0.5,
      },
    },
  ];

  return (
    <>
      <PersistentScene
        groupRef={groupRef}
        keyframes={keyframes}
        initialTempleAngle={CLOSED}
      />

      <main className="relative">
        <Hero sectionRef={heroRef} />
        <Threshold sectionRef={thresholdRef} />
        <DualityIntro sectionRef={dualityRef} />
        <MainHall sectionRef={mainHallRef} />
        <FeaturedArtifact sectionRef={featuredRef} />
        <SideChambers sectionRef={sideChambersRef} />
        <ClosingInvite sectionRef={closingRef} />
        <Footer />
      </main>
    </>
  );
}
