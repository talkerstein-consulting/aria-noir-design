"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export type DepthRibbonPath = "loop" | "knot" | "wave";
export type DepthRibbonTour = "cycle" | "ride" | "overview";

export interface DepthRibbonItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface DepthRibbonProps {
  items?: DepthRibbonItem[];
  count?: number;
  path?: DepthRibbonPath;
  tour?: DepthRibbonTour;
  interval?: number;
  speed?: number;
  cardSize?: number;
  aspect?: number;
  radius?: number;
  offset?: number;
  fov?: number;
  fog?: number;
  thread?: number;
  shadow?: number;
  accentColor?: string;
  backgroundColor?: string;
  focusOnClick?: boolean;
  holdToReveal?: boolean;
  captions?: boolean;
  interactive?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  pauseOnHover?: boolean;
  seed?: number;
  paused?: boolean;
  dpr?: number;
  ariaLabel?: string;
  onFocusChange?: (item: DepthRibbonItem | null, index: number) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface DepthRibbonHandle {
  travel: (cards: number) => void;
  focus: (index: number) => void;
  release: () => void;
  reveal: (show: boolean) => void;
}

type Settings = Required<
  Omit<DepthRibbonProps, "className" | "style" | "children" | "onFocusChange" | "ariaLabel">
> & {
  reduced: boolean;
};

interface Controller {
  sync: () => void;
  travel: (cards: number) => void;
  focus: (index: number) => void;
  step: (direction: number) => void;
  release: () => void;
  reveal: (show: boolean) => void;
  destroy: () => void;
}

interface Pose {
  target: THREE.Vector3;
  dir: THREE.Vector3;
  r: number;
}

interface Focus {
  card: number;
  item: number;
  e: number;
  v: number;
  target: number;
  from: Pose;
  handoff: number;
  handoffV: number;
  dir: THREE.Vector3;
  aspect: number;
  aspectV: number;
}

const MAX_CARDS = 240;
const MAX_ITEMS = 48;
const SUB = 8;
const TAU = Math.PI * 2;

const defaultItems: DepthRibbonItem[] = [
  ["https://pro.reactbits.dev/demo-media/abstract-iris-window.webp", "Iris window", "An opening into color"],
  ["https://pro.reactbits.dev/demo-media/abstract-citrus-signal.webp", "Citrus signal", "A sharp citrus accent"],
  ["https://pro.reactbits.dev/demo-media/abstract-rose-petal.webp", "Rose petal", "Three curves in conversation"],
  ["https://pro.reactbits.dev/demo-media/abstract-spectrum.webp", "Spectrum", "A study in pink and violet"],
  ["https://pro.reactbits.dev/demo-media/abstract-spectrum-shift.webp", "Spectrum shift", "A shift toward coral"],
  ["https://pro.reactbits.dev/demo-media/abstract-rose-balance.webp", "Rose balance", "A bright point of balance"],
  ["https://pro.reactbits.dev/demo-media/abstract-amber-loop.webp", "Amber loop", "Warmth around an open center"],
  ["https://pro.reactbits.dev/demo-media/abstract-coral-fold.webp", "Coral fold", "A bold change of direction"],
].map(([src, title, subtitle]) => ({
  src,
  alt: `${title}, ${subtitle.toLowerCase()}`,
  title,
  subtitle,
}));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const seeded = (seed: number) => {
  let state = Math.imul(Math.floor(seed) + 3, 2654435761) >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
};

const isLight = (value: string) => {
  const hex = value.replace("#", "");
  if (!/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(hex)) return false;
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
};

const springTo = (
  value: number,
  velocity: number,
  target: number,
  dt: number,
  response: number,
) => {
  const omega = TAU / Math.max(response, 0.02);
  const substeps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / substeps;
  let v = velocity;
  let x = value;
  for (let i = 0; i < substeps; i++) {
    v += (omega * omega * (target - x) - 2 * omega * v) * h;
    x += v * h;
  }
  return [x, v] as const;
};

const pathPoint = (path: DepthRibbonPath, t: number, out: THREE.Vector3) => {
  if (path === "knot") {
    return out.set(
      Math.sin(t) + 2 * Math.sin(2 * t),
      -Math.sin(3 * t) * 0.85,
      Math.cos(t) - 2 * Math.cos(2 * t),
    );
  }
  if (path === "wave") {
    return out.set(Math.cos(t) * 2.6, Math.sin(3 * t) * 0.55, Math.sin(t) * 2.6);
  }
  return out.set(Math.sin(t) * 2.8, Math.cos(t) * 0.5, Math.sin(2 * t) * 1.45);
};

const makePose = (): Pose => ({ target: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), r: 1 });

const copyPose = (from: Pose, to: Pose) => {
  to.target.copy(from.target);
  to.dir.copy(from.dir);
  to.r = from.r;
  return to;
};

const blendPose = (a: Pose, b: Pose, e: number, out: Pose) => {
  const t = clamp(e, 0, 1);
  out.target.lerpVectors(a.target, b.target, t);
  out.dir.copy(a.dir).lerp(b.dir, t);
  if (out.dir.lengthSq() < 1e-6) out.dir.copy(b.dir);
  out.dir.normalize();
  out.r = Math.exp(Math.log(a.r) + (Math.log(b.r) - Math.log(a.r)) * t);
  return out;
};

const hiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const stageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  touchAction: "pan-y",
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const cardVertexShader = `
attribute vec3 aCenter;
attribute vec4 aCard;
uniform float uMargin;
uniform float uAspect;
uniform float uFogLength;
varying vec2 vLocal;
varying vec4 vCard;
varying float vFade;

void main() {
  vec4 view = modelViewMatrix * vec4(aCenter, 1.0);
  float depth = max(-view.z, 0.0);
  float size = aCard.x * (1.0 + 0.14 * aCard.z);
  vec2 corner = position.xy * uMargin;
  view.xy += corner * vec2(uAspect, 1.0) * size;
  gl_Position = projectionMatrix * view;
  float fog = exp(-pow(depth / uFogLength, 1.5));
  float near = smoothstep(0.25, 0.85, depth);
  vFade = fog * near * aCard.w;
  vLocal = corner;
  vCard = aCard;
}
`;

