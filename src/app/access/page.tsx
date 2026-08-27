import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AccessForm } from "@/components/shop/access-form";
import { CtaLink } from "@/components/cta-link";

export const metadata: Metadata = {
  title: "Access — Aria Noir",
  description: "Orders, addresses, and anything already on the bench.",
  robots: { index: false, follow: false },
};

/**
 * Sign in, in the house's own voice.
 *
 * ---- What this page does and does not hold ----
 *
 * It holds the BRAND: the ground, the type, the rule under the field, the
 * words. It does not hold the credential. The email goes straight to
 * Shopify's customer-account authentication, which sends the code and owns
 * the session — this page never sees a password, never stores a token, and
 * has nothing worth stealing on it.
 *
 * That division is not a limitation to be engineered away later. Passwords
 * and sessions belong with the orders, and a headless storefront that
 * collected them here would be standing between a customer and their own
 * account for the sake of matching a typeface. What the reader gets instead
 * is a door that looks like the building, opening onto the same lock the
 * shop already uses.
 *
 * `ACCOUNT_HOST` in lib/storefront is the one value that points it
 * somewhere real.
 */
export default function AccessPage() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        <section className="on-ink relative flex min-h-svh flex-col justify-center bg-ink px-6 py-32 sm:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="stack stack--sm">
              <p className="t-eyebrow">Access</p>
              <h1 className="t-display-lg">Your bench.</h1>
              <p className="t-body t-body--lede mt-2">
                Orders, addresses, and anything already cut for you. We send a
                code — there is no password to remember or to lose.
              </p>
            </div>

            <div className="mt-12">
              <AccessForm />
            </div>

            <div className="hairline mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 pt-8">
              <CtaLink href="/eyewear" tone="quiet">
                See the frames
              </CtaLink>
              <CtaLink href="/contact" tone="quiet">
                Talk to the studio
              </CtaLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
