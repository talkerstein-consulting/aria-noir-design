"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/arca-i-k-black.glb";

/** Three quarters: enough yaw to read the temple and the hinge, and a
 *  little pitch — NOSE UP, seen from just under the brow line, which is the
 *  angle every colourway plate is shot at. A frame photographed from above
 *  looks like a specimen on a bench; from slightly below it looks like an
 *  object standing on a shelf at eye height, and it is the underside of the
 *  brow and the run of the temple that carry this cut.
 *
 *  The PITCH is fixed forever — only the yaw is ever touched. */
const PITCH = -0.1;
const REST_YAW = 0.62;

/** How quickly the frame catches up with where it has been sent. Eased
 *  rather than snapped: the object has weight, and a frame that teleports
 *  thirty degrees reads as a second photograph rather than the first one
 *  turning. */
const EASE = 6;

/** Radians per pixel of drag — about a half-turn across a wide plate. */
const DRAG = 0.006;

/**
 * The single source of truth for where the frame is pointing: `to` is where
 * it has been asked to go, `at` is where it currently is. The arrows and the
 * drag both write to `to` and to nothing else, which is what makes the axis
 * genuinely locked — there is no second input that could tip the frame off
 * its Y.
 *
 * It lives outside the component tree entirely, at module scope. This is
 * animation state advanced sixty times a second by a render loop that is
 * not React's: holding it in state would re-render the tree once per frame
 * to move a number no React output depends on, and holding it in anything
 * React tracks — a ref, a prop, a captured local — is a value the compiler
 * refuses to let a callback mutate after render, correctly and unhelpfully.
 * A module binding is neither.
 *
 * One viewer exists at a time (one turntable, on one product page), so a
 * single binding is the whole of it. It is reset on mount rather than
 * assumed fresh, since a module outlives the component that reads it.
 */
const drive = { at: 0, to: 0 };

/** Turn the frame by this many radians about its one axis. */
function turn(by: number) {
  drive.to += by;
}

/**
 * The K Black glb, at rest on three quarters, turned only by hand and only
 * about its own vertical axis.
 *
 * OrbitControls used to do the turning, and it is gone. Controls orbit a
 * CAMERA on a sphere: pull diagonally and the frame tips, rolls, and ends
 * up hanging at an angle nothing in the house's photography ever shows it
 * at — and no arrangement of polar clamps fixes the underlying fact that
 * the reader is flying a camera rather than turning a pair of glasses. So
 * the camera is nailed down and the OBJECT rotates, on one axis, from one
 * number. There is nothing left that can tip it over.
 */
