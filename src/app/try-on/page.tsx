import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { TryOn } from "@/components/try-on/try-on";
import { tryOnHouses } from "@/lib/try-on";

export const metadata: Metadata = {
  alternates: { canonical: "/try-on" },
  title: "Try on | Aria Noir",
  description: "Every frame in the house, worn live.",
};

/**
 * The live try-on. One screen, no footer: the page is the mirror.
 *
 * `?house=<slug>&colour=<name>` opens on that frame, so a buy page can
 * link straight to its own colourway. The page writes the same params back
 * as the reader changes frames. Both are read in the browser, so the page
 * prerenders as static. See docs/TRY-ON.md for how it works.
 */
export default function TryOnPage() {
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <TryOn houses={tryOnHouses()} />
      </main>
    </>
  );
}
