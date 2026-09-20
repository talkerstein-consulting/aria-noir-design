"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Heart, MapPin, Package, UserRound } from "lucide-react";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { AddressBook } from "@/components/shop/address-book";
import { addressLine } from "@/components/shop/address-form";
import { CardField } from "@/components/shop/card-field";
import { HeldView } from "@/components/shop/held-view";
import { ProfileForm, type Profile } from "@/components/shop/profile-form";
import { useBag } from "@/lib/cart";
import {
  announceSession,
  house,
  useHouseSession,
  type Config,
  type Order,
  type SavedAddress,
  type Session,
} from "@/lib/house-api";
import { allHouses } from "@/lib/navigation";
import { useSession } from "@/lib/session";
import { formatPrice } from "@/lib/shop";
import { cardErrorMessage } from "@/lib/square";
import { countryName } from "@/lib/validation";

/**
 * The desk: orders, held, profile, addresses, payment.
 *
 * ---- Where it comes from ----
 *
 * The Donuts `AccountPage`: an icon rail, one view at a time, the view in
 * the hash so a link can point at one and the back button walks the rail.
 * Its orders table with live fulfilment status and "order again"; its
 * profile form that saves to the API; its saved-address cards; its card on
 * file with a consented Square tokenisation; sign out in the page, not the
 * chrome; and delete-account behind a typed word. All of that came across.
 * Its fourth view — the institutional credit portal — has no equivalent
 * here and did not.
 *
 * ---- What changed ----
 *
 * Every surface is the house's: the rail is `.desk-rail`, the fields are
 * `.field`, the orders are rows on hairlines rather than a table with
 * borders. Orders are shipped, so the status vocabulary is the courier's
 * and the tracking link is the second thing on the row. Held is still this
 * browser's — the API has a wishlist endpoint keyed on a product id, and
 * a frame is `{slug, colorway}`; wiring it is one adapter in lib/held and
 * not this file's job.
 *
 * ---- The gate ----
 *
 * A stranger sees the shape of the desk, with a line saying so and the
 * door underneath — not a wall. Nothing here renders another person's
 * data: the API answers a signed-out session with nulls.
 */

export type View = "orders" | "held" | "profile" | "addresses" | "payment";

/**
 * The desk's rooms, in the order it lists them.
 *
 * Exported because the profile drawer offers the same rooms and used to
 * keep its own hand-written copy of four of the five. Payment was the one
 * it forgot: the desk has had a card-on-file view the whole time, the
 * drawer's own opening line promised it, and nothing in the drawer went
 * there. One list now, read by both, so the next room added to the desk
 * appears in the drawer without anyone remembering to add it.
 */
export const VIEWS: readonly { id: View; label: string; Icon: typeof UserRound }[] = [
  { id: "orders", label: "Orders", Icon: Package },
  { id: "held", label: "Held", Icon: Heart },
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "addresses", label: "Addresses", Icon: MapPin },
  { id: "payment", label: "Payment", Icon: CreditCard },
];

function fromHash(): View {
  const hash = window.location.hash.replace("#", "");
  return VIEWS.some((v) => v.id === hash) ? (hash as View) : "orders";
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("aria-noir:desk", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("aria-noir:desk", onChange);
  };
}

export function DeskView() {
  const known = useSession();
  const { session, loading, error, reload } = useHouseSession();
  const view = useSyncExternalStore(subscribeHash, fromHash, () => "orders" as View);
  const signedIn = Boolean(session?.user);

  const go = useCallback((next: View) => {
    window.history.replaceState(null, "", next === "orders" ? "#" : `#${next}`);
    window.dispatchEvent(new Event("aria-noir:desk"));
  }, []);

  const signOut = async () => {
    await house.logout().catch(() => {});
    announceSession();
    void reload();
  };

  return (
    <>
      <nav className="desk-rail" aria-label="The desk">
        {VIEWS.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => go(id)} aria-current={view === id}>
            <Icon aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-14">
        {loading ? (
          <p className="t-caption" role="status">Opening the desk</p>
        ) : (
          <>
            {view === "orders" ? <Orders session={session!} /> : null}
            {view === "held" ? <HeldView /> : null}
            {view === "profile" ? <ProfilePane session={session!} onSaved={reload} /> : null}
            {view === "addresses" ? <AddressesPane session={session!} /> : null}
            {view === "payment" ? <PaymentPane session={session!} onSaved={reload} /> : null}
            {!signedIn && view !== "held" ? <DoorNote reason={error} /> : null}
          </>
        )}
      </div>

      {signedIn ? (
        <div className="hairline mt-20 flex flex-wrap items-center gap-x-10 gap-y-4 pt-10">
          <CtaButton kind="secondary" onClick={() => void signOut()}>
            Sign out
          </CtaButton>
          <CtaButton kind="secondary" onClick={() => known.set(false)}>
            Not you?
          </CtaButton>
        </div>
      ) : null}
    </>
  );
}

