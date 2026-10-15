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
 * conversion happens here, on load, and it is BAKED into the geometry:
 * hug.ts moves the arms vertex by vertex, so the frame's own vertices have
 * to be in the tracker's space, not just its node transform.
 */

/** dev/face.obj puts the eye centres 67.4 units apart; the adult mean
 *  interpupillary distance is about 63mm, so one face unit is a little
 *  under a millimetre. Measured at the eyes rather than the ears: upstream
 *  moved its ear landmarks (+-77 to +-70) when it recalibrated, the eyes
 *  are where a frame is judged, and an IPD is a figure people know. */
const FACE_UNITS_PER_MM = 67.4 / 63;
/** The fixed scale upstream's main glasses helper hangs every frame at
 *  (helpers/WebARRocksMirror.js; the React demo's older copy said 82). */
export const POSE_SCALE = 78;
/** Metres to the frame's own units, so that a 140mm frame is 140mm on a
 *  face. True to size is the point: the six houses are not one width. */
const UNITS_PER_METRE = (1000 * FACE_UNITS_PER_MM) / POSE_SCALE;
/** Where the front sits, as in upstream's reference glasses. */
const FRONT_Z = 0.18;
/** The pupil line, as a fraction of the front's height from its bottom
 *  edge. Upstream's reference frame puts it at 37%; the house's fronts are
 *  deeper at the brow, so a touch higher. */
const PUPIL_FRACTION = 0.42;

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

/* Upstream bends the arms out 5 degrees and fades them past the ear
   (WebARRocksMirror.tweak_material). Neither is used: the bend stood the
   arms off the sides of the head, the fade read as the arms missing, and
   hug.ts now lays the arms on the head itself. */

function dress(mesh: THREE.Mesh, source: THREE.Material) {
  if (isLens(mesh, source)) return lensMaterial(source);
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
  return material;
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
 * The fixed placement on the mean face, from upstream's main glasses
 * helper (helpers/WebARRocksMirror.js, tweak_faceAccessory): the bridge on
 * the nose at (0, 40, 53) in dev/face.obj, tipped back 0.3 rad to match the
 * face model's upward gaze. The React demo's older copy used (0, 49, 53)
 * and 0.38; the main values go with the recalibrated face points
 * (vendor/webar-rocks-face/face-points.ts), and with them the pupil line
 * lands on the face model's eye centres (y 37.9) instead of above them.
 */
export function poseHolder() {
  const holder = new THREE.Group();
  holder.scale.setScalar(POSE_SCALE);
  holder.position.set(0, 40, 53);
  holder.rotation.set(-0.3, 0, 0);
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
