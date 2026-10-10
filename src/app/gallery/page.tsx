import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { GalleryRibbon } from "@/components/page/gallery-ribbon";
import { gallery } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Gallery | Aria Noir",
  description:
    "Six houses, six rooms. The campaign photography, house by house, from a Paris apartment to Giza.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function GalleryPage() {
  return (
    <>
      <SiteNav />
      <main className="relative h-svh overflow-hidden">
        <GalleryRibbon rooms={gallery.rooms} />
      </main>
    </>
  );
}
