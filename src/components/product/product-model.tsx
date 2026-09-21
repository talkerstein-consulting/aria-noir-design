"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { useRenderGate } from "@/hooks/use-on-screen";
import { fitScale } from "@/lib/model-fit";
import * as THREE from "three";

/** Three quarters: enough yaw to read the temple and the hinge, and a
 *  little pitch — NOSE UP, seen from just under the brow line, which is the
 *  angle every colourway plate is shot at. A frame photographed from above
 *  looks like a specimen on a bench; from slightly below it looks like an
 *  object standing on a shelf at eye height, and it is the underside of the
 *  brow and the run of the temple that carry this cut.
 *
 *  The PITCH is fixed forever — only the yaw is ever touched. */
const PITCH = -0.1;
/** Exported because the buy page's opening has to CANCEL it: the frame is
 *  shown square to the reader on arrival and turns into three quarters as
 *  it travels. A hand-copied 0.62 in the other file would be a second
 *  source of truth for the same angle. */
export const REST_YAW = 0.62;

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
 * Send the frame back to its display angle.
 *
 * The drag is free — a reader can spin the frame to the back of its own
 * temple — but the page's opening ends at a known heading, and arriving
 * there facing wherever it was last shoved is the object looking abandoned
 * rather than presented. `at` is left alone so the return is EASED by the
 * same loop that eases everything else.
 */
export function resetTurn() {
  drive.to = 0;
}

/**
 * Warm the cache for a set of glbs.
 *
 * `useGLTF` SUSPENDS while it fetches, and the boundary around the viewer
 * falls back to null — so switching colourway tore the whole scene down,
 * lights and environment included, and rebuilt it a moment later. That is
 * the glitch: not the frame changing colour, but the stage going out and
 * coming back around it. A file already in the cache resolves without
 * suspending, so the swap happens inside one frame and the fade is the
 * only thing anyone sees.
 */
