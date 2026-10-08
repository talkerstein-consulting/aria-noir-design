"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
export type DepthImageFit = "cover" | "contain";
export type DepthImageView = "lit" | "depth" | "normal";
export interface DepthImageProps {
  image: string;
  depthMap?: string;
  fit?: DepthImageFit;
  depthFromLight?: number;
  depthSmoothing?: number;
  depthContrast?: number;
  invertDepth?: boolean;
  displacement?: number;
  normalStrength?: number;
  detail?: number;
  shadowIntensity?: number;
  shadowSoftness?: number;
  lightColor?: string;
  lightIntensity?: number;
  falloff?: number;
  elevation?: number;
  ambient?: number;
  ambientColor?: string;
  colorPreserve?: number;
  follow?: number;
  autoOrbit?: boolean;
  orbitRadius?: number;
  orbitDuration?: number;
  view?: DepthImageView;
  backgroundColor?: string;
  fallbackColor?: string;
  paused?: boolean;
  dpr?: number;
  className?: string;
  children?: ReactNode;
}
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const makeColor = (value: string, fallback: string) => {
  const color = new THREE.Color();
  try {
    color.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {
    color.setStyle(fallback, THREE.LinearSRGBColorSpace);
  }
  return color;
};
const updateColor = (target: THREE.Color, value: string) => {
  try {
    target.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {}
};
const subscribeToDpr = (notify: () => void) => {
  const media = window.matchMedia("(min-resolution: 2dppx)");
  media.addEventListener("change", notify);
  window.addEventListener("resize", notify);
  return () => {
    media.removeEventListener("change", notify);
    window.removeEventListener("resize", notify);
  };
};
const readDpr = () =>
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
const VERTEX = `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
const DEPTH_FRAGMENT = `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform sampler2D uDepthMap;
uniform float uHasDepthMap;
uniform float uFromLight;
uniform float uContrast;
uniform float uInvert;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  float depth;
  if (uHasDepthMap > 0.5) {
    depth = texture(uDepthMap, vUv).r;
  } else {



    float near = luma(textureLod(uImage, vUv, 2.0).rgb);
    float wide = luma(textureLod(uImage, vUv, 4.0).rgb);
    float bright = mix(near, wide, 0.5);
    float floorward = 1.0 - vUv.y;
    depth = mix(floorward, bright, uFromLight);
  }
  depth = clamp((depth - 0.5) * uContrast + 0.5, 0.0, 1.0);
  depth = mix(depth, 1.0 - depth, uInvert);
  fragColor = vec4(depth, depth, depth, 1.0);
}
`;
const BLUR_FRAGMENT = `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uDirection;
uniform float uRadius;

const int TAPS = 16;

void main() {
  if (uRadius < 0.5) {
    fragColor = texture(uSource, vUv);
    return;
  }
  float sigma = uRadius * 0.5;
  float stride = uRadius / float(TAPS);
  float total = 1.0;
  float sum = texture(uSource, vUv).r;
  for (int i = 1; i <= TAPS; i++) {
    float offset = float(i) * stride;
    float weight = exp(-(offset * offset) / (2.0 * sigma * sigma));
    vec2 shift = uDirection * offset;
    sum += texture(uSource, vUv + shift).r * weight;
    sum += texture(uSource, vUv - shift).r * weight;
    total += weight * 2.0;
  }
  float depth = sum / total;
  fragColor = vec4(depth, depth, depth, 1.0);
}
`;
const LIT_FRAGMENT = `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uImageSize;
uniform vec2 uDepthSize;
uniform float uReady;
uniform vec3 uFallback;
uniform vec3 uBackground;
uniform vec2 uResolution;
uniform float uContain;

uniform vec3 uLight;
uniform vec3 uLightColor;
uniform float uIntensity;
uniform float uFalloff;
uniform float uAmbient;
uniform vec3 uAmbientColor;
uniform float uColorPreserve;

uniform float uDisplacement;
uniform float uNormalStrength;
uniform float uDetail;
uniform float uShadowIntensity;
uniform float uShadowSoftness;
uniform float uView;

const int SHADOW_STEPS = 12;
const float MIN_LIGHT_ANGLE = 0.15;
const float SOFTNESS_GROWTH = 3.0;
const float DETAIL_LOD = 3.0;
const float DETAIL_TEXELS = 8.0;
const float GRADIENT_TEXELS = 3.0;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }


