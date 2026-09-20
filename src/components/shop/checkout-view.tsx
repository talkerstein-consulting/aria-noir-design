"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CtaButton, CtaLink } from "@/components/cta-link";
import { LineCard } from "@/components/shop/line-card";
import { AddressBook } from "@/components/shop/address-book";
import {
  AddressFields,
  BLANK_ADDRESS,
  addressComplete,
  addressLine,
} from "@/components/shop/address-form";
import { CardField } from "@/components/shop/card-field";
import { OrderSummary } from "@/components/shop/order-summary";
import { subtotal as bagSubtotal, useBag, type ResolvedLine } from "@/lib/cart";
import {
  announceSession,
  house,
  useHouseSession,
  type Address,
  type CheckoutItem,
  type Config,
  type Quote,
  type Session,
  type SavedAddress,
} from "@/lib/house-api";
import { formatPrice } from "@/lib/shop";
import { cardErrorMessage, ensureSquare } from "@/lib/square";
import {
  countryName,
  emailError,
  isValidEmail,
  isValidPhone,
  phoneError,
  transitFor,
} from "@/lib/validation";

/**
 * The checkout, on this origin.
 *
 * ---- Where it comes from ----
 *
 * The Amazing Donuts checkout (`src/pages/CheckoutPage.tsx` there), which
 * settles an order itself: identity, destination, payment, review, one
 * press. What was taken is the sequence and the machinery — the folding
 * steps, guest-first identity, saved-address cards, the debounced quote
 * that keeps the total honest as the answers change, the Square card and
 * wallets, the submit guard, and the confirmation. None of its interface
 * came across; every surface here is cut to STYLE-GUIDE.md.
 *
 * ---- What changed, and why ----
 *
 * Donuts asks nine questions because a bakery has pickup, delivery windows,
 * house accounts and PINs. A frame is shipped, once, to an address, and is
 * paid for by card. So this asks four:
 *
 *   01  Who is buying       guest, or signed in
 *   02  Where it goes       an address; the country decides the estimate
 *   03  How you pay         card, or a wallet, or the card on file
 *   04  What you are buying the lines, the total, the one press
 *
 * The quote comes from the house API against live stock and the address,
 * which is why 04 cannot fold until 02 has. Tax is the store's number,
 * never this page's.
 *
 * ---- If the house API is not there ----
 *
 * The permalink checkout at the account host still exists and still works.
 * When the API cannot be reached the page says so and offers it, rather
 * than a spinner over a form that will never submit.
 */

type StepId = "who" | "where" | "pay" | "review";

const CONFIRM_KEY = "aria-noir:last-order";

/* ════════════════════════════════════════════════════════════════════
   FURNISHING MODE — temporary, and meant to be deleted.

   The house API is not reachable from the deployed build yet, so every
   visit to this page fell straight through to "the studio's checkout is
   not answering" and the four steps could not be looked at, let alone
   worked on. With this on, the page assumes a signed-in reader and
   renders the sequence so it can be furnished.

   What it does NOT do is fake a sale. `house.quote` and `house.order`
   are untouched: nothing is priced, authorised or charged, the pay step
   still renders without its card field while `config` is absent, and the
   Square SDK is never reached. This only gets the steps on screen.

   Turn it off — and take the stub below with it — the moment the API
   answers, or the live site is telling every visitor it knows who they
   are when it does not.
   ════════════════════════════════════════════════════════════════════ */
const FURNISHING = true;

/** The reader the page assumes while FURNISHING. Obviously not real, on
 *  purpose: if this ever shows up in front of an actual customer, it
 *  should be unmistakable that it is scaffolding rather than their
 *  account. */
const FURNISHING_SESSION: Session = {
  user: {
    id: "furnishing",
    firstName: "Aria",
    lastName: "Noir",
    email: "furnishing@example.invalid",
    phone: "",
  },
  profile: null,
  houseAccount: null,
};

