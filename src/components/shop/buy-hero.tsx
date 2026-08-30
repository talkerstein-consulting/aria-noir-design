"use client";

import Image from "next/image";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import type { House } from "@/lib/navigation";
import {
  COLLECTION_LABEL,
  defaultColorway,
  galleryFor,
  modelFor,
  priceOf,
  stockFor,
  swatchFor,
} from "@/lib/shop";
import { useBag } from "@/lib/cart";
import { CtaButton } from "@/components/cta-link";
import { RevealPlate } from "@/components/reveal";
import {
  ProductModel,
  REST_YAW,
  preloadModels,
  resetTurn,
} from "@/components/product/product-model";
import { ColourwayPicker } from "@/components/shop/colourway-picker";
import { QtyStepper } from "@/components/shop/qty-stepper";

/**
 * The transaction, and the scene that hands you to it.
 *
 * ---- The opening ----
 *
 * The page does not begin as a shop. It begins as one object: the name
 * centred, the hero colourway turning underneath it, nothing to buy on
 * screen. Then scrolling resolves that into the buy layout — the frame
 * travels left into the column it will scroll in, turning as it goes; the
 * offer slides in from the right; the name lifts away above it. By the end
 * of the first screen the turntable is sitting exactly where the first
 * photograph would be, on the same ground, so the sequence continues into
 * the colourway's own shots without a seam.
 *
 * ---- Why the choreography is one transform on one element ----
 *
 * The frame is never moved between containers, and there is no second copy
 * of it fading in somewhere else. It lives in its slot in the left column
 * for the whole page; what changes is a transform that pulls that slot to
 * the middle of the VIEWPORT and lets go of it. The slot's untransformed
 * position is measured once and the live scroll subtracted from it each
 * frame, so "the middle of the screen" tracks the scroll for free — and
 * the end state is the identity transform, which is why the landing is
 * exact rather than nearly right.
 *
 * Everything is written straight to the DOM inside a rAF loop rather than
 * held in state. This is sixty frames a second of numbers React does not
 * draw; re-rendering a WebGL canvas's parent that often would be the one
 * way to make a turntable stutter.
 */

/** How much of the first screen the opening takes. Below 1 the frame would
 *  land before the title has left; much above and the page feels stuck. */
const OPENING = 0.85;

/** How much bigger the frame is at rest than in its slot.
 *
 *  1 — it is not enlarged at all. The viewer already fits the frame to 86%
 *  of the canvas, so any zoom above 1 pushes the temples past the edge and
 *  the opening shot arrives cropped. An uncropped whole object is worth
 *  more here than a bigger part of one.
 *
 *  Kept as a named constant rather than deleted because the plumbing it
 *  drives is the correct plumbing: enlargement happens inside the 3D
 *  scene, NOT as a CSS scale on the slot. The slot holds a canvas whose
 *  drawing buffer is sized from the container's measured rect, and a
 *  measured rect includes transforms — so a CSS scale here feeds the
 *  canvas's size back into its own measurement and the element grows
 *  without bound. See ProductModel's useFrame. */
const OPENING_SCALE = 1;

/**
 * How much wider the CANVAS is than the square it lands in.
 *
 * The frame can only be drawn as large as its canvas: at 1 the viewer fits
 * it to 86% of a slot-sized buffer, and any enlargement past that pushes
 * the temples over the edge. So the canvas is cut oversized and STAYS that
 * size for the whole page — no per-frame resizing, no scaled container,
 * neither of which a WebGL canvas survives — and the frame is simply drawn
 * smaller inside it once landed.
 */
const CANVAS_OVERSIZE = 2.3;
/** What the zoom settles to, so a frame drawn in an oversized canvas ends
 *  up the size it would have been in a slot-sized one. */
const LANDED_ZOOM = 1 / CANVAS_OVERSIZE;

