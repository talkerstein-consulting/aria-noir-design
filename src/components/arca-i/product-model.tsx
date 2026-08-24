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

  /* The RADIUS of the model's bounding sphere, measured about the point we
     then recentre it on. A sphere is the only bound that does not change
     as the object turns, which is the whole point: the silhouette of a
     pair of glasses is at its narrowest face-on (just its X extent) and at its
     widest somewhere around three-quarters, where the temples swing out
     along Z and the projected width grows to the XZ diagonal. Fitting the
     frame by its width — which is what this used to do — therefore sized
     it correctly for exactly one moment of the rotation and let it run out
     of the canvas for the rest. */
  const radius = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = new THREE.Sphere();
    const center = new THREE.Vector3();
    box.getCenter(center);
    /* Take the sphere BEFORE recentring: it is measured about the box's
       own centre, which is the exact point the next line moves to origin —
       so the radius stays true once the model is sitting there. */
    box.getBoundingSphere(sphere);
    scene.position.set(-center.x, -center.y, -center.z);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        /* A black frame on a black page is read almost entirely off its
           reflections, so the environment does the heavy lifting here and
           the direct lights only soften the falloff. Roughness is nudged
           down (not to zero — polished acetate is not chrome) so the
           highlight is a wide sheen along each edge rather than a hard
           glint that flickers as the turntable spins. */
        mat.envMapIntensity = 2.6;
        if (typeof mat.roughness === "number") {
          mat.roughness = Math.min(mat.roughness, 0.42);
        }
        mat.needsUpdate = true;
      }
    });
    return sphere.radius;
  }, [scene]);

  /* Fit that sphere inside the SMALLER of the two viewport dimensions, so
     the plate's 3:2 shape can never clip it top-to-bottom either — the old
     maths only ever looked at width. 0.86 leaves a margin the frame turns
     inside of, rather than skimming the edges of. */
  const scale = (Math.min(viewport.width, viewport.height) * 0.86) / (radius * 2);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
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
      /* Dead-on, y=0: the model is recentred on the origin and the fit
         above leaves an even margin all round, so any camera offset just
         spends that margin on one side and reintroduces the clipping. */
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      /* ACES rolls the specular highlights off instead of clipping them to
         flat white, which is what made the old rig read as hard. Exposure
         above 1 lifts the whole frame off the black page. */
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
      }}
    >
      {/* Soft, low-contrast direct light: a broad fill so nothing goes to
          pure black, and two wide, dim keys instead of one bright one. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />
      <directionalLight position={[-4, 1, 3]} intensity={0.45} />
      <Suspense fallback={null}>
        <Model />
        {/* Large area lights placed BEHIND and to the sides — the frame is
            black, so it separates from a black background by its rim, not
            by its face. The two side panels rake the edges; the gold pair
            keeps the sheen warm rather than clinical. */}
        <Environment resolution={512}>
          <Lightformer intensity={2.2} position={[0, 5, 1]} scale={[12, 3, 1]} color="#ffffff" />
          <Lightformer intensity={3.4} position={[-6, 0, -2]} scale={[3, 8, 1]} color="#ffffff" />
          <Lightformer intensity={3.4} position={[6, 0, -2]} scale={[3, 8, 1]} color="#f3e7cd" />
          <Lightformer intensity={1.6} position={[-3, 1.5, 3]} scale={[5, 5, 1]} color="#c6a664" />
          <Lightformer intensity={1.1} position={[3, -1.5, 3]} scale={[5, 5, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} form="ring" position={[0, 0, -4]} scale={6} color="#ffffff" />
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