export function preloadModels(srcs: readonly string[]) {
  for (const src of srcs) useGLTF.preload(src);
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
function Model({
  src,
  yaw,
  zoom,
  air,
  onReady,
}: {
  src: string;
  yaw?: React.RefObject<number>;
  zoom?: React.RefObject<number>;
  air?: number;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(src);
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);

  /* Loaded, centred, and about to be drawn.

     `useGLTF` SUSPENDS, so this component does not exist at all until the
     glb is in — which makes its first effect the honest moment to tell the
     page the frame has arrived. The caller fades the stage in on it. What
     it replaces was a fixed timeout: the stage went opaque 90ms after the
     colourway changed whether or not there was anything in it, so a cold
     load showed an empty ground for as long as the fetch took and then the
     frame appeared at full strength, with no transition at all. */
  useEffect(() => {
    onReady?.();
  }, [scene, onReady]);

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
    /* ---- Measure from a KNOWN position, not from wherever it was left ----
     *
     * `useGLTF` caches by URL and hands every caller the same scene object,
     * and `<primitive position={offset}>` below writes onto that object. So
     * the offset this computes is applied to the very thing it is computed
     * from, and the second time a colourway is shown the box has already
     * been moved: it measures as centred, the offset collapses to zero, and
     * the frame snaps back to pivoting on its own origin — which the glb
     * puts at the FRONT of the lenses, not the middle of the object. That
     * is the jump seen when swapping to another acetate and back.
     *
     * Zeroing first makes the measurement independent of what any previous
     * mount did to the scene. It is a mutation, but an idempotent one, and
     * the render below immediately writes the real offset back. */
    scene.position.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const sphere = new THREE.Sphere();
    const center = new THREE.Vector3();
    box.getCenter(center);
    box.getBoundingSphere(sphere);

    /* ---- Where the object actually balances ----
     *
     * Area-weighted over every triangle, which is the honest centre for a
     * shell: these meshes are surfaces, not solids, so weighting by
     * triangle area is the closest thing to weighting by material. A plain
     * average of vertices would instead be a vote, and the densest mesh
     * would win it — on this model the temples carry more vertices than
     * the fronts, so the naive average lands almost where the bounding box
     * already was and fixes nothing.
     *
     * Measured in the SCENE's space, via each mesh's world matrix, because
     * the glb parks its parts at node transforms (the fronts are rotated a
     * quarter turn about X, two of them are mirrored with a negative
     * scale) and a centroid read off raw local positions would be the
     * centre of a model that is not the one on screen. A mirrored node has
     * a negative determinant, which flips the cross product's direction
     * but not its length — and length is all this takes. */
    const centroid = new THREE.Vector3();
    {
      let area = 0;
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const c = new THREE.Vector3();
      const ab = new THREE.Vector3();
      const ac = new THREE.Vector3();
      const tri = new THREE.Vector3();

      scene.updateWorldMatrix(false, true);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.geometry) return;
        const pos = mesh.geometry.getAttribute("position");
        if (!pos) return;
        const index = mesh.geometry.getIndex();
        const count = index ? index.count : pos.count;

        for (let i = 0; i < count; i += 3) {
          const i0 = index ? index.getX(i) : i;
          const i1 = index ? index.getX(i + 1) : i + 1;
          const i2 = index ? index.getX(i + 2) : i + 2;

          a.fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld);
          b.fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld);
          c.fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld);

          /* Half the cross product's length is the triangle's area. */
          const w = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() / 2;
          if (!(w > 0)) continue;

          tri.copy(a).add(b).add(c).divideScalar(3);
          centroid.addScaledVector(tri, w);
          area += w;
        }
      });

      /* A model with no drawable area cannot be balanced; the box's middle
         is the only answer left and it is the one this used to give. */
      if (area > 0) centroid.divideScalar(area);
      else centroid.copy(center);
    }

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
        /* Once per lens, not once per swap. The scene is shared and cached,
           so this traversal runs again every time the reader comes back to
           a colourway — and each run was building a fresh material and
           dropping the last one on the floor. */
        if (mesh.material instanceof THREE.MeshPhysicalMaterial) return;
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
      /* ---- The turn axis is the object's BALANCE POINT, not its box ----
       *
       * This used to be `center` — the middle of the bounding box — and a
       * bounding box is the wrong description of a pair of glasses. The
       * box is 0.154 deep because the temples reach back that far, so its
       * middle lands at z ≈ -0.071: a point in the EMPTY AIR between two
       * thin arms, 46% of the way back from the face. Nearly all the
       * object's mass — the fronts, the lenses, the bridge, the hinges —
       * sits in the first fifth of that depth, centred near z ≈ -0.007.
       *
       * Turning about the box's middle therefore swung the heavy front
       * through a wide arc around a pivot behind it: the frame slid across
       * the plate and changed size as it went, which reads as an object
       * being orbited rather than one turning on its own axis.
       *
       * `centroid` below is the area-weighted centre of the actual
       * triangles, so the axis passes through where the frame genuinely
       * balances. The front now stays put and the temples sweep behind it,
       * which is what a frame on a turntable does.
       *
       * X and Z come from the centroid because those two place the
       * VERTICAL AXIS the yaw turns about. Y stays the box's middle: the
       * height of the axis cannot affect a spin around it, and the box is
       * the better answer for sitting the object squarely in its plate. */
      offset: new THREE.Vector3(centroid.x, center.y, centroid.z).negate(),
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
     the plate's shape can never clip it top-to-bottom either. The margin
     the frame turns inside of, rather than skimming the edges of, is the
     house's and is decided in lib/model-fit. */
  const scale = fitScale(viewport, radius, air);

  /* Eases `at` toward `to` and writes the one rotation this object has.
     Frame-rate independent, and it settles rather than oscillating: at rest
     the two numbers are equal and this is a subtraction that yields zero. */
  useFrame((_, delta) => {
    if (!group.current) return;
    drive.at += (drive.to - drive.at) * Math.min(1, delta * EASE);
    /* `yaw` is a scroll-driven BIAS, added rather than assigned: the drag
       still owns `drive`, and the two compose instead of fighting. It is
       read from a ref because it changes every frame — as a prop it would
       re-render the tree sixty times a second to move a number React does
       not draw. */
    group.current.rotation.set(
      PITCH,
      REST_YAW + drive.at + (yaw?.current ?? 0),
      0,
    );
    /* Enlargement happens HERE, in the scene, and never as a CSS scale on
       the container.
    
       react-three-fiber sizes the drawing buffer from the container's
       measured rect, and a measured rect includes ancestor transforms — so
       scaling the element that holds the canvas feeds the canvas's own
       size back into the measurement and the element grows without bound.
       It reached fifteen million pixels across before this was moved into
       the scene. Scaling the object leaves the layout alone entirely. */
    group.current.scale.setScalar(scale * (zoom?.current ?? 1));
  });

  return (
    <group ref={group} scale={scale} rotation={[PITCH, REST_YAW, 0]}>
      <primitive object={scene} position={offset} />
    </group>
  );
}

/** The still, for a glb.
 *
 *  `/models/houses/arca-i-k-black.glb` → `/images/posters/arca-i-k-black.webp`
 *
 *  The posters are rendered from these same files through the same rig, by
 *  `/poster` in development — see scripts/POSTERS.md. They are the story
 *  page's placeholder while the geometry arrives and its failsafe if the
 *  geometry never does, which is the only reason a still of a turntable is
 *  worth keeping in the repository at all. */
