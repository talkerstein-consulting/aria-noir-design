"use client";

import { useEffect } from "react";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { CartTable } from "@/components/shop/cart-table";
import { ACCOUNT_URL } from "@/lib/navigation";
import { useSession, RETURN_PARAM, SIGN_OUT_URL } from "@/lib/session";
import { useBag } from "@/lib/cart";

/**
 * The bag, and the desk under it.
 *
 * This was RoomView, and the Room is gone. Its two halves were never one
 * errand: the bag is business unfinished on this device, and the desk —
 * orders, addresses, sign-out — is business that lives on Shopify. What
 * kept them together was a page called The Room, which was a name for the
 * pairing rather than a reason for it.
 *
 * They are still on one page, because a shop with a bag page AND a desk
 * page has two half-pages. What changed is which one the page is called
 * after and which one leads: the bag is the thing someone came here to
 * deal with, and the desk is what they need afterwards.
 *
 * The bag shows whether or not anyone has signed in. A guest with three
 * frames in their bag being asked to authenticate before they can look at
 * their own bag is a shop putting a lock on the inside of its own door;
 * the permalink checkout does not need an account either.
 */
export function BagView() {
  const { signedIn, set } = useSession();
  const { count } = useBag();

  /* Coming back from the auth flow. Shopify's redirect lands here with
     `?welcome=1`, which is the one moment this origin learns the outcome —
     see lib/session for why that is a hint about a word, not a credential.

     Read from `window.location` inside an effect rather than with
     `useSearchParams`. That hook opts the whole route out of static
     prerendering unless it is wrapped in a Suspense boundary, and it
     failed the production build for exactly that reason — but the query
     is not needed to RENDER anything here. It sets a flag, once, after
     mount. Suspending a page over a value nothing renders would be paying
     for a boundary to hold a place nobody is standing in. */
  useEffect(() => {
    const welcomed =
      new URLSearchParams(window.location.search).get(RETURN_PARAM) === "1";
    if (welcomed) set(true);
  }, [set]);

  return (
    <>
      <div className="stack stack--sm mb-16">
        <p className="t-eyebrow">The Bag</p>
        <h1 className="t-display-lg">
          {signedIn ? "Welcome back." : "What you are holding."}
        </h1>
        <p className="t-body t-body--lede mt-2">
          {count
            ? "Nothing here is held for long — the workshop cuts to order, and a colourway can go out between one visit and the next."
            : "Everything you are holding, and everything the house is holding for you."}
        </p>
      </div>

      <CartTable />

      {/* ---- the desk ---- */}
      <section className="hairline mt-20 pt-10">
        <h2 className="t-eyebrow mb-6">The Desk</h2>
        {signedIn ? (
          <>
            <p className="t-body t-body--tight max-w-xl">
              Orders, addresses and anything already on the bench are kept
              with the orders themselves.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <CtaLink href={ACCOUNT_URL} external>
                Orders &amp; addresses
              </CtaLink>
              {/* Signs out of Shopify, which ends the thing that actually
                  matters, and drops the local hint on the way so the header
                  does not keep saying Bag. */}
              <CtaLink href={SIGN_OUT_URL} external tone="quiet">
                Sign out
              </CtaLink>
              <CtaButton onClick={() => set(false)} tone="quiet">
                Not you?
              </CtaButton>
            </div>
          </>
        ) : (
          <>
            <p className="t-body t-body--tight max-w-xl">
              Sign in to see your orders. You do not need an account to
              check out — the bag above will go through either way.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <CtaLink href="/access">Sign in</CtaLink>
              <CtaLink href="/contact" tone="quiet">
                Talk to the studio
              </CtaLink>
            </div>
          </>
        )}
      </section>
    </>
  );
}