export function CheckoutView() {
  const router = useRouter();
  const { resolved, ready: bagReady, clear } = useBag();
  const {
    session: liveSession,
    loading: liveSessionLoading,
    error: liveSessionError,
    reload,
  } = useHouseSession();
  /* One place where the pretence is applied, so the rest of the component
     reads exactly as it will once FURNISHING is gone. */
  const session = FURNISHING ? FURNISHING_SESSION : liveSession;
  const sessionLoading = FURNISHING ? false : liveSessionLoading;
  const sessionError = FURNISHING ? "" : liveSessionError;
  const [error, setError] = useState("");

  /* The pinned total stands in for the real one while the real one is
     still below the reader. It takes itself away the moment the summary's
     own total is reached, and stays away past it, so the band is never
     sitting over the footer repeating a number already on the page.
     STYLE-GUIDE 13: a sticky element that covers content is worse than no
     sticky element. */
  const totalMark = useRef<HTMLDivElement>(null);
  const [totalBelow, setTotalBelow] = useState(true);

  const [config, setConfig] = useState<Config>();
  const [configError, setConfigError] = useState("");
  useEffect(() => {
    house
      .config()
      .then(setConfig)
      .catch((cause) => setConfigError(cause instanceof Error ? cause.message : "Unavailable."));
  }, []);

  /* No dependency array, deliberately: the summary is not rendered at all
     while the bag is still being read, so a one-shot effect would look for
     the mark before it exists and never look again. Re-reading a ref and
     rebinding two listeners is cheaper than the bug. */
  useEffect(() => {
    const mark = totalMark.current;
    if (!mark) return;
    /* Measured rather than trusted to `isIntersecting`: the band should go
       when the total is on screen AND stay gone below it, which is one
       comparison and not two states. The observer is only the thing that
       asks the question at the right moments. */
    const ask = () => setTotalBelow(mark.getBoundingClientRect().top > window.innerHeight);
    const io = new IntersectionObserver(ask, { threshold: [0, 1] });
    io.observe(mark);
    ask();
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
    };
  });

  const sendable = useMemo(() => resolved.filter((l) => l.entry?.available), [resolved]);
  const withheld = resolved.length - sendable.length;
  const subtotal = bagSubtotal(sendable);

  /* ── 01 ── */
  const signedIn = Boolean(session?.user);
  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [guestTouched, setGuestTouched] = useState<Partial<Record<"name" | "email" | "phone", boolean>>>({});
  /* The phone on file is the answer until the reader types another; the
     draft is null, not "", until then, so the profile's number is not
     overwritten by an empty field that was never touched. */
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const phone = phoneDraft ?? session?.profile?.default_phone ?? session?.user?.phone ?? "";
  const setPhone = setPhoneDraft;
  const [asGuest, setAsGuest] = useState(false);
  const contactPhone = signedIn ? phone : guest.phone;
  const contact = signedIn
    ? {
        firstName: session!.user!.firstName,
        lastName: session!.user!.lastName,
        email: session!.user!.email,
      }
    : (() => {
        /* One name field, because a parcel wants one name — but the API,
           the receipt and the confirmation's greeting all want a first
           name, so the split happens here and nowhere the reader sees. */
        const [first = "", ...rest] = guest.name.trim().split(/\s+/);
        return { firstName: first, lastName: rest.join(" "), email: guest.email.trim() };
      })();
  const identified =
    (signedIn && isValidPhone(contactPhone)) ||
    (asGuest && Boolean(contact.firstName) && isValidEmail(contact.email) && isValidPhone(contactPhone));

  /* ── the fold ── */
  const [open, setOpenRaw] = useState<StepId>("who");
  /* The step that opens is brought to the top of the viewport, under the
     header. A fold that opens below the fold is a question asked out of
     sight — and after a declined card the reader has to be shown where
     the answer is wanted, not left looking at the footer. */
  const reveal = (s: StepId) =>
    window.requestAnimationFrame(() =>
      document.getElementById(`step-${s}`)?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  const setOpen = (s: StepId) => {
    setOpenRaw(s);
    setError("");
    reveal(s);
  };

  /* ── 02 ── */
  const [address, setAddress] = useState<Address>(BLANK_ADDRESS);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [savedFetched, setSavedFetched] = useState(false);
  const savedLoaded = !session?.user || savedFetched;
  const [whereConfirmed, setWhereConfirmed] = useState(false);
  useEffect(() => {
    if (!session?.user) return;
    let live = true;
    const phoneOnFile = session.profile?.default_phone ?? session.user.phone ?? "";
    house
      .addresses()
      .then(({ addresses }) => {
        if (!live) return;
        setSaved(addresses);
        const first = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (first) {
          setAddress({ ...BLANK_ADDRESS, ...first });
          /* A returning reader with a number and a default address lands
             on payment, the way they should: a review, not a form. */
          if (isValidPhone(phoneOnFile)) {
            setWhereConfirmed(true);
            setOpenRaw("pay");
          }
        } else if (session.profile?.default_address?.addressLine1) {
          setAddress({ ...BLANK_ADDRESS, ...session.profile.default_address });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (live) setSavedFetched(true);
      });
    return () => {
      live = false;
    };
  }, [session]);
  const whereComplete = identified && addressComplete(address);

  /* ── 03 ── */
  const cardOnFile = signedIn && session?.houseAccount?.status === "active" ? session.houseAccount.card : undefined;
  /* The card on file is the answer until the reader says otherwise, the
     same way the default address is. */
  const [methodDraft, setMethodDraft] = useState<"" | "card" | "saved_card">("");
  const method = methodDraft || (cardOnFile ? "saved_card" : "");
  const setMethod = setMethodDraft;
  const card = useRef<SquareCard | undefined>(undefined);
  const [cardReady, setCardReady] = useState(false);
  const applePay = useRef<SquareWallet | undefined>(undefined);
  const googlePay = useRef<SquareWallet | undefined>(undefined);
  const [walletsFor, setWalletsFor] = useState<{ key: string; apple: boolean; google: boolean }>();
  const payComplete = method === "saved_card" || (method === "card" && cardReady);

  /* ── the quote ── */
  const [promo, setPromo] = useState(() => {
    try {
      return window.localStorage.getItem("aria-noir:promo") || "";
    } catch {
      return "";
    }
  });
  /* The quote is stored with the request it answers, so a stale answer
     is never shown against a changed question — the render compares keys
     rather than an effect clearing state on every change. */
  const [quoted, setQuoted] = useState<{ key: string; quote?: Quote; error: string }>();
  const items = (): CheckoutItem[] =>
      sendable.map(({ line, house: h, entry }) => ({
        /* Middot, not an em dash: this name is read back on the receipt
           and the house does not set em dashes in copy. See COPY.md. */
        name: `${h?.name ?? line.slug} · ${line.colorway}`,
        quantity: line.qty,
        /* For the house API's catalogue lookup; the Donuts service resolves
           by name and ignores the rest, a successor can key on these. */
        variantId: entry?.variantId,
        slug: line.slug,
        colorway: line.colorway,
        unitCents: entry?.cents,
      })) as CheckoutItem[];
  const fulfillment = () => ({
      type: "shipping",
      method: "standard",
      recipient: {
        displayName: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email,
        phone: contactPhone,
      },
      address,
      estimate: transitFor(address.country),
    });

  const quoteKey =
    config && whereComplete && sendable.length
      ? JSON.stringify({ items: items(), promo, fulfillment: fulfillment(), guest: !signedIn })
      : "";
  const quote = quoted && quoted.key === quoteKey ? quoted.quote : undefined;
  const quoteError = quoted && quoted.key === quoteKey ? quoted.error : "";

  useEffect(() => {
    if (!quoteKey) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const body = JSON.parse(quoteKey) as { items: CheckoutItem[]; promo: string; fulfillment: unknown; guest: boolean };
      house
        .quote({ items: body.items, promoCode: body.promo, fulfillment: body.fulfillment }, body.guest, controller.signal)
        .then((q) => setQuoted({ key: quoteKey, quote: q, error: "" }))
        .catch((cause) => {
          if (cause?.name === "AbortError") return;
          setQuoted({
            key: quoteKey,
            error: cause instanceof Error ? cause.message : "The total could not be calculated.",
          });
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [quoteKey]);

  /* ── wallets ── */
  const walletKey =
    config && (open === "pay" || open === "review") && quote?.order?.total
      ? `${quote.order.currency}:${quote.order.total}:${address.country}`
      : "";
  const wallets =
    walletsFor && walletsFor.key === walletKey ? walletsFor : { apple: false, google: false };

  useEffect(() => {
    if (!walletKey || !config || !quote) return;
    let cancelled = false;
    const mount = async () => {
      await ensureSquare(config.environment);
      if (cancelled || !window.Square) return;
      const payments = window.Square.payments(config.applicationId, config.locationId);
      const request = payments.paymentRequest({
        countryCode: address.country || "US",
        currencyCode: quote.order.currency,
        total: { amount: (quote.order.total / 100).toFixed(2), label: "Aria Noir" },
      });
      try {
        const w = await payments.applePay(request);
        if (!cancelled) {
          applePay.current = w;
          setWalletsFor((s) => ({ key: walletKey, apple: true, google: s?.key === walletKey ? s.google : false }));
        }
      } catch {
        /* Not this device, or not this browser. Nothing to say. */
      }
      try {
        const w = await payments.googlePay(request);
        if (cancelled) return;
        googlePay.current = w;
        await w.attach?.("#google-pay", { buttonColor: "white", buttonType: "plain", buttonSizeMode: "fill" });
        if (!cancelled)
          setWalletsFor((s) => ({ key: walletKey, google: true, apple: s?.key === walletKey ? s.apple : false }));
      } catch {
        /* Same. */
      }
    };
    void mount().catch(() => {});
    return () => {
      cancelled = true;
      void applePay.current?.destroy?.().catch(() => {});
      void googlePay.current?.destroy?.().catch(() => {});
      applePay.current = undefined;
      googlePay.current = undefined;
    };
    // The key carries everything the request depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletKey]);

  /* ── placing it ── */
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  const place = async (presetSource?: string) => {
    if (submitting.current) return;
    if (!identified) return setOpen("who");
    if (!whereComplete) return setOpen("where");
    if (!quote) {
      setError(quoteError || "The total is still being calculated.");
      return;
    }
    if (!presetSource && !method) {
      setError("Choose how to pay.");
      setOpen("pay");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      let sourceId = presetSource;
      if (!sourceId && method === "saved_card") sourceId = "SAVED_CARD";
      if (!sourceId && method === "card") {
        if (!card.current) throw new Error("The secure card field is still loading.");
        const token = await card.current.tokenize({
          amount: (quote.order.total / 100).toFixed(2),
          currencyCode: quote.order.currency,
          intent: "CHARGE",
          customerInitiated: true,
          sellerKeyedIn: false,
          billingContact: {
            givenName: contact.firstName,
            familyName: contact.lastName,
            email: contact.email,
            phone: contactPhone,
            addressLines: [address.addressLine1, address.addressLine2].filter(Boolean),
            city: address.locality,
            state: address.administrativeDistrictLevel1,
            postalCode: address.postalCode,
            countryCode: address.country,
          },
        });
        if (token.status !== "OK" || !token.token)
          throw new Error(cardErrorMessage(token.errors?.[0]?.message));
        sourceId = token.token;
      }
      const result = await house.checkout(
        {
          idempotencyKey: crypto.randomUUID(),
          items: items(),
          promoCode: promo,
          fulfillment: fulfillment(),
          sourceId: sourceId!,
          ...(signedIn
            ? {}
            : {
                guest: {
                  firstName: contact.firstName,
                  lastName: contact.lastName,
                  email: contact.email,
                  phone: contactPhone,
                },
              }),
        },
        !signedIn,
      );
      /* The confirmation is its own page, so a reload does not re-place
         and the back button does not land on an empty form. What it needs
         is kept for one read. */
      try {
        window.sessionStorage.setItem(
          CONFIRM_KEY,
          JSON.stringify({
            id: result.order.id,
            total: result.order.total,
            currency: result.order.currency,
            lines: sendable.map(({ line, house: h, entry }) => ({
              name: h?.name ?? line.slug,
              slug: line.slug,
              colorway: line.colorway,
              qty: line.qty,
              cents: entry?.cents ?? 0,
            })),
            address,
            contact: { ...contact, phone: contactPhone },
            estimate: transitFor(address.country),
            payment:
              method === "saved_card" && cardOnFile
                ? `${(cardOnFile.brand || "Card").toUpperCase()} ending ${cardOnFile.last4}`
                : presetSource
                  ? "Wallet"
                  : "Card",
            guest: !signedIn,
            quote: quote.order,
          }),
        );
        window.localStorage.removeItem("aria-noir:promo");
      } catch {
        /* Storage refused; the confirmation page has a fallback line. */
      }
      clear();
      router.push("/checkout/confirmed");
    } catch (cause) {
      /* The payment step is where the failure is answered, with every
         other answer preserved — the reader changes the card, not the
         address. */
      setError(cause instanceof Error ? cause.message : "The order could not be placed.");
      setOpenRaw("pay");
      reveal("pay");
      submitting.current = false;
      setBusy(false);
    }
  };

  const payWithWallet = (wallet?: SquareWallet) => {
    if (!wallet || submitting.current || !quote) return;
    setBusy(true);
    setError("");
    wallet
      .tokenize()
      .then((token) => {
        if (token.status !== "OK" || !token.token)
          throw new Error(token.errors?.[0]?.message || "The wallet did not authorise the payment.");
        return place(token.token);
      })
      .catch((cause) => {
        setBusy(false);
        setError(cause instanceof Error ? cause.message : "Wallet payment failed.");
      });
  };

  /* ── states before the form ── */

  if (!bagReady || sessionLoading) {
    return (
      <p className="t-caption" role="status" aria-live="polite">
        Preparing the secure checkout
      </p>
    );
  }

  if (!resolved.length) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">The bag is empty.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          Nothing to check out yet. The frames are one room over.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/eyewear">See the frames</CtaLink>
          <CtaLink href="/held" kind="secondary">What you are holding</CtaLink>
        </div>
      </div>
    );
  }

  /* No handoff to the storefront here any more. This used to offer the
     Shopify permalink as a way to finish the sale while this checkout was
     down; the sale now lives entirely in the build, so a failure is a
     failure and the honest thing is to say so and keep the bag safe rather
     than send the reader somewhere this build cannot follow them. */
  if (!FURNISHING && (configError || sessionError)) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">The studio&rsquo;s checkout is not answering.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          {configError || sessionError} The bag is kept on this device. It will be here
          when the desk answers again.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/bag">Back to the bag</CtaLink>
          <CtaLink href="/contact" kind="secondary">Write to the house</CtaLink>
        </div>
      </div>
    );
  }

  const state = (id: StepId, done: boolean, reachable: boolean) =>
    open === id ? "open" : done ? "done" : reachable ? "ready" : "waiting";

  return (
    <div className="checkout checkout-has-foot" data-busy={busy} aria-busy={busy}>
      <div className="checkout-steps">
        {/* ── 01 ── */}
        <section id="step-who" className="step scroll-mt-28" data-state={state("who", identified, true)}>
          <button type="button" className="step-head" onClick={() => setOpen("who")} aria-expanded={open === "who"}>
            <span className="t-eyebrow">
              <span className="step-index">01</span>Who is buying
            </span>
            {open === "who" || !identified ? null : (
              <span className="t-eyebrow text-[var(--fg-quiet)]">Change</span>
            )}
          </button>
          <p className="step-summary t-caption">
            {signedIn
              ? `${contact.firstName} ${contact.lastName} · ${contact.email}${contactPhone ? ` · ${contactPhone}` : ""}`
              : identified
                ? `${contact.firstName} · ${contact.email} · ${contactPhone} · as a guest`
                : "Not answered yet."}
          </p>
          <div className="step-body">
            {signedIn ? (
              <>
                <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
                  Signed in as {contact.email}. The order and the receipt go on your desk.
                </p>
                <label className="field mt-8 max-w-sm" data-invalid={Boolean(phoneError(phone))}>
                  <span>Telephone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <em className="t-caption mt-2 block not-italic text-[var(--fg-quiet)]">
                    For the courier, on the day. Nothing else.
                  </em>
                  {phoneError(phone) ? <em className="field-error" role="alert">{phoneError(phone)}</em> : null}
                </label>
                <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
                  <CtaButton disabled={!isValidPhone(phone)} onClick={() => setOpen("where")}>
                    That is right
                  </CtaButton>
                  <button
                    type="button"
                    className="link-quiet"
                    onClick={async () => {
                      await house.logout().catch(() => {});
                      announceSession();
                      void reload();
                    }}
                  >
                    Not you? Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
                  An account is not a condition of buying anything. A name for the parcel, an address for
                  the receipt, a number for the courier — that is all an order needs.
                </p>
                <div className="mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                  <label className="field" data-invalid={Boolean(guestTouched.name && !guest.name.trim())}>
                    <span>Name</span>
                    <input
                      autoComplete="name"
                      value={guest.name}
                      onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
                      onBlur={() => setGuestTouched((t) => ({ ...t, name: true }))}
                    />
                    {guestTouched.name && !guest.name.trim() ? (
                      <em className="field-error" role="alert">A name for the parcel.</em>
                    ) : null}
                  </label>
                  <label className="field" data-invalid={Boolean(guestTouched.email && (emailError(guest.email) || !guest.email.trim()))}>
                    <span>Email</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={guest.email}
                      onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                      onBlur={() => setGuestTouched((t) => ({ ...t, email: true }))}
                    />
                    {guestTouched.email && (emailError(guest.email) || !guest.email.trim()) ? (
                      <em className="field-error" role="alert">
                        {emailError(guest.email) || "Where the receipt goes."}
                      </em>
                    ) : null}
                  </label>
                  <label className="field" data-invalid={Boolean(guestTouched.phone && (phoneError(guest.phone) || !guest.phone.trim()))}>
                    <span>Telephone</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={guest.phone}
                      onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                      onBlur={() => setGuestTouched((t) => ({ ...t, phone: true }))}
                    />
                    {guestTouched.phone && (phoneError(guest.phone) || !guest.phone.trim()) ? (
                      <em className="field-error" role="alert">
                        {phoneError(guest.phone) || "A number the courier can reach on the day."}
                      </em>
                    ) : null}
                  </label>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
                  <CtaButton
                    onClick={() => {
                      setGuestTouched({ name: true, email: true, phone: true });
                      if (guest.name.trim() && isValidEmail(guest.email) && isValidPhone(guest.phone)) {
                        setAsGuest(true);
                        setOpen("where");
                      }
                    }}
                  >
                    Continue as guest
                  </CtaButton>
                  <Link href="/access?next=/checkout" className="link-quiet">
                    Sign in instead
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── 02 ── */}
        <section id="step-where" className="step scroll-mt-28" data-state={state("where", whereComplete && whereConfirmed, identified)}>
          <button
            type="button"
            className="step-head"
            onClick={() => identified && setOpen("where")}
            aria-expanded={open === "where"}
            disabled={!identified}
          >
            <span className="t-eyebrow">
              <span className="step-index">02</span>Where it goes
            </span>
            {open === "where" || !(whereComplete && whereConfirmed) ? null : (
              <span className="t-eyebrow text-[var(--fg-quiet)]">Change</span>
            )}
          </button>
          <p className="step-summary t-caption">
            {whereComplete
              ? `${addressLine(address)} · ${countryName(address.country)} · ${transitFor(address.country)}`
              : "Not answered yet."}
          </p>
          <div className="step-body">
            {signedIn ? (
              <>
                <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
                  {saved.length
                    ? "Choose one of the addresses on your desk, or add another."
                    : "The first address on your desk. It is kept for next time."}
                </p>
                <div className="mt-8">
                  <AddressBook
                    addresses={saved}
                    onChange={setSaved}
                    selected={address}
                    onSelect={(a) => setAddress({ ...BLANK_ADDRESS, ...a })}
                    startOpen={savedLoaded && saved.length === 0}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
                  The address the frame is sent to. The country decides the estimate; standard shipping is
                  free everywhere the house sends.
                </p>
                <div className="mt-8 max-w-2xl">
                  <AddressFields value={address} onChange={setAddress} idPrefix="ship" />
                </div>
              </>
            )}
            {whereComplete ? (
              <CtaButton
                className="mt-10"
                onClick={() => {
                  setWhereConfirmed(true);
                  setOpen("pay");
                }}
              >
                Send it here
              </CtaButton>
            ) : null}
          </div>
        </section>

        {/* ── 03 ── */}
        <section id="step-pay" className="step scroll-mt-28" data-state={state("pay", payComplete && open === "review", whereComplete && whereConfirmed)}>
          <button
            type="button"
            className="step-head"
            onClick={() => whereComplete && whereConfirmed && setOpen("pay")}
            aria-expanded={open === "pay"}
            disabled={!(whereComplete && whereConfirmed)}
          >
            <span className="t-eyebrow">
              <span className="step-index">03</span>How you pay
            </span>
            {open === "pay" || !payComplete ? null : (
              <span className="t-eyebrow text-[var(--fg-quiet)]">Change</span>
            )}
          </button>
          <p className="step-summary t-caption">
            {method === "saved_card" && cardOnFile
              ? `${(cardOnFile.brand || "Card").toUpperCase()} ending ${cardOnFile.last4}`
              : method === "card"
                ? "A card, entered once."
                : "Not answered yet."}
          </p>
          <div className="step-body">
            {config ? (
              <>
                <div className="wallets" hidden={!(wallets.apple || wallets.google)}>
                    {wallets.apple ? (
                      <button
                        type="button"
                        className="wallet wallet--apple"
                        aria-label="Pay with Apple Pay"
                        disabled={busy || !quote}
                        onClick={() => payWithWallet(applePay.current)}
                      >
                        <span>Pay</span>
                      </button>
                    ) : null}
                    <div id="google-pay" className="wallet wallet--google" hidden={!wallets.google} />
                    <p className="t-caption wallets-or">or a card</p>
                </div>

                {cardOnFile ? (
                  <div className="pay-options">
                    <label className="check">
                      <input
                        type="radio"
                        name="method"
                        checked={method === "saved_card"}
                        onChange={() => setMethod("saved_card")}
                      />
                      <span>
                        {(cardOnFile.brand || "Card").toUpperCase()} ending {cardOnFile.last4}
                        {cardOnFile.expMonth ? (
                          <em className="not-italic text-[var(--fg-quiet)]">
                            {" "}· {String(cardOnFile.expMonth).padStart(2, "0")}/{String(cardOnFile.expYear).slice(-2)}
                          </em>
                        ) : null}
                      </span>
                    </label>
                    <label className="check">
                      <input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} />
                      <span>Another card</span>
                    </label>
                  </div>
                ) : null}

                {/* Mounted only while the reader is on this step or the
                    review after it. The fold hides bodies with CSS, and a
                    card field that mounted behind a closed step would
                    answer "ready" to a question nobody had reached. */}
                {(open === "pay" || open === "review") && (method === "card" || !cardOnFile) ? (
                  <div className="mt-8 max-w-md">
                    <CardField
                      config={config}
                      cardRef={card}
                      onReady={(r) => {
                        setCardReady(r);
                        if (r) setMethod((m) => m || "card");
                      }}
                      onError={setError}
                    />
                    <p className="t-caption mt-4 max-w-md">
                      The card is read by Square inside that field and never by this site. The house keeps the
                      last four digits and nothing else.
                    </p>
                  </div>
                ) : null}

                {error && open === "pay" ? (
                  <p className="field-error mt-8" role="alert">{error}</p>
                ) : null}

                <CtaButton className="mt-10" disabled={!payComplete} onClick={() => setOpen("review")}>
                  Review the order
                </CtaButton>
              </>
            ) : (
              <p className="t-caption" role="status">Loading secure payment</p>
            )}
          </div>
        </section>

        {/* ── 04 ── */}
        <section id="step-review" className="step scroll-mt-28" data-state={state("review", false, payComplete)}>
          <button
            type="button"
            className="step-head"
            onClick={() => payComplete && setOpen("review")}
            aria-expanded={open === "review"}
            disabled={!payComplete}
          >
            <span className="t-eyebrow">
              <span className="step-index">04</span>What you are buying
            </span>
          </button>
          <p className="step-summary t-caption">
            {sendable.length} {sendable.length === 1 ? "piece" : "pieces"} · {formatPrice(subtotal)}
          </p>
          <div className="step-body">
            <ReviewLines lines={sendable} />
            {withheld > 0 ? (
              <p className="t-caption mt-6 text-[var(--fg-accent)]">
                {withheld === 1
                  ? "One line is out of the workshop and is not in this order."
                  : `${withheld} lines are out of the workshop and are not in this order.`}
              </p>
            ) : null}
            <dl className="review-facts mt-8">
              <div>
                <dt className="t-eyebrow">To</dt>
                <dd className="t-body t-body--tight">
                  {contact.firstName} {contact.lastName}
                  <br />
                  {addressLine(address)}
                  <br />
                  {countryName(address.country)}
                </dd>
              </div>
              <div>
                <dt className="t-eyebrow">Arrives</dt>
                <dd className="t-body t-body--tight">{transitFor(address.country)}, by tracked courier.</dd>
              </div>
              <div>
                <dt className="t-eyebrow">Paid with</dt>
                <dd className="t-body t-body--tight">
                  {method === "saved_card" && cardOnFile
                    ? `${(cardOnFile.brand || "Card").toUpperCase()} ending ${cardOnFile.last4}`
                    : "The card above"}
                </dd>
              </div>
            </dl>

            {error && open === "review" ? <p className="field-error mt-8" role="alert">{error}</p> : null}

            <div className="hairline mt-10 flex flex-wrap items-end justify-between gap-6 pt-8">
              <div>
                <p className="t-eyebrow">Total</p>
                <p className="t-display-xs mt-2 tabular-nums">
                  {quote ? formatPrice(quote.order.total) : quoteError ? "—" : "…"}
                </p>
                <p className="t-caption mt-2">
                  {quote
                    ? "Tax included, against your address. Shipping is free."
                    : quoteError || "Calculating against live stock and your address."}
                </p>
              </div>
              <CtaButton disabled={busy || !quote || !payComplete} onClick={() => void place()}>
                {busy ? "Placing the order" : "Place the order"}
              </CtaButton>
            </div>
            <p className="t-caption mt-6 max-w-xl">
              By placing the order you agree to the{" "}
              <Link href="/policies/terms" className="link-quiet link-quiet--micro">terms</Link> and the{" "}
              <Link href="/policies/returns" className="link-quiet link-quiet--micro">returns policy</Link>.
              What the house keeps is in the{" "}
              <Link href="/policies/privacy" className="link-quiet link-quiet--micro">privacy policy</Link>.
            </p>
          </div>
        </section>
      </div>

      {/* The number, pinned, for the widths where the column beside the
          questions has become a band beneath them. See .checkout-foot. */}
      <div className="checkout-foot" hidden={!totalBelow}>
        <dl className="checkout-foot-sum">
          <dt className="t-eyebrow">Total</dt>
          <dd className="tabular-nums">
            {quote?.order
              ? formatPrice(quote.order.total)
              : whereComplete && !quoteError
                ? "…"
                : formatPrice(subtotal)}
          </dd>
        </dl>
        {/* Not a second commit. The step's own button is the commit; this
            is the way to the lines the number is counting, which on a
            phone are a long way down the page. */}
        <a href="#your-order" className="link-quiet link-quiet--micro">
          {sendable.length === 1 ? "One frame" : `${sendable.length} frames`}
        </a>
      </div>

      <aside className="checkout-aside">
        <OrderSummary
          lines={sendable}
          subtotal={subtotal}
          quote={quote}
          quoteError={whereComplete ? quoteError : ""}
          pending={whereComplete && !quote && !quoteError}
          promo={promo}
          onPromo={(code) => {
            setPromo(code);
            try {
              if (code) window.localStorage.setItem("aria-noir:promo", code);
              else window.localStorage.removeItem("aria-noir:promo");
            } catch {
              /* Storage refused; the code lives for this page. */
            }
          }}
          estimate={whereComplete ? transitFor(address.country) : undefined}
        />
        {/* The foot of the summary, which is where its total sits. What
            the pinned band watches for, and the point at which the band
            has nothing left to say. */}
        <div ref={totalMark} aria-hidden />
      </aside>
    </div>
  );
}

function ReviewLines({ lines }: { lines: readonly ResolvedLine[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {lines.map(({ line, house: h, entry }) => (
        <LineCard
          key={`${line.slug}:${line.colorway}`}
          house={h}
          slug={line.slug}
          colorway={line.colorway}
          qty={line.qty}
          cents={entry?.cents}
        />
      ))}
    </div>
  );
}
