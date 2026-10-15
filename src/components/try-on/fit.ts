import * as THREE from "three";
import type { TryOnFit } from "@/lib/try-on";

/**
 * Turning a house glb into something WebAR.rocks can put on a face.
 *
 * ---- What the tracker expects ----
 *
 * WebAR.rocks solves the head's pose against a mean face (its dev/face.obj,
 * roughly millimetres, Y up, looking down +Z) and moves one Object3D with
 * it. Upstream's glasses demo hangs its frame on that object with a fixed
 * transform, and the frame itself has to be authored to a convention:
 *
 *   - centred on X, temples running back along -Z,
 *   - the pupil line at Y = 0,
 *   - the front of the frame at Z ~ 0.18,
 *   - about 2 units across.
 *
 * ---- What the house glbs are ----
 *
 * scripts/export-models.mjs writes them in real metres, Y up, the front of
 * the frame at Z = 0 and the temples running back along -Z, with the
 * Blender Z-up rotation left on every node. So the axes already agree; what
 * differs is scale, the pupil line, and the node rotations.
 *
 * Rather than re-export thirty files to a second convention, the
 * conversion happens here, on load, and it is BAKED into the geometry: the
 * arm bend below is a vertex-shader effect that reads the
 * raw `position` attribute, so the frame's own vertices have to be in the
 * tracker's space, not just its node transform.
 */

/** dev/face.obj is 154 units between the ear landmarks. An adult head is
 *  about 145mm there, so one face unit is a little under a millimetre. */
const FACE_UNITS_PER_MM = 154 / 145;
/** The fixed scale upstream's demo hangs every frame at. */
export const POSE_SCALE = 82;
/** Metres to the frame's own units, so that a 140mm frame is 140mm on a
 *  face. True to size is the point: the six houses are not one width. */
const UNITS_PER_METRE = (1000 * FACE_UNITS_PER_MM) / POSE_SCALE;
/** Where the front sits, as in upstream's reference glasses. */
const FRONT_Z = 0.18;
/** The pupil line, as a fraction of the front's height from its bottom
 *  edge. Upstream's reference frame puts it at 37%; the house's fronts are
 *  deeper at the brow, so a touch higher. */
const PUPIL_FRACTION = 0.42;

/** Arm bending, upstream's default, in frame units. */
const BRANCH = {
  bendingAngle: (5 * Math.PI) / 180,
  bendingZ: 0,
};

/** Flip triangle winding after baking a mirrored (det < 0) transform in,
 *  or the mesh renders inside out. Several house nodes are scale(-1). */
function flipWinding(geometry: THREE.BufferGeometry) {
  const index = geometry.getIndex();
  if (index) {
    const a = index.array;
    for (let i = 0; i < a.length; i += 3) {
      const t = a[i + 1];
      a[i + 1] = a[i + 2];
      a[i + 2] = t;
    }
    index.needsUpdate = true;
    return;
  }
  for (const attribute of Object.values(geometry.attributes)) {
    const a = attribute.array;
    const size = attribute.itemSize;
    for (let v = 0; v < attribute.count; v += 3) {
      for (let k = 0; k < size; k++) {
        const i1 = (v + 1) * size + k;
        const i2 = (v + 2) * size + k;
        const t = a[i1];
        a[i1] = a[i2];
        a[i2] = t;
      }
    }
    attribute.needsUpdate = true;
  }
}

/** By name, the mesh's or the material's: PATRIARCA's lens mesh is called
 *  "Acetate_frame.004" and only its material says "Lens". Transmission is
 *  no guide, because the patterned acetates are authored transmissive too. */
function isLens(mesh: THREE.Mesh, material: THREE.Material) {
  return /lens/i.test(mesh.name) || /lens/i.test(material.name);
}

/**
 * The lens, keeping the tint it was authored with.
 *
 * Transmission refracts whatever the renderer drew behind the object, and
 * behind this object is a transparent canvas over a video it cannot see,
 * so a transmissive lens renders as a dark disc over the eye. The lens's
 * own colour at its own alpha, with a reflection on top, is the same lens
 * without asking the renderer for a background it does not have.
 */