const cardFragmentShader = `
precision highp float;

uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform float uInset;
uniform float uLoaded[${MAX_ITEMS}];
uniform float uAspect;
uniform float uRadius;
uniform float uShadow;
uniform float uDim;
varying vec2 vLocal;
varying vec4 vCard;
varying float vFade;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  if (vFade < 0.003) discard;
  vec2 halfSize = vec2(uAspect, 1.0) * 0.5;
  vec2 p = vLocal * vec2(uAspect, 1.0);
  float corner = clamp(uRadius, 0.0, 1.0) * min(halfSize.x, halfSize.y);
  float d = roundBox(p, halfSize, corner);
  float aa = fwidth(d) * 0.8;
  float card = 1.0 - smoothstep(-aa, aa, d);
  float soft = 0.07 + 0.12 * vCard.z;
  float sd = roundBox(p - vec2(0.0, -0.045 - 0.07 * vCard.z), halfSize - soft * 0.3, corner);
  float shade = (1.0 - smoothstep(-soft, soft, sd)) * uShadow * (0.55 + 0.35 * vCard.z);
  vec2 uv = p / (halfSize * 2.0) + 0.5;
  vec2 crop = uAspect < 1.0 ? vec2(uAspect, 1.0) : vec2(1.0, 1.0 / uAspect);
  vec2 suv = clamp(0.5 + (uv - 0.5) * crop, 0.0, 1.0);
  float which = floor(vCard.y + 0.5);
  vec2 slot = vec2(mod(which, uGrid.x), floor(which / uGrid.x));
  float inner = 1.0 - 2.0 * uInset;
  vec2 atlasUv = vec2(
    (slot.x + uInset + suv.x * inner) / uGrid.x,
    1.0 - (slot.y + uInset + (1.0 - suv.y) * inner) / uGrid.y
  );
  vec3 image = texture2D(uAtlas, atlasUv).rgb;
  vec3 color = mix(vec3(0.14, 0.13, 0.18), image, uLoaded[int(which)]) * (1.0 + 0.08 * vCard.z);
  float fade = vFade * (1.0 - uDim);
  float alpha = card * fade;
  vec4 result = vec4(color * alpha, alpha);
  result += vec4(0.0, 0.0, 0.0, shade * fade) * (1.0 - alpha);
  if (result.a < 0.002) discard;
  gl_FragColor = result;
}
`;

const threadVertexShader = `
uniform float uFogLength;
varying float vFade;

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * view;
  float depth = max(-view.z, 0.0);
  vFade = exp(-pow(depth / uFogLength, 1.5)) * smoothstep(0.4, 1.4, depth);
}
`;

const threadFragmentShader = `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;

void main() {
  float alpha = uOpacity * vFade;
  gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

const photoVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const photoFragmentShader = `
precision highp float;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uRadius;
uniform float uOpacity;
varying vec2 vUv;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uPlaneAspect, 1.0);
  float d = roundBox(p, vec2(uPlaneAspect, 1.0) * 0.5, uRadius);
  float aa = fwidth(d);
  float cover = 1.0 - smoothstep(-aa, aa, d);
  vec2 uv = vUv - 0.5;
  if (uPlaneAspect < uImageAspect) {
    uv.x *= uPlaneAspect / uImageAspect;
  } else {
    uv.y *= uImageAspect / uPlaneAspect;
  }
  vec3 color = texture2D(uImage, uv + 0.5).rgb;
  float alpha = cover * uOpacity;
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

const encodedColor = (value: string, fallback: string, target: THREE.Color) => {
  try {
    target.set(value);
  } catch {
    target.set(fallback);
  }
  const rgb = { r: 0, g: 0, b: 0 };
  target.getRGB(rgb, THREE.SRGBColorSpace);
  return target.setRGB(rgb.r, rgb.g, rgb.b);
};