function Model() {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);

  /* ---- Where the frame turns about ----
   *
   * The pivot has to be the middle of the WHOLE object — temples included —
   * and the model does not arrive that way. Its own origin sits at the
   * front of the frame (the glb measures z from -0.148 at the temple tips
   * to +0.006 at the face), so left alone it swings about its lenses like a
   * door rather than turning on the spot. The fix is to offset the model by
   * the centre of its bounding box, which puts that centre on the group's
   * origin — and the group's origin is what the rotation is applied to.
   *
   * The offset is APPLIED IN JSX rather than written onto `scene.position`
   * here, and that distinction is the whole bug this replaces. useGLTF
   * caches and shares the loaded scene, and React runs this memo twice in
   * development — so the first pass moved the scene and the second pass
   * measured the already-moved scene, found it centred, and dutifully set
   * the offset back to zero. The model went back to pivoting on its front
   * face, in dev only, which is exactly where it was seen doing it.
   * Measuring without mutating is idempotent however many times it runs.
   */
  const { offset, radius } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = new THREE.Sphere();
    const center = new THREE.Vector3();
    box.getCenter(center);
    box.getBoundingSphere(sphere);

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      /* ---- The lenses ----
       *
       * The glb ships them with the same standard material as everything
       * else, so the frame's own treatment — low roughness, a hard push on
       * the environment — turned them into two mirrors. Two silver ovals is
       * what a lens looks like in a render and never what one looks like
       * through a shop window.
       *
       * ---- Why they are not `transmission` glass ----
       *
       * They were, and that is precisely what made them grey. Transmission
       * refracts what is BEHIND the glass in the 3D scene, and the page is
       * not in the 3D scene — it is a DOM element behind a canvas. So the
       * lens sampled the only backdrop the renderer has, the white sky in
       * the environment map, and dutifully showed it: two pale grey discs
       * on a black page, which is exactly what was asked about.
       *
       * The fix is ordinary ALPHA. A material at low opacity does not
       * refract anything, it just fails to cover what is under it — and
       * because the canvas is drawn with `alpha: true`, what is under it is
       * the page. The lens now shows the section's own black, and the
       * concentric openings behind the frame read straight through it.
       *
       * What is given up is refraction: the far rim no longer bends as it
       * crosses the lens. On a black object against a black ground there is
       * nothing there to bend, so the trade costs an effect that could not
       * be seen and buys the one thing that could.
       *
       * Distances here are in the MODEL's own units, where the whole frame
       * is 0.14 across, not in the scaled-up units it is drawn at.
       */
      if (mesh.name.startsWith("Lens")) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          /* Cool and very slightly blue, the cast an optical coating has. */
          color: "#aebcc9",
          metalness: 0,
          /* Not zero. A perfectly smooth lens mirrors the lightformers back
             as hard white discs; a touch of roughness spreads that into the
             sheen a real coated lens carries. */
          roughness: 0.08,
          transparent: true,
          /* Low enough that the page reads through almost unchanged. The
             lens is legible from its edge sheen, not from its fill. */
          opacity: 0.12,
          /* The one thing that keeps them from disappearing entirely: a
             faint sheen skimmed off the environment at grazing angles,
             which is how you see a lens is there at all. */
          specularIntensity: 1,
          envMapIntensity: 1.1,
          /* Nothing behind a transparent lens should be depth-culled by it
             — without this the far rim of the frame is punched out of the
             picture by glass you are supposed to be seeing through. */
          depthWrite: false,
          /* Both faces, so the far side of the lens is drawn too. */
          side: THREE.DoubleSide,
        });
        return;
      }

      const mat = mesh.material as THREE.MeshStandardMaterial;
      /* A black frame on a black page is read almost entirely off its
         reflections, so the environment does the heavy lifting here and
         the direct lights only soften the falloff. Roughness is nudged
         down (not to zero — polished acetate is not chrome) so the
         highlight is a wide sheen along each edge rather than a hard
         glint that flickers as the frame is turned.

         Less push than the studio rig needed: the sky below is broader and
         softer, so the same number would only make it bright. */
      mat.envMapIntensity = 1.8;
      if (typeof mat.roughness === "number") {
        mat.roughness = Math.min(mat.roughness, 0.42);
      }
      mat.needsUpdate = true;
    });

    return {
      offset: center.clone().negate(),
      /* The RADIUS of that box's bounding sphere. A sphere is the only
         bound that does not change as the object turns, which is the whole
         point: the silhouette of a pair of glasses is at its narrowest
         face-on and at its widest around three-quarters, where the temples
         swing out along Z. Fitting by width sizes it correctly for exactly
         one moment of a rotation the reader can still perform by hand. */
      radius: sphere.radius,
    };
  }, [scene]);

  /* Fit that sphere inside the SMALLER of the two viewport dimensions, so
     the plate's shape can never clip it top-to-bottom either. 0.86 leaves a
     margin the frame turns inside of, rather than skimming the edges of. */
  const scale = (Math.min(viewport.width, viewport.height) * 0.86) / (radius * 2);

  /* Eases `at` toward `to` and writes the one rotation this object has.
     Frame-rate independent, and it settles rather than oscillating: at rest
     the two numbers are equal and this is a subtraction that yields zero. */
  useFrame((_, delta) => {
    if (!group.current) return;
    drive.at += (drive.to - drive.at) * Math.min(1, delta * EASE);
    group.current.rotation.set(PITCH, REST_YAW + drive.at, 0);
  });

  return (
    <group ref={group} scale={scale} rotation={[PITCH, REST_YAW, 0]}>
      <primitive object={scene} position={offset} />
    </group>
  );
}