function lensMaterial(source: THREE.Material) {
  const physical = source as THREE.MeshPhysicalMaterial;
  const tint = physical.color ?? new THREE.Color(0xffffff);
  /* The second-generation lenses are authored opaque and carry their
     see-through in transmission (0.85), so their alpha says nothing: what
     the lens lets through is the transmission, and what it tints is the
     rest. The photographs agree, the lenses read nearly clear on a face. */
  const opacity = physical.transmission
    ? THREE.MathUtils.clamp(1 - physical.transmission, 0.08, 0.6)
    : Math.min(source.opacity ?? 0.5, 0.6);
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity,
    depthWrite: false,
    envMapIntensity: 0.8,
  });
}

/**
 * Upstream's arm bend (WebARRocksMirror.tweak_material), ported: behind
 * `bendingZ` the arms bend a few degrees, as they do over a head.
 *
 * Upstream also FADES the arms out past the ear. That is gone: on a face
 * it read as the arms missing, and it is not needed. With the arms opened
 * to clear the head (splayArms), the occluder already hides what is behind
 * the head and the ears, and everything in front of them is meant to show.
 *
 * Upstream applies it to materials named "frame". The house's materials
 * are named whatever Blender called them, so here it goes on everything:
 * the front of the frame is in front of Z = 0, where the bend is zero.
 */
