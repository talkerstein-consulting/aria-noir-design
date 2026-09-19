"use client";

import { useCallback, useEffect, useState } from "react";
import { markKnown } from "@/lib/session";

/**
 * The house API — this origin's own commerce backend.
 *
 * ---- Where it comes from ----
 *
 * The contract is the `house-accounts` service that runs Amazing Donuts
 * (talkerstein-consulting/amazingdonuts, `apps/house-accounts/apps/api`):
 * Express, PostgreSQL, Square. Sessions are an httpOnly cookie; every route
 * answers JSON; an error is `{ error: { message } }`. The routes named here
 * are that service's routes, one to one, so the same deployment serves this
 * storefront with a tenant slug and a Square location of its own.
 *
 * ---- What it replaces ----
 *
 * The Shopify permalink handoff (once `checkoutHref` in lib/cart, now
 * removed) and the `account.arianoir.com` doorway. The bag goes to
 * `/checkout` on this origin, and the desk reads real orders, addresses
 * and a card on file from here.
 *
 * ---- How it is reached ----
 *
 * `/api/house/*` on this origin. next.config rewrites that prefix to
 * `HOUSE_API_URL`, so the cookie is first-party and there is no CORS to
 * argue with. In development that is the donuts API on :3101 with
 * `HOUSE_TENANT=aria-noir`.
 */

export const TENANT = process.env.NEXT_PUBLIC_HOUSE_TENANT || "aria-noir";

export class HouseError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/house${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new HouseError(
      "The studio's checkout service could not be reached. Please try again shortly.",
      0,
      "OFFLINE",
    );
  }
  /* A 204 carries no body: the delete and logout routes answer so. */
  if (response.status === 204) return null as T;
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new HouseError(
      "The studio's checkout service is unavailable. Please try again shortly.",
      response.status,
      "UNAVAILABLE",
    );
  }
  const body = await response.json();
  if (!response.ok)
    throw new HouseError(
      body?.error?.message || "Request failed.",
      response.status,
      body?.error?.code,
    );
  return body as T;
}

/* ── Shapes ────────────────────────────────────────────────────────── */

export type User = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

export type Address = {
  addressLine1: string;
  addressLine2: string;
  locality: string;
  administrativeDistrictLevel1: string;
  postalCode: string;
  country: string;
};

export type SavedAddress = Address & {
  id: string;
  label: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
};

export type CardOnFile = {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
};

export type Session = {
  user: User | null;
  profile: null | {
    default_phone?: string | null;
    default_address?: Partial<Address> | null;
  };
  /* Donuts' institutional account. Aria Noir has no credit programme, but
     the card on file lives on this object at the API, so it is read from
     here and nothing else about it is used. */
  houseAccount: null | {
    id: string;
    status: string;
    card?: CardOnFile | null;
    cardNeedsReplacement?: boolean;
  };
};

export type Config = {
  environment: "sandbox" | "production";
  applicationId: string;
  locationId: string;
  currency: string;
  placesEnabled: boolean;
  testMode?: boolean;
  delivery?: {
    enabled?: boolean;
    feeAmount?: number;
    freeThreshold?: number;
    minimumAmount?: number;
  };
};

export type QuoteLine = {
  name: string;
  quantity: string | number;
  total_money?: { amount: number; currency: string };
};

export type Quote = {
  order: {
    currency: string;
    total: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    serviceCharge?: number;
    line_items?: QuoteLine[];
    taxes?: { name: string; percentage: string }[];
  };
};

export type OrderLine = {
  name: string;
  quantity: string;
  variation_name?: string;
  total_money?: { amount: number; currency: string };
};

export type Order = {
  id: string;
  square_order_id?: string;
  ordered_at: string;
  status: string;
  total: number;
  tax: number;
  subtotal?: number;
  currency: string;
  line_items: OrderLine[];
  fulfillment?: {
    type?: string;
    address?: Partial<Address>;
    recipient?: { displayName?: string; email?: string; phone?: string };
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  } | null;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  receiptUrl?: string | null;
  breakdown?: {
    merchandise: number;
    deliveryFee: number;
    discount: number;
    tip: number;
    tax: number;
    total: number;
  };
  delivery?: {
    status?: string;
    statusLabel?: string;
    trackingUrl?: string;
  } | null;
};

export type CheckoutItem = { name: string; quantity: number };

/* ── Calls ─────────────────────────────────────────────────────────── */

