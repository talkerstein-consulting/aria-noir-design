"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import ArcaModel, { type TempleRefs } from "./ArcaModel";
import ChoreographyController, {
  type SectionKeyframe,
  type TempleRefsRef,
} from "./ChoreographyController";

// Aimed at the frame's own centre height, so a pose's `y` reads directly as
// "centred" (0.02) vs "dropped below the headline" (hero).
const LOOK_AT = new THREE.Vector3(0, 0.051, 0);

function CameraAim() {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    camera.lookAt(LOOK_AT);
  }, [camera]);
  return null;
}

export default function ArcaCanvas({
  groupRef,
  keyframes,
  initialTempleAngle = 0,
  initialLightSweep = 0.5,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  keyframes: SectionKeyframe[];
  initialTempleAngle?: number;
  initialLightSweep?: number;
}) {
  const templesRef: TempleRefsRef = useRef({ left: null, right: null });
  const sweepLightRef = useRef<THREE.PointLight | null>(null);

  // react-use-measure's initial ResizeObserver tick can race with layout when
  // this Canvas is mounted via next/dynamic, leaving the canvas stuck at the
  // browser's 300x150 default. A nudge forces a remeasure.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleTemplesReady = (temples: TempleRefs) => {
    templesRef.current = temples;
    // "temples folded" is the hero's resting look, not something that
    // animates shut during its own scroll — set directly, once, here.
    // Each arm runs along -Z from its hinge, so folding inward means -angle
    // on the left and +angle on the right.
    if (temples.left) temples.left.rotation.y = -initialTempleAngle;
    if (temples.right) temples.right.rotation.y = initialTempleAngle;
  };

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{ position: [0, 0.1, 0.7], fov: 30 }}
    >
      <Environment files="/hdri/brown_photostudio_02_2k.hdr" environmentIntensity={0.45} />
      <ambientLight intensity={0.06} />

      {/* Base key — deliberately restrained so the travelling light below is
          what actually reveals the surface. */}
      <directionalLight position={[-0.3, 0.45, 0.5]} intensity={0.75} color="#ffd9a0" />
      {/* Rim — separates the frame from the noir backdrop */}
      <directionalLight position={[0.35, 0.1, -0.5]} intensity={0.9} color="#8fb8ff" />

      {/* The sweeping band. Close in and bright, so as it passes it rakes
          across the bridge and hairline and picks out the relief. */}
      {/* Intensity is in candela with decay 2, so it falls off as 1/d² — at
          this range anything above ~0.1 blows the dark acetate out to cream. */}
      <pointLight
        ref={sweepLightRef}
        position={[0, 0.085, 0.2]}
        intensity={0.055}
        distance={0.8}
        decay={2}
        color="#fff0d4"
      />

      <CameraAim />

      <group ref={groupRef} position={[0, -0.025, 0]}>
        <ArcaModel onReady={handleTemplesReady} />
      </group>

      <Sparkles
        count={50}
        scale={[0.6, 0.4, 0.4]}
        position={[0, 0.08, -0.05]}
        size={0.03}
        speed={0.12}
        opacity={0.18}
        color="#f2c98a"
      />

      <ChoreographyController
        groupRef={groupRef}
        templesRef={templesRef}
        sweepLightRef={sweepLightRef}
        keyframes={keyframes}
      />

      <EffectComposer>
        <Bloom intensity={0.45} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.62} />
        <Noise opacity={0.025} />
      </EffectComposer>
    </Canvas>
  );
}