/** The frame opens SQUARE TO THE READER and turns into the viewer's three
 *  quarters as it travels.
 *
 *  This is the negative of the viewer's rest angle rather than a number of
 *  its own: the bias is added to REST_YAW, so cancelling it exactly is
 *  what "facing front" means. Imported rather than copied — the day the
 *  rest angle moves, front is still front. */
const OPENING_YAW = -REST_YAW;

/** The scrim's vertical padding, in pixels — 0.85rem, the same number the
 *  stylesheet uses.
 *
 *  It is here because the pin has to be SEAMLESS: the control is caught at
 *  the exact moment its own bottom edge reaches the foot of the screen, and
 *  once pinned it gains this padding. Taking the padding off the trigger
 *  line means the controls sit at the same pixel either side of the
 *  switch, so nothing jumps as it locks. */
const PIN_PAD = 14;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The scroll position the page is actually PAINTED at.
 *
 *  Lenis animates the page from its own loop, and window.scrollY trails it
 *  while it does — so anything choreographed against the document's number
 *  is describing last frame's position. */
/** The viewport WITHOUT the scrollbar.
 *
 *  `window.innerWidth` counts the scrollbar gutter, so sizing the full-bleed
 *  grey from it made the grey 10px wider than the page — which is a
 *  horizontal scrollbar, on the one screen that is meant to be a single
 *  object on a field of grey. `clientWidth` is the space actually available
 *  to lay out in. */
const vw = () => document.documentElement.clientWidth;
const vh = () => document.documentElement.clientHeight;

const scrollNow = () =>
  (window as unknown as { __lenis?: { scroll: number } }).__lenis?.scroll ??
  window.scrollY;
/** Ease-out cubic: fast off the mark, settling into the slot. */
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