export const house = {
  session: () => api<Session>("/storefront/session"),
  config: () => api<Config>("/storefront/config"),

  login: (email: string, password: string) =>
    api<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, tenant: TENANT }),
    }),
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) =>
    api<{ user: User }>("/storefront/register", {
      method: "POST",
      body: JSON.stringify({ ...input, tenantSlug: TENANT }),
    }),
  forgotPassword: (email: string) =>
    api<{ ok: true; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, tenantSlug: TENANT }),
    }),
  resetPassword: (token: string, password: string) =>
    api<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  logout: () => api<null>("/auth/logout", { method: "POST" }),
  deleteAccount: (confirmation: string) =>
    api<null>("/storefront/account", {
      method: "DELETE",
      body: JSON.stringify({ confirmation }),
    }),

  updateProfile: (input: {
    firstName: string;
    lastName: string;
    phone: string;
    address?: Address;
  }) =>
    api<{ ok: true }>("/storefront/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  addresses: () => api<{ addresses: SavedAddress[] }>("/storefront/addresses"),
  saveAddress: (
    input: Address & {
      label: string;
      addressType: SavedAddress["addressType"];
      isDefault: boolean;
    },
    id?: string,
  ) =>
    api<{ address: SavedAddress }>(
      id ? `/storefront/addresses/${id}` : "/storefront/addresses",
      { method: id ? "PATCH" : "POST", body: JSON.stringify(input) },
    ),
  deleteAddress: (id: string) =>
    api<null>(`/storefront/addresses/${id}`, { method: "DELETE" }),

  orders: () => api<{ orders: Order[] }>("/storefront/orders"),

  saveCard: (input: {
    sourceId: string;
    cardholderName: string;
    replace?: boolean;
  }) =>
    api<{ ok: true }>("/storefront/house-card", {
      method: "POST",
      body: JSON.stringify({ ...input, consent: true }),
    }),

  promoCode: (code: string) =>
    api<{ valid: boolean; code: string; name: string }>(
      "/public/storefront/promo-code",
      {
        method: "POST",
        body: JSON.stringify({ code, tenantSlug: TENANT }),
      },
    ),

  quote: (
    input: {
      items: CheckoutItem[];
      promoCode: string;
      fulfillment: unknown;
    },
    guest: boolean,
    signal?: AbortSignal,
  ) =>
    api<Quote>(guest ? "/public/storefront/quote" : "/storefront/quote", {
      method: "POST",
      signal,
      body: JSON.stringify({
        ...input,
        customizations: [],
        ...(guest ? { tenantSlug: TENANT } : {}),
      }),
    }),

  checkout: (
    input: {
      idempotencyKey: string;
      items: CheckoutItem[];
      promoCode: string;
      fulfillment: unknown;
      sourceId: string;
      guest?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    },
    guest: boolean,
  ) =>
    api<{ order: { id: string; total: number; currency: string } }>(
      guest ? "/public/storefront/checkout" : "/storefront/checkout",
      {
        method: "POST",
        body: JSON.stringify({
          ...input,
          paymentMethod: "card",
          customizations: [],
          ...(guest ? { tenantSlug: TENANT } : {}),
        }),
      },
    ),
};

/* ── The session, as a hook ────────────────────────────────────────── */

const SESSION_EVENT = "aria-noir:house-session";

/** Any surface that signs in or out says so here, and every other mounted
 *  reader of the session refetches. One event, no context provider. */
export function announceSession() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function useHouseSession() {
  const [session, setSession] = useState<Session | undefined>();
  const [error, setError] = useState("");

  /* The fetch, and what is done with the answer. Also mirrors the answer
     into the header's hint (lib/session), so the profile glyph says the
     right word without the header having to ask the API itself. */
  const reload = useCallback(
    () =>
      house
        .session()
        .then((next) => {
          setSession(next);
          setError("");
          markKnown(Boolean(next.user));
        })
        .catch((cause) => {
          /* An unreachable API reads as signed out, and the surfaces say
             why in their own words. It must not read as a crash. */
          setSession({ user: null, profile: null, houseAccount: null });
          setError(cause instanceof Error ? cause.message : "Unavailable.");
        }),
    [],
  );

  useEffect(() => {
    let live = true;
    house
      .session()
      .then((next) => {
        if (!live) return;
        setSession(next);
        setError("");
        markKnown(Boolean(next.user));
      })
      .catch((cause) => {
        if (!live) return;
        setSession({ user: null, profile: null, houseAccount: null });
        setError(cause instanceof Error ? cause.message : "Unavailable.");
      });
    const onChange = () => void reload();
    window.addEventListener(SESSION_EVENT, onChange);
    return () => {
      live = false;
      window.removeEventListener(SESSION_EVENT, onChange);
    };
  }, [reload]);

  return { session, loading: session === undefined, error, reload };
}
