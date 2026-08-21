"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/ARCA.glb";
const ALT_MODEL_URL = "/models/AHAVA.glb";

/** Scroll-driven state, mutated outside React to avoid per-frame re-renders. */
export type ModelDrive = { rotY: number; posY: number };

function Model({
  drive,
  url,
  fit,
}: {
  drive: { current: ModelDrive };
  url: string;
  /** Target width in world units. Normalising by WIDTH (not max dimension)
   *  matters here: temple-depth (Z) is the largest raw axis, but width is
   *  what should fill the frame. */
  fit: number;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  /* world-space size of the frustum at z=0 — narrow viewports give a much
     smaller width, which is what lets the fit clamp below keep the model
     inside the screen on a phone */
  const viewport = useThree((s) => s.viewport);

  // ARCA.glb is Y-up native and correctly front-facing — no corrective rotation.
  // Materials are properly authored (gold metallic + black acetate); only
  // envMapIntensity is tuned, never recoloured. Scale normalises by WIDTH,
  // because temple-depth (Z) is the largest raw dimension but width is what
  // should fill the frame.
  const baseWidth = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    scene.position.set(-center.x, -center.y, -center.z);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.envMapIntensity = 1.35;
      }
    });

    return size.x;
  }, [scene]);

  /* Never let the frame exceed 82% of the visible width. On desktop `fit`
     wins; on a phone the viewport clamp does, so the model always fits. */
  const scale = Math.min(fit, viewport.width * 0.82) / baseWidth;

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = drive.current.rotY;
    group.current.position.y = drive.current.posY;
  });

  return (
    <group ref={group} scale={scale} position={[0, -3, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function InvalidateBridge({ onReady }: { onReady: (fn: () => void) => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    onReady(invalidate);
  }, [invalidate, onReady]);
  return null;
}

export function ModelScene({
  drive,
  onInvalidateReady,
  url = MODEL_URL,
  fit = 2.9,
  continuous = false,
}: {
  drive: { current: ModelDrive };
  onInvalidateReady: (fn: () => void) => void;
  url?: string;
  fit?: number;
  /** Render every frame instead of on demand. Use where the model moves
   *  continuously with scroll — one-render-per-invalidate leaves the WebGL
   *  frame a tick behind the CSS transform, which reads as judder. */
  continuous?: boolean;
}) {
  const ready = useCallback(
    (fn: () => void) => onInvalidateReady(fn),
    [onInvalidateReady],
  );

  return (
    <Canvas
      frameloop={continuous ? "always" : "demand"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <InvalidateBridge onReady={ready} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} />
      <Suspense fallback={null}>
        <Model drive={drive} url={url} fit={fit} />
        {/* Offline-safe studio env (no CDN fetch) for the gold hardware. */}
        <Environment resolution={256}>
          <Lightformer
            intensity={3}
            position={[0, 4, 2]}
            scale={[10, 2, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.4}
            position={[-4, 1, 2]}
            scale={[4, 6, 1]}
            color="#c6a664"
          />
          <Lightformer
            intensity={1.2}
            position={[4, 0, 2]}
            scale={[4, 6, 1]}
            color="#ffffff"
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
useGLTF.preload(ALT_MODEL_URL);
