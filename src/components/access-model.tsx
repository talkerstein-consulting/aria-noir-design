"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { privateAccess } from "@/lib/content";

/**
 * The unreleased frame, under a light that walks across it as you scroll.
 *
 * ---- Why this replaces a scrubbed film ----
 *
 * The film turned the object. This one holds it still and moves the LAMP,
 * which is a different sentence: a frame being turned is a product being
 * demonstrated, and a frame lit slowly out of the dark is something being
 * looked at before it is finished. The section is about seeing a thing
 * early; the light arriving is that, said in one gesture.
 *
 * It also costs less than the sequence it replaces — no 61 stills to fetch
 * and decode, one glb the site already ships — and unlike a film it is
 * genuinely tied to the scrollbar rather than sampled from it.
 */

/** Named in lib/content beside the copy, so the section's object and its
 *  words are changed in the same place. */
const MODEL_URL = privateAccess.model;

/** How far the key light travels, in model radii, left to right. */
const SWEEP = 2.6;
/** How high it hangs over the frame. */
const LAMP_Y = 1.15;
/** And how far in front, so the sweep rakes the face rather than the top. */
const LAMP_Z = 0.85;

/** A quarter turn of drift across the whole section — enough that the
 *  object is not a photograph, far too little to read as a turntable. */
const DRIFT = 0.42;

/** Where the frame sits at rest: three quarters, nose up, the angle the
 *  colourway plates are shot at. */
const PITCH = -0.08;
const REST_YAW = 0.5;

/**
 * Scroll position, 0→1 through the section.
 *
 * Module scope for the same reason the product turntable's rotation is:
 * this is per-frame animation state read by a render loop that is not
 * React's, and anything React tracks the compiler will not let a callback
 * mutate after render. One viewer exists at a time.
 */
const drive = { p: 0 };

export function setAccessProgress(p: number) {
  drive.p = p;
}

function Frame() {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const key = useRef<THREE.PointLight>(null);
  const viewport = useThree((s) => s.viewport);

  /* Measured, not mutated — see the long note in product-model.tsx. The
     scene is cloned because the eyewear index loads this same file. */
  const { object, radius } = useMemo(() => {
    const object = scene.clone(true);
    const box = new THREE.Box3().setFromObject(object);
    const sphere = new THREE.Sphere();
    const center = new THREE.Vector3();
    box.getCenter(center);
    box.getBoundingSphere(sphere);
    object.position.set(-center.x, -center.y, -center.z);

    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      /* The lenses ship tan (#e7c693) and on a black page they were the
         only thing visible — two glowing ovals with no frame around them.
         Same treatment as the product turntable: low-opacity alpha, so what
         shows through a lens is the page, not a colour. */
      if (/^lens/i.test(mesh.name)) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: "#aebcc9",
          metalness: 0,
          roughness: 0.1,
          transparent: true,
          opacity: 0.1,
          envMapIntensity: 0.9,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        return;
      }

      const mat = mesh.material as THREE.MeshStandardMaterial;
      /* Polished enough to hold a moving highlight. A black frame is read
         off its reflections, so the environment below matters more here
         than any of the lamps. */
      if (typeof mat.roughness === "number") {
        mat.roughness = Math.min(mat.roughness, 0.28);
      }
      mat.envMapIntensity = 1.15;
      mat.needsUpdate = true;
    });

    return { object, radius: sphere.radius };
  }, [scene]);

  const scale = (Math.min(viewport.width, viewport.height) * 0.95) / (radius * 2);

  useFrame(() => {
    const p = drive.p;
    if (group.current) {
      group.current.rotation.set(PITCH, REST_YAW + (p - 0.5) * DRIFT, 0);
    }
    if (key.current) {
      /* The lamp crosses from one side to the other and dips closest at the
         middle of the section, so the brightest moment is the one the
         reader is most likely to be sitting in. */
      const across = (p - 0.5) * SWEEP;
      const dip = 1 - Math.cos(p * Math.PI * 2) * 0.18;
      key.current.position.set(across, LAMP_Y * dip, LAMP_Z);
      /* Falls off with distance, so the sweep reads as a lamp passing over
         rather than a slider changing a value. */
      key.current.intensity = 5.5 - Math.abs(p - 0.5) * 2.2;
    }
  });

  return (
    <>
      <group ref={group} scale={scale}>
        <primitive object={object} />
      </group>
      {/* The one light that moves. Everything else is fill. */}
      <pointLight ref={key} color="#fff6e6" distance={9} decay={1.6} />
    </>
  );
}

export function AccessModel() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      {/* Barely there. The frame has to be able to fall back into the dark
          at the ends of the sweep, or the lamp has nothing to reveal. */}
      <ambientLight intensity={0.18} />
      <Suspense fallback={null}>
        <Frame />
        {/* Three dim panels, and they are what makes a BLACK object visible
            at all: acetate is read off the edges it reflects, not off the
            light falling on its face. Without this the first build showed
            two lenses floating in a void — the frame was lit and still not
            there. Kept low and cold so the moving key is the only warm
            thing in the scene, which is what lets it read as a lamp
            crossing rather than the exposure changing. */}
        <Environment resolution={256}>
          <Lightformer intensity={0.9} position={[0, 4, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.4} position={[-5, 0, -2]} scale={[3, 7, 1]} color="#cddcec" />
          <Lightformer intensity={1.1} position={[5, 0, -2]} scale={[3, 7, 1]} color="#ffffff" />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
