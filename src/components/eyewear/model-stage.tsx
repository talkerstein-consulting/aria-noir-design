"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CtaLink } from "@/components/cta-link";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * The turntable index.
 *
 * One frame hangs in the middle of the screen and rotates as you scroll.
 * Each cycle is a REST — the frame holds still, facing you, and follows the
 * cursor — followed by ONE FULL TURN. At the back of that turn, the moment
 * the frame is edge-on and there is nothing to look at, three things happen
 * at once: the mesh is swapped for the next house, the name crossfades, and
 * the next house's photograph wipes in from the right. Then it rests again.
 *
 * The swap is hidden inside the rotation, which is the whole trick. A
 * crossfade between two frames is two ghosts; a cut is a jump. A turn has a
 * moment where the object is genuinely not readable, and that is where the
 * change belongs — the same beat a rotating display case gives you for free.
 *
 * ---- Two things differ from the reference implementation ----
 *
 * 1. The ground is the house's PHOTOGRAPH, not a flat colour, tinted far
 *    down so it reads as a lit room rather than a picture. A solid colour
 *    per model is the correct answer when the models are the entire
 *    product; here the photography is half of it, and throwing it away to
 *    show a hex value would be the page discarding its best asset. The
 *    incoming plate slides in from the right on the same value that drives
 *    the turn, so the ground and the frame change on one gesture.
 *
 * 2. It is a SECTION, not a document. The reference owns `window.scrollY`
 *    and `position: fixed`; this has a nav above it and a footer below it,
 *    so it is a tall block with a sticky stage and reads its own progress.
 *
 * ---- What is missing ----
 *
 * Six houses, two models. `3d models/` holds a .blend per colourway for all
 * six, and .blend is not a web format — only ARCA and AHAVA have been
 * through glTF. A frame with no export still takes its full turn: it rests,
 * the ground wipes, the name changes, and the stage is simply empty of mesh
 * for that beat. The photograph is doing the work it was already doing, and
 * the day an export lands the frame appears in it with no other change.
 * That is the same bargain the index grid strikes with its swatches, and it
 * beats borrowing another house's model for the length of a turn.
 */

export type StageItem = {
  name: string;
  meta: string;
  /** The ground. Blurred and sunk almost to black — see PLATE_FILTER. */
  image?: string;
  swatch?: string;
  /** Web-ready glTF. Absent for the houses still only in .blend. */
  model?: string;
  href?: string;
  cta?: string;
};

/* ── Timeline, in "units" of scroll ──────────────────────────────────
   One intro unit (the first frame grows out of nothing) plus one unit
   per item. The last unit turns back to the first, so the sequence
   closes rather than stopping. */
const T_INTRO = 1;
/** Scroll length of one unit, as a multiple of the viewport. Declared in
 *  `.model-stage` (globals) rather than here, so it can drop on a phone —
 *  115vh a turn is six and a half screens of thumb on a 812px viewport. */
/** How much of a cycle the frame spends at rest, facing front, before the
 *  turn starts. Below about a third the stage never stops moving and the
 *  object never gets read. */
const REST = 0.34;

/** How far down the plate is pushed. This is a ground, not a picture: it
 *  has to survive white type, a lit mesh in front of it, and the next plate
 *  sliding over it. */
const TINT = 0.5;
/**
 * Blurred, desaturated and pulled down a stop before the tint lands.
 *
 * The blur is the important one and it is not a softening effect — it is
 * what makes a photograph usable as a GROUND. Every plate in this pool has
 * a frame in the middle of it, because they are product photographs; put
 * one behind a turning 3D frame and there are two pairs of glasses in the
 * centre of the screen, one of them out of focus and slightly the wrong
 * shape. Blurred past legibility, the plate stops being a picture of a
 * frame and becomes the light and colour of the room that frame was shot
 * in, which is exactly what the stage wants behind it.
 *
 * Desaturating on top of that is what makes six grounds read as six views
 * of one room rather than six different photographs — the pool is lit
 * wildly differently plate to plate, and a flat black overlay preserves
 * that gap exactly instead of closing it.
 */
