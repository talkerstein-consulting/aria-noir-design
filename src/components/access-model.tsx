"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { privateAccess } from "@/lib/content";
import { useOnScreen } from "@/hooks/use-on-screen";

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

/**
 * The lamp's travel, in world units, left to right.
 *
 * The frame is fitted to about 3.5 units across, so this starts and ends
 * well outside it: the light enters from off-frame, crosses, and leaves —
 * rather than sliding about inside the picture.
 */
const SWEEP = 5.4;
/**
 * The dark end and the lit end.
 *
 * The section opens on almost nothing — the lamp is off to one side and
 * turned nearly out, so the first thing in view is a shape you can barely
 * confirm is a pair of glasses. Scrolling brings the light across AND up:
 * by the far side the frame is plainly lit. Two variables, one scroll
 * value, and the reader is what raises the light.
 *
 * DARK is the fraction of full brightness at rest. Not zero: a section
 * someone lands in the middle of should never be a blank screen, and the
 * ambient floor below is doing the same job from underneath.
 */
const DARK = 0.05;
const PANEL_I = 7;
const AMBIENT_MIN = 0.06;
const AMBIENT_MAX = 1.05;

/** Smoothstep: no sudden start, no sudden stop. */
const ease = (t: number) => t * t * (3 - 2 * t);

/** How high it hangs over the frame. */
const LAMP_Y = 0.62;
/** And how far in front, so it rakes the face rather than the top edge. */
const LAMP_Z = 2.7;

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

/**
 * The lamp: a broad soft panel that crosses the frame, not a bulb.
 *
 * A point light is a bare filament — it draws a hard specular dot that
 * slides along an edge, which on polished acetate reads as a glint rather
 * than as weather. This is a Lightformer: an actual rectangle of light in
 * the environment map, so what the frame reflects is a soft-edged panel
 * the width of the object. Overcast, and moving.
 *
 * It lives inside <Environment>, which is what makes the reflection real
 * rather than just illumination — and why that environment has to be
 * re-rendered every frame (`frames={Infinity}` on it). At 256px that is a
 * cheap render target and the only per-frame GPU cost in the section.
 */
function SweepLight() {
  const panel = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Color("#fff6ea"), []);

  useFrame(() => {
    const mesh = panel.current;
    if (!mesh) return;
    const p = drive.p;

    /* Across, left to right. */
    mesh.position.set((p - 0.5) * SWEEP, LAMP_Y, LAMP_Z);

    /* And up. Lightformer bakes `intensity` into the material colour once,
       in a layout effect, so brightness is animated by writing that colour
       directly — the prop is left at 1 and this is the real value.
       
       Brightness is capped where it is because the reflection is a PANEL:
       push it and the rim it crosses goes to near-white, which reads as a
       white frame rather than a black one being lit. */
    const k = PANEL_I * (DARK + (1 - DARK) * ease(p));
    (mesh.material as THREE.MeshBasicMaterial).color
      .copy(base)
      .multiplyScalar(k);
  });

  return (
    <Lightformer
      ref={panel}
      form="rect"
      intensity={1}
      /* Wide and tall enough to wrap the frame's edges rather than pick
         out one of them. */
      scale={[5.2, 3, 1]}
      color="#fff6ea"
    />
  );
}

/** The floor under the dark, raised on the same scroll as the lamp. */
function Lift() {
  const amb = useRef<THREE.AmbientLight>(null);
  useFrame(() => {
    if (amb.current) {
      amb.current.intensity =
        AMBIENT_MIN + (AMBIENT_MAX - AMBIENT_MIN) * ease(drive.p);
    }
  });
  return <ambientLight ref={amb} intensity={AMBIENT_MIN} />;
}

function Frame() {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
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
      /* Softer than the product turntable's acetate, and deliberately.
      
         At 0.28 the surface is a mirror: it reflected the light panel as a
         PANEL — a hard white shape sitting on the rim, which reads as a
         white frame rather than a black one being lit. Rougher, the same
         panel arrives as a gradient across the acetate, which is what an
         overcast source looks like on a polished black object. */
      if (typeof mat.roughness === "number") {
        mat.roughness = Math.max(0.42, Math.min(mat.roughness, 0.5));
      }
      mat.envMapIntensity = 1.7;
      mat.needsUpdate = true;
    });

    return { object, radius: sphere.radius };
  }, [scene]);

  const scale =
    (Math.min(viewport.width, viewport.height) * 0.95) / (radius * 2);

  /* THE FRAME DOES NOT MOVE. Only the lamp does — see SweepLight.

     That is the whole idea and it is easy to lose: a little drift was in
     here at first, and the moment the object turns as well, the light stops
     being the subject and it reads as a turntable that happens to be lit.
     Held still, the only thing changing on screen is which part of the
     acetate is catching. */

  return (
    <>
      <group ref={group} scale={scale} rotation={[PITCH, REST_YAW, 0]}>
        <primitive object={object} />
      </group>
    </>
  );
}

export function AccessModel() {
  /* Same bargain as ProductModel: this sits on the home page, and without
     a gate it renders continuously from the moment the page loads until
     the reader leaves — most of that time from several screens away. */
  const box = useRef<HTMLDivElement>(null);
  const live = useOnScreen(box);

  return (
    <div ref={box} className="h-full w-full">
      <Canvas
        frameloop={live ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.35;
        }}
      >
        <Lift />
        <Suspense fallback={null}>
          <Frame />
          {/* Three dim panels, and they are what makes a BLACK object visible
            at all: acetate is read off the edges it reflects, not off the
            light falling on its face. Without this the first build showed
            two lenses floating in a void — the frame was lit and still not
            there. Kept low and cold so the moving key is the only warm
            thing in the scene, which is what lets it read as a lamp
            crossing rather than the exposure changing. */}
          {/* An overcast sky, and one panel of it walking across the frame.

            `frames={Infinity}` is what lets the moving panel be part of the
            reflected world rather than a light shining on it: the map is
            re-rendered every frame, which is the whole reason the sweep
            shows up in the acetate's edges instead of only in its shading.

            The static panels are dim against the moving one on purpose —
            enough to keep the frame present between passes, not so much
            that the sweep is a rounding error on top of them. That was the
            first version's mistake in the other direction. */}
          <Environment resolution={256} frames={Infinity}>
            <Lightformer
              intensity={1.9}
              position={[0, 4, 1]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[10, 6, 1]}
              color="#ffffff"
            />
            <Lightformer
              intensity={1.5}
              position={[-5, 0, -2]}
              scale={[3, 7, 1]}
              color="#cddcec"
            />
            <Lightformer
              intensity={1.4}
              position={[5, 0, -2]}
              scale={[3, 7, 1]}
              color="#ffffff"
            />
            <SweepLight />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