function withBranches(material: THREE.Material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBranchBendingAngle = { value: BRANCH.bendingAngle };
    shader.uniforms.uBranchBendingZ = { value: BRANCH.bendingZ };

    shader.vertexShader =
      "uniform float uBranchBendingAngle, uBranchBendingZ;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float zBranch = max(0.0, uBranchBendingZ - position.z);
        float bendBranchDx = tan(uBranchBendingAngle) * zBranch;
        transformed.x += sign(transformed.x) * bendBranchDx;
        transformed.z *= (1.0 - bendBranchDx);`,
      );
  };
  return material;
}

function dress(mesh: THREE.Mesh, source: THREE.Material) {
  if (isLens(mesh, source)) return withBranches(lensMaterial(source));
  const material = source.clone();
  const physical = material as THREE.MeshPhysicalMaterial;
  physical.fog = false;
  /* Acetate exported as transmissive has the lens's problem: nothing
     behind it to refract, so at its authored 0.7 alpha a tortoise reads
     as a ghost of itself over the face. Solid is closer to the real
     thing. Nose pads are the exception: clear silicone, and meant to be. */
  if (physical.transmission) {
    physical.transmission = 0;
    if (!/nose/i.test(`${mesh.name} ${material.name}`)) {
      material.transparent = false;
      material.opacity = 1;
    }
  }
  /* The baked acetates (ARCA II's patterned run) arrive with a flat grey
     emission and no emission map, which on a stage behind transmission
     reads as inner glow and on a face reads as a grey wash over the whole
     pattern. Lit by its own pattern instead, and quieter, so the room's
     light still does most of the work. */
  if (physical.map && !physical.emissiveMap && physical.emissive?.getHex()) {
    physical.emissiveMap = physical.map;
    physical.emissive.multiplyScalar(0.4);
  }
  return withBranches(material);
}

/**
 * Bake, measure, place. Returns a new group in the tracker's frame units,
 * ready to hang inside the pose holder (see `poseHolder`).
 */
export function fitFrame(source: THREE.Object3D, fit: TryOnFit = {}) {
  source.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];
  source.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    if (mesh.matrixWorld.determinant() < 0) flipWinding(geometry);
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const dressed = materials.map((m) => dress(mesh, m));
    const baked = new THREE.Mesh(geometry, dressed.length === 1 ? dressed[0] : dressed);
    baked.name = mesh.name;
    baked.renderOrder = dressed.some((m) => m.transparent) ? 2 : 1;
    meshes.push(baked);
  });

  /* ---- measure, in the glb's own units ---- */
  const box = new THREE.Box3();
  for (const mesh of meshes) box.expandByObject(mesh);
  const width = box.max.x - box.min.x;

  /* The front is the slice of the frame nearest the camera; its height is
     the lens opening plus the rims, which is what the pupil line is
     measured against. Temples and hinges are excluded by depth. */
  const band = width * 0.12;
  let frontMin = Infinity;
  let frontMax = -Infinity;
  const v = new THREE.Vector3();
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute("position");
    const step = Math.max(1, Math.floor(position.count / 8192));
    for (let i = 0; i < position.count; i += step) {
      v.fromBufferAttribute(position, i);
      if (v.z < box.max.z - band) continue;
      frontMin = Math.min(frontMin, v.y);
      frontMax = Math.max(frontMax, v.y);
    }
  }
  if (!Number.isFinite(frontMin)) {
    frontMin = box.min.y;
    frontMax = box.max.y;
  }

  /* Real metres if it measures like a pair of glasses in metres (they run
     125-160mm across); otherwise someone exported in other units, and the
     frame is fitted to upstream's 2-unit width instead of guessed at. */
  const inMetres = width > 0.09 && width < 0.25;
  const scale = (inMetres ? UNITS_PER_METRE : 2 / width) * (fit.scale ?? 1);

  const pupilY = frontMin + (frontMax - frontMin) * PUPIL_FRACTION;
  const centreX = (box.min.x + box.max.x) / 2;
  const nudgeY = (fit.y ?? 0) / POSE_SCALE;
  const nudgeZ = (fit.z ?? 0) / POSE_SCALE;

  const group = new THREE.Group();
  for (const mesh of meshes) {
    mesh.geometry.translate(-centreX, -pupilY, -box.max.z);
    mesh.geometry.scale(scale, scale, scale);
    mesh.geometry.translate(0, nudgeY, FRONT_Z + nudgeZ);
  }
  splayArms(meshes);
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingSphere();
    mesh.geometry.computeBoundingBox();
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  group.userData.widthMm = inMetres ? width * 1000 : null;
  return group;
}

/**
 * Open the arms to the width of a head.
 *
 * The house glbs are modelled unworn: arms parallel, about 116-122mm apart
 * inside. On a face they flex outward over the temples. Left parallel, the
 * back half of each arm sat INSIDE the occluder head (measured: every rear
 * arm vertex, every house), so the occluder hid it and the arms came and
 * went as the head turned.
 *
 * Upstream's convention is an interior width of 2 frame units, which puts
 * the arms just outside the mean head. So the arms, and only the arms, are
 * pushed out to that, ramped in behind the hinge so the front keeps its
 * true size and the hinge does not tear.
 */
/* Measured against the occluder, arm by arm, house by house: at 1.04 no
   part of any arm between the hinge and the ear is inside the head. At
   1.0, 18% of MATRIARCA's still was; at 0.97, 30%. The cost is a little
   flare seen face-on, which on a real face reads as arms over the head. */
const ARM_INTERIOR_HALF = 1.04;
/** Where the arms are measured: well behind the hinge blocks. */
const ARM_MEASURE_Z = -0.6;
/** The ramp: untouched in front of RAMP_START, fully open behind RAMP_END. */
const RAMP_START = -0.06;
const RAMP_END = -0.45;

function splayArms(meshes: THREE.Mesh[]) {
  /* The inside face of the arms: a low percentile of |x| back there, so a
     stray vertex on a screw or an emblem does not decide it. */
  const xs: number[] = [];
  for (const mesh of meshes) {
    const p = mesh.geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      if (p.getZ(i) < ARM_MEASURE_Z && Math.abs(p.getX(i)) > 0.2) xs.push(Math.abs(p.getX(i)));
    }
  }
  if (xs.length < 20) return;
  xs.sort((a, b) => a - b);
  const inner = xs[Math.floor(xs.length * 0.05)];
  const spread = ARM_INTERIOR_HALF - inner;
  if (spread <= 0) return;

  for (const mesh of meshes) {
    const p = mesh.geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      if (z >= RAMP_START) continue;
      const t = THREE.MathUtils.smoothstep(-z, -RAMP_START, -RAMP_END);
      const x = p.getX(i);
      p.setX(i, x + Math.sign(x) * spread * t);
    }
    p.needsUpdate = true;
  }
}

/**
 * The fixed placement on the mean face, from upstream's
 * WebARRocksMirror.set_glassesPose: the bridge sits on the nose at
 * (0, 47, 53) in dev/face.obj, lifted 2 units, and tipped back to match the
 * face model's upward gaze.
 */
export function poseHolder() {
  const holder = new THREE.Group();
  holder.scale.setScalar(POSE_SCALE);
  holder.position.set(0, 47 + 2, 53);
  holder.rotation.set(-0.38, 0, 0);
  return holder;
}

export function disposeFrame(group: THREE.Object3D) {
  group.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((m) => m.dispose());
  });
}
