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

export interface ExpandingGridItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface ExpandingGridProps {
  items?: ExpandingGridItem[];
  columns?: number;
  tileSize?: number;
  magnify?: number;
  lensSize?: number;
  fill?: number;
  radius?: number;
  saturation?: number;
  dim?: number;
  follow?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  openOnClick?: boolean;
  captions?: boolean;
  interactive?: boolean;
  backgroundColor?: string;
  seed?: number;
  paused?: boolean;
  dpr?: number;
  ariaLabel?: string;
  onOpen?: (item: ExpandingGridItem | null, index: number) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface ExpandingGridHandle {
  open: (index: number) => void;
  close: () => void;
  focusAt: (x: number, y: number) => void;
}

type Settings = Required<
  Omit<ExpandingGridProps, "className" | "style" | "children" | "onOpen" | "ariaLabel">
> & {
  reduced: boolean;
};

interface Controller {
  sync: () => void;
  open: (index: number) => void;
  close: () => void;
  focusAt: (x: number, y: number) => void;
  destroy: () => void;
}

interface Tile {
  gx: number;
  gy: number;
  x: number;
  y: number;
  size: number;
  z: number;
  image: number;
}

interface Opened {
  tile: number;
  image: number;
  e: number;
  v: number;
  target: number;
  x: number;
  y: number;
  size: number;
  aspect: number;
  aspectV: number;
}

const MAX_TILES = 640;
const MAX_ITEMS = 48;
const MIN_PITCH = 44;
const TAU = Math.PI * 2;

const defaultItems: ExpandingGridItem[] = [
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-indigo.webp",
    alt: "Studio portrait with short dark hair and a cobalt jacket",
    title: "Indigo",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-sienna.webp",
    alt: "Studio portrait with short natural hair and a burnt-orange top",
    title: "Sienna",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-pearl.webp",
    alt: "Studio portrait with long black hair and an ivory shirt",
    title: "Pearl",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-ochre.webp",
    alt: "Studio portrait with curly dark hair and an ochre knit",
    title: "Ochre",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-teal.webp",
    alt: "Studio portrait with a shaved head and a teal jacket",
    title: "Teal",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-olive.webp",
    alt: "Studio portrait with a dark bob and an olive top",
    title: "Olive",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-rose.webp",
    alt: "Studio portrait with curly red hair and burgundy clothing",
    title: "Rose",
    subtitle: "Studio portrait",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/portrait-silver.webp",
    alt: "Studio portrait with cropped grey hair and a black shirt",
    title: "Silver",
    subtitle: "Studio portrait",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  ratio = 1,
) => {
  const omega = TAU / Math.max(response, 0.02);
  const substeps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / substeps;
  let v = velocity;
  let x = value;
  for (let i = 0; i < substeps; i++) {
    v += (omega * omega * (target - x) - 2 * ratio * omega * v) * h;
    x += v * h;
  }
  return [x, v] as const;
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

const tileVertexShader = `
attribute vec4 aTile;
attribute vec4 aLook;
varying vec2 vLocal;
varying float vSize;
varying vec4 vLook;

void main() {
  vLocal = position.xy;
  vSize = aTile.z;
  vLook = aLook;
  vec3 world = vec3(aTile.x + position.x * aTile.z, -aTile.y + position.y * aTile.z, aTile.w);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;

const tileFragmentShader = `
precision highp float;

uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform float uInset;
uniform float uLoaded[${MAX_ITEMS}];
uniform float uRadius;
uniform float uDim;
varying vec2 vLocal;
varying float vSize;
varying vec4 vLook;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = vLocal * vSize;
  float d = roundBox(p, vec2(vSize * 0.5), uRadius * vSize);
  float aa = max(fwidth(d), 1e-3) * 0.75;
  float cover = 1.0 - smoothstep(-aa, aa, d);
  if (cover < 0.004) discard;
  float which = floor(vLook.x + 0.5);
  vec2 slot = vec2(mod(which, uGrid.x), floor(which / uGrid.x));
  vec2 uv = clamp(vLocal + 0.5, 0.0, 1.0);
  float inner = 1.0 - 2.0 * uInset;
  vec2 atlasUv = vec2(
    (slot.x + uInset + uv.x * inner) / uGrid.x,
    1.0 - (slot.y + uInset + (1.0 - uv.y) * inner) / uGrid.y
  );
  vec3 image = texture2D(uAtlas, atlasUv).rgb;
  float luma = dot(image, vec3(0.2126, 0.7152, 0.0722));
  vec3 color = mix(vec3(luma), image, clamp(vLook.y, 0.0, 1.0));
  float loaded = uLoaded[int(which)];
  color = mix(vec3(0.5), color, loaded);
  float alpha = cover * vLook.z * mix(0.35, 1.0, loaded) * (1.0 - uDim);
  gl_FragColor = vec4(color * alpha, alpha);
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
uniform vec2 uSize;
uniform float uRadius;
uniform float uSaturation;
varying vec2 vUv;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = roundBox(p, uSize * 0.5, uRadius);
  float aa = max(fwidth(d), 1e-3) * 0.75;
  float cover = 1.0 - smoothstep(-aa, aa, d);
  if (cover < 0.004) discard;
  float planeAspect = uSize.x / max(uSize.y, 1.0);
  vec2 uv = vUv - 0.5;
  if (planeAspect < uImageAspect) {
    uv.x *= planeAspect / uImageAspect;
  } else {
    uv.y *= uImageAspect / planeAspect;
  }
  vec3 image = texture2D(uImage, uv + 0.5).rgb;
  float luma = dot(image, vec3(0.2126, 0.7152, 0.0722));
  vec3 color = mix(vec3(luma), image, uSaturation);
  gl_FragColor = vec4(color * cover, cover);
}
`;

const createGrid = (
  root: HTMLElement,
  stage: HTMLElement,
  settingsRef: { current: Settings },
  itemsRef: { current: ExpandingGridItem[] },
  onOpen: (image: number) => void,
): Controller | null => {
  const doc = root.ownerDocument;
  const canvas = doc.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
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
  const tileUniforms = {
    uAtlas: { value: null as THREE.Texture | null },
    uGrid: { value: new THREE.Vector2(1, 1) },
    uInset: { value: 0.004 },
    uLoaded: { value: loaded },
    uRadius: { value: 0.16 },
    uDim: { value: 0 },
  };
  const tileMaterial = new THREE.ShaderMaterial({
    uniforms: tileUniforms,
    vertexShader: tileVertexShader,
    fragmentShader: tileFragmentShader,
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
  const tileData = new Float32Array(MAX_TILES * 4);
  const lookData = new Float32Array(MAX_TILES * 4);
  const tileAttribute = new THREE.InstancedBufferAttribute(tileData, 4);
  const lookAttribute = new THREE.InstancedBufferAttribute(lookData, 4);
  tileAttribute.setUsage(THREE.DynamicDrawUsage);
  lookAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aTile", tileAttribute);
  geometry.setAttribute("aLook", lookAttribute);
  geometry.instanceCount = 0;
  const mesh = new THREE.Mesh(geometry, tileMaterial);
  mesh.frustumCulled = false;

  const photoUniforms = {
    uImage: { value: null as THREE.Texture | null },
    uImageAspect: { value: 0.8 },
    uSize: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: 8 },
    uSaturation: { value: 1 },
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
  scene.add(mesh, photo);
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, 0.1, 20);
  camera.position.set(0, 0, 5);

  let atlasCanvas: HTMLCanvasElement | null = null;
  let atlasTexture: THREE.CanvasTexture | null = null;
  let images: HTMLImageElement[] = [];
  const imageTextures = new Map<number, THREE.Texture>();
  let itemsKey = "";
  let layoutKey = "";
  let width = 1;
  let height = 1;
  let dpr = 1;
  let pitch = 80;
  let cols = 1;
  let rows = 1;
  let tiles: Tile[] = [];
  let order: number[] = [];
  const lens = { x: 0, y: 0, vx: 0, vy: 0, strength: 0, strengthV: 0 };
  let placed = false;
  let pathClock = 0;
  let keyboard: { col: number; row: number } | null = null;
  let hovered = -1;
  let opened: Opened | null = null;
  let raf = 0;
  let last = 0;
  let visible = false;
  let destroyed = false;
  let lost = false;
  const pointer = { x: 0, y: 0, inside: false };
  let press: { id: number; x: number; y: number } | null = null;

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
    const slot = count <= 36 ? 320 : 256;
    const gridCols = Math.ceil(Math.sqrt(count));
    const gridRows = Math.ceil(count / gridCols);
    const canvasAtlas = doc.createElement("canvas");
    canvasAtlas.width = gridCols * slot;
    canvasAtlas.height = gridRows * slot;
    atlasCanvas = canvasAtlas;
    const context = canvasAtlas.getContext("2d");
    atlasTexture = new THREE.CanvasTexture(canvasAtlas);
    atlasTexture.colorSpace = THREE.NoColorSpace;
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.generateMipmaps = true;
    atlasTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tileUniforms.uAtlas.value = atlasTexture;
    tileUniforms.uGrid.value.set(gridCols, gridRows);
    tileUniforms.uInset.value = 1.5 / slot;
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
          (image.naturalHeight - side) * 0.3,
          side,
          side,
          (index % gridCols) * slot,
          Math.floor(index / gridCols) * slot,
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
    layoutKey = "";
  };

  const layout = () => {
    const settings = settingsRef.current;
    const rect = root.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, Math.max(settings.dpr, 0.5));
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const items = Math.max(1, Math.min(itemsRef.current.length, MAX_ITEMS));
    const key = [nextWidth, nextHeight, nextDpr, settings.columns, settings.seed, items].join("|");
    if (key === layoutKey) return false;
    layoutKey = key;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = -height;
    camera.updateProjectionMatrix();

    pitch = Math.max(width / clamp(Math.round(settings.columns), 3, 40), MIN_PITCH);
    cols = Math.max(1, Math.floor(width / pitch));
    rows = Math.max(1, Math.floor(height / pitch));
    while (cols * rows > MAX_TILES) {
      pitch *= 1.08;
      cols = Math.max(1, Math.floor(width / pitch));
      rows = Math.max(1, Math.floor(height / pitch));
    }
    const offsetX = (width - cols * pitch) / 2 + pitch / 2;
    const offsetY = (height - rows * pitch) / 2 + pitch / 2;
    const shuffle = Array.from({ length: items }, (_, i) => i);
    let state = Math.imul(Math.floor(settings.seed) + 5, 2654435761) >>> 0 || 1;
    for (let i = shuffle.length - 1; i > 0; i--) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      const j = state % (i + 1);
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    const stride = items > 6 ? [5, 7, 3, 11, 13].find((s) => items % s !== 0 && s < items) ?? 1 : 1;
    tiles = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tiles.push({
          gx: offsetX + col * pitch,
          gy: offsetY + row * pitch,
          x: 0,
          y: 0,
          size: 0,
          z: 0,
          image: shuffle[(col + row * stride) % items],
        });
      }
    }
    order = tiles.map((_, i) => i);
    if (!placed) {
      lens.x = width / 2;
      lens.y = height / 2;
      placed = true;
    }
    if (keyboard) {
      keyboard.col = clamp(keyboard.col, 0, cols - 1);
      keyboard.row = clamp(keyboard.row, 0, rows - 1);
    }
    if (opened && opened.tile >= tiles.length) {
      opened = null;
      photo.visible = false;
    }
    return true;
  };

  const pathPoint = (t: number) => ({
    x: width / 2 + width * 0.32 * Math.sin(t * 0.23 + 0.7),
    y: height / 2 + height * 0.28 * Math.sin(t * 0.31 + 0.2),
  });

  const pick = (x: number, y: number) => {
    const tolerance = pitch * 0.18;
    let best = -1;
    let bestScore = Infinity;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const half = tile.size / 2;
      const dx = Math.max(Math.abs(x - tile.x) - half, 0);
      const dy = Math.max(Math.abs(y - tile.y) - half, 0);
      const outside = Math.hypot(dx, dy);
      if (outside > tolerance) continue;
      const score = outside - tile.z * 0.01;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  };

  const schedule = () => {
    if (destroyed || lost || !visible || raf) return;
    raf = requestAnimationFrame(frame);
  };

  const textureFor = (image: number) => {
    const source = images[image];
    if (!source || !source.complete || !source.naturalWidth) return null;
    let texture = imageTextures.get(image);
    if (!texture) {
      texture = new THREE.Texture(source);
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;
      imageTextures.set(image, texture);
      renderer.initTexture(texture);
    }
    return texture;
  };

  const openTile = (index: number) => {
    const tile = tiles[index];
    if (!tile) return;
    const image = images[tile.image];
    const texture = textureFor(tile.image);
    if (!image || !texture) return;
    photoUniforms.uImage.value = texture;
    photoUniforms.uImageAspect.value = image.naturalWidth / Math.max(image.naturalHeight, 1);
    opened = {
      tile: index,
      image: tile.image,
      e: 0,
      v: 0,
      target: 1,
      x: tile.x,
      y: tile.y,
      size: tile.size,
      aspect: 1,
      aspectV: 0,
    };
    hovered = -1;
    root.style.cursor = "";
    onOpen(tile.image);
    schedule();
  };

  const closeTile = () => {
    if (!opened || opened.target === 0) return;
    opened.target = 0;
    onOpen(-1);
    schedule();
  };

  function frame(now: number) {
    raf = 0;
    if (destroyed || lost) return;
    const settings = settingsRef.current;
    const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
    last = now;
    const reduced = settings.reduced;
    const running = !settings.paused && !reduced;
    let busy = false;

    let targetX = lens.x;
    let targetY = lens.y;
    let strength = 0;
    const openActive = !!opened && opened.target === 1;
    if (!openActive && settings.interactive && pointer.inside) {
      targetX = pointer.x;
      targetY = pointer.y;
      strength = 1;
    } else if (!openActive && keyboard) {
      const tile = tiles[keyboard.row * cols + keyboard.col];
      if (tile) {
        targetX = tile.gx;
        targetY = tile.gy;
        strength = 1;
      }
    } else if (!openActive && settings.autoplay && running) {
      pathClock += dt * Math.max(settings.autoplaySpeed, 0);
      const point = pathPoint(pathClock);
      targetX = point.x;
      targetY = point.y;
      strength = 1;
      busy = true;
    }

    const response = reduced ? 0.05 : clamp(settings.follow, 0.05, 2);
    [lens.x, lens.vx] = springTo(lens.x, lens.vx, targetX, dt, response);
    [lens.y, lens.vy] = springTo(lens.y, lens.vy, targetY, dt, response);
    [lens.strength, lens.strengthV] = springTo(
      lens.strength,
      lens.strengthV,
      strength,
      dt,
      reduced ? 0.05 : strength > lens.strength ? 0.5 : 0.8,
    );
    if (
      Math.abs(lens.x - targetX) + Math.abs(lens.y - targetY) > 0.05 ||
      Math.abs(lens.vx) + Math.abs(lens.vy) > 0.05 ||
      Math.abs(lens.strength - strength) > 1e-3 ||
      Math.abs(lens.strengthV) > 1e-3
    ) {
      busy = true;
    }

    const k = clamp(settings.tileSize, 0.05, 0.98);
    const core = Math.max(clamp(settings.fill, 0.2, 1), k);
    const a = Math.max(clamp(settings.magnify, 1, 3) - 1, 0);
    const sigma = Math.max(settings.lensSize, 0.2) * pitch;
    const inv = 1 / (2 * sigma * sigma);
    const s0 = clamp(settings.saturation, 0, 1);
    const d0 = clamp(settings.dim, 0, 0.9);
    const lensStrength = clamp(lens.strength, 0, 1.2);
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const vx = tile.gx - lens.x;
      const vy = tile.gy - lens.y;
      const g = lensStrength * Math.exp(-(vx * vx + vy * vy) * inv);
      const scale = 1 + a * g;
      tile.x = lens.x + vx * scale;
      tile.y = lens.y + vy * scale;
      tile.size = pitch * scale * (k + (core - k) * g);
      tile.z = g;
    }
    order.sort((p, q) => tiles[p].z - tiles[q].z || p - q);
    let count = 0;
    for (const i of order) {
      const tile = tiles[i];
      if (opened && opened.tile === i) continue;
      const reveal = smooth((tile.z - 0.12) / 0.7);
      const o = count * 4;
      tileData[o] = tile.x;
      tileData[o + 1] = tile.y;
      tileData[o + 2] = tile.size;
      tileData[o + 3] = 0;
      lookData[o] = tile.image;
      lookData[o + 1] = s0 + (1 - s0) * reveal;
      lookData[o + 2] = 1 - d0 + d0 * reveal;
      lookData[o + 3] = 1;
      count++;
    }
    geometry.instanceCount = count;
    tileAttribute.needsUpdate = true;
    lookAttribute.needsUpdate = true;
    tileUniforms.uRadius.value = clamp(settings.radius, 0, 0.5);

    if (pointer.inside && !press && settings.openOnClick && !openActive) {
      const next = pick(pointer.x, pointer.y);
      if (next !== hovered) {
        hovered = next;
        root.style.cursor = next >= 0 ? "pointer" : "";
        if (next >= 0) textureFor(tiles[next].image);
      }
    }

    if (opened) {
      [opened.e, opened.v] = springTo(opened.e, opened.v, opened.target, dt, reduced ? 0.08 : 0.7, 0.9);
      const e = clamp(opened.e, 0, 1);
      const imageAspect = photoUniforms.uImageAspect.value;
      [opened.aspect, opened.aspectV] = springTo(
        opened.aspect,
        opened.aspectV,
        opened.target ? imageAspect : 1,
        dt,
        reduced ? 0.08 : 0.8,
      );
      const tile = tiles[opened.tile];
      if (opened.target === 0 && tile) {
        opened.x = tile.x;
        opened.y = tile.y;
        opened.size = tile.size;
      }
      const maxH = height * 0.72;
      const maxW = width * 0.84;
      let endH = maxH;
      if (endH * imageAspect > maxW) endH = maxW / imageAspect;
      const aspect = clamp(opened.aspect, Math.min(1, imageAspect), Math.max(1, imageAspect));
      const startSide = Math.max(opened.size, 1);
      const endSide = Math.sqrt(endH * endH * imageAspect);
      const side = startSide + (endSide - startSide) * e;
      const planeH = side / Math.sqrt(aspect);
      const planeW = planeH * aspect;
      const centerY = height / 2 - (settingsRef.current.captions ? 22 : 0);
      const x = opened.x + (width / 2 - opened.x) * e;
      const y = opened.y + (centerY - opened.y) * e;
      photo.position.set(x, -y, 1.5);
      photo.scale.set(planeW, planeH, 1);
      photoUniforms.uSize.value.set(planeW, planeH);
      const startRadius = clamp(settings.radius, 0, 0.5) * startSide;
      photoUniforms.uRadius.value = startRadius + (Math.min(18, endSide * 0.04) - startRadius) * e;
      photoUniforms.uSaturation.value = 1;
      photo.visible = true;
      tileUniforms.uDim.value = 0.8 * e;
      root.style.setProperty("--grid-caption-y", `${centerY + endH / 2 + 18}px`);
      busy = true;
      if (opened.target === 0 && opened.e < 0.002 && Math.abs(opened.v) < 0.02) {
        opened = null;
        photo.visible = false;
        tileUniforms.uDim.value = 0;
      }
    }

    for (let i = 0; i < MAX_ITEMS; i++) {
      if (fading[i] && loaded[i] < 1) {
        loaded[i] = reduced ? 1 : Math.min(1, loaded[i] + dt / 0.5);
        busy = true;
      }
    }

    renderer.render(scene, camera);
    if (busy || pointer.inside) schedule();
  }

  const locate = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    locate(event);
    pointer.inside = true;
    keyboard = null;
    schedule();
  };

  const onLeave = () => {
    pointer.inside = false;
    hovered = -1;
    root.style.cursor = "";
    schedule();
  };

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button > 0) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onUp = (event: PointerEvent) => {
    if (!press || press.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8;
    press = null;
    if (moved) return;
    const settings = settingsRef.current;
    if (opened && opened.target === 1) {
      closeTile();
      return;
    }
    if (!settings.openOnClick || !settings.interactive) return;
    locate(event);
    const index = pick(pointer.x, pointer.y);
    if (index >= 0) openTile(index);
  };

  const onKey = (event: KeyboardEvent) => {
    const settings = settingsRef.current;
    if (!settings.interactive) return;
    if (event.key === "Escape") {
      closeTile();
      keyboard = null;
      schedule();
      return;
    }
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      if (!keyboard) {
        keyboard = {
          col: clamp(Math.round((lens.x - (width - cols * pitch) / 2 - pitch / 2) / pitch), 0, cols - 1),
          row: clamp(Math.round((lens.y - (height - rows * pitch) / 2 - pitch / 2) / pitch), 0, rows - 1),
        };
      } else {
        keyboard.col = clamp(keyboard.col + move[0], 0, cols - 1);
        keyboard.row = clamp(keyboard.row + move[1], 0, rows - 1);
      }
      schedule();
    } else if (event.key === "Enter" && event.target === root) {
      event.preventDefault();
      if (opened && opened.target === 1) closeTile();
      else if (keyboard && settings.openOnClick) openTile(keyboard.row * cols + keyboard.col);
    }
  };

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerup", onUp);
  root.addEventListener("keydown", onKey);

  const resizer = new ResizeObserver(() => {
    if (layout()) schedule();
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
    layout();
    schedule();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  buildAtlas();
  layout();
  photo.visible = true;
  renderer.compile(scene, camera);
  photo.visible = false;
  if (settingsRef.current.autoplay && !settingsRef.current.reduced) {
    const start = pathPoint(0);
    lens.x = start.x;
    lens.y = start.y;
  }
  schedule();

  return {
    sync: () => {
      buildAtlas();
      layout();
      last = 0;
      schedule();
    },
    open: (index: number) => {
      const target = tiles.findIndex((tile) => tile.image === index);
      if (target >= 0) openTile(target);
    },
    close: closeTile,
    focusAt: (x: number, y: number) => {
      keyboard = { col: clamp(Math.round(x), 0, cols - 1), row: clamp(Math.round(y), 0, rows - 1) };
      schedule();
    },
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer?.disconnect();
      resizer.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
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
      photoGeometry.dispose();
      tileMaterial.dispose();
      photoMaterial.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
};

export const ExpandingGrid = forwardRef<ExpandingGridHandle, ExpandingGridProps>(function ExpandingGrid(
  {
    items = defaultItems,
    columns = 12,
    tileSize = 0.36,
    magnify = 1.5,
    lensSize = 1.3,
    fill = 0.92,
    radius = 0,
    saturation = 0,
    dim = 0.25,
    follow = 0.45,
    autoplay = true,
    autoplaySpeed = 1,
    openOnClick = true,
    captions = true,
    interactive = true,
    backgroundColor = "transparent",
    seed = 0,
    paused = false,
    dpr = 2,
    ariaLabel = "Portrait grid. Move the pointer or use the arrow keys to magnify, click or press Enter to open a photo.",
    onOpen,
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
  const [opened, setOpened] = useState(-1);
  const [failed, setFailed] = useState(false);
  const list = items.length ? items : defaultItems;
  const itemsRef = useRef(list);

  const settings: Settings = {
    items: list,
    columns,
    tileSize,
    magnify,
    lensSize,
    fill,
    radius,
    saturation,
    dim,
    follow,
    autoplay,
    autoplaySpeed,
    openOnClick,
    captions,
    interactive,
    backgroundColor,
    seed,
    paused,
    dpr,
    reduced,
  };
  const settingsRef = useRef(settings);
  const openRef = useRef(onOpen);

  useEffect(() => {
    settingsRef.current = settings;
    itemsRef.current = list;
    openRef.current = onOpen;
    controllerRef.current?.sync();
  });

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const controller = createGrid(root, stage, settingsRef, itemsRef, (index) => {
      setOpened(index);
      const item = index >= 0 ? itemsRef.current[index] ?? null : null;
      openRef.current?.(item, index);
      if (item?.href && index >= 0) window.location.assign(item.href);
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
      open: (index: number) => controllerRef.current?.open(index),
      close: () => controllerRef.current?.close(),
      focusAt: (x: number, y: number) => controllerRef.current?.focusAt(x, y),
    }),
    [],
  );

  const background = backgroundColor.trim().toLowerCase();
  const transparent = background === "transparent" || background === "";
  const light = !transparent && isLight(background);
  const current = opened >= 0 ? list[opened] : null;

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
        <div style={{ ...overlayStyle, gap: 8, flexWrap: "wrap", padding: 24, alignContent: "center" }}>
          {list.slice(0, 24).map((item) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              style={{ width: 56, height: 56, objectFit: "cover" }}
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
      {captions ? (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "min(var(--grid-caption-y, 88%), calc(100% - 52px))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
            opacity: current ? 1 : 0,
            transform: current ? "translateY(0)" : "translateY(6px)",
            transition: current
              ? "opacity 420ms ease 360ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 360ms"
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

ExpandingGrid.displayName = "ExpandingGrid";

export default ExpandingGrid;
