"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeGradientTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#020202");
  gradient.addColorStop(0.55, "#050505");
  gradient.addColorStop(0.82, "#171008");
  gradient.addColorStop(1, "#241a0c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function Backdrop() {
  const texture = useMemo(() => makeGradientTexture(), []);

  return (
    <mesh position={[0, 0.1, -0.9]} renderOrder={-1}>
      <planeGeometry args={[2.2, 1.4]} />
      <meshBasicMaterial map={texture} fog={false} depthWrite={false} />
    </mesh>
  );
}