vec2 fitScale() {
  float plane = uResolution.x / uResolution.y;
  float photo = uImageSize.x / uImageSize.y;
  vec2 s = vec2(1.0);
  bool wider = photo > plane;
  if (uContain > 0.5) wider = !wider;
  if (wider) s.x = plane / photo; else s.y = photo / plane;
  return s;
}

vec2 depthGradient(vec2 uv, vec2 step) {
  float l = texture(uDepth, uv - vec2(step.x, 0.0)).r;
  float r = texture(uDepth, uv + vec2(step.x, 0.0)).r;
  float b = texture(uDepth, uv - vec2(0.0, step.y)).r;
  float t = texture(uDepth, uv + vec2(0.0, step.y)).r;
  return vec2(r - l, t - b) * 0.5;
}

vec2 detailGradient(vec2 uv, vec2 step) {
  float l = luma(textureLod(uImage, uv - vec2(step.x, 0.0), DETAIL_LOD).rgb);
  float r = luma(textureLod(uImage, uv + vec2(step.x, 0.0), DETAIL_LOD).rgb);
  float b = luma(textureLod(uImage, uv - vec2(0.0, step.y), DETAIL_LOD).rgb);
  float t = luma(textureLod(uImage, uv + vec2(0.0, step.y), DETAIL_LOD).rgb);
  return vec2(r - l, t - b) * 0.5;
}

