import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { RoomView } from "@/components/shop/room-view";

export const metadata: Metadata = {
  title: "The Room — Aria Noir",
  description: "The bag, the orders, and the bench.",
  robots: { index: false, follow: false },
};

/**
 * The Room — everything that belongs to one person.
 *
 * The bag lives here rather than in the header. A cart control in the
 * chrome is a shop shouting about its own till on every page; this site
 * spends its header on three words and a wordmark, and a running total is
 * not one of the things it wants to say while someone is reading about how
 * an acetate is milled.
 *
 * So the bag is somewhere you GO, and it is in the same place as the orders
 * and the addresses, because they are the same errand: the things you have,
 * and the things you are about to have.
 */
export default function RoomPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink section bg-ink pt-32 sm:pt-40">
          <div className="mx-auto max-w-5xl">
            <RoomView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
