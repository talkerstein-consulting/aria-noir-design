"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type FrameScrubVariant =
  "plain" | "blend" | "ghost" | "slice" | "mosaic" | "wipe";

export interface FrameScrubProps {
  /** Explicit frame URLs, in playback order. Wins over `src`. */
  frames?: string[];
  /** Frame URL pattern containing an `{i}` token, e.g. "/seq/shot-{i}.webp". */
  src?: string;
  /** Video URL sampled into `count` frames, then scrubbed. */
  video?: string;
  /** Width in pixels each video frame is decoded at. */
  videoQuality?: number;
  /** Number of frames in the sequence. */
  count?: number;
  /** Zero-pad width applied to `{i}` when expanding `src`. */
  pad?: number;
  /** First frame number used when expanding `src`. */
  start?: number;
  /** How consecutive frames are composited while scrubbing. */
  variant?: FrameScrubVariant;
  /** Extra viewports of scroll the sequence is spread across. */
  scrollLength?: number;
  /** Scroll-following easing, 0 tracks the scrollbar exactly. */
  smooth?: number;
  /** How each frame fills the stage. */
  fit?: "cover" | "contain";
  /** Maximum stage width in pixels. */
  width?: number;
  /** Stage height as a fraction of the viewport. */
  height?: number;
  /** Stage corner radius in pixels. */
  borderRadius?: number;
  /** Colour painted behind every frame. */
  background?: string;
  /** Colour used by the built-in sequence and the readouts. */
  accent?: string;
  /** Echo count for the `ghost` variant. */
  trail?: number;
  /** Band count for the `slice` variant. */
  slices?: number;
  /** Column count for the `mosaic` variant. */
  cells?: number;
  /** How many frames of lag the offset variants spread across. */
  lag?: number;
  /** Extra scale applied at the start of the scrub. */
  punch?: number;
  /** Film grain strength. */
  grain?: number;
  /** Vignette strength. */
  vignette?: number;
  /** Show the frame readout. */
  showCounter?: boolean;
  /** Fired when the settled frame index changes. */
  onFrameChange?: (index: number) => void;
  className?: string;
}

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

const glide = (t: number) => t * t * (3 - 2 * t);

const SYNTH_W = 900;
const SYNTH_H = 560;
const POOL = 10;
const ARC = 260;
const RING = 34;

type Rgb = [number, number, number];

