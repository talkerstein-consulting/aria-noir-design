import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ShopAll } from "@/components/shop/shop-all";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { CollectionsIndex } from "@/components/shop/collections-index";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop all | Aria Noir",
  description:
    "Every piece the house makes, priced. Six houses of eyewear cut from block acetate, and one garment knitted in Peru.",
};

/**
 * The full inventory.
 *
 *   heading → the collections (the homepage's tiles: hover to zoom and
 *   pick a colour) → the toolbar (Filters left, Sort by right) → every
 *   piece as its own card, with one highlight image breaking the grid.
 *
 * The list is `ShopAll`, a client component because the grid is filtered
 * in place, in a Suspense boundary because it reads the URL.
 */
export default function ShopAllPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative bg-ink">
        {/* The same opener as /collections, not a second one.
            Raviv, 20 Nov: "if they press Shop All and they come here this
            way, it's cool — but I want to keep the page consistent." The
            gallery carries the page's h1, so there is no second heading
            here. */}
        <CollectionsIndex />
        {/* Not a black rectangle. The boundary suspends on every cold
            entry, and what it hands over is the page's own shape; see
            ShopSkeleton. */}
        <Suspense fallback={<ShopSkeleton />}>
          <ShopAll />
        </Suspense>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
