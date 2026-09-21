import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ConfirmedView } from "@/components/shop/confirmed-view";

export const metadata: Metadata = {
  title: "Order confirmed — Aria Noir",
  description: "On the bench.",
  robots: { index: false, follow: false },
};

export default function ConfirmedPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <section className="on-ink section bg-ink pt-20 sm:pt-40">
          <div className="mx-auto max-w-5xl">
            <ConfirmedView />
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