function DoorNote({ reason }: { reason?: string }) {
  return (
    <p className="t-caption mt-10 max-w-xl text-[var(--fg-quiet)]">
      {reason
        ? `${reason} `
        : "Not signed in, so this is the shape of the desk rather than your own. "}
      An account is not a condition of buying anything — the bag goes through either way.{" "}
      <Link href="/access?next=/desk" className="link-quiet">
        Sign in
      </Link>
    </p>
  );
}

/* ── Orders ───────────────────────────────────────────────────────── */

function Orders({ session }: { session: Session }) {
  const [fetched, setFetched] = useState<Order[]>();
  const orders = session.user ? fetched : [];
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { add } = useBag();

  useEffect(() => {
    if (!session.user) return;
    let cancelled = false;
    house
      .orders()
      .then(({ orders }) => {
        if (!cancelled) setFetched(orders);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "The orders could not be read.");
      });
    return () => {
      cancelled = true;
    };
  }, [session.user]);

  /* The Donuts "order again": every line of the order back into the bag,
     where the catalogue still carries it. A line is matched by name — the
     API stores what the checkout sent, `House — Colourway`. */
  const again = (order: Order) => {
    let added = 0;
    let skipped = 0;
    for (const item of order.line_items) {
      const [houseName, colorway] = item.name.split(" — ");
      const h = allHouses.find((x) => x.name === houseName);
      if (h && colorway) {
        add(h.slug, colorway, Number(item.quantity) || 1);
        added += 1;
      } else skipped += 1;
    }
    setNote(
      added
        ? `${added} ${added === 1 ? "line" : "lines"} back in the bag${skipped ? `; ${skipped} no longer carried.` : "."}`
        : "None of those lines are carried any more.",
    );
  };

  if (!session.user) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">Everything the bench has had.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          Each order with its lines, its total, where it went and where it is now. Tracking is on
          the row the day it ships.
        </p>
      </div>
    );
  }

  if (error) return <p className="field-error" role="alert">{error}</p>;
  if (!orders) return <p className="t-caption" role="status">Reading the orders</p>;

  if (!orders.length) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">Nothing on the bench yet.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          The first order will be here the moment it is placed, and its tracking the day it ships.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/eyewear">See the frames</CtaLink>
          <CtaLink href="/held" kind="secondary">What you are holding</CtaLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      {note ? <p className="t-caption mb-6" role="status">{note}</p> : null}
      <ul className="orders">
        {orders.map((o) => {
          const open = openId === o.id;
          const ref = (o.square_order_id || o.id).slice(-8).toUpperCase();
          const when = new Date(o.ordered_at).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const tracking = o.fulfillment?.trackingUrl || o.delivery?.trackingUrl;
          const status = o.delivery?.statusLabel || o.fulfillmentStatus || "Received";
          return (
            <li key={o.id} className="order" data-open={open}>
              <button
                type="button"
                className="order-head"
                onClick={() => setOpenId(open ? null : o.id)}
                aria-expanded={open}
              >
                <span className="order-ref">
                  <span className="t-eyebrow">No. {ref}</span>
                  <span className="t-caption block">{when}</span>
                </span>
                <span className="order-lines t-body t-body--tight">
                  {o.line_items.map((l) => `${l.name}${Number(l.quantity) > 1 ? ` · ${l.quantity}` : ""}`).join(", ")}
                </span>
                <span className="order-status">
                  <span className="t-label block text-[var(--fg-primary)]">{status}</span>
                  <span className="t-caption block">{o.paymentStatus || "Paid"}</span>
                </span>
                <span className="t-label tabular-nums text-[var(--fg-primary)]">{formatPrice(o.total)}</span>
              </button>

              {open ? (
                <div className="order-body">
                  <ul className="stack stack--sm">
                    {o.line_items.map((l, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-6">
                        <span className="t-body">
                          {l.name}
                          {Number(l.quantity) > 1 ? (
                            <span className="text-[var(--fg-quiet)]"> · {l.quantity}</span>
                          ) : null}
                        </span>
                        <span className="t-body tabular-nums">
                          {l.total_money ? formatPrice(l.total_money.amount) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <dl className="review-facts mt-8">
                    {o.fulfillment?.address ? (
                      <div>
                        <dt className="t-eyebrow">To</dt>
                        <dd className="t-body t-body--tight">
                          {o.fulfillment.recipient?.displayName}
                          <br />
                          {addressLine(o.fulfillment.address)}
                          {o.fulfillment.address.country ? (
                            <>
                              <br />
                              {countryName(o.fulfillment.address.country)}
                            </>
                          ) : null}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="t-eyebrow">Where it is</dt>
                      <dd className="t-body t-body--tight">
                        {status}
                        {o.fulfillment?.carrier || o.fulfillment?.trackingNumber ? (
                          <>
                            <br />
                            {[o.fulfillment.carrier, o.fulfillment.trackingNumber].filter(Boolean).join(" · ")}
                          </>
                        ) : null}
                        {tracking ? (
                          <>
                            <br />
                            <a href={tracking} target="_blank" rel="noreferrer" className="link-quiet">
                              Track the parcel
                            </a>
                          </>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="t-eyebrow">Money</dt>
                      <dd className="t-body t-body--tight">
                        {o.breakdown ? (
                          <>
                            {formatPrice(o.breakdown.merchandise)} frames
                            {o.breakdown.discount ? ` · −${formatPrice(o.breakdown.discount)}` : ""}
                            {" · "}
                            {formatPrice(o.breakdown.tax)} tax
                            <br />
                          </>
                        ) : null}
                        {formatPrice(o.total)} {o.paymentStatus ? `· ${o.paymentStatus.toLowerCase()}` : ""}
                        {o.receiptUrl ? (
                          <>
                            <br />
                            <a href={o.receiptUrl} target="_blank" rel="noreferrer" className="link-quiet">
                              Receipt
                            </a>
                          </>
                        ) : null}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
                    <button type="button" className="link-quiet" onClick={() => again(o)}>
                      Order it again
                    </button>
                    <Link href="/policies/returns" className="link-quiet">
                      How a return works
                    </Link>
                    <Link href={`/contact?order=${ref}`} className="link-quiet">
                      Ask about this order
                    </Link>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Profile ──────────────────────────────────────────────────────── */

function ProfilePane({ session, onSaved }: { session: Session; onSaved: () => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const known = useSession();
  const router = useRouter();

  const u = session.user;
  const a = session.profile?.default_address;
  const value: Profile = {
    name: u ? `${u.firstName} ${u.lastName}`.trim() : "",
    email: u?.email ?? "",
    phone: session.profile?.default_phone ?? u?.phone ?? "",
    line1: a?.addressLine1 ?? "",
    line2: a?.addressLine2 ?? "",
    city: a?.locality ?? "",
    region: a?.administrativeDistrictLevel1 ?? "",
    postal: a?.postalCode ?? "",
    country: a?.country ?? "",
  };

  const save = u
    ? async (next: Profile) => {
        const [firstName, ...rest] = next.name.trim().split(/\s+/);
        await house.updateProfile({
          firstName: firstName || u.firstName,
          lastName: rest.join(" ") || u.lastName,
          phone: next.phone,
          address: next.line1
            ? {
                addressLine1: next.line1,
                addressLine2: next.line2,
                locality: next.city,
                administrativeDistrictLevel1: next.region,
                postalCode: next.postal,
                country: next.country || "US",
              }
            : undefined,
        });
        onSaved();
      }
    : undefined;

  return (
    <>
      <ProfileForm
        key={u?.email ?? "stranger"}
        value={value}
        onSave={save}
        lockedKeys={u ? ["email"] : undefined}
        note={
          u
            ? "Your name, the number a courier can reach, and the address a frame goes to unless an order says otherwise. The email is the account itself and is changed by writing to the studio."
            : "A name, the address a frame goes to, and a number a courier can reach. Sign in and these write as well as read."
        }
      />

      {u ? (
        <section className="hairline mt-20 pt-10">
          <p className="t-eyebrow">The account itself</p>
          <p className="t-body mt-4 max-w-xl text-[var(--fg-tertiary)]">
            Deleting it removes the sign-in, the saved addresses and the card on file. Orders
            already placed stay on the workshop&rsquo;s books, as they must, without your name on them.
          </p>
          {!deleteOpen ? (
            <CtaButton kind="secondary" className="mt-8" onClick={() => setDeleteOpen(true)}>
              Delete the account
            </CtaButton>
          ) : (
            <div className="mt-8 max-w-sm">
              <label className="field" data-invalid={Boolean(deleteError)}>
                <span>Type DELETE to be sure</span>
                <input value={confirmation} autoComplete="off" onChange={(e) => setConfirmation(e.target.value)} />
                {deleteError ? <em className="field-error" role="alert">{deleteError}</em> : null}
              </label>
              <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
                <CtaButton
                  disabled={confirmation !== "DELETE" || deleting}
                  onClick={async () => {
                    setDeleting(true);
                    setDeleteError("");
                    try {
                      await house.deleteAccount(confirmation);
                      announceSession();
                      known.set(false);
                      router.push("/eyewear");
                    } catch (cause) {
                      setDeleteError(cause instanceof Error ? cause.message : "It could not be deleted.");
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "Deleting" : "Delete it"}
                </CtaButton>
                <CtaButton
                  kind="secondary"
                  onClick={() => {
                    setDeleteOpen(false);
                    setConfirmation("");
                    setDeleteError("");
                  }}
                >
                  Keep it
                </CtaButton>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}

/* ── Addresses ────────────────────────────────────────────────────── */

function AddressesPane({ session }: { session: Session }) {
  const [fetched, setAddresses] = useState<SavedAddress[]>();
  const addresses = session.user ? fetched : [];
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session.user) return;
    house
      .addresses()
      .then(({ addresses }) => setAddresses(addresses))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "The addresses could not be read."));
  }, [session.user]);

  return (
    <div>
      <p className="t-body t-body--lede">Where frames go.</p>
      <p className="t-body mt-2 max-w-xl text-[var(--fg-tertiary)]">
        Up to ten. The default is the one the checkout starts with; any of them is a press away
        there.
      </p>
      {error ? <p className="field-error mt-8" role="alert">{error}</p> : null}
      {session.user && addresses ? (
        <div className="mt-10">
          <AddressBook addresses={addresses} onChange={setAddresses} />
        </div>
      ) : session.user ? (
        <p className="t-caption mt-8" role="status">Reading the addresses</p>
      ) : null}
    </div>
  );
}

/* ── Payment ──────────────────────────────────────────────────────── */

function PaymentPane({ session, onSaved }: { session: Session; onSaved: () => void }) {
  const card = session.houseAccount?.card;
  const needsReplacement = session.houseAccount?.cardNeedsReplacement;
  const [config, setConfig] = useState<Config>();
  const [editing, setEditing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const cardRef = useRef<SquareCard | undefined>(undefined);

  useEffect(() => {
    if (!editing || config) return;
    house.config().then(setConfig).catch((cause) => setError(cause instanceof Error ? cause.message : "Unavailable."));
  }, [editing, config]);

  const save = async () => {
    if (!session.user || !cardRef.current || !consent) return;
    setBusy(true);
    setError("");
    try {
      const token = await cardRef.current.tokenize({
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: {
          givenName: session.user.firstName,
          familyName: session.user.lastName,
          email: session.user.email,
        },
      });
      if (token.status !== "OK" || !token.token) throw new Error(cardErrorMessage(token.errors?.[0]?.message));
      await house.saveCard({
        sourceId: token.token,
        cardholderName: `${session.user.firstName} ${session.user.lastName}`,
        replace: Boolean(card),
      });
      setEditing(false);
      setConsent(false);
      setNote("Kept. It is offered first at the checkout.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The card could not be kept.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="t-body t-body--lede">A card on file.</p>
      <p className="t-body mt-2 max-w-xl text-[var(--fg-tertiary)]">
        Kept by Square, not by the house — what the desk holds is the brand and the last four
        digits. Optional; the checkout takes a card every time otherwise.
      </p>

      {!session.user ? null : card ? (
        <div className="mt-10 max-w-md">
          <p className="t-eyebrow">On file</p>
          <p className="t-body mt-3">
            {(card.brand || "Card").toUpperCase()} ending {card.last4}
            {card.expMonth ? (
              <span className="text-[var(--fg-quiet)]">
                {" "}· {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
              </span>
            ) : null}
          </p>
          {needsReplacement ? (
            <p className="field-error mt-3" role="alert">
              This card can no longer be charged. Replace it before the next order.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="t-caption mt-10">Nothing on file.</p>
      )}

      {note ? <p className="t-caption mt-6" role="status">{note}</p> : null}

      {session.user && !editing ? (
        <CtaButton kind="secondary" className="mt-8" onClick={() => setEditing(true)}>
          {card ? "Replace the card" : "Keep a card"}
        </CtaButton>
      ) : null}

      {session.user && editing ? (
        <div className="hairline mt-10 max-w-md pt-8">
          {config ? (
            <CardField config={config} cardRef={cardRef} onReady={setReady} onError={setError} />
          ) : (
            <p className="t-caption" role="status">Loading secure payment</p>
          )}
          <label className="check mt-8">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              Keep this card with Square for future orders from this account. It can be replaced
              here at any time.
            </span>
          </label>
          {error ? <p className="field-error mt-6" role="alert">{error}</p> : null}
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            <CtaButton disabled={!ready || !consent || busy} onClick={() => void save()}>
              {busy ? "Keeping" : "Keep the card"}
            </CtaButton>
            <CtaButton
              kind="secondary"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              Cancel
            </CtaButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
