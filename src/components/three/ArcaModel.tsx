"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/ARCA_rigged.glb");

export type TempleRefs = {
  left: THREE.Object3D | null;
  right: THREE.Object3D | null;
};

/**
 * Blender's ORIGIN_CURSOR left each temple's origin near the middle of the
 * arm rather than at the hinge, so rotating swung the whole temple away from
 * the frame instead of folding it. Re-pivot to the real hinge — the centroid
 * of the front-most (+z) face, which is the surface that meets the frame.
 */
function repivotTempleToHinge(temple: THREE.Object3D) {
  if (temple.userData.__repivoted) return;

  const meshes: THREE.Mesh[] = [];
  temple.traverse((c) => {
    if (c instanceof THREE.Mesh) meshes.push(c);
  });
  if (meshes.length === 0) return;

  let maxZ = -Infinity;
  for (const m of meshes) {
    m.geometry.computeBoundingBox();
    maxZ = Math.max(maxZ, m.geometry.boundingBox!.max.z);
  }

  // Average only the vertices in a thin slab at the hinge face — using the
  // whole bbox centre here is what leaves a visible gap at a steep fold.
  const SLAB = 0.004;
  let sx = 0;
  let sy = 0;
  let sz = 0;
  let n = 0;
  for (const m of meshes) {
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      if (z > maxZ - SLAB) {
        sx += p.getX(i);
        sy += p.getY(i);
        sz += z;
        n++;
      }
    }
  }
  if (n === 0) return;

  const hinge = new THREE.Vector3(sx / n, sy / n, sz / n);
  for (const m of meshes) {
    m.geometry.translate(-hinge.x, -hinge.y, -hinge.z);
    m.geometry.computeBoundingSphere();
  }
  temple.position.add(hinge);
  temple.userData.__repivoted = true;
}

function upgradeMaterial(old: THREE.Material, overrides: THREE.MeshPhysicalMaterialParameters) {
  const src = old as THREE.MeshStandardMaterial;
  return new THREE.MeshPhysicalMaterial({
    color: src.color?.clone(),
    map: src.map ?? null,
    normalMap: src.normalMap ?? null,
    roughnessMap: src.roughnessMap ?? null,
    metalnessMap: src.metalnessMap ?? null,
    aoMap: src.aoMap ?? null,
    ...overrides,
  });
}

export default function ArcaModel({
  onReady,
}: {
  onReady?: (temples: TempleRefs) => void;
}) {
  const { scene } = useGLTF("/models/ARCA_rigged.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      if (mat.name === "lens_glass") {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x07070a,
          transmission: 1,
          roughness: 0.025,
          thickness: 0.02,
          ior: 1.52,
          transparent: true,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 1.4,
        });
      } else if (mat.name.startsWith("gold")) {
        child.material = upgradeMaterial(mat, {
          metalness: 1,
          roughness: 0.16,
          envMapIntensity: 1.8,
          clearcoat: 0.3,
          clearcoatRoughness: 0.15,
        });
      } else {
        // dark acetate / hardware — glossy clearcoat read instead of flat matte
        child.material = upgradeMaterial(mat, {
          roughness: 0.32,
          metalness: 0.06,
          clearcoat: 0.65,
          clearcoatRoughness: 0.22,
          envMapIntensity: 1.15,
        });
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    const left = scene.getObjectByName("Temple_L");
    const right = scene.getObjectByName("Temple_R");
    if (left) repivotTempleToHinge(left);
    if (right) repivotTempleToHinge(right);

    onReady?.({ left: left ?? null, right: right ?? null });
  }, [scene, onReady]);

  return <primitive object={scene} />;
}
