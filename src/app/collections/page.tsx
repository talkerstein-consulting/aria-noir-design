import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CollectionsIndex } from "@/components/shop/collections-index";

export const metadata: Metadata = {
  title: "Collections | Aria Noir",
  description:
    "Every collection the house has cut, indexed: six houses of block acetate eyewear and one garment knitted in Peru.",
};

/** The global collections page. The index and chapters are `CollectionsIndex`. */
export default function CollectionsPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <CollectionsIndex />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
