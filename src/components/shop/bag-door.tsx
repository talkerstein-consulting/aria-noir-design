"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, RETURN_PARAM } from "@/lib/session";
import { lastBrowsed, OPEN_BAG_PARAM } from "@/lib/last-browsed";

/**
 * Turns a visit to `/bag` into the bag drawer, over the page the reader
 * was last on.
 *
 * ---- What it does ----
 *
 * Works out where they were shopping, and replaces this entry in history
 * with that place, carrying `?bag=1`. SiteNav sees the param, opens the
 * drawer and strips it. The reader ends up looking at the frames they were
 * reading with their bag open beside them, which is where the bag has
 * always belonged.
 *
 * `replace`, never `push`: this route is a hinge, not a destination. Were
 * it pushed, Back from the page it lands on would return here and bounce
 * straight forward again — a trap one press wide.
 *
 * ---- The post-auth return ----
 *
 * Shopify sends a customer back to `/bag?welcome=1` after the credential
 * step, and that parameter is the one moment this origin learns the sign-in
 * happened. It is read and recorded HERE, before the redirect, because the
 * page it hands off to has no reason to know about it — and losing it would
 * mean a reader who has just signed in gets a header that still says
 * Access. See lib/session: it is a hint about which word to draw, never a
 * credential.
 *
 * ---- What is drawn ----
 *
 * Nothing. This is on screen for one frame between two pages, and anything
 * painted here would be a flash of a page nobody asked for. The reader came
 * from somewhere and is going somewhere; the honest interface is the
 * absence of one.
 */
export function BagDoor() {
  const router = useRouter();
  const { set } = useSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(RETURN_PARAM) === "1") set(true);

    const target = lastBrowsed();
    const sep = target.includes("?") ? "&" : "?";
    router.replace(`${target}${sep}${OPEN_BAG_PARAM}=1`);
  }, [router, set]);

  return null;
}