export function posterFor(src: string) {
  /* `-baked` is stripped: a baked model is the same object as its unbaked
     twin, photographed from the same angle, so it shares the poster rather
     than needing a second capture of an identical frame. Without this the
     suffix travels into the filename and the still 404s. */
  const name = src
    .split("/")
    .pop()!
    .replace(/\.glb$/i, "")
    .replace(/-baked$/, "");
  return `/images/posters/${name}.webp`;
}

/** The poster's edge, in device pixels. Square — see poster-rig. */
const CAPTURE_SIZE = 1140;

/**
 * Take the canvas as a PNG, once, after the frame has actually been drawn.
 *
 * ---- Why it sets its own size ----
 *
 * The buffer is told what to be rather than measured from the page. A
 * capture has to produce the same square whatever window it was run in, and
 * — the part that actually forced this — r3f sizes itself from a
 * ResizeObserver, which in a tab that is not being composited reports
 * nothing at all and leaves the canvas at its 300x150 default. A poster
 * rendered from that is a thumbnail of a thumbnail. `setSize` from the r3f
 * store rather than `gl.setSize`: the store's version also updates the
 * camera and the `viewport` that the model's own fit is computed from, so
 * the object is framed for the buffer it is actually being drawn into.
 *
 * ---- Why it waits ----
 *
 * Six frames, not one. `onReady` fires when the geometry has loaded, but
 * the environment map is convolved on the render AFTER that, and the resize
 * above needs a render of its own before the fit has caught up. Capturing
 * early gives a black object under no light, framed for the wrong box.
 *
 * The explicit `gl.render` before reading is belt and braces for
 * `preserveDrawingBuffer`: it guarantees the buffer being serialised was
 * drawn in this same task, rather than trusting what the compositor left
 * behind.
 */
