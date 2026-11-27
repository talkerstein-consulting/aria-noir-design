import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CollectionsIndex } from "@/components/shop/collections-index";
import { ShopAll } from "@/components/shop/shop-all";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "The Collection | Aria Noir",
  description: "Six eyewear families, from the four shapes of ARCA I to the sculptural bridge of PATRIARCA.",
  openGraph: { title: "The Collection | Aria Noir", description: "Six eyewear families, from the four shapes of ARCA I to the sculptural bridge of PATRIARCA." },
  twitter: { card: "summary_large_image", title: "The Collection | Aria Noir", description: "Six eyewear families, from the four shapes of ARCA I to the sculptural bridge of PATRIARCA." },
};

/**
 * The global collections page.
 *
 * ---- One page, two doors (Raviv, 20 Nov) ----
 *
 * "It would be nice if this would float into the shop page, naturally …
 * can we not have this page just at the bottom of the collection page?
 * And if they press Shop All and they come here this way, it's cool — but
 * I want to keep the page consistent."
 *
 * So this is the same page as `/shop`: the gallery of collections, and
 * then the full inventory under it, with nothing between them but the
 * scroll. The dolly gallery is the opener again on Rems's call (20 Nov) —
 * the rail that briefly replaced it is gone.
 * Reading the collections and carrying on downward lands you in the shop;
 * arriving from Shop All lands you on the identical view. The two routes
 * both exist because they are both in the menu, and they must not look
 * like two different rooms.
 */
export default function CollectionsPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative bg-ink">
        <CollectionsIndex />
        <Suspense fallback={<ShopSkeleton />}>
          <ShopAll />
        </Suspense>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
