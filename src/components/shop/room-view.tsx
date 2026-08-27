"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { CartTable } from "@/components/shop/cart-table";
import { ACCOUNT_URL } from "@/lib/navigation";
import { useSession, RETURN_PARAM, SIGN_OUT_URL } from "@/lib/session";
import { useBag } from "@/lib/cart";

/**
 * The Room's contents.
 *
 * Two halves, in the order they matter to the person standing in it: the
 * bag, which is business unfinished on this device, and the desk — orders,
 * addresses, sign-out — which lives on Shopify because that is where the
 * orders are.
 *
 * The bag shows whether or not anyone has signed in. A guest with three
 * frames in their bag being asked to authenticate before they can look at
 * their own bag is a shop putting a lock on the inside of its own door;
 * the permalink checkout does not need an account either.
 */
export function RoomView() {
  const { signedIn, set } = useSession();
  const { count } = useBag();
  const params = useSearchParams();

  /* Coming back from the auth flow. Shopify's redirect lands here with
     `?welcome=1`, which is the one moment this origin learns the outcome —
     see lib/session for why that is a hint about a word and not a
     credential. */
  const welcomed = params.get(RETURN_PARAM) === "1";
  useEffect(() => {
    if (welcomed) set(true);
  }, [welcomed, set]);

  return (
    <>
      <div className="stack stack--sm mb-16">
        <p className="t-eyebrow">The Room</p>
        <h1 className="t-display-lg">
          {signedIn ? "Welcome back." : "Your bag, and your bench."}
        </h1>
        <p className="t-body t-body--lede mt-2">
          {count
            ? "Nothing here is held for long — the workshop cuts to order, and a colourway can go out between one visit and the next."
            : "Everything you are holding, and everything the house is holding for you."}
        </p>
      </div>

      {/* ---- the bag ---- */}
      <section className="mb-20">
        <h2 className="t-eyebrow mb-8">The Bag</h2>
        <CartTable />
      </section>

      {/* ---- the desk ---- */}
      <section className="hairline pt-10">
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
                  does not keep saying Room. */}
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
