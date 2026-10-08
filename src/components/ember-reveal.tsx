"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export type EmberRevealImage = string | { src: string; alt?: string };

export interface EmberRevealHandle {
  ignite: (x?: number, y?: number) => void;
  next: () => void;
  reset: () => void;
}

export interface EmberRevealProps {
  images?: EmberRevealImage[];
  aspectRatio?: number;
  radius?: number;
  emberColor?: string;
  charColor?: string;
  glow?: number;
  edge?: number;
  roughness?: number;
  detail?: number;
  scorch?: number;
  smoke?: number;
  sparks?: number;
  shimmer?: number;
  burnDuration?: number;
  pocketSize?: number;
  heal?: number;
  follow?: number;
  hover?: boolean;
  clickToBurn?: boolean;
  autoplay?: boolean;
  interval?: number;
  idleDelay?: number;
  /** Burn through to whatever is behind the canvas instead of to the next
   *  image: the burnt area is transparent. For revealing an element. */
  burnThrough?: boolean | "form";
  /** Ignite here (0..1, 0..1) as soon as the textures are ready. */
  igniteAt?: readonly [number, number];
  onChange?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

interface Settings {
  sources: { src: string; alt: string }[];
  emberColor: string;
  charColor: string;
  glow: number;
  edge: number;
  roughness: number;
  detail: number;
  scorch: number;
  smoke: number;
  sparks: number;
  shimmer: number;
  burnDuration: number;
  pocketSize: number;
  heal: number;
  follow: number;
  hover: boolean;
  clickToBurn: boolean;
  autoplay: boolean;
  interval: number;
  idleDelay: number;
  reduced: boolean;
  burnThrough: boolean | "form";
  igniteAt?: readonly [number, number];
  onChange?: (index: number) => void;
}

interface Controller {
  sync: () => void;
  destroy: () => void;
  ignite: (x?: number, y?: number) => void;
  reset: () => void;
}

interface Hooks {
  onIndex: (index: number) => void;
  onFail: () => void;
}

type Vec = { x: number; y: number };

const DEFAULT_IMAGES: EmberRevealImage[] = [
  { src: "https://pro.reactbits.dev/demo-media/effect-ember-poppy.webp", alt: "Coral-orange poppy with detailed petals against deep wine" },
  { src: "https://pro.reactbits.dev/demo-media/effect-ember-dahlia.webp", alt: "Burgundy dahlia with pink-lit petal edges against dark plum" },
  { src: "https://pro.reactbits.dev/demo-media/effect-ember-iris.webp", alt: "Violet iris petals with a golden throat against deep wine" },
];

const SPARKS = 220;

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

let colorContext: CanvasRenderingContext2D | null = null;

const parseColor = (value: string, fallback: [number, number, number]): [number, number, number] => {
  if (!colorContext) colorContext = document.createElement("canvas").getContext("2d");
  if (!colorContext) return fallback;
  colorContext.fillStyle = "#010203";
  colorContext.fillStyle = value;
  const read = String(colorContext.fillStyle);
  if (read === "#010203" && value.trim().toLowerCase() !== "#010203") return fallback;
  if (read.startsWith("#")) {
    const hex = read.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ];
  }
  const parts = read.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return fallback;
  return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
};

const normalizeImages = (images: EmberRevealImage[] | undefined) => {
  const list = (images && images.length ? images : DEFAULT_IMAGES).map((item, index) =>
    typeof item === "string"
      ? { src: item, alt: `Image ${index + 1}` }
      : { src: item.src, alt: item.alt ?? `Image ${index + 1}` },
  );
  return list.length === 1 ? [list[0], list[0]] : list;
};

const QUAD_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const NOISE = `
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    sum += amp * gradientNoise(p);
    p = turn * p * 2.03 + 11.7;
    amp *= 0.5;
  }
  return sum;
}

float fbm3(vec2 p) {
  float sum = 0.0;
  float amp = 0.6;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    sum += amp * gradientNoise(p);
    p = turn * p * 2.07 + 5.3;
    amp *= 0.5;
  }
  return sum;
}

vec4 bicubic(sampler2D map, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (w1 / g0 - 1.0 + i + 0.5) / size;
  vec2 h1 = (w3 / g1 + 1.0 + i + 0.5) / size;
  return g0.y * (g0.x * texture2D(map, vec2(h0.x, h0.y)) + g1.x * texture2D(map, vec2(h1.x, h0.y))) +
    g1.y * (g0.x * texture2D(map, vec2(h0.x, h1.y)) + g1.x * texture2D(map, vec2(h1.x, h1.y)));
}
`;