const PLATE_FILTER = "blur(6px) saturate(0.8) brightness(0.95)";
/**
 * The plate is fetched at THUMBNAIL width and stretched over the viewport.
 *
 * A 28px CSS blur across a full-bleed 1600px photograph is the browser
 * convolving about two million pixels, twice — once per layer — and it is
 * pure waste here, because the output is a smear either way. Asking
 * next/image for a 96px-wide variant and letting bilinear upscaling do
 * nine tenths of the blurring gets the same picture from a texture a few
 * kilobytes wide. The small residual `blur()` above is only there to erase
 * the upscale's own soft grid; it is doing a fraction of the work.
 *
 * The bandwidth is the other half of it: six grounds at ~200KB become six
 * at ~3KB, which matters more than the filter did — this is the hero, and
 * it is what a reader waits on.
 */
const PLATE_SIZES = "320px";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Centre the model on its own MASS, and scale it to unit radius.
 *
 * ---- Why the bounding box is the wrong centre for a frame ----
 *
 * A pair of glasses is a small dense front with two long thin temples
 * trailing behind it. Its bounding box therefore extends a long way back,
 * and the box's centre lands somewhere in the empty air between the arms —
 * behind the frame, not in it. Spinning about that point swings the front
 * through a wide arc: the lenses sweep across the screen and back while the
 * temple tips barely move, which reads as the object being carried past the
 * camera rather than turning on a stand.
 *
 * So the pivot is the centroid of the actual VERTICES. Geometry is where
 * the object is, and for this shape most of it is in the front — which puts
 * the axis through the bridge, roughly where a hand would hold it. The
 * frame now turns in place.
 *
 * The scale still comes off the bounding SPHERE, because that is the radius
 * the object sweeps and the thing the camera has to frame; only the pivot
 * moved.
 */
function centroid(obj: THREE.Object3D) {
  const sum = new THREE.Vector3();
  let count = 0;
  const v = new THREE.Vector3();

  obj.updateWorldMatrix(true, true);
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const pos = mesh.geometry?.getAttribute("position");
    if (!pos) return;
    /* Sampled, not exhaustive. These meshes run to six figures of vertices
       and the centroid of every 24th is the same point to several decimals
       — this runs once per model, but it runs on the main thread while the
       first frame is trying to paint. */
    const step = Math.max(1, Math.floor(pos.count / 4096));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      sum.add(v);
      count += 1;
    }
  });

  return count ? sum.divideScalar(count) : new THREE.Vector3();
}

function normalize(obj: THREE.Object3D) {
  obj.position.sub(centroid(obj));

  /* Radius measured from the NEW ORIGIN, corner by corner.
     `Box3.getBoundingSphere` centres its sphere on the BOX, which was the
     right answer while the pivot was the box centre and is the wrong one
     now: with the pivot moved forward into the frame, the temple tips are
     further from the axis than half a diagonal, and a sphere sized off the
     box would let them swing outside the frustum halfway through a turn. */
  const box = new THREE.Box3().setFromObject(obj);
  const radius =
    Math.max(
      Math.hypot(box.min.x, box.min.y, box.min.z),
      Math.hypot(box.min.x, box.min.y, box.max.z),
      Math.hypot(box.min.x, box.max.y, box.min.z),
      Math.hypot(box.min.x, box.max.y, box.max.z),
      Math.hypot(box.max.x, box.min.y, box.min.z),
      Math.hypot(box.max.x, box.min.y, box.max.z),
      Math.hypot(box.max.x, box.max.y, box.min.z),
      Math.hypot(box.max.x, box.max.y, box.max.z),
    ) || 1;

  const wrap = new THREE.Group();
  wrap.add(obj);
  wrap.scale.setScalar(1 / radius);
  wrap.rotation.x = -0.08; // stand the front toward camera, tipped slightly down
  return wrap;
}