export function ProductModel() {
  const dragging = useRef<{ id: number; x: number } | null>(null);
  /* Whether the pointer is over the object rather than merely somewhere in
     the section. Drives the cursor, and nothing else — see `near()`. */
  const [near, setNear] = useState(false);

  /* A module binding outlives this component, so the frame starts where it
     was left otherwise — at whatever angle the last visitor dragged it to,
     on a page they have not seen yet. */
  useEffect(() => {
    drive.at = 0;
    drive.to = 0;
  }, []);

  /* Drag is the same input as the arrows, expressed continuously: it moves
     `to`, and `at` chases it. Pointer capture keeps a drag alive when the
     cursor leaves the frame mid-turn. */
  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = { id: e.pointerId, x: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    /* ---- Is the pointer on the object? ----
     *
     * The canvas fills a whole screen and the frame occupies the middle
     * fifth of it, so a cursor that changed across the entire section was
     * promising a drag over acres of empty black. The model is centred and
     * fitted to a known fraction of the viewport (see `scale`), which means
     * its extent can simply be computed rather than picked at with a
     * raycast — cheaper, and it does not flicker between the temples where
     * a raycast finds nothing to hit. */
    const box = e.currentTarget.getBoundingClientRect();
    const dx = Math.abs(e.clientX - (box.left + box.width / 2));
    const dy = Math.abs(e.clientY - (box.top + box.height / 2));
    const reach = Math.min(box.width, box.height) * 0.5;
    /* Wider than tall, like the object. */
    setNear(dx < reach * 1.15 && dy < reach * 0.5);

    const d = dragging.current;
    if (!d || d.id !== e.pointerId) return;
    /* Only the horizontal component is read. Vertical movement during a
       drag is not a gesture this object has — which is the whole point. */
    turn((e.clientX - d.x) * DRAG);
    d.x = e.clientX;
  }, []);

  const onUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current?.id === e.pointerId) dragging.current = null;
  }, []);

  const onLeave = useCallback(() => setNear(false), []);

  return (
    <div className="relative h-full w-full">
      <div
        /* The cursor IS the left/right indicator — and it is the ONLY one,
           now that the word came off. `ew-resize` is the pointer every
           desktop already reads as "this moves along the horizontal axis",
           which is exactly the gesture this object has and the only gesture
           it has, so the affordance and the constraint are one statement.

           It appears over the object and nowhere else. A cursor that
           changes the moment you enter the section is offering a drag on a
           screenful of empty black. */
        className={`h-full w-full touch-none ${near ? "cursor-ew-resize" : ""}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
      >
        <Canvas
          dpr={[1, 2]}
          /* Dead-on, y=0, and it never moves again: the model is recentred
             on the origin and the fit leaves an even margin all round, so
             any camera offset just spends that margin on one side. */
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          /* ACES rolls the specular highlights off instead of clipping them
             to flat white. Exposure is back to 1: the sky below does the
             lifting now, and pushing it further only blows the sheen on the
             polished edges back into the hard glint the overcast rig exists
             to remove. */
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1;
          }}
        >
          {/* OVERCAST, not spotlit. A high even fill, with two very dim
              directionals left in only to stop the geometry going
              completely flat — an overcast sky still has a brighter side.
              What was here before was a key light: one bright source, a
              hard highlight, a hot rim. */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 5, 4]} intensity={0.3} />
          <directionalLight position={[-4, 2, 3]} intensity={0.2} />
          <Suspense fallback={null}>
            <Model />
            {/* A white sky, built as one enormous soft source overhead and
                large low-intensity panels all round.

                The old rig was a studio: two narrow panels at 3.4 raking
                the sides and a gold pair in front — how you light a black
                object to make it glint, and it glinted, in a hard line that
                travelled along an edge as the frame turned. These are wide,
                dim, and nearly the same brightness in every direction, so
                what runs along an edge is a broad even sheen instead. The
                frame still separates from the page by its rim; the rim is
                just no longer a spotlight's. */}
            <Environment resolution={512}>
              {/* the sky itself — wide, high, and the brightest thing here */}
              <Lightformer intensity={1.9} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 8, 1]} color="#ffffff" />
              {/* the horizon, all the way round */}
              <Lightformer intensity={0.9} position={[-8, 1, 0]} scale={[6, 10, 1]} color="#ffffff" />
              <Lightformer intensity={0.9} position={[8, 1, 0]} scale={[6, 10, 1]} color="#fbf7ef" />
              <Lightformer intensity={0.8} position={[0, 0, 7]} scale={[12, 8, 1]} color="#ffffff" />
              <Lightformer intensity={0.7} position={[0, 0, -7]} scale={[12, 8, 1]} color="#ffffff" />
              {/* the ground bounce, which is what an overcast day has under
                  it: dimmer than the sky, and a little warm */}
              <Lightformer intensity={0.45} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 8, 1]} color="#efe7d8" />
            </Environment>
          </Suspense>
        </Canvas>
      </div>

      {/* No label. The stage carried a centred "Rotate" under the object and
          it is gone: the cursor already says it, over the object, at the
          moment it applies — and a word printed on the page says it
          permanently, to everyone, including the people who were never
          going to reach for it. */}
    </div>
  );
}

useGLTF.preload(MODEL_URL);
