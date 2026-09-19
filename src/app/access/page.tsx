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
 * ---- What this page holds ----
 *
 * The brand — the ground, the type, the rule under each field, the words —
 * and the door. The credential goes to the house API (`/api/house/auth`),
 * which hashes the password and sets an httpOnly session cookie on this
 * origin; the page never stores it and never sees it again.
 *
 * ---- Why this origin now owns the door ----
 *
 * It used to hand off to Shopify's customer accounts, because there was
 * nothing here that needed a session. There is now: the checkout on
 * `/checkout` and the desk on `/desk` read orders, addresses and a card on
 * file from the house API, and those need to know who is asking.
 *
 * `?reset=<token>` arrives from the password-reset email; `?next=/path`
 * is where to go once in; `?mode=new` opens on the account form. All three
 * are read on the client by the form, so this page stays static — see
 * DEPLOY.md on why nothing here should become a serverless function.
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
                Orders, addresses, and anything already cut for you. An
                account is not needed to buy a frame — it is for afterwards.
              </p>
            </div>

            <div className="mt-12">
              <AccessForm />
            </div>

            <div className="hairline mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 pt-8">
              <CtaLink href="/eyewear">See the frames</CtaLink>
              <CtaLink href="/contact" kind="secondary">
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
