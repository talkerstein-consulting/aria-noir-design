import * as THREE from "three";

/**
 * Swing the arms in to the sides of the head.
 *
 * The house glbs are modelled unworn, arms parallel. On a face the arms
 * pivot at the hinges until they rest on the head. They do not bend: a
 * temple is a straight bar. Left parallel, the arms sank into the occluder
 * head (which then hid them); pushed out to one fixed width, they stood off
 * the temples. So each arm is turned, rigidly, about its hinge by the
 * smallest angle that keeps every point of it in front of the ear just
 * outside the head. It then rests on the head at one point, the way a real
 * one does, and is straight along its whole length.
 *
 * Everything is measured in the occluder's space (face units, about a
 * millimetre each), which is also the space the tracker moves as one.
 */

/** How far off the skin the inside of the arm rests. */
const CLEARANCE = 1.5;
/** Slice length along the arm, in frame units (about 3mm). */
const SLICE = 0.04;
/** The hinge: the arms turn about this depth, in frame units, just behind
 *  the front. Nothing in front of it moves. */
const PIVOT_Z = -0.06;
/** Only the arm in front of the ear decides the angle: dev/face.obj puts
 *  the ear landmark at z -18, and behind it the tip is hidden anyway. */
const EAR_Z = -22;
/** How far the arms may swing, either way, in radians (about 15 deg). */
const MAX_TURN = 0.26;
/** Head profile resolution, face units. */
const BIN = 3;

export type HeadProfile = {
  /** The head's half-width at (y, z), or null where there is no head. */
  halfWidth(y: number, z: number): number | null;
};

/** Sample the occluder's surface into a (y, z) grid of half-widths. */
export function headProfile(geometry: THREE.BufferGeometry): HeadProfile {
  const bins = new Map<string, number>();
  const key = (y: number, z: number) => `${Math.round(y / BIN)},${Math.round(z / BIN)}`;
  const put = (x: number, y: number, z: number) => {
    const k = key(y, z);
    bins.set(k, Math.max(bins.get(k) ?? 0, Math.abs(x)));
  };

  const p = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : p.count;
  const at = (i: number) => (index ? index.getX(i) : i);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i + 2 < count; i += 3) {
    a.fromBufferAttribute(p, at(i));
    b.fromBufferAttribute(p, at(i + 1));
    c.fromBufferAttribute(p, at(i + 2));
    /* Dense enough that every bin a face crosses gets a sample. */
    const edge = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
    const n = Math.max(1, Math.ceil(edge / (BIN * 0.5)));
    for (let u = 0; u <= n; u++) {
      for (let w = 0; w <= n - u; w++) {
        const s = u / n;
        const t = w / n;
        v.set(0, 0, 0)
          .addScaledVector(a, 1 - s - t)
          .addScaledVector(b, s)
          .addScaledVector(c, t);
        put(v.x, v.y, v.z);
      }
    }
  }

  return {
    halfWidth(y, z) {
      const own = bins.get(key(y, z));
      if (own !== undefined) return own;
      /* A gap in the samples: the nearest neighbours' average. */
      let sum = 0;
      let n = 0;
      for (const dy of [-1, 0, 1]) {
        for (const dz of [-1, 0, 1]) {
          const h = bins.get(key(y + dy * BIN, z + dz * BIN));
          if (h !== undefined) {
            sum += h;
            n += 1;
          }
        }
      }
      return n ? sum / n : null;
    },
  };
}

/** The frame's own vertices as they came out of fit.ts, kept so the hug
 *  can be re-run from scratch when the fit is nudged. */
function base(geometry: THREE.BufferGeometry) {
  const p = geometry.getAttribute("position");
  if (!geometry.userData.base) geometry.userData.base = Float32Array.from(p.array as ArrayLike<number>);
  return geometry.userData.base as Float32Array;
}

/**
 * Turn the arms of `frame` onto the sides of `head`. `toHead` takes the
 * frame's own coordinates (frame units) into the head's (face units).
 * Safe to call again: it always starts from the unturned vertices.
 */