export function ModelStage({
  items,
  id,
  intro,
  loadingLabel = "Cutting the frames",
}: {
  items: readonly StageItem[];
  id?: string;
  /** What the loading screen says while the geometry arrives. */
  loadingLabel?: string;
  /**
   * The page's title, for when this IS the hero.
   *
   * It does not fade — it turntables away on the same axis the frame turns
   * on, while the frame grows out of nothing in front of it. That is the
   * whole reason the stage can be the hero rather than sit under one: a
   * title plate and a 3D scroller stacked vertically are two openings, and
   * the reader has to scroll past the first to reach the second. Here the
   * title IS the first beat of the rotation.
   */
  intro?: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const baseLayer = useRef<HTMLDivElement>(null);
  const inLayer = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const introRot = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  const n = items.length;
  /* The height is declared in CSS (see `.model-stage`) so the unit can
     shrink on a phone without this component knowing the viewport at
     render time — a `window` read here would not survive SSR. Progress is
     normalised against the section's own extent, so the loop does not care
     what the number is; it is purely how much thumb a turn costs. */
  const units = T_INTRO + n;

  /* How much of the geometry has arrived, 0 to 1, and whether the stage can
     open. State rather than a ref: these two draw a bar and dismiss a
     screen, so they are allowed to re-render. Both settle within a handful
     of updates and then never change again. */
  const [progress01, setProgress01] = useState(0);
  const [firstArrived, setFirstArrived] = useState(false);

  /* Derived, not stored. A stage with no exports at all has nothing to
     wait for and must not open behind a bar that will never move — and
     computing that during render rather than setting it from inside the
     effect keeps the "ready" state out of the effect's hands entirely. */
  const hasModels = items.some((item) => !!item.model);
  const ready = !hasModels || firstArrived;

  /* Scroll and pointer live in refs, not state: the loop below writes
     straight to the DOM and to three, and a render per frame would undo the
     entire point of doing it this way. */
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const onProgress = useCallback((p: number) => {
    progress.current = p;
  }, []);
  useScrollProgress(wrap, onProgress);

  /* The model list is stable for the life of the section; deriving it once
     keeps the WebGL effect from tearing down whenever the parent renders. */
  const modelUrls = useMemo(
    () => items.map((item) => item.model ?? null),
    [items],
  );

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    /* Reduced motion gets no turntable at all. The whole object is a thing
       spinning; there is no toned-down version of it that is still it, so
       the plates and the names carry the section on their own. */
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas: el,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    /* ---- exposure ----
       The reference implementation ran ACES at 1.55 with four directional
       lights on top of a full environment map, which is roughly two stops
       of headroom spent twice. On a watch that reads as "punchy"; on
       acetate it reads as blown — Noir goes mid-grey, Caramel Stripe loses
       its stripe, and every house converges on the same washed highlight.
       The frames are 97% shadow and 3% gold by direction, and you cannot
       overexpose your way to that.

       So: neutral exposure, and the environment does the lighting. */
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );

    /**
     * Distance is COMPUTED, never fixed.
     *
     * The reference parked the camera at z=3.4, which frames a unit sphere
     * nicely at 16:9 and not at all at 375×812. A perspective camera's
     * `fov` is its VERTICAL angle; the horizontal one falls out of the
     * aspect ratio, so on a portrait phone the horizontal field is roughly
     * half what it is on a laptop and a frame that fitted with room to
     * spare hangs off both edges. That is what "too big on mobile" is —
     * not a scale problem, a framing one, and scaling the mesh down would
     * fix the symptom while leaving the stage un-composable at any other
     * aspect.
     *
     * So: solve for the distance at which the model's bounding sphere fits
     * BOTH axes, take the larger, and add margin. Portrait gets pushed
     * back automatically, landscape is unchanged, and a tablet halfway
     * between the two gets the halfway answer for free.
     */
    /* Air around the frame at its widest. The fit is solved against the
       bounding SPHERE, which is deliberately conservative — it is the
       radius the object sweeps as it turns, so the frame never clips
       mid-rotation even when it is edge-on and longest. That already
       builds slack in at rest, where you are looking at the front, so the
       margin on top of it stays small. */
    const MARGIN = 1.12;
    const fitCamera = () => {
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      /* radius 1 — `normalize()` guarantees it. */
      const dist = Math.max(1 / Math.sin(vFov / 2), 1 / Math.sin(hFov / 2));
      camera.position.z = dist * MARGIN;
      /* Portrait puts the name plate under the frame rather than beside
         it, so the frame lifts out of its way. Nothing to dodge in
         landscape, where the type sits well below the object. */
      camera.position.y = camera.aspect < 0.85 ? 0.18 : 0;
      camera.lookAt(0, camera.position.y, 0);
    };

    /* An environment map, not just lights. Acetate is glossy and the gold is
       metal — both are reflections of a room before they are anything else,
       and lit with directionals alone they read as grey plastic. */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.09);
    scene.environment = env.texture;

    /* ---- the lights ----
       The environment is the light source; these only carve shape out of
       it. Every intensity here is roughly a third of what the reference
       used, and the ambient is nearly gone — ambient is the one term that
       cannot make a shadow, so raising it is exactly how a dark frame
       turns grey. What is left is a key for the acetate's gloss, a cool
       rim to find the edge against a dark ground, and a whisper of warm
       fill so the underside is not solid black.

       Neutral WHITE on the key, too. The reference tinted its fill warm
       and its rim blue, which is a look rather than a light — and a look
       painted onto a product whose whole selling point is the colour of
       the material. Tinted lights are how Rose photographs as Caramel. */
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(2.5, 3, 4);
    const rim = new THREE.DirectionalLight(0xd6e2ff, 0.7);
    rim.position.set(-3, 1.5, -2);
    const fill = new THREE.DirectionalLight(0xfff2e0, 0.35);
    fill.position.set(0, -2, 3);
    const top = new THREE.DirectionalLight(0xffffff, 0.45);
    top.position.set(0, 4, 1);
    scene.add(key, rim, fill, top, new THREE.AmbientLight(0xffffff, 0.12));

    /* The room does the rest. Reflections are what acetate and gold ARE —
       both are a room before they are a colour — so this carries the load
       the directionals were carrying badly. */
    scene.environmentIntensity = 1.1;

    const stage = new THREE.Group();
    scene.add(stage);

    /* ---- loading ----
       One fetch per DISTINCT url: several cuts of one house share an export,
       and loading it four times would be four copies of the same geometry on
       the GPU. Indices then point at the shared object. */
    const loader = new GLTFLoader();
    /* The exports are Draco-compressed — 3.5MB of raw geometry becomes about
       800KB, which is the difference between a hero that loads and one that
       is still downloading when you have finished scrolling past it. The
       decoder is a wasm blob that has to be served: it lives in /public/draco,
       copied from three's own examples, and a plain GLTFLoader without this
       fails on the first byte of every one of these files. */
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader.setDRACOLoader(draco);
    const byUrl = new Map<string, THREE.Object3D>();
    const loaded: (THREE.Object3D | null)[] = modelUrls.map(() => null);
    let disposed = false;

    const unique = [...new Set(modelUrls.filter((u): u is string => !!u))];

    /* ---- progress ----
       Measured in BYTES across every export, not in files finished. Two
       models at 1.2MB each would otherwise sit at 0% and then jump to 50%,
       which is a bar that lies twice. `total` is unknown until the servers
       answer with a length, so it grows as the responses do; the ratio is
       still monotonic because loaded bytes never exceed the totals already
       counted. */
    const bytes = new Map<string, { got: number; total: number }>();
    unique.forEach((u) => bytes.set(u, { got: 0, total: 0 }));

    const report = () => {
      if (disposed) return;
      let got = 0;
      let total = 0;
      bytes.forEach((b) => {
        got += b.got;
        total += b.total || b.got;
      });
      setProgress01(total > 0 ? Math.min(1, got / total) : 0);
    };

    let settled = 0;
    const settle = () => {
      settled += 1;
      /* The stage opens as soon as the FIRST frame can be shown. Holding
         it until all of them have arrived would keep the reader on a
         loading screen for meshes belonging to houses four turns away. */
      if (!disposed && settled >= 1) setFirstArrived(true);
    };

    unique.forEach((url) => {
      loader.load(
        url,
        (gltf) => {
          if (disposed) return;
          const obj = normalize(gltf.scene);
          byUrl.set(url, obj);
          modelUrls.forEach((u, i) => {
            if (u === url) loaded[i] = obj;
          });
          const b = bytes.get(url);
          if (b) b.got = b.total || b.got;
          report();
          settle();
        },
        (e) => {
          const b = bytes.get(url);
          if (!b) return;
          b.got = e.loaded;
          if (e.total) b.total = e.total;
          report();
        },
        () => {
          /* A missing export is a state the stage runs in, not an error
             worth shouting about. It still counts as settled, or one bad
             URL would hold the loading screen open forever. */
          bytes.delete(url);
          report();
          settle();
        },
      );
    });


    /* What is currently parented to the stage. Tracked as the OBJECT, not
       just the index — the loop calls show(0) on its first frame, long
       before the fetch resolves, and an index-only guard would record "0 is
       mounted" while nothing was, then return early forever. The mesh would
       load, sit in `loaded`, and never reach the scene.

       Comparing the object as well means the same index re-mounts for free
       the frame after its export arrives. */
    let mountedIdx = -1;
    let mountedObj: THREE.Object3D | null = null;
    const show = (i: number) => {
      const next = loaded[i] ?? null;
      if (i === mountedIdx && next === mountedObj) return;
      /* Several indices share one export (ARCA's four cuts). Removing the
         outgoing object first is what keeps three from silently re-parenting
         the same node instead of the stage holding exactly one. */
      if (mountedObj && mountedObj.parent === stage) stage.remove(mountedObj);
      mountedIdx = i;
      mountedObj = next;
      if (next) stage.add(next);
    };

    /* Only a real pointer tilts the frame. `pointermove` fires for touch
       too, so on a phone every scroll flick would grab the model and swing
       it — the tilt is a hover affordance, and a finger dragging the page
       is not hovering. */
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    /* Size off the CANVAS, not the window. The stage sits inside a sticky
       box that excludes the scrollbar gutter, so the two differ by ~10px —
       enough to stretch the aspect and put the frame slightly off centre. */
    const onResize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      fitCamera();
      camera.updateProjectionMatrix();
      /* Phones ship dpr 3, which is nine times the fragments of dpr 1 for
         a difference nobody can see on a blurred-ground product render.
         1.5 is the point where the edges stop looking stepped. */
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 768 ? 1.5 : 2));
      renderer.setSize(w, h, false);
    };
    onResize();
    window.addEventListener("resize", onResize);

    /* Smoothed values. The scroll target is chased rather than tracked, so
       the frame keeps turning for a beat after the wheel stops — and so the
       swap can be timed off the VISIBLE rotation rather than off the scroll
       position, which is what makes it land exactly at the back. */
    const S = { rotY: 0, scale: 0.0001, curX: 0, curY: 0 };
    const clock = new THREE.Clock();
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = progress.current * (T_INTRO + n);

      let targetRotY: number;
      let targetScale: number;
      let cursor: number;

      if (t < T_INTRO) {
        /* ---- intro: the first frame grows out of a point, spinning ---- */
        const g = easeOut(t / T_INTRO);
        targetScale = Math.max(0.0001, g);
        targetRotY = lerp(Math.PI * 0.85, 0, g);
        cursor = g * 0.85;
      } else {
        /* ---- cycles: rest, then exactly one turn ---- */
        const local = t - T_INTRO;
        const cycle = Math.floor(local);
        const f = local - cycle;
        const turning = f > REST;
        const tf = turning ? (f - REST) / (1 - REST) : 0;
        targetScale = 1;
        /* Cumulative turns, monotonic across the whole section — one full
           revolution per cycle, never reset, so nothing ever snaps. */
        targetRotY = -Math.PI * 2 * (cycle + (turning ? easeInOut(tf) : 0));
        /* The frame answers the cursor while it rests and ignores it mid
           turn: a pointer nudging the Y axis during the swap would drag the
           back of the rotation into view. */
        cursor = 1 - Math.sin(tf * Math.PI);
      }

      const p = pointer.current;
      p.x = lerp(p.x, p.tx, 1 - Math.pow(0.001, dt));
      p.y = lerp(p.y, p.ty, 1 - Math.pow(0.001, dt));
      S.curY = lerp(S.curY, p.x * 0.4 * cursor, 1 - Math.pow(0.0008, dt));
      S.curX = lerp(S.curX, p.y * 0.28 * cursor, 1 - Math.pow(0.0008, dt));
      S.rotY = lerp(S.rotY, targetRotY, 1 - Math.pow(0.0016, dt));
      S.scale = lerp(S.scale, targetScale, 1 - Math.pow(0.002, dt));

      /* ---- what is showing, derived from the SMOOTHED rotation ----
         Not from `t`. The rotation lags the scroll by design, and reading
         the swap off the scroll would change the mesh while the frame was
         still visibly facing forward. */
      let shownIdx: number;
      let nameIdx: number;
      let nameOpacity: number;
      let fromIdx: number;
      let toIdx: number;
      let wipe: number;

      if (t < T_INTRO) {
        const g = t / T_INTRO;
        shownIdx = 0;
        nameIdx = 0;
        fromIdx = 0;
        toIdx = 0;
        wipe = 0;
        nameOpacity = smooth((g - 0.35) / 0.5);
      } else {
        const turns = Math.max(0, -S.rotY / (Math.PI * 2));
        const k = Math.floor(turns + 1e-6);
        const frac = turns - k;
        fromIdx = k % n;
        toIdx = (k + 1) % n;
        wipe = frac;
        /* Rounding, not flooring: the mesh changes at the HALF turn, which
           is the frame edge-on and the only moment the change is free. */
        shownIdx = Math.round(turns) % n;
        if (frac < 0.5) {
          nameIdx = fromIdx;
          nameOpacity = frac < 0.02 ? 1 : 1 - smooth(frac / 0.5);
        } else {
          nameIdx = toIdx;
          nameOpacity = smooth((frac - 0.5) / 0.5);
        }
      }

      show(shownIdx);

      if (!still) {
        stage.rotation.y = S.rotY + S.curY;
        stage.rotation.x = S.curX;
        stage.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.02;
      }
      stage.scale.setScalar(Math.max(0.0001, S.scale));

      /* ---- the ground: two plates, the incoming one pushing in ---- */
      if (baseLayer.current && inLayer.current) {
        baseLayer.current.dataset.plate = String(fromIdx);
        inLayer.current.dataset.plate = String(toIdx);
        inLayer.current.style.transform = `translateX(${(1 - wipe) * 100}%)`;
      }
      /* Every plate is mounted in BOTH layers; only the two in play are
         painted. The layer decides WHICH of the two: the resident layer
         shows the house you are leaving, the sliding one shows the house
         arriving.

         This used to compare the flat ref index against `fromIdx`/`toIdx`
         directly, which is wrong the moment there are two layers — the
         second layer's refs start at `n`, so nothing in it ever matched
         and it slid across every turn as an EMPTY div carrying a large
         black box-shadow. That was the black panel: not a seam between two
         grounds, a layer with no ground in it at all. */
      cards.current.forEach((card, i) => {
        if (!card) return;
        const want = i >= n ? toIdx : fromIdx;
        const on = i % n === want;
        /* `visibility`, not `opacity`. A transparent element is still
           rasterized and composited; a hidden one is skipped at paint. Ten
           of these twelve are never on screen. */
        card.style.visibility = on ? "visible" : "hidden";
        card.style.contentVisibility = on ? "visible" : "hidden";
      });

      /* ---- the intro title: turns away on the frame's own axis ---- */
      if (introRot.current) {
        const g = clamp01(t / T_INTRO);
        const gone = smooth(g / 0.55);
        introRot.current.style.opacity = String(1 - gone);
        introRot.current.style.transform = `translate(${p.x * 14}px, ${p.y * 8}px) rotateY(${-92 * easeInOut(g)}deg)`;
      }

      /* ---- the name ---- */
      if (plate.current) {
        plate.current.style.opacity = String(nameOpacity);
        plate.current.style.transform = `translateY(${(1 - nameOpacity) * 18}px)`;
        if (plate.current.dataset.idx !== String(nameIdx)) {
          plate.current.dataset.idx = String(nameIdx);
        }
      }
      steps.current.forEach((row, i) => {
        row?.classList.toggle("is-on", i === nameIdx);
      });

      renderer.render(scene, camera);
    };

    frame();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (finePointer) window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      /* Geometry, materials and textures are not garbage collected — they
         live on the GPU until told otherwise, and a route change without
         this leaks the whole scene. */
      byUrl.forEach((obj) => {
        obj.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((m) => m?.dispose());
        });
      });
      draco.dispose();
      env.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [modelUrls, n]);

  /* The name plate is written by the loop through `data-idx`, but the WORDS
     have to exist in the DOM for crawlers and for anyone with JS off — so
     every name is rendered and CSS shows the active one. */
  return (
    <section
      ref={wrap}
      id={id}
      className="model-stage on-ink relative z-[35] bg-ink"
      style={{ "--stage-units": units } as React.CSSProperties}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ---- ground: the resident plate, and the one pushing it out ----
            The blur and the tint live HERE, one of each per layer, rather
            than on every plate inside them. A `filter` creates a stacking
            context and its own rasterization target, so declaring it per
            plate meant twelve of them for two visible results. Two now. */}
        <div ref={baseLayer} className="absolute inset-0">
          <div className="absolute inset-0" style={{ filter: PLATE_FILTER }}>
            <Plates items={items} cards={cards} offset={0} />
          </div>
          <Tint />
        </div>
        <div
          ref={inLayer}
          className="absolute inset-0 will-change-transform"
          style={{
            transform: "translateX(100%)",
            /* The leading edge is FEATHERED, not shadowed. The reference
               threw a hard-edged drop shadow ahead of the incoming panel,
               which is the right call when the grounds are saturated flat
               colours and you want the wipe to read as a physical card
               sliding over another. These grounds are two near-black
               blurred photographs, so a hard edge with a dark bloom in
               front of it reads as a rectangle of slightly different black
               crossing the screen — an object, not a transition.

               Masking the first fifth of the layer to transparent lets the
               new room bleed in instead. The wipe is still a wipe; it just
               no longer has a border. */
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 20%)",
            maskImage: "linear-gradient(90deg, transparent 0%, #000 20%)",
          }}
        >
          <div className="absolute inset-0" style={{ filter: PLATE_FILTER }}>
            <Plates items={items} cards={cards} offset={items.length} />
          </div>
          <Tint />
        </div>

        {/* A vignette over both, so the centre of the screen is the lightest
            thing on it and the frame has somewhere to sit. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 42%, rgba(255,255,255,.05), rgba(0,0,0,0) 55%), radial-gradient(140% 120% at 50% 120%, rgba(0,0,0,.6), rgba(0,0,0,0) 60%)",
          }}
        />

        <canvas ref={canvas} className="absolute inset-0 block h-full w-full" />

        {/* ---- the title, for as long as there is no frame yet ---- */}
        {intro ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-8"
            style={{ perspective: "1200px" }}
          >
            <div
              ref={introRot}
              className="text-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {intro}
            </div>
          </div>
        ) : null}

        {/* ---- the preloader ----
            Two and a half megabytes of geometry stand between arriving and
            seeing anything. On this machine that is a fifth of a second; on
            a phone on a train it is ten, and for all ten the stage showed a
            lit room with nothing standing in it. A hero that is silently
            missing its subject reads as broken, not as loading.

            So the stage says so, in the vocabulary it already owns: an
            eyebrow, a hairline, and a number. It is the home page's loading
            bar, which is the only other place on this site that has ever
            had to make someone wait.

            It leaves on the first model, not the last — see `settle`. And
            it is `inert` while it is up, so a reader tabbing in does not
            land on controls behind a screen they cannot see past. */}
        <div
          className="stage-loader"
          data-done={ready}
          inert={ready}
          aria-hidden={ready}
        >
          <p className="t-eyebrow">{loadingLabel}</p>
          <div className="stage-loader-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress01 * 100)}>
            <i style={{ transform: `scaleX(${progress01})` }} />
          </div>
          <p className="t-micro tabular-nums">
            {Math.round(progress01 * 100)}
          </p>
        </div>

        {/* ---- the name ---- */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end px-6 pb-[clamp(3.5rem,12vh,9.5rem)] sm:px-10">
          <div
            ref={plate}
            data-idx="0"
            className="stage-name flex flex-col items-center gap-3 text-center"
            style={{ opacity: 0 }}
          >
            {items.map((item, i) => (
              <div key={item.name} data-i={i} className="stage-name-item">
                {/* The colourway list is long and the tracking is wide, so
                    on a narrow screen it wraps rather than being clipped —
                    and drops a step of tracking so it wraps less often. */}
                <p className="font-ui text-[10px] tracking-[0.22em] text-gold uppercase sm:text-[11px] sm:tracking-[0.35em]">
                  {item.meta}
                </p>
                <h3 className="mt-3 font-display text-[clamp(2rem,11vw,6rem)] leading-[1.05] tracking-tight text-paper text-balance">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="pointer-events-auto transition-opacity hover:opacity-80"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </h3>
                {item.href && item.cta ? (
                  <div className="pointer-events-auto mt-6 flex justify-center">
                    <CtaLink href={item.href}>{item.cta}</CtaLink>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* ---- stepper: where you are in the set ---- */}
        {/* Where you are in the set.
            A column down the right margin on a wide screen, where there is
            dead space beside the frame and a vertical run reads as a
            scrollbar's worth of progress. On a phone that column lands on
            top of the centred type, so it lies down instead and sits along
            the bottom edge under the name — the one strip of the screen
            the frame and the type have both already vacated. */}
        <ul className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-row gap-3 sm:top-1/2 sm:bottom-auto sm:left-auto sm:right-[clamp(1.4rem,2.8vw,2.75rem)] sm:translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:gap-3.5">
          {items.map((item, i) => (
            <li
              key={item.name}
              ref={(node) => {
                steps.current[i] = node;
              }}
              className="stage-step"
            >
              <span className="sr-only">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The ground's darkness, once per layer. Outside the blur, because
 *  blurring a flat black rectangle is work with no output. */
function Tint() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `rgba(0,0,0,${TINT})` }}
    />
  );
}

/**
 * One layer's worth of grounds: every plate mounted, one painted.
 *
 * ---- Why `visibility` and not just `opacity` ----
 *
 * These were `opacity: 0` with a CSS transition, which reads as "hidden"
 * and is not: a fully transparent element is still laid out, still
 * rasterized and still handed to the compositor. Ten invisible full-bleed
 * plates were being composited every frame to show two. `visibility:
 * hidden` is skipped at paint, and `content-visibility: hidden` lets the
 * browser throw away the rendered result entirely — while the element
 * stays mounted, so swapping to it is not a fresh decode mid-turn.
 *
 * The tint and the blur are NOT here. They belong to the layer, once, not
 * to each of six plates — see the ground layers in the stage. That is the
 * difference between two filtered elements on the page and twelve.
 */
function Plates({
  items,
  cards,
  offset,
}: {
  items: readonly StageItem[];
  cards: React.RefObject<(HTMLDivElement | null)[]>;
  offset: number;
}) {
  return (
    <>
      {items.map((item, i) => (
        <div
          key={item.name}
          ref={(node) => {
            cards.current[offset + i] = node;
          }}
          className="absolute inset-0"
          style={{ visibility: "hidden", contentVisibility: "hidden" }}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              /* Thumbnail-width source, stretched. See PLATE_SIZES. */
              sizes={PLATE_SIZES}
              /* scale-110 because the layer's blur samples past the edge
                 and would otherwise feather the plate's own border into
                 transparency — visible as a pale seam. Overscanning hides
                 it. */
              className="scale-110 object-cover"
              priority={i === 0}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${item.swatch ?? "#2a2a2a"} 0%, var(--ink) 85%)`,
              }}
            />
          )}
        </div>
      ))}
    </>
  );
}