const readHex = (value: string): Rgb => {
  let h = value.trim().replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = Number.parseInt(h.slice(0, 6) || "888888", 16);
  if (Number.isNaN(n)) return [136, 136, 136];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const blend = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const luma = (c: Rgb) => (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;

const unitOf = (v: Rgb): Rgb => {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
};

const crossOf = (a: Rgb, b: Rgb): Rgb => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const dotOf = (a: Rgb, b: Rgb) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const KNOT_P = 2;
const KNOT_Q = 3;
const TUBE = 0.48;
const LENS = 16;
const TILT = 0.5;
const LIGHT: Rgb = [-0.42, -0.58, -0.7];
const HALF: Rgb = unitOf([-0.42, -0.58, -1.7]);

const shell = (() => {
  let cache: Float64Array | null = null;
  return () => {
    if (cache) return cache;
    const spine: Rgb[] = [];
    const tan: Rgb[] = [];
    for (let i = 0; i < ARC; i += 1) {
      const u = (i / ARC) * Math.PI * 2;
      const swell = 2 + Math.cos(KNOT_Q * u);
      spine.push([
        swell * Math.cos(KNOT_P * u),
        swell * Math.sin(KNOT_P * u),
        Math.sin(KNOT_Q * u) * 1.05,
      ]);
    }
    for (let i = 0; i < ARC; i += 1) {
      const a = spine[(i + 1) % ARC];
      const b = spine[(i - 1 + ARC) % ARC];
      tan.push(unitOf([a[0] - b[0], a[1] - b[1], a[2] - b[2]]));
    }

    const sides: Rgb[] = [];
    let side = unitOf(crossOf(tan[0], [0, 0, 1]));
    for (let i = 0; i < ARC; i += 1) {
      const t = tan[i];
      const drift = crossOf(t, crossOf(side, t));
      side = unitOf(
        Math.hypot(drift[0], drift[1], drift[2]) > 1e-6
          ? drift
          : crossOf(t, [0, 1, 0]),
      );
      sides.push(side);
    }
    const up0 = unitOf(crossOf(tan[0], sides[0]));
    const twist = Math.atan2(dotOf(side, up0), dotOf(side, sides[0]));

    const buf = new Float64Array(ARC * RING * 6);
    let w = 0;
    for (let i = 0; i < ARC; i += 1) {
      const fix = (-twist * i) / ARC;
      const cf = Math.cos(fix);
      const sf = Math.sin(fix);
      const raw = sides[i];
      const perp = unitOf(crossOf(tan[i], raw));
      const nx: Rgb = [
        raw[0] * cf + perp[0] * sf,
        raw[1] * cf + perp[1] * sf,
        raw[2] * cf + perp[2] * sf,
      ];
      const ny = unitOf(crossOf(tan[i], nx));
      for (let k = 0; k < RING; k += 1) {
        const a = (k / RING) * Math.PI * 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const dx = nx[0] * ca + ny[0] * sa;
        const dy = nx[1] * ca + ny[1] * sa;
        const dz = nx[2] * ca + ny[2] * sa;
        buf[w] = spine[i][0] + dx * TUBE;
        buf[w + 1] = spine[i][1] + dy * TUBE;
        buf[w + 2] = spine[i][2] + dz * TUBE;
        buf[w + 3] = dx;
        buf[w + 4] = dy;
        buf[w + 5] = dz;
        w += 6;
      }
    }
    cache = buf;
    return buf;
  };
})();

const QUADS = ARC * RING;
const seen = new Float64Array(ARC * RING * 6);
const facet = new Float64Array(QUADS * 12);
const order = new Int32Array(QUADS);

const synthDraw = (
  ctx: CanvasRenderingContext2D,
  phase: number,
  accent: string,
  background: string,
) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SYNTH_W, SYNTH_H);

  const base = readHex(accent);
  const back = readHex(background);
  const lit = luma(back) > luma(base);
  const dark = lit ? blend(base, [0, 0, 0], 0.34) : blend(base, back, 0.88);
  const bright = lit
    ? blend(base, back, 0.78)
    : blend(base, [255, 255, 255], 0.58);

  const cx = SYNTH_W / 2;
  const cy = SYNTH_H / 2;
  const reach = Math.min(SYNTH_W, SYNTH_H) / 9.9;
  const spin = phase * Math.PI * 2;
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);

  const mesh = shell();
  for (let v = 0; v < QUADS; v += 1) {
    const o = v * 6;
    const px = mesh[o];
    const pz2 = mesh[o + 2];
    const ax = px * cs + pz2 * sn;
    const az = pz2 * cs - px * sn;
    const ay = mesh[o + 1] * ct - az * st;
    const bz = mesh[o + 1] * st + az * ct;
    const gx = mesh[o + 3] * cs + mesh[o + 5] * sn;
    const gz = mesh[o + 5] * cs - mesh[o + 3] * sn;
    const persp = LENS / (LENS + bz);
    seen[o] = bz;
    seen[o + 1] = cx + ax * reach * persp;
    seen[o + 2] = cy + ay * reach * persp;
    seen[o + 3] = gx;
    seen[o + 4] = mesh[o + 4] * ct - gz * st;
    seen[o + 5] = mesh[o + 4] * st + gz * ct;
  }

  let live = 0;
  for (let i = 0; i < ARC; i += 1) {
    const rowA = i * RING;
    const rowB = ((i + 1) % ARC) * RING;
    for (let k = 0; k < RING; k += 1) {
      const k2 = (k + 1) % RING;
      const a0 = (rowA + k) * 6;
      const a1 = (rowA + k2) * 6;
      const b1 = (rowB + k2) * 6;
      const b0 = (rowB + k) * 6;
      const x0 = seen[a0 + 1];
      const y0 = seen[a0 + 2];
      const x1 = seen[a1 + 1];
      const y1 = seen[a1 + 2];
      const x2 = seen[b1 + 1];
      const y2 = seen[b1 + 2];
      const x3 = seen[b0 + 1];
      const y3 = seen[b0 + 2];
      const area =
        (x1 - x0) * (y2 - y0) -
        (x2 - x0) * (y1 - y0) +
        ((x2 - x0) * (y3 - y0) - (x3 - x0) * (y2 - y0));
      if (area >= 0) continue;
      const f = live * 12;
      facet[f] = (seen[a0] + seen[a1] + seen[b1] + seen[b0]) * 0.25;
      facet[f + 1] = x0;
      facet[f + 2] = y0;
      facet[f + 3] = x1;
      facet[f + 4] = y1;
      facet[f + 5] = x2;
      facet[f + 6] = y2;
      facet[f + 7] = x3;
      facet[f + 8] = y3;
      const ux = seen[a0 + 3] + seen[a1 + 3] + seen[b1 + 3] + seen[b0 + 3];
      const uy = seen[a0 + 4] + seen[a1 + 4] + seen[b1 + 4] + seen[b0 + 4];
      const uz = seen[a0 + 5] + seen[a1 + 5] + seen[b1 + 5] + seen[b0 + 5];
      const m = Math.hypot(ux, uy, uz) || 1;
      facet[f + 9] = ux / m;
      facet[f + 10] = uy / m;
      facet[f + 11] = uz / m;
      order[live] = live;
      live += 1;
    }
  }

  const slice = order.subarray(0, live);
  slice.sort((m, n) => facet[n * 12] - facet[m * 12]);

  for (let i = 0; i < live; i += 1) {
    const f = slice[i] * 12;
    const nx = facet[f + 9];
    const ny = facet[f + 10];
    const nz = facet[f + 11];
    const key = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    const sky = 0.5 - 0.5 * ny;
    const spec = Math.pow(
      Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]),
      34,
    );
    const fog = clamp((facet[f] + 3.2) / 9.5, 0, 0.58);
    const mix = clamp(0.03 + 0.8 * Math.pow(key, 1.15) + 0.09 * sky, 0, 1);
    const tone =
      mix < 0.5
        ? blend(dark, base, mix * 2)
        : blend(base, bright, (mix - 0.5) * 2);
    const c = blend(blend(tone, bright, spec * 0.6), back, fog);
    const paint = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    ctx.fillStyle = paint;
    ctx.strokeStyle = paint;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(facet[f + 1], facet[f + 2]);
    ctx.lineTo(facet[f + 3], facet[f + 4]);
    ctx.lineTo(facet[f + 5], facet[f + 6]);
    ctx.lineTo(facet[f + 7], facet[f + 8]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};