const FIELD_FRAGMENT = `
uniform sampler2D uPrevious;
uniform vec2 uAspect;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uPocket;
uniform float uPocketOn;
uniform float uHeal;
uniform vec2 uOrigin;
uniform float uRadius;
uniform float uBurning;
uniform float uClear;
uniform float uFade;
uniform float uLobes;
uniform float uSeed;
varying vec2 vUv;
${NOISE}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  vec4 previous = texture2D(uPrevious, vUv);
  vec2 p = (vUv - 0.5) * uAspect;
  float reach = segment(p, (uFrom - 0.5) * uAspect, (uTo - 0.5) * uAspect);
  float stamp = uPocketOn * (1.0 - smoothstep(0.0, uPocket, reach));
  stamp = stamp * stamp * (3.0 - 2.0 * stamp);
  float pocket = max(previous.r * uHeal, stamp);
  vec2 away = p - (uOrigin - 0.5) * uAspect;
  float lobes = fbm(away * 2.2 + uSeed) * uLobes;
  float front = uBurning * (1.0 - smoothstep(uRadius - 0.16, uRadius + 0.16, length(away) * (1.0 + lobes)));
  float burn = uClear > 0.5 ? 0.0 : max(previous.g, front);
  float before = max(previous.r, previous.g);
  float heat = max(pocket, burn);
  float activity = max(previous.b * uFade, clamp((heat - before) * 24.0, 0.0, 1.0));
  if (uClear > 0.5) activity = 0.0;
  gl_FragColor = vec4(pocket, burn, activity, 1.0);
}
`;


const SMOKE_FRAGMENT = `
uniform sampler2D uSmoke;
uniform sampler2D uField;
uniform vec2 uAspect;
uniform vec2 uTexel;
uniform float uDt;
uniform float uTime;
uniform float uDecay;
uniform float uClear;
varying vec2 vUv;
${NOISE}

void main() {
  vec2 p = vUv * uAspect * 2.6;
  float t = uTime * 0.12;
  float e = 0.02;
  float up = gradientNoise(p + vec2(0.0, e) + t);
  float down = gradientNoise(p - vec2(0.0, e) + t);
  float right = gradientNoise(p + vec2(e, 0.0) - t);
  float left = gradientNoise(p - vec2(e, 0.0) - t);
  vec2 curl = vec2(up - down, left - right) / (2.0 * e);
  vec2 velocity = (vec2(0.0, 0.11) + curl * 0.028) / uAspect;
  vec2 back = vUv - velocity * uDt;
  float centre = texture2D(uSmoke, back).r;
  float spread = (texture2D(uSmoke, back + vec2(uTexel.x, 0.0)).r + texture2D(uSmoke, back - vec2(uTexel.x, 0.0)).r + texture2D(uSmoke, back + vec2(0.0, uTexel.y)).r + texture2D(uSmoke, back - vec2(0.0, uTexel.y)).r) * 0.25;
  float smoke = mix(centre, spread, 0.35) * uDecay;
  smoke += texture2D(uField, vUv).b * uDt * 2.4;
  if (uClear > 0.5) smoke = 0.0;
  gl_FragColor = vec4(min(smoke, 1.2), 0.0, 0.0, 1.0);
}
`;

