"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NO_RESULT_ROUTES, query } from "@/lib/search";

/**
 * Search, in the navbar itself (desktop).
 *
 * The magnifier no longer opens a sheet over the page: the field grows out
 * of the bar, to the left of the icon, and what it finds drops down under
 * the bar on the right. Enter goes to the first answer; Escape, or the
 * icon (now a cross), closes it.
 */
export function NavSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hits = useMemo(() => query(q).slice(0, 8), [q]);
  const asked = q.trim().length >= 2;

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => field.current?.focus({ preventScroll: true }), 60);
      return () => window.clearTimeout(t);
    }
    setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className="nav-search" data-open={open || undefined}>
        <input
          ref={field}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) {
              router.push(hits[0].href);
              onClose();
            }
          }}
          placeholder="Search frames, colours, pages"
          aria-label="Search the house"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          tabIndex={open ? 0 : -1}
        />
      </div>

      {open && asked ? (
        <div className="nav-search-results on-ink" aria-live="polite">
          {hits.length ? (
            <ul>
              {hits.map((h) => (
                <li key={h.href + h.label}>
                  <Link href={h.href} onClick={onClose} className="nav-search-hit">
                    <span className="font-display text-lg">{h.label}</span>
                    <span className="t-micro text-[var(--fg-quiet)]">{h.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="t-micro pb-2 text-[var(--fg-quiet)]">Nothing by that name. Try:</p>
              <ul>
                {NO_RESULT_ROUTES.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} onClick={onClose} className="nav-search-hit">
                      <span className="font-display text-lg">{r.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