const noiseTile = (doc: Document, size: number) => {
  const cv = doc.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) return cv;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
};

export const FrameScrub = ({
  frames,
  src,
  video,
  videoQuality = 720,
  count = 48,
  pad = 3,
  start = 1,
  variant = "blend",
  scrollLength = 3,
  smooth = 0.18,
  fit = "cover",
  width = 1020,
  height = 0.72,
  borderRadius = 20,
  background = "#0a0a0a",
  accent = "#ededed",
  trail = 4,
  slices = 14,
  cells = 6,
  lag = 2.4,
  punch = 0.06,
  grain = 0.07,
  vignette = 0.34,
  showCounter = true,
  onFrameChange,
  className,
}: FrameScrubProps) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bank = useRef<HTMLImageElement[]>([]);
  const reel = useRef<HTMLCanvasElement[]>([]);
  const pool = useRef<{ key: number; cv: HTMLCanvasElement }[]>([]);
  const stamp = useRef("");
  const grit = useRef<HTMLCanvasElement | null>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const shown = useRef(0);
  const beat = useRef(0);
  const spin = useRef(0);
  const live = useRef(false);
  const seen = useRef(-1);
  const wakeRef = useRef<(() => void) | null>(null);
  const report = useRef(onFrameChange);

  const [lead, setLead] = useState(0);
  const [tally, setTally] = useState<{ key: string[] | null; n: number }>({
    key: null,
    n: 0,
  });
  const [pulled, setPulled] = useState<{ key: string; n: number }>({
    key: "",
    n: 0,
  });
  const [fault, setFault] = useState<{ key: string; msg: string } | null>(null);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    report.current = onFrameChange;
  }, [onFrameChange]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const sources = useMemo(() => {
    if (frames && frames.length > 0) return frames;
    if (!src) return null;
    const many = Math.max(1, Math.round(count));
    const out: string[] = [];
    for (let i = 0; i < many; i += 1) {
      const n = start + i;
      out.push(src.replace("{i}", String(n).padStart(Math.max(0, pad), "0")));
    }
    return out;
  }, [frames, src, count, pad, start]);

  const total = sources ? sources.length : clamp(Math.round(count), 2, 240);

  const feed: "urls" | "video" | "synth" = sources
    ? "urls"
    : video
      ? "video"
      : "synth";

  const ready =
    feed === "synth"
      ? 1
      : feed === "urls"
        ? tally.key === sources
          ? Math.min(1, tally.n / (sources as string[]).length)
          : 0
        : pulled.key === video
          ? Math.min(1, pulled.n / total)
          : 0;

  useEffect(() => {
    if (!sources) {
      bank.current = [];
      return;
    }
    reel.current = [];
    let alive = true;
    const imgs: HTMLImageElement[] = [];
    sources.forEach((url, i) => {
      const img = new Image();
      img.decoding = "async";
      const tick = () => {
        if (!alive) return;
        setTally((prev) =>
          prev.key === sources
            ? { key: sources, n: prev.n + 1 }
            : { key: sources, n: 1 },
        );
        wakeRef.current?.();
      };
      img.onload = tick;
      img.onerror = tick;
      img.src = url;
      imgs[i] = img;
    });
    bank.current = imgs;
    return () => {
      alive = false;
    };
  }, [sources]);

  useEffect(() => {
    if (sources || !video) {
      reel.current = [];
      return;
    }
    const root = rootRef.current;
    const doc = root ? root.ownerDocument : null;
    if (!doc) return;

    let alive = true;
    const el = doc.createElement("video");
    el.preload = "auto";
    el.muted = true;
    el.playsInline = true;

    const settle = (name: string) =>
      new Promise<boolean>((done) => {
        let closed = false;
        const finish = (ok: boolean) => {
          if (closed) return;
          closed = true;
          el.removeEventListener(name, hit);
          el.removeEventListener("error", miss);
          clearTimeout(timer);
          done(ok);
        };
        const hit = () => finish(true);
        const miss = () => finish(false);
        const timer = setTimeout(() => finish(false), 8000);
        el.addEventListener(name, hit);
        el.addEventListener("error", miss);
      });

    const harvest = async () => {
      el.src = video;
      if (!(await settle("loadedmetadata"))) {
        if (alive)
          setFault({
            key: video,
            msg:
              el.error && el.error.code === 4
                ? "This browser cannot decode that video format"
                : "This video could not be loaded",
          });
        return;
      }
      if (!alive) return;
      const span = el.duration;
      if (!Number.isFinite(span) || span <= 0) {
        if (alive)
          setFault({ key: video, msg: "This video has no readable duration" });
        return;
      }
      const vw = el.videoWidth || 1280;
      const vh = el.videoHeight || 720;
      const trim = Math.min(1, Math.max(160, videoQuality) / vw);
      const fw = Math.max(2, Math.round(vw * trim));
      const fh = Math.max(2, Math.round(vh * trim));
      const kept: HTMLCanvasElement[] = [];
      for (let i = 0; i < total; i += 1) {
        if (!alive) return;
        el.currentTime = (span * (i + 0.5)) / total;
        if (!(await settle("seeked"))) {
          if (alive && i === 0)
            setFault({ key: video, msg: "This video could not be decoded" });
          return;
        }
        if (!alive) return;
        const cv = doc.createElement("canvas");
        cv.width = fw;
        cv.height = fh;
        const c2 = cv.getContext("2d");
        if (!c2) return;
        c2.drawImage(el, 0, 0, fw, fh);
        kept[i] = cv;
        reel.current = kept;
        setPulled({ key: video, n: i + 1 });
        wakeRef.current?.();
      }
    };

    harvest();
    return () => {
      alive = false;
      el.removeAttribute("src");
      el.load();
      reel.current = [];
    };
  }, [sources, video, videoQuality, total]);

  const surface = useCallback(
    (index: number) => {
      const root = rootRef.current;
      const doc = root ? root.ownerDocument : null;
      if (!doc) return null;
      const token = `${accent}|${background}|${total}`;
      if (stamp.current !== token) {
        stamp.current = token;
        pool.current = [];
      }
      const hit = pool.current.find((e) => e.key === index);
      if (hit) return hit.cv;
      let slot: { key: number; cv: HTMLCanvasElement };
      if (pool.current.length >= POOL) {
        slot = pool.current.pop() as { key: number; cv: HTMLCanvasElement };
        slot.key = index;
      } else {
        const cv = doc.createElement("canvas");
        cv.width = SYNTH_W;
        cv.height = SYNTH_H;
        slot = { key: index, cv };
      }
      const c2 = slot.cv.getContext("2d");
      if (!c2) return null;
      synthDraw(c2, index / Math.max(1, total), accent, background);
      pool.current.unshift(slot);
      return slot.cv;
    },
    [accent, background, total],
  );

  const paint = useCallback(
    (p: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { w: cw, h: ch, dpr } = size.current;
      if (cw < 2 || ch < 2) return;

      const last = Math.max(0, total - 1);
      const at = clamp(p, 0, 1) * last;

      const pick = (i: number) => {
        const k = clamp(Math.round(i), 0, last);
        if (feed === "video") {
          const cv = reel.current[k];
          return cv
            ? { img: cv as CanvasImageSource, w: cv.width, h: cv.height }
            : null;
        }
        if (feed === "synth") {
          const cv = surface(k);
          return cv
            ? { img: cv as CanvasImageSource, w: SYNTH_W, h: SYNTH_H }
            : null;
        }
        const img = bank.current[k];
        if (!img || !img.complete || img.naturalWidth === 0) return null;
        return {
          img: img as CanvasImageSource,
          w: img.naturalWidth,
          h: img.naturalHeight,
        };
      };

      const blit = (i: number, alpha: number) => {
        const f = pick(i);
        if (!f || alpha <= 0.002) return;
        const scale =
          fit === "contain"
            ? Math.min(cw / f.w, ch / f.h)
            : Math.max(cw / f.w, ch / f.h);
        const dw = f.w * scale;
        const dh = f.h * scale;
        ctx.globalAlpha = clamp(alpha, 0, 1);
        ctx.drawImage(f.img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        ctx.globalAlpha = 1;
      };

      const sample = (time: number, alpha: number, soft: boolean) => {
        const t = clamp(time, 0, last);
        if (!soft) {
          blit(t, alpha);
          return;
        }
        const a = Math.floor(t);
        const f = t - a;
        blit(a, alpha);
        if (f > 0.002 && a < last) blit(a + 1, alpha * glide(f));
      };

      const region = (
        x: number,
        y: number,
        w: number,
        h: number,
        time: number,
      ) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        sample(time, 1, true);
        ctx.restore();
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, cw, ch);

      const grow = 1 + Math.max(0, punch) * (1 - clamp(p, 0, 1));
      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.scale(grow, grow);
      ctx.translate(-cw / 2, -ch / 2);

      const spread = Math.max(0, lag);

      if (variant === "plain") {
        sample(at, 1, false);
      } else if (variant === "ghost") {
        const echoes = clamp(Math.round(trail), 0, 8);
        const weights: number[] = [];
        for (let k = echoes; k >= 0; k -= 1) weights.push(Math.exp(-k * 0.62));
        let sum = 0;
        for (let j = 0; j < weights.length; j += 1) {
          const k = echoes - j;
          sum += weights[j];
          sample(at - k * spread * 0.5, weights[j] / sum, true);
        }
      } else if (variant === "slice") {
        const bands = Math.max(1, Math.round(slices));
        const band = ch / bands;
        for (let j = 0; j < bands; j += 1) {
          const mix = bands < 2 ? 0.5 : j / (bands - 1);
          region(0, j * band, cw, band + 1, at + (mix - 0.5) * spread);
        }
      } else if (variant === "mosaic") {
        const cols = Math.max(1, Math.round(cells));
        const cellW = cw / cols;
        const rows = Math.max(1, Math.round(ch / cellW));
        const cellH = ch / rows;
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const dx = cols < 2 ? 0 : (c + 0.5) / cols - 0.5;
            const dy = rows < 2 ? 0 : (r + 0.5) / rows - 0.5;
            const far = Math.min(1, Math.hypot(dx, dy) * 2);
            region(
              c * cellW,
              r * cellH,
              cellW + 1,
              cellH + 1,
              at + (far - 0.5) * spread,
            );
          }
        }
      } else if (variant === "wipe") {
        const a = Math.floor(clamp(at, 0, last));
        const f = clamp(at - a, 0, 1);
        const edge = f * cw;
        sample(a, 1, false);
        if (a < last && edge > 0.5) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, edge, ch);
          ctx.clip();
          blit(a + 1, 1);
          ctx.restore();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = accent;
          ctx.fillRect(edge - 1, 0, 1.5, ch);
          ctx.globalAlpha = 1;
        }
      } else {
        sample(at, 1, true);
      }

      ctx.restore();

      if (vignette > 0.001) {
        const grad = ctx.createRadialGradient(
          cw / 2,
          ch / 2,
          Math.min(cw, ch) * 0.22,
          cw / 2,
          ch / 2,
          Math.max(cw, ch) * 0.72,
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, `rgba(0,0,0,${clamp(vignette, 0, 1).toFixed(3)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      if (grain > 0.001 && grit.current) {
        ctx.globalAlpha = clamp(grain, 0, 1);
        const pat = ctx.createPattern(grit.current, "repeat");
        if (pat) {
          ctx.fillStyle = pat;
          ctx.fillRect(0, 0, cw, ch);
        }
        ctx.globalAlpha = 1;
      }

      const front = clamp(Math.round(at), 0, last);
      if (front !== seen.current) {
        seen.current = front;
        setLead(front);
        report.current?.(front);
      }
    },
    [
      accent,
      background,
      cells,
      fit,
      grain,
      lag,
      punch,
      slices,
      feed,
      surface,
      total,
      trail,
      variant,
      vignette,
    ],
  );

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return 0;
    const view = root.ownerDocument.defaultView;
    const tall = view ? view.innerHeight : 0;
    const box = root.getBoundingClientRect();
    const span = box.height - tall;
    if (span <= 0) return 0;
    return clamp(-box.top / span, 0, 1);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cv = canvasRef.current;
    if (!root || !cv) return;
    const doc = root.ownerDocument;
    const view = doc.defaultView;
    if (!view) return;

    ctxRef.current = cv.getContext("2d");
    if (!grit.current) grit.current = noiseTile(doc, 128);

    const ease = calm ? 0 : clamp(smooth, 0, 0.95);

    const resize = () => {
      const box = cv.getBoundingClientRect();
      const dpr = Math.min(2, view.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(box.width));
      const h = Math.max(1, Math.round(box.height));
      if (
        size.current.w !== w ||
        size.current.h !== h ||
        size.current.dpr !== dpr
      ) {
        size.current = { w, h, dpr };
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
    };

    const step = (time: number) => {
      const prev = beat.current || time;
      const delta = Math.min(0.05, Math.max(0, (time - prev) / 1000));
      beat.current = time;

      const target = measure();
      const from = shown.current;
      const pull = ease > 0 ? 1 - Math.pow(1 - ease, delta * 60) : 1;
      const next = from + (target - from) * pull;
      shown.current = next;
      paint(next);

      if (Math.abs(target - next) > 0.00015) {
        spin.current = view.requestAnimationFrame(step);
      } else {
        shown.current = target;
        paint(target);
        live.current = false;
      }
    };

    const wake = () => {
      if (live.current) return;
      live.current = true;
      beat.current = 0;
      spin.current = view.requestAnimationFrame(step);
    };
    wakeRef.current = wake;

    const relayout = () => {
      resize();
      shown.current = measure();
      paint(shown.current);
      wake();
    };

    resize();
    shown.current = measure();
    paint(shown.current);

    view.addEventListener("scroll", wake, { passive: true });
    doc.addEventListener("scroll", wake, { passive: true, capture: true });
    view.addEventListener("resize", relayout);

    const watch = new ResizeObserver(relayout);
    watch.observe(cv);

    return () => {
      view.cancelAnimationFrame(spin.current);
      live.current = false;
      wakeRef.current = null;
      view.removeEventListener("scroll", wake);
      doc.removeEventListener("scroll", wake, { capture: true });
      view.removeEventListener("resize", relayout);
      watch.disconnect();
    };
  }, [measure, paint, smooth, calm]);

  const runway = 100 + Math.max(0.2, scrollLength) * 100;
  const slip = fault && video && fault.key === video ? fault.msg : null;
  const loading = feed !== "synth" && (ready < 1 || slip !== null);

  return (
    <section
      ref={rootRef}
      aria-label="Scroll-scrubbed frame sequence"
      className={cn("relative w-full", className)}
      style={{ height: `${runway}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden px-4 sm:px-8">
        <div
          className="relative w-full overflow-hidden"
          style={{
            maxWidth: `${Math.max(200, width)}px`,
            height: `${clamp(height, 0.2, 0.95) * 100}vh`,
            borderRadius: `${Math.max(0, borderRadius)}px`,
            backgroundColor: background,
          }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {showCounter && (
            <div
              className="pointer-events-none absolute right-4 top-4 font-mono text-[11px] tracking-[0.18em] tabular-nums sm:right-5 sm:top-5"
              style={{ color: accent, opacity: 0.72 }}
            >
              {String(lead + 1).padStart(2, "0")}
              <span style={{ opacity: 0.5 }}>
                {" / "}
                {String(total).padStart(2, "0")}
              </span>
            </div>
          )}

          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: background }}
            >
              {slip ? (
                <span
                  className="max-w-[70%] text-center font-mono text-[11px] leading-relaxed tracking-[0.14em]"
                  style={{ color: accent, opacity: 0.55 }}
                >
                  {slip}
                </span>
              ) : (
                <div className="flex w-40 flex-col items-center gap-2">
                  <span
                    className="block h-px w-full overflow-hidden"
                    style={{ backgroundColor: `${accent}26` }}
                  >
                    <span
                      className="block h-full w-full origin-left"
                      style={{
                        backgroundColor: accent,
                        transform: `scaleX(${ready.toFixed(3)})`,
                      }}
                    />
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-[0.18em] tabular-nums"
                    style={{ color: accent, opacity: 0.6 }}
                  >
                    {Math.round(ready * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FrameScrub;