const DISPLAY_FRAGMENT = `
uniform sampler2D uField;
uniform sampler2D uSmokeMap;
uniform vec2 uFieldSize;
uniform sampler2D uImageA;
uniform sampler2D uImageB;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uEmber;
uniform vec3 uChar;
uniform float uGlow;
uniform float uThrough;
uniform float uEdge;
uniform float uRough;
uniform float uDetail;
uniform float uScorch;
uniform float uSmoke;
uniform float uShimmer;
uniform float uSeed;
uniform float uPixelRatio;
varying vec2 vUv;
${NOISE}

vec2 cover(vec2 uv, vec2 size) {
  float view = uResolution.x / uResolution.y;
  float image = size.x / max(size.y, 1.0);
  vec2 scale = view > image ? vec2(1.0, image / view) : vec2(view / image, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

vec3 emberRamp(float t) {
  vec3 deep = uEmber * vec3(0.55, 0.22, 0.12);
  vec3 hot = mix(uEmber, vec3(1.0, 0.93, 0.78), 0.75);
  return mix(mix(deep, uEmber, smoothstep(0.0, 0.45, t)), hot, smoothstep(0.45, 1.0, t));
}

void main() {
  vec2 pixel = vUv * uResolution;
  float unit = min(uResolution.x, uResolution.y);
  vec2 q = pixel / unit * uDetail + uSeed;
  vec4 field = bicubic(uField, vUv, uFieldSize);
  float heat = clamp(max(field.r, field.g), 0.0, 1.0);
  float touched = smoothstep(0.0005, 0.04, heat);
  float w = max(0.3, uEdge) * uPixelRatio * clamp(unit / uPixelRatio / 520.0, 0.6, 1.6);
  float shape = 0.0;
  vec2 warp = vec2(0.0);
  if (heat > 0.0004) {
    warp = vec2(fbm3(q * 0.6 + 3.1), fbm3(q * 0.6 - 5.3));
    shape = fbm3(q + warp * 1.1);
  }
  float v = heat + uRough * shape * touched - 0.5;
  float slope = max(fwidth(v), 1e-5);
  float d = v / slope;
  float jag = gradientNoise(q * 8.0 + warp * 2.0) * 0.65 + gradientNoise(q * 19.0 + warp) * 0.35;
  d += jag * (2.0 + 5.0 * uRough) * w * (1.0 - smoothstep(20.0 * w, 60.0 * w, abs(d)));
  float shimmerZone = exp(-abs(d + 6.0 * w) / (12.0 * w)) * touched;
  vec2 wobble = vec2(gradientNoise(q * 2.4 + vec2(0.0, -uTime * 1.8)), gradientNoise(q * 2.4 + vec2(7.3, -uTime * 2.1)));
  vec2 bend = wobble * uShimmer * shimmerZone * 2.2 * uPixelRatio / uResolution;
  vec3 a = texture2D(uImageA, cover(vUv + bend, uSizeA)).rgb;
  vec3 b = texture2D(uImageB, cover(vUv + bend * 0.3, uSizeB)).rgb;
  float toast = pow(smoothstep(-0.22, 0.0, v), 2.0) * (1.0 - smoothstep(0.0, 0.02, v)) * touched;
  toast = max(toast, (1.0 - smoothstep(0.0, 16.0 * w, max(-d, 0.0))) * step(d, 0.5) * touched * 0.8);
  float luma = dot(a, vec3(0.299, 0.587, 0.114));
  vec3 browned = vec3(luma) * vec3(1.0, 0.68, 0.4) * 0.8 + vec3(0.05, 0.025, 0.0);
  vec3 paper = mix(a, browned, toast * uScorch * 0.9);
  paper *= 1.0 - toast * uScorch * 0.4;
  float mottle = 0.55 + 0.9 * (0.5 + 0.5 * gradientNoise(q * 12.0 + warp * 4.0));
  float charZone = smoothstep(-10.0 * w, -2.2 * w, d);
  paper = mix(paper, uChar * mottle, charZone * 0.96);
  float cut = smoothstep(-0.6 * uPixelRatio, 0.6 * uPixelRatio, d);
  float soot = max(exp(-max(d, 0.0) / (5.0 * w)), 1.0 - smoothstep(0.0, 0.14, v)) * touched;
  vec3 hole = b * (1.0 - soot * 0.55);
  vec3 color = mix(paper, hole, cut);
  float crawl = gradientNoise(q * 1.4 + vec2(uTime * 0.7, -uTime * 1.1)) + 0.5 * gradientNoise(q * 3.7 - vec2(uTime * 1.9, 0.0));
  float flicker = smoothstep(-0.6, 0.7, crawl);
  float burning = 0.12 + 1.25 * flicker * flicker;
  float thick = 0.7 + 0.7 * smoothstep(-0.4, 0.6, gradientNoise(q * 3.3 - vec2(uTime * 0.5, 0.0)));
  float line = exp(-pow((d + 1.4 * w) / (1.5 * w * thick), 2.0)) * burning;
  float core = exp(-pow((d + 1.1 * w) / (0.7 * w * thick), 2.0)) * burning;
  float embers = smoothstep(0.55, 0.85, gradientNoise(q * 18.0 + warp * 3.0 + vec2(0.0, uTime * 0.4))) * charZone * (1.0 - cut) * smoothstep(-8.0 * w, -3.5 * w, d);
  float halo = exp(-abs(d + 1.5 * w) / (11.0 * w));
  vec3 hot = mix(uEmber, vec3(1.0, 0.9, 0.66), 0.8);
  vec3 deep = uEmber * vec3(0.75, 0.32, 0.16);
  vec3 emit = uEmber * line * 1.1 + hot * core * 0.95 + deep * halo * (0.25 + 0.5 * flicker) + mix(uEmber, hot, 0.4) * embers * (0.35 + 0.65 * flicker);
  emit *= uGlow * touched;
  color = 1.0 - (1.0 - color) * (1.0 - clamp(emit, 0.0, 1.0));
  float smoke = texture2D(uSmokeMap, vUv).r;
  float haze = (1.0 - exp(-smoke * 1.6)) * uSmoke;
  vec3 smokeTone = mix(uChar, vec3(0.56, 0.54, 0.52), 0.7);
  color = mix(color, smokeTone, clamp(haze * 0.55, 0.0, 0.6));
  /* burnThrough: what has burnt away is clear, not the next image.
     Only the fire and smoke left in the hole keep any coverage; the output
     is premultiplied, as the canvas is. */
  float coverage = 1.0;
  if (uThrough > 0.5) {
    float lit = clamp(max(max(emit.r, emit.g), emit.b) + haze * 0.55, 0.0, 1.0);
    coverage = mix(1.0, lit, cut);
    color = mix(color, emit + smokeTone * clamp(haze * 0.55, 0.0, 0.6), cut);
  }
  if (uThrough > 1.5) {
    float lit2 = clamp(max(max(emit.r, emit.g), emit.b), 0.0, 1.0);
    float rim = charZone * (1.0 - cut) * 0.95;
    float hazeA = clamp(haze * 0.55, 0.0, 0.6) * (1.0 - cut);
    vec3 outside = uChar * mottle * rim + emit + smokeTone * hazeA;
    vec3 inside = 1.0 - (1.0 - hole) * (1.0 - clamp(emit, 0.0, 1.0));
    color = mix(outside, inside, cut);
    coverage = mix(clamp(rim + lit2 + hazeA, 0.0, 1.0), 1.0, cut);
  }
  gl_FragColor = vec4(color, coverage);
}
`;

