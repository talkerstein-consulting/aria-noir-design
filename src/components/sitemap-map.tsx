"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RouteGroup, RouteKind } from "@/lib/navigation";

/**
 * The architecture as a map: Home on the left, each group off it, each
 * route off its group, joined by curved hairlines.
 *
 * Every node is unlocked. Selecting one does not navigate; it opens the
 * page live in the preview beside the map, so the whole site can be walked
 * without leaving this one. "Open" (or a double click) goes for real.
 *
 * The curves are measured, not drawn by hand: after layout, each node's
 * box is read relative to the canvas and a cubic Bézier is run from the
 * parent's edge to the child's. A ResizeObserver redraws on any change in
 * size, so the lines follow the layout through every breakpoint. Wide, the
 * tree runs left to right; narrow, it stacks and the curves drop from the
 * parent's left edge into each child.
 */

const KIND_LABEL: Record<RouteKind, string> = {
  designed: "Designed",
  built: "Built",
  private: "Private",
  tool: "Tool",
};

type Edge = { d: string; from: string; to: string };

export function SitemapMap({ groups }: { groups: readonly RouteGroup[] }) {
  const canvas = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [frameKey, setFrameKey] = useState(0);

  const route = groups.flatMap((g) => g.routes).find((r) => r.href === selected);
  const groupOf = groups.find((g) => g.routes.some((r) => r.href === selected));

  const measure = useCallback(() => {
    const root = canvas.current;
    if (!root) return;
    const base = root.getBoundingClientRect();
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const box = (id: string) => {
      const el = root.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        l: r.left - base.left,
        r: r.right - base.left,
        t: r.top - base.top,
        b: r.bottom - base.top,
        cy: r.top - base.top + r.height / 2,
      };
    };
    const curve = (fromId: string, toId: string): Edge | null => {
      const a = box(fromId);
      const b = box(toId);
      if (!a || !b) return null;
      if (wide) {
        const x1 = a.r, y1 = a.cy, x2 = b.l, y2 = b.cy;
        const k = (x2 - x1) * 0.5;
        return { from: fromId, to: toId, d: `M${x1},${y1} C${x1 + k},${y1} ${x2 - k},${y2} ${x2},${y2}` };
      }
      const x1 = a.l + 10, y1 = a.b, x2 = b.l, y2 = b.cy;
      return { from: fromId, to: toId, d: `M${x1},${y1} C${x1},${y2} ${x1},${y2} ${x2},${y2}` };
    };

    const next: Edge[] = [];
    for (const g of groups) {
      const e = curve("root", `g:${g.title}`);
      if (e) next.push(e);
      for (const r of g.routes) {
        const f = curve(`g:${g.title}`, `r:${r.href}`);
        if (f) next.push(f);
      }
    }
    setEdges(next);
    setSize({ w: root.scrollWidth, h: root.scrollHeight });
  }, [groups]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const root = canvas.current;
    if (!root) return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  /* Escape closes the preview. */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const lit = (e: Edge) =>
    selected != null &&
    ((e.to === `r:${selected}`) || (groupOf && e.to === `g:${groupOf.title}`));

  return (
    <div className="smap" data-open={selected ? "" : undefined}>
      <div ref={canvas} className="smap-canvas">
        <svg
          className="smap-wires"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden
        >
          {edges.map((e) => (
            <path key={`${e.from}>${e.to}`} d={e.d} data-lit={lit(e) || undefined} />
          ))}
        </svg>

        <div className="smap-root">
          <button
            type="button"
            data-node="root"
            className="smap-node smap-node--root"
            aria-pressed={selected === "/"}
            onClick={() => setSelected("/")}
          >
            <span className="smap-label">Aria Noir</span>
            <span className="smap-path">/</span>
          </button>
        </div>

        <ol className="smap-groups">
          {groups.map((g) => (
            <li key={g.title} className="smap-group">
              <div className="smap-gcell">
                <div data-node={`g:${g.title}`} className="smap-node smap-node--group">
                  <span className="smap-label">{g.title}</span>
                  <span className="smap-path">{g.routes.length} pages</span>
                </div>
              </div>
              <ul className="smap-routes">
                {g.routes.map((r) => (
                  <li key={r.href}>
                    <button
                      type="button"
                      data-node={`r:${r.href}`}
                      data-kind={r.kind}
                      className="smap-node smap-node--route"
                      aria-pressed={selected === r.href}
                      onClick={() => {
                        setSelected(r.href);
                        setFrameKey((k) => k + 1);
                      }}
                      onDoubleClick={() => (window.location.href = r.href)}
                    >
                      <span className="smap-dot" aria-hidden />
                      <span className="smap-label">{r.label}</span>
                      <span className="smap-path">{r.href}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <aside className="smap-preview" aria-label="Page preview" aria-hidden={!selected}>
        {selected && (
          <>
            <div className="smap-preview-bar">
              <div className="min-w-0">
                <p className="t-eyebrow">
                  {groupOf?.title ?? "The door"} · {route ? KIND_LABEL[route.kind] : "Designed"}
                </p>
                <p className="smap-preview-title">{route?.label ?? "Home"}</p>
                <p className="smap-path">{selected}</p>
              </div>
              <div className="smap-preview-actions">
                <Link href={selected} className="smap-btn smap-btn--solid">
                  Open
                </Link>
                <a href={selected} target="_blank" rel="noreferrer" className="smap-btn">
                  New tab
                </a>
                <button type="button" className="smap-btn" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
            {route?.note && <p className="t-caption smap-preview-note">{route.note}</p>}
            <div className="smap-frame">
              <iframe key={`${selected}-${frameKey}`} src={selected} title={`Preview of ${selected}`} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