const createRibbon = (
  root: HTMLElement,
  stage: HTMLElement,
  settingsRef: { current: Settings },
  itemsRef: { current: DepthRibbonItem[] },
  onFocus: (item: number) => void,
): Controller | null => {
  const doc = root.ownerDocument;
  const canvas = doc.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  stage.appendChild(canvas);
  renderer.setClearColor(0x000000, 0);

  const loaded = new Array<number>(MAX_ITEMS).fill(0);
  const fading = new Array<boolean>(MAX_ITEMS).fill(false);
  const margin = 1.4;
  const fogLength = { value: 16 };
  const accent = new THREE.Color(0xb19eef);
  const cardUniforms = {
    uAtlas: { value: null as THREE.Texture | null },
    uGrid: { value: new THREE.Vector2(1, 1) },
    uInset: { value: 0.004 },
    uLoaded: { value: loaded },
    uMargin: { value: margin },
    uAspect: { value: 1 },
    uFogLength: fogLength,
    uRadius: { value: 0.12 },
    uShadow: { value: 0.5 },
    uDim: { value: 0 },
  };
  const cardMaterial = new THREE.ShaderMaterial({
    uniforms: cardUniforms,
    vertexShader: cardVertexShader,
    fragmentShader: cardFragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  });
  const base = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = base.index;
  geometry.setAttribute("position", base.getAttribute("position"));
  geometry.setAttribute("uv", base.getAttribute("uv"));
  const centers = new Float32Array(MAX_CARDS * 3);
  const cardData = new Float32Array(MAX_CARDS * 4);
  const centerAttribute = new THREE.InstancedBufferAttribute(centers, 3);
  const cardAttribute = new THREE.InstancedBufferAttribute(cardData, 4);
  centerAttribute.setUsage(THREE.DynamicDrawUsage);
  cardAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aCenter", centerAttribute);
  geometry.setAttribute("aCard", cardAttribute);
  geometry.instanceCount = 0;
  const cardsMesh = new THREE.Mesh(geometry, cardMaterial);
  cardsMesh.frustumCulled = false;
  cardsMesh.renderOrder = 1;

  const threadUniforms = {
    uFogLength: fogLength,
    uColor: { value: accent },
    uOpacity: { value: 0.3 },
  };
  const threadMaterial = new THREE.ShaderMaterial({
    uniforms: threadUniforms,
    vertexShader: threadVertexShader,
    fragmentShader: threadFragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  });
  let threadGeometry = new THREE.BufferGeometry();
  const thread = new THREE.LineLoop(threadGeometry, threadMaterial);
  thread.frustumCulled = false;
  thread.renderOrder = 0;

  const photoUniforms = {
    uImage: { value: null as THREE.Texture | null },
    uImageAspect: { value: 1 },
    uPlaneAspect: { value: 1 },
    uRadius: { value: 0.06 },
    uOpacity: { value: 1 },
  };
  const photoMaterial = new THREE.ShaderMaterial({
    uniforms: photoUniforms,
    vertexShader: photoVertexShader,
    fragmentShader: photoFragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  });
  const photoGeometry = new THREE.PlaneGeometry(1, 1);
  const photo = new THREE.Mesh(photoGeometry, photoMaterial);
  photo.frustumCulled = false;
  photo.renderOrder = 2;
  photo.visible = false;

  const scene = new THREE.Scene();
  scene.add(thread, cardsMesh, photo);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 2000);

  let atlasCanvas: HTMLCanvasElement | null = null;
  let atlasTexture: THREE.CanvasTexture | null = null;
  let images: HTMLImageElement[] = [];
  const imageTextures = new Map<number, THREE.Texture>();
  let itemsKey = "";
  let pathKey = "";
  let assignKey = "";
  let colorKey = "";
  let samples = new Float32Array(0);
  let cardCount = 0;
  let boundRadius = 10;
  let assignment: number[] = [];
  const lifts: { value: number; velocity: number }[] = [];
  let order: number[] = [];
  let depths = new Float32Array(0);
  let width = 1;
  let height = 1;
  let dpr = 1;
  let s = 0;
  let velocity = 0;
  let rate = 1;
  let rateV = 0;
  let pull = 0;
  let pullV = 0;
  let phase: "ride" | "overview" = "ride";
  let phaseClock = 0;
  let orbitYaw = 0;
  let orbitPitch = 0;
  let orbitYawV = 0;
  let orbitPitchV = 0;
  let holding = false;
  let peek = false;
  let hovered = -1;
  let focus: Focus | null = null;
  let time = 0;
  let raf = 0;
  let last = 0;
  let visible = false;
  let destroyed = false;
  let lost = false;
  let pressTimer = 0;
  let pendingTravel = 0;
  let pendingYaw = 0;
  let wheelAt = -10;
  const pointer = { clientX: 0, clientY: 0, inside: false };
  let press: {
    id: number;
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    moved: boolean;
    touch: boolean;
    samples: { t: number; d: number }[];
  } | null = null;
  const travelPose = makePose();
  const overviewPose = makePose();
  const basePose = makePose();
  const focusPose = makePose();
  const fromPose = makePose();
  const finalPose = makePose();
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpC = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  const right = new THREE.Vector3();
  const lift = new THREE.Vector3();
  const view = new THREE.Vector3();

  const pointAt = (value: number, out: THREE.Vector3) => {
    const total = cardCount * SUB;
    if (!total) return out.set(0, 0, 0);
    const u = ((((value * SUB) % total) + total) % total);
    const i0 = Math.floor(u);
    const f = u - i0;
    const i1 = (i0 + 1) % total;
    return out.set(
      samples[i0 * 3] + (samples[i1 * 3] - samples[i0 * 3]) * f,
      samples[i0 * 3 + 1] + (samples[i1 * 3 + 1] - samples[i0 * 3 + 1]) * f,
      samples[i0 * 3 + 2] + (samples[i1 * 3 + 2] - samples[i0 * 3 + 2]) * f,
    );
  };

  const cardPosition = (index: number, out: THREE.Vector3) => {
    const k = index * SUB * 3;
    return out.set(samples[k], samples[k + 1], samples[k + 2]);
  };

  const buildPath = () => {
    const settings = settingsRef.current;
    const count = clamp(Math.round(settings.count), 12, MAX_CARDS);
    const key = `${settings.path}|${count}`;
    if (key === pathKey) return false;
    pathKey = key;
    const steps = 4096;
    const raw = new Float64Array((steps + 1) * 3);
    const lengths = new Float64Array(steps + 1);
    const point = new THREE.Vector3();
    for (let k = 0; k <= steps; k++) {
      pathPoint(settings.path, (k / steps) * TAU, point);
      raw[k * 3] = point.x;
      raw[k * 3 + 1] = point.y;
      raw[k * 3 + 2] = point.z;
      if (k > 0) {
        lengths[k] =
          lengths[k - 1] +
          Math.hypot(
            raw[k * 3] - raw[(k - 1) * 3],
            raw[k * 3 + 1] - raw[(k - 1) * 3 + 1],
            raw[k * 3 + 2] - raw[(k - 1) * 3 + 2],
          );
      }
    }
    const length = lengths[steps];
    const total = count * SUB;
    const scale = count / length;
    samples = new Float32Array(total * 3);
    let k = 0;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let j = 0; j < total; j++) {
      const at = (j / total) * length;
      while (k < steps - 1 && lengths[k + 1] < at) k++;
      const span = lengths[k + 1] - lengths[k] || 1;
      const f = (at - lengths[k]) / span;
      for (let c = 0; c < 3; c++) {
        samples[j * 3 + c] = (raw[k * 3 + c] + (raw[(k + 1) * 3 + c] - raw[k * 3 + c]) * f) * scale;
      }
      cx += samples[j * 3];
      cy += samples[j * 3 + 1];
      cz += samples[j * 3 + 2];
    }
    cx /= total;
    cy /= total;
    cz /= total;
    boundRadius = 0;
    for (let j = 0; j < total; j++) {
      samples[j * 3] -= cx;
      samples[j * 3 + 1] -= cy;
      samples[j * 3 + 2] -= cz;
      boundRadius = Math.max(
        boundRadius,
        Math.hypot(samples[j * 3], samples[j * 3 + 1], samples[j * 3 + 2]),
      );
    }
    cardCount = count;
    s = ((s % count) + count) % count;
    threadGeometry.dispose();
    threadGeometry = new THREE.BufferGeometry();
    threadGeometry.setAttribute("position", new THREE.BufferAttribute(samples.slice(), 3));
    thread.geometry = threadGeometry;
    while (lifts.length < count) lifts.push({ value: 0, velocity: 0 });
    lifts.length = count;
    order = Array.from({ length: count }, (_, i) => i);
    depths = new Float32Array(count);
    if (focus && focus.card >= count) focus = null;
    return true;
  };

  const assign = () => {
    const settings = settingsRef.current;
    const items = Math.max(1, Math.min(itemsRef.current.length, MAX_ITEMS));
    const key = `${cardCount}|${items}|${settings.seed}`;
    if (key === assignKey) return;
    assignKey = key;
    const random = seeded(settings.seed * 131 + 7);
    const list: number[] = [];
    while (list.length < cardCount) {
      const pass = Array.from({ length: items }, (_, i) => i);
      for (let i = pass.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [pass[i], pass[j]] = [pass[j], pass[i]];
      }
      if (list.length && items > 1 && pass[0] === list[list.length - 1]) {
        [pass[0], pass[1]] = [pass[1], pass[0]];
      }
      list.push(...pass);
    }
    assignment = list.slice(0, cardCount);
    if (items > 1 && assignment[0] === assignment[cardCount - 1]) {
      const swap = assignment.findIndex((value, i) => i > 0 && i < cardCount - 1 && value !== assignment[0] && assignment[i - 1] !== assignment[cardCount - 1] && assignment[i + 1] !== assignment[cardCount - 1]);
      if (swap > 0) [assignment[swap], assignment[cardCount - 1]] = [assignment[cardCount - 1], assignment[swap]];
    }
  };

  const buildAtlas = () => {
    const items = itemsRef.current.slice(0, MAX_ITEMS);
    const key = items.map((item) => item.src).join("\u0000");
    if (key === itemsKey) return;
    itemsKey = key;
    images.forEach((image) => {
      image.onload = null;
    });
    imageTextures.forEach((texture) => texture.dispose());
    imageTextures.clear();
    atlasTexture?.dispose();
    loaded.fill(0);
    fading.fill(false);
    const count = Math.max(items.length, 1);
    const slot = count <= 20 ? 512 : count <= 36 ? 384 : 256;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const canvasAtlas = doc.createElement("canvas");
    canvasAtlas.width = cols * slot;
    canvasAtlas.height = rows * slot;
    atlasCanvas = canvasAtlas;
    const context = canvasAtlas.getContext("2d");
    atlasTexture = new THREE.CanvasTexture(canvasAtlas);
    atlasTexture.colorSpace = THREE.NoColorSpace;
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.generateMipmaps = true;
    atlasTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    cardUniforms.uAtlas.value = atlasTexture;
    cardUniforms.uGrid.value.set(cols, rows);
    cardUniforms.uInset.value = 1.5 / slot;
    images = items.map((item, index) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => {
        if (destroyed || atlasCanvas !== canvasAtlas || !context) return;
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        context.drawImage(
          image,
          (image.naturalWidth - side) / 2,
          (image.naturalHeight - side) / 2,
          side,
          side,
          (index % cols) * slot,
          Math.floor(index / cols) * slot,
          slot,
          slot,
        );
        if (atlasTexture) atlasTexture.needsUpdate = true;
        fading[index] = true;
        schedule();
      };
      image.src = item.src;
      return image;
    });
  };

  const refreshColors = () => {
    const settings = settingsRef.current;
    const key = settings.accentColor;
    if (key === colorKey) return;
    colorKey = key;
    encodedColor(settings.accentColor, "#B19EEF", accent);
  };

  const resize = () => {
    const settings = settingsRef.current;
    const rect = root.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, Math.max(settings.dpr, 0.5));
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return false;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    return true;
  };

  const verticalFov = () => {
    const base = THREE.MathUtils.degToRad(clamp(settingsRef.current.fov, 30, 100));
    const aspect = width / height;
    if (aspect >= 1) return base;
    const minimum = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(52) / 2) / aspect);
    return Math.min(Math.max(base, minimum), THREE.MathUtils.degToRad(110));
  };

  const halfFov = () => {
    const vertical = verticalFov() / 2;
    const horizontal = Math.atan(Math.tan(vertical) * (width / height));
    return { vertical, horizontal };
  };

  const computeTravel = (out: Pose) => {
    const settings = settingsRef.current;
    const offset = clamp(settings.offset, 0.3, 3);
    pointAt(s + 0.5, tmpA);
    pointAt(s - 0.5, tmpB);
    tangent.subVectors(tmpA, tmpB);
    if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0);
    tangent.normalize();
    right.crossVectors(tangent, up);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    lift.crossVectors(right, tangent).normalize();
    const wide = clamp((width / height - 0.5) / 0.7, 0, 1);
    pointAt(s, tmpC);
    tmpC
      .addScaledVector(lift, (1.05 - 0.5 * wide) * offset)
      .addScaledVector(right, (0.35 + 0.7 * wide) * offset);
    pointAt(s + 5.5, out.target);
    out.dir.subVectors(tmpC, out.target);
    out.r = Math.max(out.dir.length(), 0.01);
    out.dir.divideScalar(out.r);
    return out;
  };

  const computeOverview = (out: Pose) => {
    const { vertical, horizontal } = halfFov();
    const yaw = orbitYaw + (settingsRef.current.reduced ? 0 : time * 0.05);
    const pitch = clamp(0.62 + orbitPitch, 0.05, 1.45);
    out.target.set(0, 0, 0);
    out.dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    const card = clamp(settingsRef.current.cardSize, 0.2, 1.5) * 0.75;
    right.crossVectors(up, out.dir).normalize();
    lift.crossVectors(out.dir, right).normalize();
    const tanH = Math.tan(horizontal) * 0.9;
    const tanV = Math.tan(vertical) * 0.86;
    let reach = boundRadius * 0.5;
    for (let i = 0; i < cardCount; i++) {
      cardPosition(i, tmpA);
      const along = tmpA.dot(out.dir);
      reach = Math.max(
        reach,
        along + (Math.abs(tmpA.dot(right)) + card) / tanH,
        along + (Math.abs(tmpA.dot(lift)) + card) / tanV,
      );
    }
    out.r = reach;
    return out;
  };

  const focusDistance = (imageAspect: number) => {
    const settings = settingsRef.current;
    const size = clamp(settings.cardSize, 0.2, 1.5);
    const { vertical, horizontal } = halfFov();
    const byHeight = size / (2 * Math.tan(vertical) * 0.6);
    const byWidth = (size * imageAspect) / (2 * Math.tan(horizontal) * 0.84);
    return Math.max(byHeight, byWidth);
  };

  const project = (index: number) => {
    cardPosition(index, view).applyMatrix4(camera.matrixWorldInverse);
    const depth = -view.z;
    const focal = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    return {
      depth,
      sx: width / 2 + (view.x * focal) / Math.max(depth, 1e-3),
      sy: height / 2 - (view.y * focal) / Math.max(depth, 1e-3),
      scale: focal / Math.max(depth, 1e-3),
    };
  };

  const pick = (clientX: number, clientY: number) => {
    const settings = settingsRef.current;
    const rect = root.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const aspect = clamp(settings.aspect, 0.4, 2.5);
    const size = clamp(settings.cardSize, 0.2, 1.5);
    for (let n = order.length - 1; n >= 0; n--) {
      const i = order[n];
      if (focus && i === focus.card) continue;
      const p = project(i);
      if (p.depth < 0.4) continue;
      const fog = Math.exp(-Math.pow(p.depth / fogLength.value, 1.5));
      if (fog < 0.2) continue;
      const halfH = (size * (1 + 0.14 * Math.max(lifts[i].value, 0)) * p.scale) / 2;
      const halfW = halfH * aspect;
      if (halfH < 4) continue;
      const dx = Math.abs(px - p.sx);
      const dy = Math.abs(py - p.sy);
      if (dx > halfW || dy > halfH) continue;
      const corner = clamp(settings.radius, 0, 1) * Math.min(halfW, halfH);
      const qx = Math.max(dx - halfW + corner, 0);
      const qy = Math.max(dy - halfH + corner, 0);
      if (qx * qx + qy * qy <= corner * corner) return i;
    }
    return -1;
  };

  const schedule = () => {
    if (destroyed || lost || !visible || raf) return;
    raf = requestAnimationFrame(frame);
  };

  const prewarm = (which: number) => {
    const image = images[which];
    if (!image || !image.complete || !image.naturalWidth || imageTextures.has(which)) return;
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    imageTextures.set(which, texture);
    renderer.initTexture(texture);
  };

  const focusCard = (index: number) => {
    if (index < 0 || index >= cardCount) return;
    const item = assignment[index] ?? 0;
    const image = images[item];
    if (!image || !image.complete || !image.naturalWidth) return;
    prewarm(item);
    const texture = imageTextures.get(item);
    if (!texture) return;
    photoUniforms.uImage.value = texture;
    photoUniforms.uImageAspect.value = image.naturalWidth / image.naturalHeight;
    cardPosition(index, tmpA);
    const direction = new THREE.Vector3().subVectors(camera.position, tmpA).normalize();
    focus = {
      card: index,
      item,
      e: 0,
      v: 0,
      target: 1,
      from: copyPose(finalPose, makePose()),
      handoff: 0,
      handoffV: 0,
      dir: direction,
      aspect: clamp(settingsRef.current.aspect, 0.4, 2.5),
      aspectV: 0,
    };
    hovered = -1;
    holding = false;
    peek = false;
    if (settingsRef.current.tour !== "overview") {
      phase = "ride";
      phaseClock = 0;
      pull = 0;
      pullV = 0;
    }
    s = index - 2.6;
    velocity = 0;
    onFocus(item);
    schedule();
  };

  /** With an image open, move to the next card along the ribbon. */
  const step = (direction: number) => {
    if (!focus || focus.target === 0 || !cardCount) return;
    focusCard((((focus.card + direction) % cardCount) + cardCount) % cardCount);
  };

  const release = () => {
    if (!focus || focus.target === 0) return;
    focus.target = 0;
    onFocus(-1);
    schedule();
  };

  function frame(now: number) {
    raf = 0;
    if (destroyed || lost) return;
    const settings = settingsRef.current;
    const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
    last = now;
    time += dt;
    const reduced = settings.reduced;
    refreshColors();
    buildPath();
    assign();
    if (!cardCount) return;

    if (pointer.inside && !press && settings.interactive && !(focus && focus.target === 1)) {
      const candidate = pick(pointer.clientX, pointer.clientY);
      if (candidate !== hovered) {
        hovered = candidate;
        root.style.cursor = candidate >= 0 && settings.focusOnClick ? "pointer" : "";
        if (candidate >= 0) prewarm(assignment[candidate] ?? 0);
      }
    } else if (!pointer.inside || (focus && focus.target === 1)) {
      hovered = -1;
    }
    const hovering = settings.pauseOnHover && hovered >= 0;

    const tour = settings.tour;
    if (tour === "cycle" && !reduced && !settings.paused) {
      if (!focus && !hovering && !press && time - wheelAt > 1.2) phaseClock += dt;
      if (phase === "ride" && phaseClock >= Math.max(settings.interval, 2)) {
        phase = "overview";
        phaseClock = 0;
      } else if (phase === "overview" && phaseClock >= 3.8) {
        phase = "ride";
        phaseClock = 0;
      }
    } else {
      phase = "ride";
      phaseClock = 0;
    }
    const pullTarget = tour === "overview" || phase === "overview" || holding || peek ? 1 : 0;
    [pull, pullV] = springTo(pull, pullV, pullTarget, dt, reduced ? 0.05 : 1.7);

    const scrolled = time - wheelAt < 1.2;
    const stopped = hovering || !!focus || scrolled;
    [rate, rateV] = springTo(rate, rateV, stopped ? 0 : 1, dt, stopped ? 0.25 : 0.9);
    const cruise = reduced || settings.paused ? 0 : settings.speed;
    const dragging = !!press && press.moved && pull < 0.5;
    if (!dragging) {
      const glide = pendingTravel * (1 - Math.exp(-dt / (reduced ? 0.02 : 0.16)));
      pendingTravel -= glide;
      if (Math.abs(pendingTravel) < 1e-4) pendingTravel = 0;
      s += (cruise * Math.max(rate, 0) + velocity) * dt + glide;
      velocity *= Math.exp(-dt * 1.8);
    }
    if (pendingYaw !== 0) {
      const turn = pendingYaw * (1 - Math.exp(-dt / (reduced ? 0.02 : 0.16)));
      pendingYaw -= turn;
      if (Math.abs(pendingYaw) < 1e-4) pendingYaw = 0;
      orbitYaw += turn;
    }
    if (!(press && press.moved)) {
      orbitYaw += orbitYawV * dt;
      orbitPitch += orbitPitchV * dt;
      orbitYawV *= Math.exp(-dt * 2);
      orbitPitchV *= Math.exp(-dt * 2);
    }
    s = ((s % cardCount) + cardCount) % cardCount;

    computeTravel(travelPose);
    computeOverview(overviewPose);
    blendPose(travelPose, overviewPose, pull, basePose);

    if (focus) {
      [focus.e, focus.v] = springTo(focus.e, focus.v, focus.target, dt, reduced ? 0.08 : 1.25);
      if (focus.target === 0) {
        [focus.handoff, focus.handoffV] = springTo(focus.handoff, focus.handoffV, 1, dt, reduced ? 0.05 : 0.6);
      }
      [focus.aspect, focus.aspectV] = springTo(
        focus.aspect,
        focus.aspectV,
        focus.target ? photoUniforms.uImageAspect.value : clamp(settings.aspect, 0.4, 2.5),
        dt,
        reduced ? 0.08 : 1.1,
      );
      cardPosition(focus.card, focusPose.target);
      focusPose.dir.copy(focus.dir);
      focusPose.r = focusDistance(photoUniforms.uImageAspect.value);
      const start = blendPose(focus.from, basePose, focus.handoff, fromPose);
      blendPose(start, focusPose, focus.e, finalPose);
      if (focus.target === 0 && focus.e < 0.002 && Math.abs(focus.v) < 0.02) {
        focus = null;
        photo.visible = false;
        copyPose(basePose, finalPose);
      }
    } else {
      copyPose(basePose, finalPose);
    }

    camera.fov = THREE.MathUtils.radToDeg(verticalFov());
    camera.aspect = width / height;
    camera.near = Math.max(finalPose.r * 0.01, 0.05);
    camera.far = Math.max(finalPose.r * 6, boundRadius * 6, 50);
    camera.updateProjectionMatrix();
    camera.position.copy(finalPose.target).addScaledVector(finalPose.dir, finalPose.r);
    camera.up.set(0, 1, 0);
    camera.lookAt(finalPose.target);
    camera.updateMatrixWorld();

    fogLength.value = ((4 + finalPose.r) * 1.9) / clamp(settings.fog, 0.1, 4);
    const focusE = focus ? clamp(focus.e, 0, 1) : 0;
    cardUniforms.uDim.value = focusE * 0.65;
    cardUniforms.uAspect.value = clamp(settings.aspect, 0.4, 2.5);
    cardUniforms.uRadius.value = clamp(settings.radius, 0, 1);
    cardUniforms.uShadow.value = clamp(settings.shadow, 0, 1);
    threadUniforms.uOpacity.value =
      clamp(settings.thread, 0, 1) * Math.min(1, 1 + (dpr - 1) * 0.85) * (1 - focusE * 0.7);
    thread.visible = settings.thread > 0;

    let busy = !reduced && !settings.paused && (Math.abs(settings.speed) > 1e-4 || tour !== "ride");
    busy ||= Math.abs(velocity) > 1e-3 || Math.abs(pull - pullTarget) > 1e-3 || Math.abs(pullV) > 1e-3;
    busy ||= Math.abs(orbitYawV) + Math.abs(orbitPitchV) > 1e-3 || !!focus || !!press;
    busy ||= pendingTravel !== 0 || pendingYaw !== 0 || scrolled;

    const size = clamp(settings.cardSize, 0.2, 1.5);
    const forward = tmpA.set(0, 0, -1).applyQuaternion(camera.quaternion);
    for (let i = 0; i < cardCount; i++) {
      cardPosition(i, tmpB);
      depths[i] = tmpB.sub(camera.position).dot(forward);
      const liftSpring = lifts[i];
      const liftTarget = i === hovered ? 1 : 0;
      [liftSpring.value, liftSpring.velocity] = springTo(liftSpring.value, liftSpring.velocity, liftTarget, dt, reduced ? 0.05 : 0.35);
      if (Math.abs(liftSpring.value - liftTarget) > 1e-3 || Math.abs(liftSpring.velocity) > 1e-3) busy = true;
    }
    order.sort((a, b) => depths[b] - depths[a] || a - b);
    order.forEach((i, slot) => {
      cardPosition(i, tmpB);
      centers[slot * 3] = tmpB.x;
      centers[slot * 3 + 1] = tmpB.y;
      centers[slot * 3 + 2] = tmpB.z;
      cardData[slot * 4] = size;
      cardData[slot * 4 + 1] = assignment[i] ?? 0;
      cardData[slot * 4 + 2] = Math.max(lifts[i].value, 0);
      cardData[slot * 4 + 3] = focus && i === focus.card ? 0 : 1;
    });
    geometry.instanceCount = cardCount;
    centerAttribute.needsUpdate = true;
    cardAttribute.needsUpdate = true;

    if (focus) {
      cardPosition(focus.card, photo.position);
      photo.quaternion.copy(camera.quaternion);
      const aspect = clamp(focus.aspect, 0.3, 4);
      photo.scale.set(size * aspect, size, 1);
      photo.visible = true;
      photoUniforms.uPlaneAspect.value = aspect;
      const corner = clamp(settings.radius, 0, 1) * Math.min(aspect, 1) * 0.5;
      photoUniforms.uRadius.value = corner + (0.03 - corner) * clamp(focus.e, 0, 1);
      const depth = Math.max(tmpC.subVectors(photo.position, camera.position).dot(forward), 0);
      const fog = Math.exp(-Math.pow(depth / fogLength.value, 1.5));
      photoUniforms.uOpacity.value = fog + (1 - fog) * clamp(focus.e, 0, 1);
    }

    for (let i = 0; i < MAX_ITEMS; i++) {
      if (fading[i] && loaded[i] < 1) {
        loaded[i] = reduced ? 1 : Math.min(1, loaded[i] + dt / 0.6);
        busy = true;
      }
    }

    renderer.render(scene, camera);
    if (busy || pointer.inside) schedule();
  }

  const locate = (event: PointerEvent) => {
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      pointer.inside = true;
      locate(event);
    }
    const settings = settingsRef.current;
    if (press && press.id === event.pointerId) {
      if (!press.moved && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) {
        press.moved = true;
        window.clearTimeout(pressTimer);
        hovered = -1;
        root.style.cursor = "grabbing";
      }
      if (press.moved && settings.draggable) {
        const dx = event.clientX - press.lastX;
        const dy = event.clientY - press.lastY;
        const t = performance.now();
        if (pull > 0.5) {
          orbitYaw -= (dx / Math.max(width, 1)) * 3;
          orbitPitch += (dy / Math.max(height, 1)) * 1.6;
          press.samples.push({ t, d: dx });
        } else if (!focus) {
          const delta = press.touch ? -dx : -dy;
          const cards = (delta / Math.max(height, 1)) * 7;
          s += cards;
          press.samples.push({ t, d: cards });
        }
        while (press.samples.length && t - press.samples[0].t > 100) press.samples.shift();
      }
      press.lastX = event.clientX;
      press.lastY = event.clientY;
    }
    schedule();
  };

  const onDown = (event: PointerEvent) => {
    const settings = settingsRef.current;
    if (!settings.interactive || !event.isPrimary || event.button > 0) return;
    press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
      touch: event.pointerType === "touch",
      samples: [],
    };
    velocity = 0;
    orbitYawV = 0;
    orbitPitchV = 0;
    if (event.pointerType !== "touch") {
      try {
        stage.setPointerCapture(event.pointerId);
      } catch {}
    }
    window.clearTimeout(pressTimer);
    if (settings.holdToReveal && !focus) {
      pressTimer = window.setTimeout(() => {
        if (press && !press.moved && !focus) {
          holding = true;
          hovered = -1;
          root.style.cursor = "grabbing";
          schedule();
        }
      }, 300);
    }
    schedule();
  };

  const finish = (event: PointerEvent, cancelled: boolean) => {
    if (!press || press.id !== event.pointerId) return;
    const settings = settingsRef.current;
    const ended = press;
    press = null;
    window.clearTimeout(pressTimer);
    const wasHolding = holding;
    holding = false;
    try {
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    } catch {}
    if (ended.moved) {
      const now = performance.now();
      const recent = ended.samples.filter((sample) => now - sample.t < 100);
      if (recent.length > 1 && settings.draggable) {
        const span = Math.max((recent[recent.length - 1].t - recent[0].t) / 1000, 1 / 60);
        const speed = recent.reduce((sum, sample) => sum + sample.d, 0) / span;
        if (pull > 0.5) orbitYawV = clamp((-speed / Math.max(width, 1)) * 3, -3, 3);
        else if (!focus) velocity = clamp(speed, -30, 30);
      }
    } else if (!cancelled && !wasHolding) {
      if (focus && focus.target === 1) {
        release();
      } else if (settings.focusOnClick) {
        const index = pick(event.clientX, event.clientY);
        if (index >= 0) focusCard(index);
      }
    }
    root.style.cursor = "";
    schedule();
  };

  const onUp = (event: PointerEvent) => finish(event, false);
  const onCancel = (event: PointerEvent) => finish(event, true);
  const onLeave = (event: PointerEvent) => {
    if (press && press.id === event.pointerId) return;
    pointer.inside = false;
    hovered = -1;
    root.style.cursor = "";
    schedule();
  };

  const onWheel = (event: WheelEvent) => {
    const settings = settingsRef.current;
    if (!settings.wheel || !settings.interactive) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
    const delta = clamp((event.deltaY + event.deltaX) * unit, -240, 240);
    wheelAt = time;
    if (settings.tour === "overview") {
      pendingYaw += delta * 0.0025;
    } else {
      if (focus && focus.target === 1) release();
      peek = false;
      if (phase === "overview") phase = "ride";
      phaseClock = 0;
      pendingTravel += delta * 0.01;
    }
    schedule();
  };

  const onKey = (event: KeyboardEvent) => {
    if (!settingsRef.current.interactive) return;
    if (event.key === "Escape") {
      release();
      peek = false;
    } else if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      if (!focus) velocity += 2.5;
      else step(1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      if (!focus) velocity -= 2.5;
      else step(-1);
    } else if (event.key === "Enter" && event.target === root) {
      event.preventDefault();
      if (focus) release();
      else peek = !peek;
    }
    schedule();
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onCancel);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKey);

  const resizer = new ResizeObserver(() => {
    if (resize()) schedule();
  });
  resizer.observe(root);

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
              last = 0;
              schedule();
            } else if (raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          },
          { rootMargin: "80px" },
        );
  if (observer) observer.observe(root);
  else visible = true;

  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const onRestored = () => {
    lost = false;
    itemsKey = "";
    buildAtlas();
    schedule();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  resize();
  buildPath();
  assign();
  buildAtlas();
  s = cardCount * 0.25;
  photo.visible = true;
  renderer.compile(scene, camera);
  photo.visible = false;
  if (settingsRef.current.tour === "cycle" && !settingsRef.current.reduced) {
    phase = "overview";
    phaseClock = 2.2;
    pull = 1;
  }
  schedule();

  return {
    sync: () => {
      resize();
      buildPath();
      assign();
      buildAtlas();
      last = 0;
      schedule();
    },
    travel: (cards: number) => {
      if (!focus) velocity += cards * 1.8;
      schedule();
    },
    focus: (index: number) => focusCard(index),
    step,
    release,
    reveal: (show: boolean) => {
      peek = show;
      schedule();
    },
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(pressTimer);
      observer?.disconnect();
      resizer.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
      root.style.cursor = "";
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      images.forEach((image) => {
        image.onload = null;
      });
      imageTextures.forEach((texture) => texture.dispose());
      atlasTexture?.dispose();
      base.dispose();
      geometry.dispose();
      threadGeometry.dispose();
      photoGeometry.dispose();
      cardMaterial.dispose();
      threadMaterial.dispose();
      photoMaterial.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
};

export const DepthRibbon = forwardRef<DepthRibbonHandle, DepthRibbonProps>(function DepthRibbon(
  {
    items = defaultItems,
    count = 72,
    path = "loop",
    tour = "cycle",
    interval = 9,
    speed = 0.6,
    cardSize = 0.72,
    aspect = 1,
    radius = 0.12,
    offset = 1,
    fov = 60,
    fog = 1,
    thread = 0.3,
    shadow = 0.5,
    accentColor = "#B19EEF",
    backgroundColor = "transparent",
    focusOnClick = true,
    holdToReveal = true,
    captions = true,
    interactive = true,
    draggable = true,
    wheel = true,
    pauseOnHover = true,
    seed = 0,
    paused = false,
    dpr = 2,
    ariaLabel = "Depth ribbon gallery. Scroll or drag to travel, hold to see the whole path, click an image to bring it close.",
    onFocusChange,
    className,
    style,
    children,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const reduced = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
  const [focused, setFocused] = useState(-1);
  const [failed, setFailed] = useState(false);
  const list = items.length ? items : defaultItems;
  const itemsRef = useRef(list);

  const settings: Settings = {
    items: list,
    count,
    path,
    tour,
    interval,
    speed,
    cardSize,
    aspect,
    radius,
    offset,
    fov,
    fog,
    thread,
    shadow,
    accentColor,
    backgroundColor,
    focusOnClick,
    holdToReveal,
    captions,
    interactive,
    draggable,
    wheel,
    pauseOnHover,
    seed,
    paused,
    dpr,
    reduced,
  };
  const settingsRef = useRef(settings);
  const focusRef = useRef(onFocusChange);

  useEffect(() => {
    settingsRef.current = settings;
    itemsRef.current = list;
    focusRef.current = onFocusChange;
    controllerRef.current?.sync();
  });

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const controller = createRibbon(root, stage, settingsRef, itemsRef, (index) => {
      setFocused(index);
      const item = index >= 0 ? itemsRef.current[index] ?? null : null;
      focusRef.current?.(item, index);
    });
    if (!controller) {
      const frame = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(frame);
    }
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      travel: (cards: number) => controllerRef.current?.travel(cards),
      focus: (index: number) => controllerRef.current?.focus(index),
      release: () => controllerRef.current?.release(),
      reveal: (show: boolean) => controllerRef.current?.reveal(show),
    }),
    [],
  );

  const background = backgroundColor.trim().toLowerCase();
  const transparent = background === "transparent" || background === "";
  const light = !transparent && isLight(background);
  const current = focused >= 0 ? list[focused] : null;

  return (
    <div
      ref={rootRef}
      className={cn("relative h-full min-h-[420px] w-full overflow-hidden", className)}
      style={{ backgroundColor: transparent ? undefined : backgroundColor, ...style }}
      role="region"
      aria-roledescription="gallery"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div ref={stageRef} style={stageStyle} />
      {failed ? (
        <div style={{ ...overlayStyle, gap: 10, flexWrap: "wrap", padding: 24, alignContent: "center" }}>
          {list.slice(0, 12).map((item) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }}
            />
          ))}
        </div>
      ) : null}
      <ul style={hiddenStyle}>
        {list.map((item) => (
          <li key={item.src}>{item.title ? `${item.title}: ${item.alt}` : item.alt}</li>
        ))}
      </ul>
      {children ? (
        <div style={{ ...overlayStyle, opacity: current ? 0 : 1, transition: "opacity 300ms ease" }}>
          <div style={{ pointerEvents: current ? "none" : "auto" }}>{children}</div>
        </div>
      ) : null}
      {([-1, 1] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          aria-label={direction < 0 ? "Previous image" : "Next image"}
          tabIndex={current ? 0 : -1}
          onClick={() => controllerRef.current?.step(direction)}
          style={{
            position: "absolute",
            top: "50%",
            [direction < 0 ? "left" : "right"]: "clamp(12px, 3vw, 40px)",
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${light ? "rgba(10, 10, 10, 0.4)" : "rgba(255, 255, 255, 0.4)"}`,
            background: "transparent",
            color: light ? "rgba(10, 10, 10, 0.92)" : "rgba(255, 255, 255, 0.94)",
            cursor: "pointer",
            opacity: current ? 1 : 0,
            pointerEvents: current ? "auto" : "none",
            transform: "translateY(-50%)",
            transition: current ? "opacity 420ms ease 520ms" : "opacity 160ms ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d={direction < 0 ? "M10 2 4 8l6 6" : "M6 2l6 6-6 6"} />
          </svg>
        </button>
      ))}
      {captions ? (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "6%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
            opacity: current ? 1 : 0,
            transform: current ? "translateY(0)" : "translateY(6px)",
            transition: current
              ? "opacity 420ms ease 520ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 520ms"
              : "opacity 160ms ease, transform 160ms ease",
            color: light ? "rgba(10, 10, 10, 0.92)" : transparent ? "inherit" : "rgba(255, 255, 255, 0.94)",
            textAlign: "center",
          }}
        >
          {current ? (
            <>
              <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{current.title ?? current.alt}</span>
              {current.subtitle ? (
                <span style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.35 }}>{current.subtitle}</span>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

DepthRibbon.displayName = "DepthRibbon";

export default DepthRibbon;