const SPARK_VERTEX = `
uniform sampler2D uField;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPocketAt;
uniform float uPocketReach;
uniform vec2 uOrigin;
uniform float uRadius;
uniform float uBurning;
uniform vec2 uAspect;
uniform float uAmount;
uniform float uScale;
attribute float aSeed;
varying float vAlpha;
varying float vHeat;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  float period = 0.55 + hash(aSeed * 3.1) * 0.6;
  float phase = hash(aSeed * 7.7);
  float clock = uTime / period + phase;
  float cycle = floor(clock);
  float age = fract(clock);
  float seed = aSeed * 13.1 + cycle * 1.618;
  vec2 spawn = vec2(-1.0);
  float best = 0.0;
  bool pocketSide = hash(seed + 2.0) < 0.5 || uBurning < 0.5;
  for (int k = 0; k < 6; k++) {
    float fk = float(k);
    float angle = hash(seed + fk * 3.7) * 6.2831853;
    vec2 candidate;
    if (pocketSide) {
      float r = uPocketReach * (0.4 + 0.8 * hash(seed + 4.0 + fk));
      candidate = uPocketAt + vec2(cos(angle), sin(angle)) * r / uAspect;
    } else {
      float r = uRadius * (0.62 + 0.76 * hash(seed + 4.0 + fk));
      candidate = uOrigin + vec2(cos(angle), sin(angle)) * r / uAspect;
    }
    vec4 probe = texture2D(uField, candidate);
    float edge = 1.0 - smoothstep(0.08, 0.2, abs(max(probe.r, probe.g) - 0.5));
    float score = probe.b * edge * step(0.0, candidate.x) * step(candidate.x, 1.0) * step(0.0, candidate.y) * step(candidate.y, 1.0);
    if (score > best) {
      best = score;
      spawn = candidate;
    }
  }
  float live = smoothstep(0.25, 0.7, best);
  float keep = step(hash(seed + 9.0), uAmount);
  vec2 velocity = vec2((hash(seed + 5.0) - 0.5) * 0.16, 0.08 + hash(seed + 6.0) * 0.2);
  vec2 drift = vec2(sin(age * 9.0 + seed) * 0.012, 0.0);
  vec2 at = spawn + (velocity * age - vec2(0.0, 0.1) * age * age + drift) * vec2(1.0 / uAspect.x, 1.0);
  vAlpha = live * keep * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.35, 1.0, age));
  vHeat = 1.0 - age;
  gl_Position = vec4(at * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = vAlpha > 0.0 ? (2.0 + 2.6 * hash(seed + 8.0)) * uScale * (1.0 - age * 0.55) : 0.0;
}
`;

const SPARK_FRAGMENT = `
uniform vec3 uEmber;
varying float vAlpha;
varying float vHeat;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float falloff = exp(-dot(c, c) * 18.0);
  vec3 hot = mix(uEmber, vec3(1.0, 0.86, 0.52), vHeat * 0.55);
  gl_FragColor = vec4(hot * 1.2, falloff * vAlpha);
}
`;