function Capture({ onCapture }: { onCapture: (png: string) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const setSize = useThree((s) => s.setSize);
  const setDpr = useThree((s) => s.setDpr);

  const frames = useRef(0);
  const done = useRef(false);

  useFrame(() => {
    if (done.current) return;
    const n = frames.current++;

    if (n === 0) {
      setDpr(1);
      setSize(CAPTURE_SIZE, CAPTURE_SIZE);
      return;
    }
    if (n < 6) return;

    done.current = true;
    gl.render(scene, camera);
    onCapture(gl.domElement.toDataURL("image/png"));
  });

  return null;
}

export function ProductModel({
  src,
  yaw,
  zoom,
  air,
  onReady,
  onCapture,
}: {
  src: string;
  /** Extra yaw, in radians, driven from outside per frame. The buy page's
   *  opening turns the frame as it travels from the middle of the screen
   *  into its slot; every other caller leaves this alone. */
  yaw?: React.RefObject<number>;
  /** Multiplies the frame's size in the SCENE, per frame. The buy page's
   *  opening holds it large in the middle of the screen and lets it settle
   *  to 1 as it lands. Never do this with a CSS transform — see useFrame. */
  zoom?: React.RefObject<number>;
  /** The share of the stage the frame may occupy, where the caller wants
   *  something other than the house margin — see `MODEL_AIR_STORY`. */
  air?: number;
  /** Called once the glb is loaded and the frame is about to be drawn.
   *  Callers that fade the viewer in wait on this rather than on a timer. */
  onReady?: () => void;
  /** Development only: hand back the drawn frame as a PNG data URL. This
   *  is how the posters in `/images/posters` are made, and passing it
   *  switches the context to `preserveDrawingBuffer`, which no reader
   *  should ever pay for. See `/poster`. */
  onCapture?: (png: string) => void;
}) {
  const dragging = useRef<{ id: number; x: number } | null>(null);

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
    const d = dragging.current;
    if (!d || d.id !== e.pointerId) return;
    /* Only the horizontal component is read. Vertical movement during a
       drag is not a gesture this object has — which is the whole point,
       and on a phone it is what leaves the page free to scroll under a
       finger that started somewhere other than the frame. */
    turn((e.clientX - d.x) * DRAG);
    d.x = e.clientX;
  }, []);

  const onUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current?.id === e.pointerId) dragging.current = null;
  }, []);

  /* Render only while someone can see it. r3f's default is `always`, which
     on this page meant a full-screen antialiased scene with an environment
     map drawing sixty times a second for the whole visit — including the
     ten screens after the reader has scrolled past it. See useOnScreen. */
  const box = useRef<HTMLDivElement>(null);
  const live = useRenderGate(box);

  return (
    <div ref={box} className="model-stage-box relative h-full w-full">
      <div className="pointer-events-none h-full w-full">
        <Canvas
          /* `never` rather than `demand`: this scene animates itself (the
             rotation eases every frame), so there is no discrete moment to
             invalidate on — the question is simply whether anyone is
             looking. */
          /* A capture renders regardless of what an observer thinks:
             the gate below asks whether anyone is LOOKING, and nobody is
             looking at the poster kitchen's stage — in a tab that is not
             being composited the observer never fires at all, and the
             scene would sit at "never" forever. */
          frameloop={live || onCapture ? "always" : "never"}
          /* Capped at 1.5 rather than 2. At dpr 2 a full-screen
             antialiased scene draws four times the pixels of a CSS-pixel
             buffer, every frame, while the reader is scrolling past it.
             1.5 is 2.25x, which is a third less work for a difference that
             is very hard to see on a polished black object. This is the
             one deliberate sacrifice in this pass. */
          dpr={[1, 1.5]}
          /* Dead-on, y=0, and it never moves again: the model is recentred
             on the origin and the fit leaves an even margin all round, so
             any camera offset just spends that margin on one side. */
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{
            antialias: true,
            alpha: true,
            /* Only for a capture: keeping the buffer costs memory on every
               frame of every visit, and toDataURL is the one thing that
               cannot read a discarded one. */
            preserveDrawingBuffer: Boolean(onCapture),
          }}
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
            <Model src={src} yaw={yaw} zoom={zoom} air={air} onReady={onReady} />
            {onCapture ? <Capture onCapture={onCapture} /> : null}
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
            {/* 256 rather than 512. This map is convolved once when the scene
                is built, and that build is the single most expensive moment
                the turntable has. The rig here is six broad, dim, nearly
                even sources — an overcast sky, with no small bright detail
                anywhere in it — so halving the resolution costs a scene
                like this almost nothing to look at. The second deliberate
                sacrifice in this pass. */}
            <Environment resolution={256}>
              {/* the sky itself — wide, high, and the brightest thing here */}
              <Lightformer
                intensity={1.9}
                position={[0, 6, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[20, 8, 1]}
                color="#ffffff"
              />
              {/* the horizon, all the way round */}
              <Lightformer
                intensity={0.9}
                position={[-8, 1, 0]}
                scale={[6, 10, 1]}
                color="#ffffff"
              />
              <Lightformer
                intensity={0.9}
                position={[8, 1, 0]}
                scale={[6, 10, 1]}
                color="#fbf7ef"
              />
              <Lightformer
                intensity={0.8}
                position={[0, 0, 7]}
                scale={[12, 8, 1]}
                color="#ffffff"
              />
              <Lightformer
                intensity={0.7}
                position={[0, 0, -7]}
                scale={[12, 8, 1]}
                color="#ffffff"
              />
              {/* the ground bounce, which is what an overcast day has under
                  it: dimmer than the sky, and a little warm */}
              <Lightformer
                intensity={0.45}
                position={[0, -5, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[16, 8, 1]}
                color="#efe7d8"
              />
            </Environment>
          </Suspense>
        </Canvas>
      </div>

      {/* ---- The handle, which is the OBJECT and not the canvas ----

          The gesture used to live on a box the full size of the canvas,
          carrying `touch-none`. On a desktop that only meant the cursor
          logic had to work out whether the pointer was over the frame; on a
          phone it meant a whole screen of empty black that refused to
          scroll. `touch-action: none` is read when a gesture BEGINS, so it
          cannot be decided per-touch from inside a move handler — the area
          has to be the right size before a finger lands on it.

          So it is its own element, sized to the object rather than to the
          stage, and everything else is `pointer-events: none`. The page
          scrolls off the black exactly as it does off any other section,
          and the frame turns where the frame is.

          The size is the same rule the cursor already used: the model is
          fitted to 86% of the SMALLER viewport dimension, so its extent is
          a fraction of `min(width, height)` — wider than tall, like the
          object. Container query units are that `min()`, in CSS, which is
          why this is a stylesheet rule and not a measured box: no observer,
          no re-render, and it is correct on the first frame. */}
      <div
        className="model-grab"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      {/* No label. The stage carried a centred "Rotate" under the object and
          it is gone: the cursor already says it, over the object, at the
          moment it applies — and a word printed on the page says it
          permanently, to everyone, including the people who were never
          going to reach for it. */}
    </div>
  );
}

/* No module-level `useGLTF.preload` any more: which frame this viewer shows
   is now a prop, and a module cannot know it. drei caches per URL on first
   use, which is what the second visit reads from. */
