"use client";

import dynamic from "next/dynamic";
import * as THREE from "three";
import GeometricField from "@/components/vectors/GeometricField";
import type { SectionKeyframe } from "@/components/three/ChoreographyController";

const ArcaCanvas = dynamic(() => import("./three/ArcaCanvas"), { ssr: false });

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function PersistentScene({
  groupRef,
  keyframes,
  initialTempleAngle,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  keyframes: SectionKeyframe[];
  initialTempleAngle?: number;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Layer 1 — background: clean, minimal, but with real tonal depth */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 62% 40%, #1a1208 0%, #100c0a 35%, #080607 65%, #030303 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[1] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URL, backgroundSize: "140px 140px", opacity: 0.35 }}
      />
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 60% 55%, rgba(198,161,91,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Layer 2 — ambient middle-ground texture, well below the crisp
          per-section gallery frames that do the actual "framing" work */}
      <GeometricField
        variant="crystalline"
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full text-gold opacity-[0.16] blur-[1.5px]"
      />

      {/* Layer 3 — foreground: the product, pinned above the frame each
          section draws around it (see GalleryFrame, z-10 within sections). */}
      <div className="absolute inset-0 z-20">
        <ArcaCanvas
          groupRef={groupRef}
          keyframes={keyframes}
          initialTempleAngle={initialTempleAngle}
        />
      </div>
    </div>
  );
}