const createReveal = (
  root: HTMLDivElement,
  settingsRef: { current: Settings },
  hooks: Hooks,
): Controller | null => {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 240ms ease";
  root.appendChild(canvas);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: !!settingsRef.current.burnThrough,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (settingsRef.current.burnThrough) renderer.setClearColor(0x000000, 0);
  } catch {
    canvas.remove();
    return null;
  }
  renderer.autoClear = true;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const plane = new THREE.PlaneGeometry(2, 2);
  const targetOptions = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let fields = [new THREE.WebGLRenderTarget(4, 4, targetOptions), new THREE.WebGLRenderTarget(4, 4, targetOptions)];
  let smokes = [new THREE.WebGLRenderTarget(4, 4, targetOptions), new THREE.WebGLRenderTarget(4, 4, targetOptions)];

  const fieldMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPrevious: { value: null as THREE.Texture | null },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uFrom: { value: new THREE.Vector2(0.5, 0.5) },
      uTo: { value: new THREE.Vector2(0.5, 0.5) },
      uPocket: { value: 0.1 },
      uPocketOn: { value: 0 },
      uHeal: { value: 1 },
      uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uRadius: { value: 0 },
      uBurning: { value: 0 },
      uClear: { value: 0 },
      uFade: { value: 1 },
      uLobes: { value: 0.3 },
      uSeed: { value: Math.random() * 40 },
    },
    vertexShader: QUAD_VERTEX,
    fragmentShader: FIELD_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  const smokeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSmoke: { value: null as THREE.Texture | null },
      uField: { value: null as THREE.Texture | null },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uTexel: { value: new THREE.Vector2(0.01, 0.01) },
      uDt: { value: 0.016 },
      uTime: { value: 0 },
      uDecay: { value: 0.98 },
      uClear: { value: 0 },
    },
    vertexShader: QUAD_VERTEX,
    fragmentShader: SMOKE_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uField: { value: null as THREE.Texture | null },
      uSmokeMap: { value: null as THREE.Texture | null },
      uFieldSize: { value: new THREE.Vector2(1, 1) },
      uImageA: { value: null as THREE.Texture | null },
      uImageB: { value: null as THREE.Texture | null },
      uSizeA: { value: new THREE.Vector2(1, 1) },
      uSizeB: { value: new THREE.Vector2(1, 1) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uEmber: { value: new THREE.Vector3(1, 0.42, 0.1) },
      uChar: { value: new THREE.Vector3(0.1, 0.06, 0.04) },
      uGlow: { value: 1 },
      uThrough: { value: 0 },
      uEdge: { value: 1 },
      uRough: { value: 0.35 },
      uDetail: { value: 5 },
      uScorch: { value: 0.7 },
      uSmoke: { value: 0.5 },
      uShimmer: { value: 0.6 },
      uSeed: { value: Math.random() * 40 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: QUAD_VERTEX,
    fragmentShader: DISPLAY_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });

  const seeds = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) seeds[i] = i + 1;
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
  sparkGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const sparkMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uField: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uPocketAt: { value: new THREE.Vector2(-1, -1) },
      uPocketReach: { value: 0.1 },
      uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uRadius: { value: 0 },
      uBurning: { value: 0 },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uAmount: { value: 0.5 },
      uScale: { value: 1 },
      uEmber: { value: new THREE.Vector3(1, 0.42, 0.1) },
    },
    vertexShader: SPARK_VERTEX,
    fragmentShader: SPARK_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });

  const fieldScene = new THREE.Scene();
  fieldScene.add(new THREE.Mesh(plane, fieldMaterial));
  const smokeScene = new THREE.Scene();
  smokeScene.add(new THREE.Mesh(plane, smokeMaterial));
  const displayScene = new THREE.Scene();
  const displayMesh = new THREE.Mesh(plane, displayMaterial);
  displayMesh.frustumCulled = false;
  const sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial);
  sparkPoints.frustumCulled = false;
  sparkPoints.renderOrder = 1;
  displayScene.add(displayMesh, sparkPoints);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const textures = new Map<string, THREE.Texture | "loading" | "failed">();

  let destroyed = false;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let visible = true;
  let width = 1;
  let height = 1;
  let ratio = 1;
  let index = 0;
  let ready = false;
  let shown = false;
  const pointer: Vec = { x: 0.5, y: 0.5 };
  const pocket: Vec = { x: 0.5, y: 0.5 };
  const pocketVelocity: Vec = { x: 0, y: 0 };
  const previousPocket: Vec = { x: 0.5, y: 0.5 };
  let hovering = false;
  let pocketLevel = 0;
  let pocketResidue = 0;
  let burning = false;
  let burnRadius = 0;
  let burnTime = 0;
  let burnReach = 1;
  const origin: Vec = { x: 0.5, y: 0.5 };
  let clearNext = false;
  let interactedAt = -1e9;
  let nextAuto = performance.now() + 1600;
  const ghost = { active: false, time: 0, seed: Math.random() * 10 };

  const source = (offset: number) => {
    const list = settingsRef.current.sources;
    return list[(index + offset + list.length * 4) % list.length];
  };

  const request = (src: string) => {
    const existing = textures.get(src);
    if (existing) return existing;
    textures.set(src, "loading");
    loader.load(
      src,
      (texture) => {
        if (destroyed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.NoColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        textures.set(src, texture);
        wake();
      },
      undefined,
      () => {
        textures.set(src, "failed");
        const list = settingsRef.current.sources;
        if (list.every((item) => textures.get(item.src) === "failed")) hooks.onFail();
      },
    );
    return "loading";
  };

  const textureFor = (offset: number) => {
    const entry = request(source(offset).src);
    return entry instanceof THREE.Texture ? entry : null;
  };

  const imageSize = (texture: THREE.Texture) => {
    const image = texture.image as { width?: number; height?: number } | undefined;
    return { x: image?.width || 1, y: image?.height || 1 };
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    const scale = Math.min(1, 640 / Math.max(width, height));
    const fieldWidth = Math.max(8, Math.round(width * scale));
    const fieldHeight = Math.max(8, Math.round(height * scale));
    fields.forEach((target) => target.dispose());
    smokes.forEach((target) => target.dispose());
    fields = [new THREE.WebGLRenderTarget(fieldWidth, fieldHeight, targetOptions), new THREE.WebGLRenderTarget(fieldWidth, fieldHeight, targetOptions)];
    const smokeWidth = Math.max(8, Math.round(fieldWidth / 2));
    const smokeHeight = Math.max(8, Math.round(fieldHeight / 2));
    smokes = [new THREE.WebGLRenderTarget(smokeWidth, smokeHeight, targetOptions), new THREE.WebGLRenderTarget(smokeWidth, smokeHeight, targetOptions)];
    [...fields, ...smokes].forEach((target) => {
      renderer.setRenderTarget(target);
      renderer.clear();
    });
    displayMaterial.uniforms.uFieldSize.value.set(fieldWidth, fieldHeight);
    smokeMaterial.uniforms.uTexel.value.set(1 / smokeWidth, 1 / smokeHeight);
    renderer.setRenderTarget(null);
    const aspect = width / height;
    const vector = aspect >= 1 ? new THREE.Vector2(aspect, 1) : new THREE.Vector2(1, 1 / aspect);
    fieldMaterial.uniforms.uAspect.value.copy(vector);
    smokeMaterial.uniforms.uAspect.value.copy(vector);
    sparkMaterial.uniforms.uAspect.value.copy(vector);
    displayMaterial.uniforms.uResolution.value.set(width * ratio, height * ratio);
    sparkMaterial.uniforms.uResolution.value.set(width * ratio, height * ratio);
    sparkMaterial.uniforms.uScale.value = ratio;
    displayMaterial.uniforms.uPixelRatio.value = ratio;
    wake();
  };

  const farthest = (point: Vec) => {
    const aspect = fieldMaterial.uniforms.uAspect.value as THREE.Vector2;
    let best = 0;
    for (const corner of [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]) {
      best = Math.max(best, Math.hypot((corner.x - point.x) * aspect.x, (corner.y - point.y) * aspect.y));
    }
    return best;
  };

  let queued: Vec | null = null;

  const ignite = (x = 0.5, y = 0.5) => {
    const settings = settingsRef.current;
    if (!ready) return;
    if (burning) {
      queued = { x, y };
      return;
    }
    if (settings.reduced) {
      index = (index + 1) % settings.sources.length;
      hooks.onIndex(index);
      settings.onChange?.(index);
      wake();
      return;
    }
    origin.x = clamp(x, 0, 1);
    origin.y = clamp(y, 0, 1);
    burning = true;
    burnTime = 0;
    burnRadius = 0;
    burnReach = farthest(origin) + 0.25 + settings.roughness * 0.4;
    wake();
  };

  const finishBurn = () => {
    const settings = settingsRef.current;
    burning = false;
    burnRadius = 0;
    clearNext = true;
    index = (index + 1) % settings.sources.length;
    hooks.onIndex(index);
    settings.onChange?.(index);
    if (queued) {
      const next = queued;
      queued = null;
      window.setTimeout(() => {
        if (!destroyed) ignite(next.x, next.y);
      }, 60);
    }
  };

  const step = (dt: number, now: number) => {
    const settings = settingsRef.current;
    clock += dt;
    const idle = now - interactedAt > settings.idleDelay * 1000;
    ghost.active = settings.autoplay && !settings.reduced && !hovering && idle && visible;
    let target: Vec | null = hovering ? pointer : null;
    if (ghost.active) {
      ghost.time += dt;
      const t = ghost.time * 0.32 + ghost.seed;
      target = {
        x: 0.5 + 0.3 * Math.sin(t * 1.3) * Math.cos(t * 0.41),
        y: 0.5 + 0.26 * Math.sin(t * 0.9 + 1.1),
      };
      if (!burning && now >= nextAuto && ready) {
        ignite(target.x, target.y);
        nextAuto = now + settings.interval * 1000 + settings.burnDuration * 1000;
      }
    }
    const pocketWanted = !!target && settings.hover && !settings.reduced && settings.pocketSize > 0;
    pocketLevel += ((pocketWanted ? 1 : 0) - pocketLevel) * (1 - Math.exp(-dt / 0.12));
    previousPocket.x = pocket.x;
    previousPocket.y = pocket.y;
    if (target) {
      const follow = Math.max(0.01, settings.follow);
      const omega = 2 / follow;
      const count = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / count;
      for (let i = 0; i < count; i++) {
        pocketVelocity.x += (omega * omega * (target.x - pocket.x) - 2 * omega * pocketVelocity.x) * h;
        pocketVelocity.y += (omega * omega * (target.y - pocket.y) - 2 * omega * pocketVelocity.y) * h;
        pocket.x += pocketVelocity.x * h;
        pocket.y += pocketVelocity.y * h;
      }
      if (pocketLevel < 0.02) {
        pocket.x = target.x;
        pocket.y = target.y;
        previousPocket.x = target.x;
        previousPocket.y = target.y;
        pocketVelocity.x = 0;
        pocketVelocity.y = 0;
      }
    }
    pocketResidue = Math.max(pocketLevel, pocketResidue * Math.exp(-dt / Math.max(0.05, settings.heal)));
    if (burning || pocketLevel > 0.01) smokeUntil = now + 2600;
    if (burning) {
      burnTime += dt;
      const speed = burnReach / Math.max(0.3, settings.burnDuration);
      burnRadius += speed * dt * Math.min(1, 0.25 + burnTime / 0.35);
      if (burnRadius >= burnReach) finishBurn();
    }
  };

  const render = (dt: number) => {
    const settings = settingsRef.current;
    const a = textureFor(0);
    const b = textureFor(1);
    textureFor(2);
    if (!a || !b) return false;
    if (!ready) {
      ready = true;
    { const at = settingsRef.current.igniteAt; if (at) window.setTimeout(() => !destroyed && ignite(at[0], at[1]), 30); }
      hooks.onIndex(index);
    }
    const unit = Math.min(width, height);
    const [er, eg, eb] = parseColor(settings.emberColor, [1, 0.42, 0.1]);
    const [cr, cg, cb] = parseColor(settings.charColor, [0.1, 0.06, 0.04]);
    const fieldUniforms = fieldMaterial.uniforms;
    fieldUniforms.uPrevious.value = fields[0].texture;
    fieldUniforms.uFrom.value.set(previousPocket.x, 1 - previousPocket.y);
    fieldUniforms.uTo.value.set(pocket.x, 1 - pocket.y);
    fieldUniforms.uPocket.value = (clamp(settings.pocketSize, 0, 400) / unit) * 1.35;
    fieldUniforms.uPocketOn.value = pocketLevel;
    fieldUniforms.uHeal.value = Math.exp(-dt / Math.max(0.05, settings.heal));
    fieldUniforms.uOrigin.value.set(origin.x, 1 - origin.y);
    fieldUniforms.uRadius.value = burnRadius;
    fieldUniforms.uBurning.value = burning ? 1 : 0;
    fieldUniforms.uClear.value = clearNext ? 1 : 0;
    fieldUniforms.uFade.value = Math.exp(-dt / 0.45);
    renderer.setRenderTarget(fields[1]);
    renderer.render(fieldScene, camera);
    renderer.setRenderTarget(null);
    fields = [fields[1], fields[0]];
    const smoke = smokeMaterial.uniforms;
    smoke.uSmoke.value = smokes[0].texture;
    smoke.uField.value = fields[0].texture;
    smoke.uDt.value = dt;
    smoke.uTime.value = clock;
    smoke.uDecay.value = Math.exp(-dt / 1.1);
    smoke.uClear.value = settings.smoke > 0 && !settings.reduced ? 0 : 1;
    renderer.setRenderTarget(smokes[1]);
    renderer.render(smokeScene, camera);
    renderer.setRenderTarget(null);
    smokes = [smokes[1], smokes[0]];
    clearNext = false;
    const display = displayMaterial.uniforms;
    display.uField.value = fields[0].texture;
    display.uSmokeMap.value = smokes[0].texture;
    display.uImageA.value = a;
    display.uImageB.value = b;
    const sizeA = imageSize(a);
    const sizeB = imageSize(b);
    display.uSizeA.value.set(sizeA.x, sizeA.y);
    display.uSizeB.value.set(sizeB.x, sizeB.y);
    display.uTime.value = clock;
    display.uEmber.value.set(er, eg, eb);
    display.uChar.value.set(cr, cg, cb);
    display.uGlow.value = clamp(settings.glow, 0, 3);
    display.uThrough.value = settings.burnThrough === "form" ? 2 : settings.burnThrough ? 1 : 0;
    display.uEdge.value = clamp(settings.edge, 0.2, 4);
    display.uRough.value = clamp(settings.roughness, 0, 1) * 1.1;
    fieldUniforms.uLobes.value = clamp(settings.roughness, 0, 1) * 0.55;
    display.uDetail.value = clamp(settings.detail, 0.5, 20);
    display.uScorch.value = clamp(settings.scorch, 0, 1);
    display.uSmoke.value = settings.reduced ? 0 : clamp(settings.smoke, 0, 1);
    display.uShimmer.value = settings.reduced ? 0 : clamp(settings.shimmer, 0, 1);
    const spark = sparkMaterial.uniforms;
    spark.uField.value = fields[0].texture;
    spark.uTime.value = clock;
    spark.uPocketAt.value.set(pocket.x, 1 - pocket.y);
    spark.uPocketReach.value = (clamp(settings.pocketSize, 0, 400) / unit) * 1.0;
    spark.uOrigin.value.set(origin.x, 1 - origin.y);
    spark.uRadius.value = burnRadius;
    spark.uBurning.value = burning ? 1 : 0;
    spark.uAmount.value = settings.reduced ? 0 : clamp(settings.sparks, 0, 1);
    spark.uEmber.value.set(er, eg, eb);
    sparkPoints.visible = spark.uAmount.value > 0;
    renderer.render(displayScene, camera);
    if (!shown) {
      shown = true;
      canvas.style.opacity = "1";
    }
    return true;
  };

  let smokeUntil = 0;
  const busy = () =>
    burning || pocketLevel > 0.001 || pocketResidue > 0.002 || ghost.active || hovering || !ready || performance.now() < smokeUntil;

  const frame = (now: number) => {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt, now);
    render(dt || 1 / 60);
    if (visible && busy()) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const settings = settingsRef.current;
    if (settings.autoplay && !settings.reduced && visible) {
      const wait = Math.max(interactedAt + settings.idleDelay * 1000, nextAuto) - now;
      window.clearTimeout(timer);
      timer = window.setTimeout(wake, Math.max(30, Math.min(wait, 2000)));
    }
  };

  let timer = 0;
  const wake = () => {
    if (destroyed || raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const local = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
      y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
    };
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const point = local(event);
    pointer.x = point.x;
    pointer.y = point.y;
    if (!hovering) {
      pocket.x = point.x;
      pocket.y = point.y;
    }
    hovering = true;
    interactedAt = performance.now();
    wake();
  };

  const onLeave = () => {
    hovering = false;
    interactedAt = performance.now();
    wake();
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const settings = settingsRef.current;
    interactedAt = performance.now();
    nextAuto = performance.now() + settings.interval * 1000;
    if (!settings.clickToBurn) return;
    const point = local(event);
    ignite(point.x, point.y);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    interactedAt = performance.now();
    if (settingsRef.current.clickToBurn) ignite(0.5, 0.5);
  };

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("keydown", onKey);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) wake();
    },
    { rootMargin: "100px" },
  );
  intersection.observe(root);
  const onLost = (event: Event) => {
    event.preventDefault();
    hooks.onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  resize();

  return {
    sync: () => {
      const settings = settingsRef.current;
      if (index >= settings.sources.length) index = 0;
      wake();
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("keydown", onKey);
      canvas.removeEventListener("webglcontextlost", onLost);
      resizeObserver.disconnect();
      intersection.disconnect();
      fields.forEach((target) => target.dispose());
      smokes.forEach((target) => target.dispose());
      smokeMaterial.dispose();
      textures.forEach((entry) => {
        if (entry instanceof THREE.Texture) entry.dispose();
      });
      plane.dispose();
      sparkGeometry.dispose();
      fieldMaterial.dispose();
      displayMaterial.dispose();
      sparkMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    ignite: (x?: number, y?: number) => {
      interactedAt = performance.now();
      ignite(x ?? 0.5, y ?? 0.5);
    },
    reset: () => {
      burning = false;
      burnRadius = 0;
      clearNext = true;
      index = 0;
      hooks.onIndex(0);
      wake();
    },
  };
};

const EmberReveal = forwardRef<EmberRevealHandle, EmberRevealProps>(function EmberReveal(
  {
    images,
    aspectRatio = 4 / 3,
    radius = 16,
    emberColor = "#FF7A1F",
    charColor = "#1C120C",
    glow = 1,
    edge = 1,
    roughness = 0.5,
    detail = 5,
    scorch = 0.7,
    smoke = 0.4,
    sparks = 0.5,
    shimmer = 0.6,
    burnDuration = 1.8,
    pocketSize = 90,
    heal = 0.3,
    follow = 0.12,
    hover = true,
    clickToBurn = true,
    autoplay = false,
    interval = 3.5,
    idleDelay = 2.5,
    burnThrough = false,
    igniteAt,
    onChange,
    className,
    style,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const reduced = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
  const [current, setCurrent] = useState(0);
  const [fallback, setFallback] = useState(false);
  const sources = normalizeImages(images);
  const sourceKey = sources.map((item) => item.src).join("|");
  const settingsRef = useRef<Settings>({
    sources,
    emberColor,
    charColor,
    glow,
    edge,
    roughness,
    detail,
    scorch,
    smoke,
    sparks,
    shimmer,
    burnDuration,
    pocketSize,
    heal,
    follow,
    hover,
    clickToBurn,
    autoplay,
    interval,
    idleDelay,
    reduced,
    burnThrough,
    igniteAt,
    onChange,
  });

  useEffect(() => {
    settingsRef.current = {
      sources,
      emberColor,
      charColor,
      glow,
      edge,
      roughness,
      detail,
      scorch,
      smoke,
      sparks,
      shimmer,
      burnDuration,
      pocketSize,
      heal,
      follow,
      hover,
      clickToBurn,
      autoplay,
      interval,
      idleDelay,
      reduced,
      burnThrough,
      igniteAt,
      onChange,
    };
    controllerRef.current?.sync();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const controller = createReveal(root, settingsRef, {
      onIndex: setCurrent,
      onFail: () => setFallback(true),
    });
    controllerRef.current = controller;
    if (!controller) queueMicrotask(() => setFallback(true));
    return () => {
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [sourceKey]);

  useImperativeHandle(
    ref,
    () => ({
      ignite: (x?: number, y?: number) => controllerRef.current?.ignite(x, y),
      next: () => {
        if (controllerRef.current) controllerRef.current.ignite(0.5, 0.5);
        else setCurrent((value) => (value + 1) % sources.length);
      },
      reset: () => {
        controllerRef.current?.reset();
        setCurrent(0);
      },
    }),
    [sources.length],
  );

  const active = sources[current % sources.length];
  const upcoming = sources[(current + 1) % sources.length];

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={`${active.alt}. Press to burn through to ${upcoming.alt}.`}
      className={cn(
        "relative isolate w-full cursor-crosshair touch-manipulation select-none overflow-hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        className,
      )}
      style={{
        aspectRatio: aspectRatio > 0 ? String(aspectRatio) : undefined,
        height: aspectRatio > 0 ? undefined : "100%",
        borderRadius: radius,
        background: burnThrough ? "transparent" : "#0a0a0a",
        ...style,
      }}
      onClick={() => {
        if (fallback) setCurrent((value) => (value + 1) % sources.length);
      }}
    >
      {burnThrough && !fallback ? null : <img
        src={active.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />}
    </div>
  );
});

EmberReveal.displayName = "EmberReveal";

export { EmberReveal };
export default EmberReveal;
