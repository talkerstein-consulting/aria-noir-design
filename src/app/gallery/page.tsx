import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { GalleryRibbon } from "@/components/page/gallery-ribbon";
import { gallery } from "@/lib/pages";
import { WORN } from "@/lib/worn.generated";

/* Each room gets the frame's real-life worn photographs from the buy
   pages (lib/worn.generated, the showcase's model shots) after its
   campaign plates, captioned with the same house. */
const rooms = gallery.rooms.map((room) => {
  const worn = WORN[room.href.split("/").pop() ?? ""] ?? [];
  return {
    ...room,
    plates: [
      ...room.plates,
      ...worn.map((w) => ({
        src: w.src,
        alt: `${room.eyebrow} in ${w.colorway}, worn`,
        shape: "tall" as const,
      })),
    ],
  };
});

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
        <GalleryRibbon rooms={rooms} />
      </main>
    </>
  );
}
