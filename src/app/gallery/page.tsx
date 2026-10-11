import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { GalleryRibbon } from "@/components/page/gallery-ribbon";
import { gallery } from "@/lib/pages";

export const metadata: Metadata = {
  alternates: { canonical: "/gallery" },
  title: "Gallery | Aria Noir",
  description:
    "Six houses, six rooms. The campaign photography, house by house, from a Paris apartment to Giza.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function GalleryPage() {
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative h-svh overflow-hidden">
        {/* The ribbon is all picture; the page still needs its title. */}
        <h1 className="sr-only">Gallery</h1>
        <GalleryRibbon rooms={gallery.rooms} />
      </main>
    </>
  );
}
