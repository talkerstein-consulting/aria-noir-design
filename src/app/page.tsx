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
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative bg-ink">
        <HomeHero />
        <HomeStatement />
        <HomeCollections />
        <HomeFeatured />
        <HomeFronts />
        <HomeTeaser />
        <HomeIntake />
      </main>
      {/* The footer closes on the logo (FooterMark). */}
      <SiteFooter tone="ink" />
    </>
  );
}
