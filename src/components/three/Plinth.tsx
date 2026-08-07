"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Plinth() {
  const [diff, nor, arm] = useTexture([
    "/textures/dark_rock/diff.jpg",
    "/textures/dark_rock/nor.jpg",
    "/textures/dark_rock/arm.jpg",
  ]);

  useMemo(() => {
    [diff, nor, arm].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.4, 1.4);
    });
    diff.colorSpace = THREE.SRGBColorSpace;
  }, [diff, nor, arm]);

  return (
    <mesh position={[0, -0.065, -0.05]} receiveShadow castShadow>
      <boxGeometry args={[0.36, 0.09, 0.32]} />
      <meshStandardMaterial
        map={diff}
        normalMap={nor}
        aoMap={arm}
        roughnessMap={arm}
        metalnessMap={arm}
        roughness={1}
        metalness={0.1}
      />
    </mesh>
  );
}
