import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import WEBARROCKSFACE from "@/vendor/webar-rocks-face/WebARRocksFace.module.js";
import faceHelper from "@/vendor/webar-rocks-face/helpers/WebARRocksFaceThreeHelper.js";
import type { TryOnFit } from "@/lib/try-on";
import { disposeFrame, fitFrame, poseHolder } from "./fit";

/**
 * The live mirror. Browser only: the vendored helper reads `window` at
 * import, so this module is loaded with `import()` from an effect, never
 * statically.
 *
 * ---- Two canvases ----
 *
 * WebAR.rocks owns the first. It opens the camera, uploads each video
 * frame to a WebGL texture, runs the face network on it, and draws the
 * same texture back out as the picture you see. Three.js owns the second,
 * transparent, laid exactly over it, and draws only the frame and an
 * invisible head (the occluder) that hides the far arm when you turn.
 * Both are mirrored with CSS, so the reader sees a mirror rather than a
 * camera.
 *
 * ---- One object follows the face ----
 *
 *   faceParent      matrix written by the tracker every frame (head pose)
 *     faceFollower  offset written by the tracker (landmark centroid)
 *       holder      fixed: where a bridge sits on the mean face (fit.ts)
 *         frame     the house glb, baked into frame units (fit.ts)
 *       occluder    depth-only head, so the frame goes behind it
 */

export type TryOnStatus = "searching" | "tracking";

/** WebAR.rocks error codes, plus our own load failure. */
export type TryOnError =
  | "WEBCAM_UNAVAILABLE"
  | "GL_INCOMPATIBLE"
  | "MODEL_FAILED"
  | (string & {});

type Options = {
  faceCanvas: HTMLCanvasElement;
  threeCanvas: HTMLCanvasElement;
  onStatus: (status: TryOnStatus) => void;
};

/** The landmarks the pose is solved from. Upstream's glasses set: ears,
 *  nose and outer eye corners. The chin is left out because it moves when
 *  you talk and the frame should not. */
const PNP_LABELS = [
  "leftEarBottom",
  "rightEarBottom",
  "noseBottom",
  "noseLeft",
  "noseRight",
  "leftEyeExt",
  "rightEyeExt",
];

