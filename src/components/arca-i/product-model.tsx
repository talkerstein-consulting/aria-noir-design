"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/arca-i-k-black.glb";

/**
 * Turntable viewer for the K Black glb — drag to rotate, slow auto-spin at
 * rest. Deliberately its own scene rather than reusing model-scene.tsx's
 * ModelScene: that component is wired to the home page's scroll-drive
 * (external `drive` ref, on-demand frameloop tied to a scroll handler), and
 * bolting OrbitControls onto that would fight the same rotation value from
 * two sources. This one owns its own frameloop instead.
 */
function Model() {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);

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
        (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = 1.35;
      }
    });
    return size.x;
  }, [scene]);

  const scale = Math.min(2.9, viewport.width * 0.82) / baseWidth;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

export function ProductModel() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} />
      <Suspense fallback={null}>
        <Model />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 4, 2]} scale={[10, 2, 1]} color="#ffffff" />
          <Lightformer intensity={1.4} position={[-4, 1, 2]} scale={[4, 6, 1]} color="#c6a664" />
          <Lightformer intensity={1.2} position={[4, 0, 2]} scale={[4, 6, 1]} color="#ffffff" />
        </Environment>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