export function hugArms(frame: THREE.Object3D, toHead: THREE.Matrix4, head: HeadProfile) {
  const meshes: THREE.Mesh[] = [];
  frame.traverse((n) => {
    if ((n as THREE.Mesh).isMesh) meshes.push(n as THREE.Mesh);
  });

  /* ---- each arm, slice by slice: its inside face and where it is ---- */
  type Slice = { inner: number; y: number; z: number; n: number };
  const sides = { [-1]: new Map<number, Slice>(), [1]: new Map<number, Slice>() } as Record<
    -1 | 1,
    Map<number, Slice>
  >;
  for (const mesh of meshes) {
    const b = base(mesh.geometry);
    for (let i = 0; i < b.length; i += 3) {
      const x = b[i];
      const z = b[i + 2];
      if (z >= PIVOT_Z || Math.abs(x) < 0.2) continue;
      const side = x < 0 ? -1 : 1;
      const k = Math.floor(z / SLICE);
      const s = sides[side].get(k) ?? { inner: Infinity, y: 0, z: 0, n: 0 };
      s.inner = Math.min(s.inner, Math.abs(x));
      s.y += b[i + 1];
      s.z += z;
      s.n += 1;
      sides[side].set(k, s);
    }
  }

  /* Frame units to face units along x: the holder's scale. Its only
     rotation is about x, so x stays x. */
  const xScale = new THREE.Vector3().setFromMatrixColumn(toHead, 0).length();
  const p = new THREE.Vector3();
  const turn = { [-1]: 0, [1]: 0 } as Record<-1 | 1, number>;
  const pivotX = { [-1]: 0, [1]: 0 } as Record<-1 | 1, number>;

  for (const side of [-1, 1] as const) {
    const slices = [...sides[side].values()].map((s) => ({ ...s, y: s.y / s.n, z: s.z / s.n }));
    if (!slices.length) continue;
    /* The pivot: the inside of the arm where it leaves the hinge. */
    const first = slices.reduce((a, b) => (b.z > a.z ? b : a));
    pivotX[side] = first.inner;

    /* Each slice asks for an angle: how far out (or in) its inside face
       must go to sit CLEARANCE off the head, over how far it is from the
       hinge. The arm takes the largest, so no slice is left inside. */
    let need = -Infinity;
    for (const s of slices) {
      const length = PIVOT_Z - s.z;
      if (length < SLICE) continue;
      p.set(side * s.inner, s.y, s.z).applyMatrix4(toHead);
      if (p.z < EAR_Z) continue;
      const hw = head.halfWidth(p.y, p.z);
      if (hw === null) continue;
      const out = (hw + CLEARANCE - Math.abs(p.x)) / xScale;
      need = Math.max(need, out / length);
    }
    if (Number.isFinite(need)) {
      turn[side] = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(need, -1, 1)), -MAX_TURN, MAX_TURN);
    }
  }

  /* ---- turn every vertex behind the hinge, rigidly, about it ----
     Seen from above, (x, z) rotates about (pivotX, PIVOT_Z): outward for a
     positive turn on either side. A point at the hinge does not move, so
     the arm stays joined to the front. */
  for (const mesh of meshes) {
    const b = base(mesh.geometry);
    const attr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const out = attr.array as Float32Array;
    for (let i = 0; i < b.length; i += 3) {
      const x = b[i];
      const z = b[i + 2];
      out[i] = x;
      out[i + 2] = z;
      if (z >= PIVOT_Z || x === 0) continue;
      const side = x < 0 ? -1 : 1;
      const a = turn[side];
      if (!a) continue;
      const px = side * pivotX[side];
      const dx = x - px;
      const dz = PIVOT_Z - z;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      out[i] = px + dx * cos + side * dz * sin;
      out[i + 2] = PIVOT_Z - dz * cos + side * dx * sin;
    }
    attr.needsUpdate = true;
    mesh.geometry.computeBoundingSphere();
  }
}