export class TryOnEngine {
  private opts: Options;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);
  private faceParent = new THREE.Object3D();
  private faceFollower = new THREE.Object3D();
  private holder = poseHolder();
  private loader: GLTFLoader;
  private draco: DRACOLoader;
  private frames = new Map<string, Promise<THREE.Group>>();
  private current: string | null = null;
  private raf = 0;
  private status: TryOnStatus | null = null;
  private size = { width: 0, height: 0 };
  private destroyed = false;

  constructor(opts: Options) {
    this.opts = opts;
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath("/draco/");
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.draco);

    /* For tuning from the console in development. */
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __tryOn?: TryOnEngine }).__tryOn = this;
    }

    this.faceFollower.add(this.holder);
    this.faceParent.add(this.faceFollower);
    this.scene.add(this.faceParent);
  }

  /** Opens the camera and the network. Rejects with a TryOnError. */
  async start() {
    this.setUpRenderer();
    const { faceCanvas } = this.opts;

    await new Promise<void>((resolve, reject) => {
      faceHelper.init(
        WEBARROCKSFACE,
        {
          NNCPath: "/try-on/NN_GLASSES_9.json",
          canvas: faceCanvas,
          maxFacesDetected: 1,
          scanSettings: { threshold: 0.8 },
          solvePnPImgPointsLabels: PNP_LABELS,
          callbackReady: (err) => (err ? reject(err) : resolve()),
          callbackTrack: (state) => this.track(state.isDetected),
        },
        /* Upstream's glasses settings: heavy smoothing when still, so the
           frame does not shimmer, released quickly when you move. */
        {
          beta: 10,
          minCutOff: 0.001,
          freqRange: [2, 144],
          forceFilterNNInputPxRange: [2.5, 6],
        },
      );
    });
    if (this.destroyed) return;

    const occluder = await this.loader.loadAsync("/try-on/occluder.glb");
    this.faceFollower.add(faceHelper.create_occluderMesh(occluder.scene, false));
    faceHelper.set_faceFollower(this.faceParent, this.faceFollower, 0);

    this.loop();
  }

  /**
   * FIT CHECK, no camera. The occluder head is drawn in false colour where
   * the tracker would put a face, and turns slowly, so every frame can be
   * judged against the same head: where the bridge sits, how high the
   * lenses ride, whether the arms reach the ears. This is how the `FIT`
   * table in lib/try-on gets tuned. Development only.
   */
  async startFitCheck() {
    this.setUpRenderer();
    const occluder = await this.loader.loadAsync("/try-on/occluder.glb");
    /* Opaque on purpose: a see-through head is drawn after the frame and
       washes over it, which reads as a colour problem that is not there. */
    this.faceFollower.add(faceHelper.create_occluderMesh(occluder.scene, true));
    this.camera.position.set(0, 20, 520);
    this.camera.lookAt(0, 20, 0);
    this.status = "tracking";
    this.opts.onStatus("tracking");

    const t0 = performance.now();
    const spin = () => {
      if (this.destroyed || !this.renderer) return;
      const t = (performance.now() - t0) / 1000;
      this.faceParent.rotation.set(Math.sin(t * 0.4) * 0.12, Math.sin(t * 0.5) * 0.9, 0);
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(spin);
    };
    spin();
  }

  private setUpRenderer() {
    this.measure();
    const { threeCanvas } = this.opts;

    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      alpha: true,
      antialias: true,
      /* Kept so `capture()` can read the frame back after it is drawn. */
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(this.size.width, this.size.height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    this.renderer = renderer;

    /* Lit like the turntable: the same studio reflection, so an acetate
       reads as the same material on a face as it does on the stand. */
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(0, 200, 300);
    this.scene.add(key, new THREE.HemisphereLight(0xffffff, 0x222222, 0.5));
  }

  /** Puts a frame on. Resolves when it is on; a newer call wins. */
  async wear(url: string, fit: TryOnFit = {}) {
    this.current = url;
    const key = `${url}#${fit.y ?? 0},${fit.z ?? 0},${fit.scale ?? 1}`;
    let pending = this.frames.get(key);
    if (!pending) {
      pending = this.loader.loadAsync(url).then((gltf) => fitFrame(gltf.scene, fit));
      this.frames.set(key, pending);
      pending.catch(() => this.frames.delete(key));
    }
    let frame: THREE.Group;
    try {
      frame = await pending;
    } catch {
      const error: TryOnError = "MODEL_FAILED";
      throw error;
    }
    if (this.destroyed || this.current !== url) return;
    this.holder.clear();
    this.holder.add(frame);
  }

  /** Call when the stage changes size or the phone turns. */
  resize() {
    this.measure();
    this.renderer?.setSize(this.size.width, this.size.height, false);
    faceHelper.resize();
  }

  /**
   * The picture as the reader sees it: the video, the frame over it, and
   * mirrored, because a selfie that comes out the other way round from
   * the mirror it was taken in reads as someone else's face.
   */
  capture() {
    const video = WEBARROCKSFACE.capture_image(true);
    const out = document.createElement("canvas");
    out.width = video.width;
    out.height = video.height;
    const ctx = out.getContext("2d")!;
    ctx.translate(out.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    if (this.renderer) {
      ctx.drawImage(this.renderer.domElement, 0, 0, out.width, out.height);
    }
    return out;
  }

  async destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    try {
      await WEBARROCKSFACE.destroy();
    } catch {
      /* Already gone, or never started: either way the camera is off. */
    }
    for (const pending of this.frames.values()) {
      pending.then(disposeFrame, () => {});
    }
    this.frames.clear();
    this.scene.environment?.dispose();
    this.draco.dispose();
    this.renderer?.dispose();
    this.renderer = null;
  }

  private measure() {
    const box = this.opts.faceCanvas.parentElement!.getBoundingClientRect();
    this.size = {
      width: Math.max(1, Math.round(box.width)),
      height: Math.max(1, Math.round(box.height)),
    };
    /* The face canvas is sized in CSS pixels, as upstream's demos do:
       the network only needs a few hundred pixels of face, and a 3x
       canvas would triple the cost of drawing the video for nothing. */
    this.opts.faceCanvas.width = this.size.width;
    this.opts.faceCanvas.height = this.size.height;
  }

  private track(isDetected: boolean) {
    const next: TryOnStatus = isDetected ? "tracking" : "searching";
    if (next === this.status) return;
    this.status = next;
    this.opts.onStatus(next);
  }

  private loop = () => {
    if (this.destroyed || !this.renderer) return;
    faceHelper.update_threeCamera(this.size, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };
}
