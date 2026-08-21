"use client";

import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/**
 * Renders nothing — just arms the shared Lenis instance. The home page
 * calls the hook itself (gated behind its intro loader, so Lenis doesn't
 * fight the opening `scrollTo(0, 0)`); every other page has no loader to
 * wait for, so it just wants this always on. Without it a page falls back
 * to plain native scroll, which is why ARCA I felt different from home —
 * it never called the hook at all.
 */
export function SmoothScroll() {
  useSmoothScroll(true);
  return null;
}
