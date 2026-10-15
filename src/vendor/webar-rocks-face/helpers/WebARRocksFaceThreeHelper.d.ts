import type { BufferGeometry, Mesh, Object3D, PerspectiveCamera } from "three";

/** Only what the try-on calls. See ../README. */
type DetectState = { isDetected: boolean; detected: number };

type InitSpec = {
  NNCPath: string;
  canvas: HTMLCanvasElement;
  maxFacesDetected?: number;
  scanSettings?: { threshold?: number };
  solvePnPImgPointsLabels?: string[];
  isKeepRunningOnWinFocusLost?: boolean;
  videoSettings?: Record<string, unknown>;
  callbackReady?: (err: string | false | null, spec: unknown) => void;
  callbackTrack?: (detectState: DetectState) => void;
};

type StabilizerSpec = {
  beta?: number;
  minCutOff?: number;
  freqRange?: [number, number];
  forceFilterNNInputPxRange?: [number, number];
};

declare const WebARRocksFaceThreeHelper: {
  init(engine: unknown, spec: InitSpec, stabilizerSpec?: StabilizerSpec): void;
  set_faceFollower(parent: Object3D, follower: Object3D, faceIndex: number): void;
  create_occluderMesh(occluder: Object3D | BufferGeometry, isDebug?: boolean): Mesh;
  update_threeCamera(
    sizing: { width: number; height: number },
    camera: PerspectiveCamera,
  ): void;
  resize(): void;
  reset_landmarksStabilizers(): void;
};
export default WebARRocksFaceThreeHelper;