void main() {
  if (uReady < 0.5) {
    fragColor = vec4(uFallback, 1.0);
    return;
  }

  float aspect = uResolution.x / uResolution.y;
  vec2 scale = fitScale();
  vec2 uv = (vUv - 0.5) * scale + 0.5;

  if (uContain > 0.5 && (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)) {
    fragColor = vec4(uFallback, 1.0);
    return;
  }



  vec2 worldPerUv = vec2(2.0 * aspect, 2.0) / scale;

  vec3 albedo = texture(uImage, uv).rgb;
  float depth = texture(uDepth, uv).r;

  vec2 step = vec2(GRADIENT_TEXELS) / uDepthSize;
  vec2 slope = depthGradient(uv, step) / (step * worldPerUv)
    * uDisplacement * uNormalStrength;
  vec2 fine = detailGradient(uv, vec2(DETAIL_TEXELS) / uImageSize) * uDetail * 4.0;
  vec3 normal = normalize(vec3(-slope.x - fine.x, -slope.y - fine.y, 1.0));

  vec3 surface = vec3((vUv - 0.5) * vec2(2.0 * aspect, 2.0), (depth - 1.0) * uDisplacement);
  vec3 toLight = uLight - surface;
  float dist = max(length(toLight), 0.001);
  vec3 dir = toLight / dist;


  float occlusion = 0.0;
  if (uShadowIntensity > 0.0 && dir.z > 0.0) {
    float remaining = 1.0 - depth;
    vec2 rayUv = dir.xy / max(dir.z, MIN_LIGHT_ANGLE) * uDisplacement * remaining / worldPerUv;
    for (int i = 0; i < SHADOW_STEPS; i++) {
      float progress = (float(i) + 1.0) / float(SHADOW_STEPS);
      float rayDepth = depth + remaining * progress;
      float blocker = texture(uDepth, uv + rayUv * progress).r;
      float softness = uShadowSoftness * (progress * SOFTNESS_GROWTH + 1.0);
      occlusion = max(occlusion, clamp((blocker - rayDepth) / softness, 0.0, 1.0));
    }
  }
  float shadow = 1.0 - occlusion * uShadowIntensity;

  float lambert = max(dot(normal, dir), 0.0);
  float attenuation = uIntensity / pow(dist, uFalloff);
  vec3 lit = uLightColor * lambert * attenuation * shadow;
  vec3 fill = uAmbientColor * uAmbient;
  vec3 exposure = fill + lit;


  exposure = mix(exposure, max(exposure, vec3(luma(albedo) * 0.35)), uColorPreserve);

  vec3 color = 1.0 - exp(-albedo * exposure * 1.1);

  color = uBackground + color * (1.0 - uBackground);

  if (uView > 1.5) {
    color = normal * 0.5 + 0.5;
  } else if (uView > 0.5) {
    color = vec3(depth);
  }

  fragColor = vec4(color, 1.0);
}
`;
interface Loaded {
  texture: THREE.Texture;
  width: number;
  height: number;
}
const loadTexture = (
  src: string,
  anisotropy: number,
  onDone: (result: Loaded | null) => void,
) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  let cancelled = false;
  image.onload = () => {
    if (cancelled) return;
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = anisotropy;
    texture.needsUpdate = true;
    onDone({
      texture,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };
  image.onerror = () => {
    if (!cancelled) onDone(null);
  };
  image.src = src;
  return () => {
    cancelled = true;
  };
};
const DEPTH_WIDTH = 512;
interface Bake {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  quad: THREE.Mesh;
  material: THREE.ShaderMaterial;
  blur: THREE.ShaderMaterial;
  geometry: THREE.PlaneGeometry;
  target: THREE.WebGLRenderTarget;
  scratch: THREE.WebGLRenderTarget;
  radius: number;
}
const createBake = (): Bake => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERTEX,
    fragmentShader: DEPTH_FRAGMENT,
    uniforms: {
      uImage: { value: null as THREE.Texture | null },
      uDepthMap: { value: null as THREE.Texture | null },
      uHasDepthMap: { value: 0 },
      uFromLight: { value: 0.5 },
      uContrast: { value: 1 },
      uInvert: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const blur = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERTEX,
    fragmentShader: BLUR_FRAGMENT,
    uniforms: {
      uSource: { value: null as THREE.Texture | null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uRadius: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(geometry, material);
  scene.add(quad);
  const makeTarget = () => {
    const target = new THREE.WebGLRenderTarget(DEPTH_WIDTH, DEPTH_WIDTH, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    target.texture.wrapS = THREE.ClampToEdgeWrapping;
    target.texture.wrapT = THREE.ClampToEdgeWrapping;
    return target;
  };
  return {
    scene,
    camera,
    quad,
    material,
    blur,
    geometry,
    target: makeTarget(),
    scratch: makeTarget(),
    radius: 0,
  };
};
const runBake = (gl: THREE.WebGLRenderer, bake: Bake) => {
  const previous = gl.getRenderTarget();
  const { width, height } = bake.target;
  const pass = (
    material: THREE.ShaderMaterial,
    into: THREE.WebGLRenderTarget,
  ) => {
    bake.quad.material = material;
    gl.setRenderTarget(into);
    gl.render(bake.scene, bake.camera);
  };
  pass(bake.material, bake.target);
  if (bake.radius >= 0.5) {
    const blur = bake.blur.uniforms;
    blur.uRadius.value = bake.radius;
    blur.uSource.value = bake.target.texture;
    blur.uDirection.value.set(1 / width, 0);
    pass(bake.blur, bake.scratch);
    blur.uSource.value = bake.scratch.texture;
    blur.uDirection.value.set(0, 1 / height);
    pass(bake.blur, bake.target);
    blur.uSource.value = null;
  }
  gl.setRenderTarget(previous);
};
interface Pointer {
  x: number;
  y: number;
  inside: boolean;
}
interface ReliefProps {
  image: string;
  depthMap?: string;
  fit: DepthImageFit;
  depthFromLight: number;
  depthSmoothing: number;
  depthContrast: number;
  invertDepth: boolean;
  displacement: number;
  normalStrength: number;
  detail: number;
  shadowIntensity: number;
  shadowSoftness: number;
  lightColor: string;
  lightIntensity: number;
  falloff: number;
  elevation: number;
  ambient: number;
  ambientColor: string;
  colorPreserve: number;
  follow: number;
  autoOrbit: boolean;
  orbitRadius: number;
  orbitDuration: number;
  view: DepthImageView;
  backgroundColor: string;
  fallbackColor: string;
  paused: boolean;
  pointer: MutableRefObject<Pointer>;
}
const Relief = ({
  image,
  depthMap,
  fit,
  depthFromLight,
  depthSmoothing,
  depthContrast,
  invertDepth,
  displacement,
  normalStrength,
  detail,
  shadowIntensity,
  shadowSoftness,
  lightColor,
  lightIntensity,
  falloff,
  elevation,
  ambient,
  ambientColor,
  colorPreserve,
  follow,
  autoOrbit,
  orbitRadius,
  orbitDuration,
  view,
  backgroundColor,
  fallbackColor,
  paused,
  pointer,
}: ReliefProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { gl, size: viewSize, invalidate } = useThree();
  const light = useRef(new THREE.Vector2(0.4, 0.3));
  const goal = useRef(new THREE.Vector2());
  const orbit = useRef(0);
  const dirty = useRef(true);
  const bakeRef = useRef<Bake | null>(null);
  const getBake = () => {
    if (!bakeRef.current) bakeRef.current = createBake();
    return bakeRef.current;
  };
  useEffect(
    () => () => {
      const rig = bakeRef.current;
      bakeRef.current = null;
      if (!rig) return;
      rig.target.dispose();
      rig.scratch.dispose();
      rig.material.dispose();
      rig.blur.dispose();
      rig.geometry.dispose();
    },
    [],
  );
  const uniforms = useMemo(
    () => ({
      uImage: { value: null as THREE.Texture | null },
      uDepth: { value: null as THREE.Texture | null },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uDepthSize: { value: new THREE.Vector2(DEPTH_WIDTH, DEPTH_WIDTH) },
      uReady: { value: 0 },
      uFallback: { value: makeColor("#171717", "#171717") },
      uBackground: { value: makeColor("#000000", "#000000") },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uContain: { value: 0 },
      uLight: { value: new THREE.Vector3(0.4, 0.3, 1) },
      uLightColor: { value: makeColor("#ffffff", "#ffffff") },
      uIntensity: { value: 2 },
      uFalloff: { value: 1 },
      uAmbient: { value: 0.2 },
      uAmbientColor: { value: makeColor("#ffffff", "#ffffff") },
      uColorPreserve: { value: 0.3 },
      uDisplacement: { value: 1.5 },
      uNormalStrength: { value: 1.5 },
      uDetail: { value: 0.8 },
      uShadowIntensity: { value: 0.7 },
      uShadowSoftness: { value: 0.1 },
      uView: { value: 0 },
    }),
    [],
  );
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const bake = getBake();
    material.uniforms.uDepth.value = bake.target.texture;
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    let current: THREE.Texture | null = null;
    const cancel = loadTexture(image, anisotropy, (result) => {
      const values = material.uniforms;
      if (!result) {
        values.uReady.value = 0;
        bake.material.uniforms.uImage.value = null;
        invalidate();
        return;
      }
      current = result.texture;
      values.uImage.value = result.texture;
      values.uImageSize.value.set(result.width, result.height);
      values.uReady.value = 1;
      bake.material.uniforms.uImage.value = result.texture;
      const height = Math.max(
        1,
        Math.round((DEPTH_WIDTH * result.height) / result.width),
      );
      bake.target.setSize(DEPTH_WIDTH, height);
      bake.scratch.setSize(DEPTH_WIDTH, height);
      values.uDepthSize.value.set(DEPTH_WIDTH, height);
      dirty.current = true;
      invalidate();
    });
    return () => {
      cancel();
      current?.dispose();
    };
  }, [image, gl, invalidate]);
  useEffect(() => {
    const values = getBake().material.uniforms;
    if (!depthMap) {
      values.uHasDepthMap.value = 0;
      values.uDepthMap.value = null;
      dirty.current = true;
      invalidate();
      return;
    }
    let current: THREE.Texture | null = null;
    const cancel = loadTexture(depthMap, 1, (result) => {
      if (!result) {
        values.uHasDepthMap.value = 0;
        dirty.current = true;
        invalidate();
        return;
      }
      current = result.texture;
      values.uDepthMap.value = result.texture;
      values.uHasDepthMap.value = 1;
      dirty.current = true;
      invalidate();
    });
    return () => {
      cancel();
      current?.dispose();
      values.uHasDepthMap.value = 0;
      values.uDepthMap.value = null;
    };
  }, [depthMap, invalidate]);
  useEffect(() => {
    const bake = getBake();
    const values = bake.material.uniforms;
    values.uFromLight.value = clamp(depthFromLight, 0, 1);
    bake.radius = Math.max(0, depthSmoothing) * 5;
    values.uContrast.value = Math.max(0, depthContrast);
    values.uInvert.value = invertDepth ? 1 : 0;
    dirty.current = true;
    invalidate();
  }, [depthFromLight, depthSmoothing, depthContrast, invertDepth, invalidate]);
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const values = material.uniforms;
    updateColor(values.uFallback.value, fallbackColor);
    updateColor(values.uBackground.value, backgroundColor);
    updateColor(values.uLightColor.value, lightColor);
    updateColor(values.uAmbientColor.value, ambientColor);
    values.uContain.value = fit === "contain" ? 1 : 0;
    values.uIntensity.value = Math.max(0, lightIntensity);
    values.uFalloff.value = Math.max(0, falloff);
    values.uAmbient.value = Math.max(0, ambient);
    values.uColorPreserve.value = clamp(colorPreserve, 0, 1);
    values.uDisplacement.value = Math.max(0, displacement);
    values.uNormalStrength.value = Math.max(0, normalStrength);
    values.uDetail.value = Math.max(0, detail);
    values.uShadowIntensity.value = clamp(shadowIntensity, 0, 1);
    values.uShadowSoftness.value = Math.max(0.002, shadowSoftness);
    values.uView.value = view === "normal" ? 2 : view === "depth" ? 1 : 0;
    invalidate();
  }, [
    fallbackColor,
    backgroundColor,
    lightColor,
    ambientColor,
    fit,
    lightIntensity,
    falloff,
    ambient,
    colorPreserve,
    displacement,
    normalStrength,
    detail,
    shadowIntensity,
    shadowSoftness,
    view,
    invalidate,
  ]);
  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const values = material.uniforms;
    values.uResolution.value.set(viewSize.width, viewSize.height);
    if (dirty.current && values.uReady.value > 0.5) {
      dirty.current = false;
      runBake(gl, getBake());
    }
    const aspect = viewSize.width / Math.max(viewSize.height, 1);
    const where = pointer.current;
    if (where.inside) {
      goal.current.set(where.x * aspect, where.y);
    } else if (autoOrbit && !paused) {
      orbit.current += delta / Math.max(orbitDuration, 0.1);
      const angle = orbit.current * Math.PI * 2;
      goal.current.set(
        Math.cos(angle) * orbitRadius * aspect,
        Math.sin(angle) * orbitRadius,
      );
    } else {
      goal.current.copy(light.current);
    }
    const step = Math.min(delta, 0.05);
    const ease =
      follow >= 1 ? 1 : 1 - Math.pow(1 - clamp(follow, 0, 1), step * 60);
    light.current.lerp(goal.current, ease);
    values.uLight.value.set(light.current.x, light.current.y, elevation);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={VERTEX}
        fragmentShader={LIT_FRAGMENT}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};
const DepthImage = ({
  image,
  depthMap,
  fit = "cover",
  depthFromLight = 0.5,
  depthSmoothing = 7,
  depthContrast = 1.2,
  invertDepth = false,
  displacement = 1.5,
  normalStrength = 1.5,
  detail = 0.8,
  shadowIntensity = 0.7,
  shadowSoftness = 0.1,
  lightColor = "#ffffff",
  lightIntensity = 6,
  falloff = 2.5,
  elevation = 1.2,
  ambient = 0.02,
  ambientColor = "#ffffff",
  colorPreserve = 0,
  follow = 0.12,
  autoOrbit = true,
  orbitRadius = 0.6,
  orbitDuration = 10,
  view = "lit",
  backgroundColor = "#000000",
  fallbackColor = "#171717",
  paused = false,
  dpr = 1.5,
  className,
  children,
}: DepthImageProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, inside: false });
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const deviceDpr = useSyncExternalStore(subscribeToDpr, readDpr, () => 1);
  const pixelRatio = Math.min(deviceDpr, Math.max(dpr, 0.5));
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1,
    );
    pointer.current.y = clamp(
      1 - ((event.clientY - rect.top) / rect.height) * 2,
      -1,
      1,
    );
    pointer.current.inside = true;
  };
  const still = paused || Boolean(reducedMotion);
  return (
    <div
      ref={rootRef}
      className={cn("relative touch-none overflow-hidden", className)}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
    >
      <div className="absolute inset-0">
        <Canvas
          orthographic
          dpr={pixelRatio}
          frameloop={visible ? "always" : "demand"}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <Relief
            image={image}
            depthMap={depthMap}
            fit={fit}
            depthFromLight={depthFromLight}
            depthSmoothing={depthSmoothing}
            depthContrast={depthContrast}
            invertDepth={invertDepth}
            displacement={displacement}
            normalStrength={normalStrength}
            detail={detail}
            shadowIntensity={shadowIntensity}
            shadowSoftness={shadowSoftness}
            lightColor={lightColor}
            lightIntensity={lightIntensity}
            falloff={falloff}
            elevation={elevation}
            ambient={ambient}
            ambientColor={ambientColor}
            colorPreserve={colorPreserve}
            follow={reducedMotion ? 1 : follow}
            autoOrbit={autoOrbit && !still}
            orbitRadius={orbitRadius}
            orbitDuration={orbitDuration}
            view={view}
            backgroundColor={backgroundColor}
            fallbackColor={fallbackColor}
            paused={still}
            pointer={pointer}
          />
        </Canvas>
      </div>
      {children ? (
        <div className="pointer-events-none relative z-10 h-full w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
};
export default DepthImage;