export function BuyHero({ house }: { house: House }) {
  /* Seeded with the house's hero colourway, and with the SAME rule the
     picker uses — see defaultColorway. The opening turns a specific
     acetate; the panel beside it has to name that one. */
  const [chosen, setChosen] = useState<string | null>(
    () => defaultColorway(house) || null,
  );
  const [qty, setQty] = useState(1);

  /* The buy control, and the box that holds its place while it is pinned. */
  const buyRowRef = useRef<HTMLDivElement>(null);
  const buySlotRef = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);

  const entry = stockFor(house).find((e) => e.colorway === chosen);
  const available = entry?.available === true;
  const { add } = useBag();

  const images = galleryFor(house, chosen ?? undefined);
  const modelSrc = modelFor(house, chosen);

  /* ---- The turntable is a DESKTOP object ----

     A phone gets the photographs and the offer, and no 3D at all. The
     opening choreography was already switched off there, which left a
     WebGL canvas and a multi-megabyte glb being downloaded and drawn so
     that a still frame could sit above the pictures — paid for by the
     device least able to afford either.

     `null` until measured, and measured in a LAYOUT effect: the server and
     the first client paint both render no model, and a wide screen mounts
     it before the browser paints, so there is no flash and no hydration
     mismatch. Doing this with `useSyncExternalStore` (as private-access
     does) would render the desktop branch once during hydration — which on
     a phone means mounting the canvas and starting the glb fetch before
     unmounting it again, which is the whole cost this avoids. */
  const [wide, setWide] = useState<boolean | null>(null);
  useLayoutEffect(() => {
    const q = window.matchMedia("(min-width: 1024px)");
    const read = () => setWide(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);

  /* Everything downstream reads this, so one check gates the canvas, the
     opening title, the preload and the choreography together. */
  const model = wide ? modelSrc : null;
  const acetate = swatchFor(chosen ?? house.colorwayNames[0]);

  const addToBag = () => {
    if (!chosen) return;
    add(house.slug, chosen, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const titleRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /* The panel's CONTENT, transformed separately from the sticky box that
     holds it. Transforming the sticky element itself would mean measuring
     a box this loop is moving; the outer stays put and honest, the inner
     is what slides. */
  const panelInnerRef = useRef<HTMLDivElement>(null);
  /* The grey, which is NOT the canvas's container. It scales from the full
     screen down to the slot, and it can only do that as a plain div — a
     scaled canvas container feeds its own measurement. */
  const groundRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /* Read by the render loop inside the Canvas, written by the one out
     here. A ref rather than a prop for the reason above. */
  const yaw = useRef(0);
  const zoom = useRef(1);

  /* useLayoutEffect, not useEffect.

     useEffect runs AFTER the browser paints, so the scene drew one frame at
     its natural layout position and then snapped into place — the panel was
     measured painting at 992px and jumping to 192px on the very next frame.
     A layout effect runs before that first paint, so the opening is never
     shown in its un-choreographed state. */
  useLayoutEffect(() => {
    const slot = slotRef.current;
    const title = titleRef.current;
    const panel = panelRef.current;
    const inner = panelInnerRef.current;
    const ground = groundRef.current;

    if (!slot) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 1023px)");

    let last = -1;
    /* Whether the landed state has already been written. Without it the
       phone branch would rewrite the same six inline styles sixty times a
       second for the whole page. */
    let settled = false;
    /* Baselines in PAGE coordinates, measured once while nothing is
       transformed. Everything below is arithmetic on these plus the scroll,
       and never a live measurement.

       That is the fix for the bounce. Reading a rect each frame meant
       reading a box Lenis had not yet moved: smooth scrolling advances the
       page from its own rAF, so a measurement taken in this callback is one
       frame stale and the pin drifted by however far the page travelled in
       that frame — 18px into a fast scroll, easing to 7px as it slowed,
       correct again only at rest. Arithmetic on a fixed baseline cannot be
       stale, because it never asks the layout anything. */
    let base = { x: 0, y: 0, w: 0, h: 0 };
    let stickyTop = 0;
    /* The block's horizontal box, which never moves. Held so the panel can
       be taken out of flow without collapsing to content width. */
    let panelX = 0;
    let panelW = 0;
    /* The gutter between the two columns, taken from the landed layout
       rather than repeated from the stylesheet. It is what keeps the grey
       off the offer at every point of the slide, and it is correct by
       construction: at rest the grey's right edge plus this gap IS the
       block's left edge. */
    let columnGap = 0;

    const measure = () => {
      const y = scrollNow();
      const had = slot.style.transform;
      slot.style.transform = "";
      const r = slot.getBoundingClientRect();
      base = { x: r.left, y: r.top + y, w: r.width, h: r.height };
      slot.style.transform = had;

      if (panel && inner) {
        const hadPos = inner.style.position;
        const hadTop = inner.style.top;
        inner.style.position = "";
        inner.style.top = "";
        const pr = panel.getBoundingClientRect();
        panelX = pr.left;
        panelW = pr.width;
        /* Read off the INNER element, which is the sticky one now, and
           read it with the opening's inline positioning stripped — a
           `fixed` inline top would otherwise report itself back as the
           resting offset. */
        stickyTop = parseFloat(getComputedStyle(inner).top) || 0;
        inner.style.position = hadPos;
        inner.style.top = hadTop;
        columnGap = panelX - (base.x + base.w);
      }
    };

    const settle = () => {
      slot.style.transform = "";
      zoom.current = LANDED_ZOOM;
      if (ground) {
        ground.style.transform = "";
        ground.style.filter = "";
      }
      if (inner) {
        inner.style.transform = "";
        inner.style.position = "";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
      }
      if (title) {
        title.style.transform = "";
        title.style.opacity = "";
      }
      if (panel) panel.style.opacity = "";
      yaw.current = 0;
    };

    const draw = () => {
      /* Motion sickness switches the scene off entirely, and it is checked
         HERE rather than at the subscription: the loop below runs whether
         or not the preference is set, so that flipping it mid-session
         lands on the next frame. */
      if (reduced.matches) return;

      /* ---- And so does a phone ----

         The opening was a reduced version of itself below 1024px: no
         sideways travel and no sliding offer, but still the grey closing
         from the full screen onto the square and the frame settling into
         it. That is a screen and a half of scrolling spent before the page
         admits to being a shop, on the device with the least screen to
         spend and no cursor to make the object feel worth turning.

         So on a phone there is no mechanic at all — the name, then the
         picture, then the offer, in that order down the page. `settle()`
         is the landed state written once; the guard above it means this
         costs one media-query read per frame and nothing else. */
      if (narrow.matches) {
        if (!settled) {
          settle();
          settled = true;
        }
        return;
      }
      settled = false;

      /* A phone has no second column to travel into, so the frame does not
         travel sideways and the offer does not slide in from anywhere — it
         is simply the next thing down the page. What is left of the
         opening there is the part that still means something: the grey
         closing from the full screen onto the square, and the frame
         settling down into it. */
      const isNarrow = narrow.matches;
      const y = scrollNow();
      const p = clamp01(y / (vh() * OPENING));
      if (p === last) return;
      last = p;
      const e = ease(p);
      const away = 1 - e;

      if (base.h > 0 && ground) {
        const cx = base.x + base.w / 2;
        const cy = base.y - y + base.h / 2;
        const dx = isNarrow ? 0 : (vw() / 2 - cx) * away;
        const dy = (vh() * 0.58 - cy) * away;
        slot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

        /* ---- the grey, as a RECTANGLE rather than a scale factor ----
        
           A single scale can only grow the square about its centre, which
           sends its right edge wherever the arithmetic puts it — straight
           under the offer as that slides in. Interpolating an explicit rect
           means the edge is something this can reason about and hold to.
        
           It opens as the whole screen, closes on the square the frame
           lands in, and its right edge is capped at the block's left edge
           less the column gutter for the entire journey. The cap is exactly
           consistent at rest: the landed square's right edge PLUS that
           gutter is the block's left edge, so the clamp does nothing on the
           final frame and everything before it. */
        const gx = base.x + dx;
        const gy = base.y - y + dy;
        let tx = gx * e;
        const ty = gy * e;
        let tw = vw() + (base.w - vw()) * e;
        const th = vh() + (base.h - vh()) * e;

        /* Where the offer's left edge is right now, as it travels. On a
           phone it is below rather than beside, so there is no edge to
           keep clear of and the grey uses the full width.
        
           Its start is derived from the VIEWPORT, not from a percentage of
           its own width: at 108% of a 600px block it began at 1580px on a
           1794px screen — still inside the frame, so the clamp below held
           the grey 294px short of the right edge on the very first paint,
           keeping it off a block nobody could see yet. Starting it a full
           gutter beyond the edge means the cap is inert until the offer is
           genuinely on screen. */
        if (!isNarrow) {
          const panelLeftNow =
            panelX + away * (vw() + columnGap - panelX);
          const maxRight = panelLeftNow - columnGap;
          if (tx + tw > maxRight) tw = Math.max(0, maxRight - tx);
        }
        if (tx < 0) {
          tw += tx;
          tx = 0;
        }

        ground.style.transform =
          `translate3d(${tx - gx}px, ${ty - gy}px, 0) ` +
          `scale(${tw / base.w}, ${th / base.h})`;

        /* Darker while it is the whole screen, lifting to its own value as
           it closes on the square. A full-bleed ground at the brightness a
           600px panel wants is a grey WALL; the same gradient dimmed reads
           as depth behind the object rather than as a lit backdrop. */
        ground.style.filter = `brightness(${1 - away * 0.45})`;
      }

      /* Large on arrival, settling to the size the square can hold. */
      zoom.current = LANDED_ZOOM + (1 - LANDED_ZOOM) * away;

      if (title) {
        title.style.transform = `translate3d(0, ${-e * 22}vh, 0)`;
        title.style.opacity = String(clamp01(1 - p * 1.7));
      }

      if (panel && inner && isNarrow) {
        /* Nothing to choreograph: the offer is just the next block. */
        inner.style.position = "";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
        inner.style.transform = "";
        panel.style.opacity = "";
      } else if (panel && inner) {
        /* Taken OUT OF FLOW for the slide, rather than translated back up
           into place.

           Correcting a position that depends on the scroll can only ever
           be as fresh as the scroll number it was computed from, and under
           smooth scrolling that is a frame behind — the correction drifted
           38px at speed and eased back as the page slowed, which is a
           bounce however small. Fixed positioning removes the dependency
           instead of compensating for it: while the block is travelling
           its top is a constant, so there is no number to be stale. It is
           handed back to `sticky` exactly when the two agree, both putting
           it at `stickyTop`. */
        if (p < 1) {
          inner.style.position = "fixed";
          inner.style.top = `${stickyTop}px`;
          inner.style.left = `${panelX}px`;
          inner.style.width = `${panelW}px`;
            inner.style.transform = `translate3d(${
            away * (vw() + columnGap - panelX)
          }px, 0, 0)`;
        } else {
          inner.style.position = "";
          inner.style.top = "";
          inner.style.left = "";
          inner.style.width = "";
          inner.style.transform = "";
        }
        panel.style.opacity = String(clamp01(e * 1.6));
      }

      yaw.current = away * OPENING_YAW;
      /* Landed: the frame comes back to its display angle however far the
         reader span it on the way down. */
      if (p === 1) resetTurn();
    };

    const apply = () => {
      /* Only motion sickness switches the scene off entirely. A narrow
         screen still gets the opening — a reduced one, handled inside
         draw(). */
      if (reduced.matches) {
        settle();
        return;
      }
      measure();
      /* Forces the next draw: `p` is compared against this, and no real
         value can equal it. */
      last = -1;
      draw();
    };

    apply();

    /* ---- driven by the FRAME, not by the scroll event ----

       This used to subscribe to Lenis's scroll event and to the window's,
       and it was one event short of correct. The last event of a gesture
       can be delivered before the position it describes has been
       committed, so `draw` read a scroll number from part-way through the
       movement, painted that frame — and was never called again, because
       the only thing that called it was the event that had already gone.
       The opening was left stranded wherever that landed: scroll back up
       to the top and the grey stayed the size it had been on the way down,
       so the top of the screen was simply not covered by it.

       A frame loop cannot be left stale. It reads the position that is on
       screen right now, every time the screen is drawn, which is also
       exactly when a scene like this wants to be computed. The cost of
       running it down the rest of the page is one scroll read and one
       comparison per frame — `draw` returns on its first line while `p` is
       unchanged, which it is for all but the first screen. */
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      draw();
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("resize", apply);
    reduced.addEventListener("change", apply);
    narrow.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", apply);
      reduced.removeEventListener("change", apply);
      narrow.removeEventListener("change", apply);
    };
  }, [model]);

  /* ---- The buy control, pinned where it lands ----

     Phones only, and it is the SAME element throughout: the quantity and
     the button scroll up the page under the colourway picker exactly as
     they always did, and when they reach the foot of the screen they stop
     there and stay for the rest of the page.

     What this replaces was a second copy of the control fixed to the foot
     of the screen, translated out of frame and slid back in once the real
     one had gone. Two controls, one of them announcing an arrival the page
     never earned. There is one now, and it does not travel — it simply
     stops.

     `position: sticky` cannot do this. A sticky element is bounded by its
     own parent, and this row's parent is the offer: a few hundred pixels
     tall, ending long before the photography, the details and the
     catalogue it has to survive. Nothing in the markup is an ancestor of
     both the control and the rest of the page, so the pin is switched by
     hand — which is also what makes it possible to keep the row's exact
     width and left edge rather than letting a fixed element go full bleed
     and stop looking like the row it was.

     The slot around it keeps its height in the flow, so the offer does not
     close up by the height of a button the moment it pins. */
  useEffect(() => {
    const row = buyRowRef.current;
    const slot = buySlotRef.current;
    if (!row || !slot) return;

    const narrow = window.matchMedia("(max-width: 1023px)");
    let pinned = false;
    let gone = false;

    /* The film in the detail section below, looked up by the handle it
       carries. Held loosely: a house with no video renders a photograph in
       its place and still has the element, but if the section is ever
       absent the control simply never leaves — which is the safer of the
       two failures. */
    const film = () => document.querySelector(".buy-film");

    const release = () => {
      pinned = false;
      gone = false;
      row.removeAttribute("data-gone");
      row.style.position = "";
      row.style.bottom = "";
      row.style.left = "";
      row.style.width = "";
      slot.style.height = "";
      row.removeAttribute("data-pinned");
    };

    const check = () => {
      if (!narrow.matches) {
        if (pinned) release();
        return;
      }

      /* Measured off the SLOT, never off the row. The row is the thing
         this moves, so reading its box to decide whether to move it is a
         loop that latches: pin it, and its rect says it is at the pin
         line, so it stays pinned however far back up the reader scrolls.
         The slot is in flow and stays there, so its box is the row's
         honest, unpinned position at all times.

         The line is the FOOT of the screen, and the test is on the slot's
         bottom edge rather than its top. Scrolling down, the control rises
         out of the fold; the frame its bottom edge reaches the bottom of
         the viewport is the frame it is caught, which is why the lock is
         invisible — the pinned position and the position it was travelling
         through are the same position. Everything above that line it is
         simply below the fold and there is nothing to pin. */
      const next = slot.getBoundingClientRect().bottom <= vh() - PIN_PAD;
      if (next === pinned) {
        /* Still pinned, but the page may have been resized under it — and
           the film may have gone by since the last frame. */
        if (pinned) {
          const box = slot.getBoundingClientRect();
          row.style.left = `${box.left}px`;
          row.style.width = `${box.width}px`;
          follow();
        }
        return;
      }
      pinned = next;

      if (!next) {
        release();
        return;
      }

      /* Height is frozen BEFORE the row leaves the flow — once it is out,
         the slot has nothing left to measure. */
      const box = slot.getBoundingClientRect();
      slot.style.height = `${box.height}px`;
      row.style.position = "fixed";
      row.style.bottom = "0px";
      row.style.left = `${box.left}px`;
      row.style.width = `${box.width}px`;
      row.setAttribute("data-pinned", "true");
      follow();
    };

    /* ---- and where it stops following ----

       The control holds through the photographs and the detail copy, and
       takes itself away once the film has gone past the top of the screen.
       Below that point the page is the film, the fit guide and the rest of
       the catalogue — pages about other frames — and a buy button for THIS
       one parked over them is the shop following someone around after they
       have stopped looking.

       This one does travel: it slides down out of frame rather than
       blinking off. A pinned element leaving under its own edge is the one
       piece of motion here that describes something real — it is going
       back to where it came from, and it comes back up the same way. */
    const follow = () => {
      const f = film();
      const next = pinned && !!f && f.getBoundingClientRect().bottom < 0;
      if (next === gone) return;
      gone = next;
      if (next) row.setAttribute("data-gone", "true");
      else row.removeAttribute("data-gone");
    };

    check();
    const lenis = (
      window as unknown as {
        __lenis?: {
          on?: (e: string, f: () => void) => void;
          off?: (e: string, f: () => void) => void;
        };
      }
    ).__lenis;
    lenis?.on?.("scroll", check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    narrow.addEventListener("change", check);
    return () => {
      lenis?.off?.("scroll", check);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      narrow.removeEventListener("change", check);
      release();
    };
  }, []);

  /* Every cut of this house, fetched up front. The run is four small
     Draco-compressed files and the reader is being invited to click
     between them, so paying for them once on arrival is cheaper than
     tearing the scene down on each swap.
     
     Only where there is a turntable to feed. On a phone there is none, and
     prefetching four meshes for a canvas that will never mount is the
     largest download on the page bought for nothing. */
  useEffect(() => {
    if (!wide) return;
    const all = house.colorwayModels
      ? Object.values(house.colorwayModels)
      : house.model
        ? [house.model]
        : [];
    preloadModels(all);
  }, [house, wide]);

  /* A new acetate is a new glb, and it arrives whenever it arrives. Fading
     the canvas out and back covers the swap — without it the frame either
     pops from one colour to another or, worse, shows the old one until the
     new one has finished loading.

     The fade-back waits on the MODEL, not on a clock. It used to be a 90ms
     timeout, which is right for a cached swap and wrong for the one that
     matters: on a cold load the glb takes a second or two, so the stage
     went opaque over an empty ground and the frame appeared at full
     strength when it finished — the opening's first impression was a pop.
     `onReady` fires from inside the suspended viewer, so the frame is
     there before the opacity moves and the arrival is the transition the
     stylesheet already describes. */
  /* WHICH frame is on screen, not a boolean "one is". A flag needed a
     second effect to clear it on a colourway change, and child effects run
     before parent ones — so the viewer reported ready, and the parent's
     reset then ran after it and put the flag back to false for good. The
     stage never came back. Naming the drawn source instead makes the
     comparison the whole state machine: it stops matching the moment the
     colourway changes, and matches again when that glb is in. */
  const [drawnSrc, setDrawnSrc] = useState<string | null>(null);
  const onModelReady = useCallback(() => setDrawnSrc(model ?? null), [model]);
  const drawn = model != null && drawnSrc === model;

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) stage.style.opacity = drawn ? "1" : "0";
  }, [drawn]);

  return (
    <>
      {/* ---- the opening title ---- */}
      {model ? (
        <div className="buy-opening">
          {/* The same two lines as the panel's heading, and deliberately
              NOT a second <h1>. The heading that survives the scroll is the
              one in the offer; this is its opening statement, so it is
              hidden from the accessibility tree rather than competing with
              it for the page's one h1. */}
          <div ref={titleRef} className="buy-opening-title" aria-hidden>
            <p className="t-eyebrow">{COLLECTION_LABEL}</p>
            <p className="t-display-lg mt-3">{house.name}</p>
          </div>
        </div>
      ) : null}

      {/* Three children, in the order a PHONE wants them: the frame, then
          the offer, then the photographs. On a wide screen the stylesheet
          puts the frame and the photographs back in one column with the
          offer beside them — see .buy-grid. Ordering it this way round
          means the small screen needs no reordering at all, which is the
          screen that can least afford a `order:` rule going stale. */}
      <div className="buy-grid mx-auto grid max-w-7xl grid-cols-1 items-start">
          {model ? (
            <div
              ref={slotRef}
              /* Same square, same ground as the photographs under it. That
                 is the alignment the opening lands into: when the transform
                 reaches identity this is simply the first picture in the
                 column. */
              className="buy-model buy-grid-model relative aspect-square"
            >
              {/* Behind the frame, and NOT clipped to the slot: at the top
                  of the page it is the whole screen. */}
              <div ref={groundRef} className="buy-ground" aria-hidden />
              <div
                ref={stageRef}
                className="buy-stage"
                /* One source of truth for the oversize: the zoom
                   arithmetic and the layout read the same constant. The
                   stylesheet decides WHERE it applies — only at the width
                   the opening runs at. Below that there is no
                   choreography, so an oversized canvas would be 189px of
                   horizontal scrollbar bought for nothing. */
                style={
                  { "--canvas-oversize": CANVAS_OVERSIZE } as CSSProperties
                }
              >
                <ProductModel
                  src={model}
                  yaw={yaw}
                  zoom={zoom}
                  onReady={onModelReady}
                />
              </div>
            </div>
          ) : null}

        {/* ---- the offer ---- */}
        {/* ---- the offer, held still ----

            `top-48` is not a taste choice: 12rem is exactly the section's
            own top padding — `--section-pad-wide`, which is what actually
            applies here; the `pt-40` utility on the section does not win
            against `.section`, so the measured value is the one to match,
            not the one in the class list. Matching them means the panel is
            already AT its sticky position on the first frame, so it pins
            the instant the page moves instead of sliding up 32px and then
            catching. */}
        <div ref={panelRef} className="buy-panel buy-grid-panel">
          <div ref={panelInnerRef} className="buy-panel-inner">
          {/* The name arrives WITH the offer, and stays. The opening's
              centred copy is decorative; this is the page's h1. */}
          <p className="t-eyebrow">{COLLECTION_LABEL}</p>
          <h1 className="t-display-lg mt-3">{house.name}</h1>
          <p className="buy-colourway mt-2">{chosen}</p>

          <p className="t-body mt-5 text-[var(--fg-tertiary)]">{house.note}</p>

          <p className="buy-price mt-6 tabular-nums">
            {priceOf(house, chosen ?? undefined)}
          </p>

          <div className="hairline mt-8 pt-8">
            <Suspense fallback={null}>
              <ColourwayPicker house={house} onChoose={setChosen} />
            </Suspense>

            {/* The slot keeps the row's height in the offer's flow while the
                row itself is pinned to the top of a phone's screen, so the
                panel does not collapse by 48px the instant it pins. */}
            <div ref={buySlotRef} className="buy-slot mt-10">
              <div ref={buyRowRef} className="buy-row">
              <QtyStepper value={qty} onChange={setQty} />
              {available ? (
                <CtaButton
                  bare
                  className="btn-outline flex-1"
                  alt="In the bag"
                  swapped={added}
                  onClick={addToBag}
                >
                  Add to bag
                </CtaButton>
              ) : (
                <button type="button" className="btn-outline flex-1" disabled>
                  Out of the workshop
                </button>
              )}
              </div>
            </div>

            <p className="t-caption mt-6">
              {available
                ? "Ships in 3–5 days. Free worldwide standard shipping."
                : "Made in runs. Tell us and we will write when this one returns."}
            </p>
          </div>
          </div>
        </div>

        {/* ---- the lead photograph, phones only ----

            One picture above the offer, and the rest of the column below
            it. With the turntable gone from phones the page had no image
            before the name and the price; with the WHOLE column moved
            above them it had six, and the colourways and the buy button
            were most of a page away.

            It is a second element rather than a reordering because the
            column is one flow item and a grid cannot lift a single child
            out of it. The same file, so the browser fetches it once, and
            the copy in the column below is hidden at this width — see
            `.buy-grid-lead`. */}
        {images.length ? (
          <div className="buy-grid-lead relative aspect-square overflow-hidden bg-ink">
            <Image
              src={images[0]}
              alt={`${house.name}${chosen ? ` — ${chosen}` : ""}, ${house.material}`}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
        ) : null}

        {/* ---- the photographs ---- */}
        <div className="buy-grid-photos stack stack--sm">
          {images.length ? (
            images.map((src, i) => (
              <RevealPlate
                key={src}
                className="relative aspect-square overflow-hidden bg-ink"
              >
                <Image
                  src={src}
                  alt={
                    i === 0
                      ? `${house.name}${chosen ? ` — ${chosen}` : ""}, ${house.material}`
                      : ""
                  }
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  priority={i === 0}
                  className="arca-rise object-cover"
                />
              </RevealPlate>
            ))
          ) : model ? null : (
            <div
              className="flex aspect-square w-full items-end p-6 transition-colors duration-500"
              style={{
                background: `linear-gradient(160deg, ${acetate} 0%, var(--ink) 82%)`,
              }}
            >
              <span className="t-micro">
                {chosen
                  ? `${chosen} — photography in progress`
                  : "Photography in progress"}
              </span>
            </div>
          )}
        </div>


      </div>

    </>
  );
}
