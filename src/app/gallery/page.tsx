import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { GalleryRooms } from "@/components/page/gallery-rooms";
import { PageClose } from "@/components/page/page-close";
import { gallery } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Gallery — Aria Noir",
  description:
    "Six houses, six rooms. The campaign photography, house by house, from a Paris apartment to Giza.",
};

/** Shared section-page shell — see house/about/page.tsx. */
export default function GalleryPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <PageHero {...gallery.hero} />
        <GalleryRooms rooms={gallery.rooms} />
        <PageClose tone="ink" {...gallery.close} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
