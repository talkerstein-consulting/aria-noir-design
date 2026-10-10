"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
export interface DollyGalleryImage {
  src: string;
  alt?: string;
}
export interface DollyGalleryProps {
  images?: (string | DollyGalleryImage)[];
  infinite?: boolean;
  itemWidth?: number;
  aspectRatio?: number;
  borderRadius?: number;
  grayscale?: number;
  perspective?: number;
  spacing?: number;
  spread?: number;
  scatter?: number;
  revealRange?: number;
  passRange?: number;
  parallaxX?: number;
  parallaxY?: number;
  parallaxSmooth?: number;
  tilt?: number;
  pulse?: number;
  drift?: number;
  smooth?: number;
  wheelSpeed?: number;
  dragSpeed?: number;
  autoScroll?: number;
  pauseOnHover?: boolean;
  backgroundColor?: string;
  onIndexChange?: (index: number, side: -1 | 1) => void;
  /** Come to rest with a photograph at its place, never between two. */
  snap?: boolean;
  /** Lay each tile out this many times larger and scale it back down, so the
   *  browser rasterises it sharp when it swells toward the viewer. */
  resolution?: number;
  /** Where a photograph rests, as a fraction of `spacing` PAST the front:
   *  0 is the front plane; ~0.6 is beside the viewer, at its largest. The
   *  snap and the reported index both answer to this point. */
  rest?: number;
  /** Opacity of a photograph that is not in focus, when snapping. */
  ghost?: number;
  /** The direction photographs alternate in: left/right, or top/bottom. */
  axis?: "x" | "y";
  /** On the y axis: how far out a photograph waits, per spacing of depth. */
  fan?: number;
  className?: string;
  children?: ReactNode;
}
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=900&auto=format&fit=crop",
];
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
const wrap = (value: number, span: number) => ((value % span) + span) % span;
const jitter = (k: number, salt: number) => {
  const x = Math.sin(k * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const normalise = (image: string | DollyGalleryImage): DollyGalleryImage =>
  typeof image === "string" ? { src: image } : image;
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
interface Drag {
  y: number;
  at: number;
}
export const DollyGallery = ({
  images = DEFAULT_IMAGES,
  infinite = true,
  itemWidth = 340,
  aspectRatio = 4 / 5,
  borderRadius = 0,
  grayscale = 1,
  perspective = 1000,
  spacing = 800,
  spread = 0.8,
  scatter = 0.1,
  revealRange = 1.5,
  passRange = 1,
  parallaxX = 0.12,
  parallaxY = 0.06,
  parallaxSmooth = 0.85,
  tilt = 4,
  pulse = 0.03,
  drift = 0.08,
  smooth = 0.85,
  wheelSpeed = 1,
  dragSpeed = 1.5,
  autoScroll = 0,
  pauseOnHover = true,
  backgroundColor = "transparent",
  onIndexChange,
  snap = false,
  resolution = 1,
  rest = 0,
  ghost = 0.04,
  axis = "x",
  fan = 0,
  className,
  children,
}: DollyGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const slots = useRef<HTMLDivElement[]>([]);
  const target = useRef(Number.NaN);
  const shown = useRef(Number.NaN);
  const speed = useRef(0);
  const sway = useRef(0);
  const frame = useRef(0);
  const live = useRef(false);
  const stamp = useRef(0);
  const hovering = useRef(false);
  const visible = useRef(true);
  const dragging = useRef<Drag | null>(null);
  const flick = useRef(0);
  const aim = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const lastIndex = useRef(Number.NaN);
  const indexChange = useRef(onIndexChange);
  indexChange.current = onIndexChange;
  const [box, setBox] = useState({ width: 0, height: 0 });
  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    () => false,
  );
  const list = useMemo(() => images.map(normalise), [images]);
  const tileWidth = Math.max(40, Math.min(itemWidth, box.width - 32));
  const tileHeight = tileWidth / Math.max(0.1, aspectRatio);
  const step = Math.max(40, spacing);
  const res = Math.max(1, resolution);
  const lead = rest * step;
  const snapTo = (value: number) => Math.round((value - lead) / step) * step + lead;
  const snapTimer = useRef(0);
  const dragFrom = useRef(0);
  const ring = useMemo(() => {
    if (!list.length) return [];
    if (!infinite) return list.map((image, index) => ({ image, index }));
    const needed = Math.ceil(revealRange + passRange) + 2;
    let copies = Math.max(1, Math.ceil((needed + 1) / list.length));
    /* An even ring, so left and right still alternate across the seam. */
    if ((copies * list.length) % 2) copies++;
    const out: {
      image: DollyGalleryImage;
      index: number;
    }[] = [];
    for (let c = 0; c < copies; c++) {
      list.forEach((image, index) => out.push({ image, index }));
    }
    return out;
  }, [list, infinite, revealRange, passRange]);
  const cycle = ring.length * step;
  const reach = Math.max(0, (list.length - 1) * step);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const watch = new ResizeObserver(() => {
      setBox({ width: root.clientWidth, height: root.clientHeight });
    });
    watch.observe(root);
    return () => watch.disconnect();
  }, []);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const watch = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    watch.observe(root);
    return () => watch.disconnect();
  }, []);
  const paint = useCallback(
    (offset: number) => {
      if (!box.height || !ring.length) return;
      const half = cycle / 2;
      const rush = clamp(Math.abs(speed.current) / 2500, 0, 1);
      const px = eased.current.x;
      const py = eased.current.y;
      let nearest = -1;
      let nearestGap = Infinity;
      let nearestSide: -1 | 1 = 1;
      for (let k = 0; k < ring.length; k++) {
        const slot = slots.current[k];
        if (!slot) continue;
        const raw = k * step - offset;
        const depth = infinite ? wrap(raw + half, cycle) - half : raw;
        const t = depth / step;
        const alpha =
          t >= 0
            ? 1 - clamp(t / Math.max(0.01, revealRange), 0, 1)
            : 1 - clamp(-t / Math.max(0.01, passRange), 0, 1);
        if (alpha <= 0.002 || -depth >= perspective * 0.95) {
          slot.style.visibility = "hidden";
          continue;
        }
        slot.style.visibility = "visible";
        /* Snapping: the words answer to where the gallery is GOING, so they
           change with the gesture, not halfway through the move. */
        const aimRaw = k * step - (snap ? target.current : offset);
        const aimDepth = infinite ? wrap(aimRaw + half, cycle) - half : aimRaw;
        const gap = Math.abs(aimDepth + lead);
        if (gap < nearestGap) {
          nearestGap = gap;
          nearest = ring[k].index;
          nearestSide = k % 2 === 0 ? -1 : 1;
        }
        const side = k % 2 === 0 ? -1 : 1;
        const baseX = axis === "x" ? side * spread * tileWidth : 0;
        const baseY =
          axis === "y"
            ? side * spread * tileHeight +
              /* Far photographs held out toward the edge, clear of the words. */
              side * fan * tileHeight * Math.max(0, t)
            : (jitter(k, 2) * 2 - 1) * scatter * tileHeight;
        const x = baseX + px * parallaxX * tileWidth * alpha;
        const y =
          baseY +
          py * parallaxY * tileHeight * alpha +
          sway.current * drift * tileHeight;
        const swell = 1 + pulse * rush * alpha;
        const rx = -py * tilt * rush * alpha;
        const ry = px * tilt * rush * alpha;
        /* House change: far photographs sit back, low; a photograph is at
           full strength when it is largest, passing at the side. */
        /* With a resting point, only the photograph in focus is seen at
           strength; every other one is a ghost until it arrives. */
        const focus = clamp(1 - Math.abs(depth + lead) / (step * 0.55), 0, 1);
        const strength = snap
          ? (ghost + (1 - ghost) * focus * focus) * clamp(alpha * 8, 0, 1)
          : t >= 0
            ? alpha * alpha
            : clamp(alpha * 3, 0, 1);
        slot.style.opacity = strength.toFixed(3);
        slot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${(-depth).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(swell / res).toFixed(4)})`;
      }
      if (snap && ring.length && Number.isFinite(target.current)) {
        /* Snapping on a finite run: the photograph is simply the one the
           scroll is resting on, counted, not searched for. */
        const n = Math.round((target.current - lead) / step);
        const k = infinite
          ? ((n % ring.length) + ring.length) % ring.length
          : clamp(n, 0, ring.length - 1);
        nearest = ring[k].index;
        nearestSide = k % 2 === 0 ? -1 : 1;
      }
      if (nearest >= 0 && nearest * 4 + nearestSide !== lastIndex.current) {
        lastIndex.current = nearest * 4 + nearestSide;
        indexChange.current?.(nearest, nearestSide);
      }
    },
    [
      box.height,
      ring,
      cycle,
      step,
      infinite,
      revealRange,
      passRange,
      perspective,
      spread,
      scatter,
      tileWidth,
      tileHeight,
      parallaxX,
      parallaxY,
      drift,
      pulse,
      tilt,
      res,
      lead,
      snap,
      ghost,
      axis,
      fan,
    ],
  );
  const settle = useCallback(
    (value: number) => (infinite ? value : clamp(value, 0, reach + lead)),
    [infinite, reach, lead],
  );
  const wake = useCallback(() => {
    if (live.current) return;
    live.current = true;
    stamp.current = 0;
    const tick = (now: number) => {
      const dt = stamp.current
        ? Math.min(0.05, (now - stamp.current) / 1000)
        : 1 / 60;
      stamp.current = now;
      const drifting =
        autoScroll !== 0 &&
        visible.current &&
        !(pauseOnHover && hovering.current) &&
        !dragging.current;
      if (drifting) target.current = settle(target.current + autoScroll * dt);
      if (Math.abs(flick.current) > 1) {
        target.current = settle(target.current + flick.current * dt);
        flick.current *= Math.pow(0.02, dt);
      } else {
        flick.current = 0;
      }
      const rate = 1.5 + (1 - clamp(smooth, 0, 1)) * 30;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * rate);
      const next = shown.current + (target.current - shown.current) * ease;
      const moved = next - shown.current;
      shown.current = next;
      const velocity = reduced ? 0 : moved / dt;
      const blend = 1 - Math.exp(-dt * 8);
      speed.current += (velocity - speed.current) * blend;
      sway.current +=
        (clamp(-velocity / 2500, -1, 1) - sway.current) * blend * 0.6;
      const pointerRate = 2 + (1 - clamp(parallaxSmooth, 0, 1)) * 40;
      const pointerEase = reduced ? 1 : 1 - Math.exp(-dt * pointerRate);
      eased.current.x += (aim.current.x - eased.current.x) * pointerEase;
      eased.current.y += (aim.current.y - eased.current.y) * pointerEase;
      paint(shown.current);
      const restless =
        Math.abs(target.current - shown.current) > 0.05 ||
        Math.abs(speed.current) > 1 ||
        Math.abs(sway.current) > 0.001 ||
        Math.abs(aim.current.x - eased.current.x) > 0.001 ||
        Math.abs(aim.current.y - eased.current.y) > 0.001;
      if (restless || drifting || flick.current !== 0) {
        frame.current = requestAnimationFrame(tick);
      } else {
        shown.current = target.current;
        speed.current = 0;
        sway.current = 0;
        paint(shown.current);
        live.current = false;
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [
    autoScroll,
    pauseOnHover,
    settle,
    reduced,
    smooth,
    parallaxSmooth,
    paint,
  ]);
  useEffect(() => {
    /* First paint: open at rest on the first photograph. */
    if (Number.isNaN(target.current)) target.current = lead;
    if (Number.isNaN(shown.current)) shown.current = lead;
    target.current = settle(target.current);
    shown.current = settle(shown.current);
    paint(shown.current);
    wake();
    return () => {
      cancelAnimationFrame(frame.current);
      live.current = false;
    };
  }, [paint, settle, wake]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.height : 1;
      const before = target.current;
      if (snap) {
        /* One gesture, one photograph: down is the next, up the previous.
           A trackpad's stream of small deltas counts once; the gesture ends
           when the wheel has been still for a moment. */
        if (Math.abs(event.deltaY) < 2) return;
        const next = settle(snapTo(before) + Math.sign(event.deltaY) * step);
        if (!infinite && next === before && !snapTimer.current) return;
        event.preventDefault();
        if (!snapTimer.current) {
          target.current = next;
          paint(shown.current);
          flick.current = 0;
          wake();
        }
        window.clearTimeout(snapTimer.current);
        snapTimer.current = window.setTimeout(() => {
          snapTimer.current = 0;
        }, 220);
        return;
      }
      target.current = settle(before + event.deltaY * unit * wheelSpeed);
      if (!infinite && target.current === before) return;
      event.preventDefault();
      flick.current = 0;
      wake();
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.height, wheelSpeed, settle, infinite, wake, snap, step, paint]);
  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    aim.current.x = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1,
    );
    aim.current.y = clamp(
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
      -1,
      1,
    );
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragging.current = { y: event.clientY, at: performance.now() };
    dragFrom.current = target.current;
    flick.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    track(event);
    const drag = dragging.current;
    if (!drag) {
      wake();
      return;
    }
    const dy = event.clientY - drag.y;
    const now = performance.now();
    const dt = Math.max(1, now - drag.at) / 1000;
    drag.y = event.clientY;
    drag.at = now;
    target.current = settle(target.current - dy * dragSpeed);
    flick.current = (-dy * dragSpeed) / dt;
    wake();
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    flick.current = clamp(flick.current, -4000, 4000);
    if (snap) {
      /* Where the flick would coast to, rounded to a photograph. */
      const from = snapTo(dragFrom.current);
      const moved = target.current - dragFrom.current;
      target.current = settle(
        Math.abs(moved) > 30 ? from + Math.sign(moved) * step : from,
      );
      flick.current = 0;
    }
    wake();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const jumps: Record<string, number> = {
      ArrowDown: step,
      ArrowUp: -step,
      ArrowRight: step,
      ArrowLeft: -step,
      PageDown: step,
      PageUp: -step,
      " ": step,
    };
    const jump = jumps[event.key];
    if (jump === undefined) return;
    event.preventDefault();
    target.current = settle(target.current + jump);
    wake();
  };
  const tileStyle: CSSProperties = {
    width: tileWidth * res,
    height: tileHeight * res,
    left: "50%",
    top: "50%",
    marginLeft: (-tileWidth * res) / 2,
    marginTop: (-tileHeight * res) / 2,
    borderRadius: borderRadius * res,
  };
  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image gallery"
      tabIndex={0}
      className={cn(
        "relative h-full w-full cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-inset",
        className,
      )}
      style={{ backgroundColor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
        aim.current.x = 0;
        aim.current.y = 0;
        wake();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ perspective: `${perspective}px` }}
      >
        {ring.map(({ image, index }, k) => (
          <div
            key={k}
            ref={(node) => {
              if (node) slots.current[k] = node;
              else delete slots.current[k];
            }}
            className="invisible absolute overflow-hidden bg-neutral-800 will-change-[transform,opacity] [backface-visibility:hidden]"
            style={tileStyle}
            aria-hidden={k >= list.length}
          >
            <img
              src={image.src}
              alt={image.alt ?? `Gallery image ${index + 1}`}
              draggable={false}
              loading="lazy"
              style={{
                filter:
                  grayscale > 0
                    ? `grayscale(${clamp(grayscale, 0, 1)})`
                    : undefined,
              }}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      {children ? (
        <div className="pointer-events-none relative z-[2] h-full w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
};
export default DollyGallery;
