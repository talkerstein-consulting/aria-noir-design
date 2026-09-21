import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ShopAll } from "@/components/shop/shop-all";

export const metadata: Metadata = {
  title: "Shop all — Aria Noir",
  description:
    "Every piece the house makes, priced. Six houses of eyewear cut from block acetate, and one garment knitted in Peru.",
};

/**
 * The full inventory, on this origin.
 *
 * The menu's Shop All used to leave for the storefront's
 * /collections/all, because this build had no room of its own for it.
 * This is the room. Same shell as every section page; the list itself is
 * `ShopAll`, which is a client component because the grid is filtered in
 * place, and it sits in a Suspense boundary because it reads the URL.
 */
export default function ShopAllPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <Suspense fallback={<div className="on-ink min-h-screen bg-ink" />}>
          <ShopAll />
        </Suspense>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
