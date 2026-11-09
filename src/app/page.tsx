import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import {
  HomeCollections,
  HomeFeatured,
  HomeFronts,
  HomeHero,
  HomeStatement,
} from "@/components/home/home-sections";
import { HomeTeaser } from "@/components/home/home-teaser";
import { HomeIntake } from "@/components/home/home-gallery";
import { HomeSocial } from "@/components/home/home-social";

/**
 * The home page, October v2. The order is the brief:
 *
 *   hero → the statement → the collections → one collection, full screen → the frames,
 *   isolated → the teaser (ARCA II Noir, depth) → the intake (the house
 *   letter in a contact sheet) → footer → the logo.
 *
 * The scroll-driven film that lived here (`components/experience.tsx`) is
 * no longer mounted; it is kept until the new page is signed off.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      {/* Jai's review (5 Nov): hero as a muted film (a montage of the six
          frames' clips), and room between sections ("back to back is too
          much, not enough breathing room"). */}
      <main id="main" tabIndex={-1} className="relative flex flex-col gap-y-20 bg-ink sm:gap-y-28 lg:gap-y-36">
        <HomeHero />
        <HomeCollections gutter="ink" />
        <HomeStatement />
        <HomeFeatured />
        <HomeFronts />
        <HomeTeaser />
        <HomeIntake />
        <HomeSocial />
      </main>
      {/* The footer closes on the house emblem above the legal row. */}
      <SiteFooter tone="ink" />
    </>
  );
}
