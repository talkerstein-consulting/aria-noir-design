"use client";

import { useState } from "react";
import type { Address } from "@/lib/house-api";
import { CountrySelect } from "@/components/shop/country-select";
import { postalError, transitFor } from "@/lib/validation";

/**
 * One address, as the house's fields.
 *
 * Shared by the checkout (the address an order goes to) and the desk (the
 * addresses kept on the account), so the two never disagree about what an
 * address is. Same rules as ProfileForm: label above the underline, always
 * visible; optional marked, required not; validation on blur; the message
 * says what to do and the rule goes accent WITH it.
 *
 * The country leads. Everything after it — the postal rule, the transit
 * estimate, the word for "province" — depends on it, and a form that asks
 * for the postcode before the country is a form that will tell someone
 * their real address is wrong.
 */

export const BLANK_ADDRESS: Address = {
  addressLine1: "",
  addressLine2: "",
  locality: "",
  administrativeDistrictLevel1: "",
  postalCode: "",
  country: "US",
};

export function addressComplete(a: Address) {
  return (
    Boolean(a.addressLine1.trim()) &&
    Boolean(a.locality.trim()) &&
    Boolean(a.country) &&
    !postalError(a.postalCode, a.country) &&
    Boolean(a.postalCode.trim())
  );
}

export function sameAddress(a: Address, b: Address) {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    norm(a.addressLine1) === norm(b.addressLine1) &&
    norm(a.addressLine2) === norm(b.addressLine2) &&
    norm(a.locality) === norm(b.locality) &&
    norm(a.postalCode).replace(/\s/g, "") === norm(b.postalCode).replace(/\s/g, "") &&
    a.country === b.country
  );
}

/** One line, for a folded step or an address card. */
export function addressLine(a: Partial<Address>) {
  return [
    a.addressLine1,
    a.addressLine2,
    a.locality,
    [a.administrativeDistrictLevel1, a.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

const regionLabel = (country: string) =>
  country === "US"
    ? "State"
    : country === "CA"
      ? "Province"
      : country === "GB"
        ? "County"
        : "State or region";

export function AddressFields({
  value,
  onChange,
  idPrefix = "addr",
  disabled,
}: {
  value: Address;
  onChange: (next: Address) => void;
  idPrefix?: string;
  disabled?: boolean;
}) {
  const [touched, setTouched] = useState<Partial<Record<keyof Address, boolean>>>({});
  const touch = (k: keyof Address) => setTouched((t) => ({ ...t, [k]: true }));
  const set = (k: keyof Address, v: string) => onChange({ ...value, [k]: v });

  const postal = touched.postalCode ? postalError(value.postalCode, value.country) : "";
  const need = (k: keyof Address) =>
    touched[k] && !value[k].trim() && k !== "addressLine2" && k !== "administrativeDistrictLevel1"
      ? "This one is needed before a frame can be sent."
      : "";

  return (
    <div className="stack">
      <label className="field max-w-sm" data-invalid={false}>
        <span>Country</span>
        <CountrySelect
          id={`${idPrefix}-country`}
          value={value.country}
          disabled={disabled}
          onChange={(code) => set("country", code)}
        />
        <em className="t-caption mt-2 block not-italic text-[var(--fg-quiet)]">
          Standard shipping is free · {transitFor(value.country)}
        </em>
      </label>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        <label className="field" data-invalid={Boolean(need("addressLine1"))}>
          <span>Address</span>
          <input
            id={`${idPrefix}-line1`}
            autoComplete="address-line1"
            value={value.addressLine1}
            disabled={disabled}
            onChange={(e) => set("addressLine1", e.target.value)}
            onBlur={() => touch("addressLine1")}
            aria-invalid={Boolean(need("addressLine1"))}
          />
          {need("addressLine1") ? (
            <em className="field-error" role="alert">{need("addressLine1")}</em>
          ) : null}
        </label>
        <label className="field">
          <span>
            Apartment, floor
            <em className="not-italic opacity-60"> · optional</em>
          </span>
          <input
            id={`${idPrefix}-line2`}
            autoComplete="address-line2"
            value={value.addressLine2}
            disabled={disabled}
            onChange={(e) => set("addressLine2", e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        <label className="field" data-invalid={Boolean(need("locality"))}>
          <span>City</span>
          <input
            id={`${idPrefix}-city`}
            autoComplete="address-level2"
            value={value.locality}
            disabled={disabled}
            onChange={(e) => set("locality", e.target.value)}
            onBlur={() => touch("locality")}
            aria-invalid={Boolean(need("locality"))}
          />
          {need("locality") ? (
            <em className="field-error" role="alert">{need("locality")}</em>
          ) : null}
        </label>
        <label className="field">
          <span>{regionLabel(value.country)}</span>
          <input
            id={`${idPrefix}-region`}
            autoComplete="address-level1"
            value={value.administrativeDistrictLevel1}
            disabled={disabled}
            onChange={(e) => set("administrativeDistrictLevel1", e.target.value)}
          />
        </label>
      </div>

      <label className="field max-w-xs" data-invalid={Boolean(postal || need("postalCode"))}>
        <span>Postal code</span>
        <input
          id={`${idPrefix}-postal`}
          autoComplete="postal-code"
          value={value.postalCode}
          disabled={disabled}
          onChange={(e) => set("postalCode", e.target.value)}
          onBlur={() => touch("postalCode")}
          aria-invalid={Boolean(postal || need("postalCode"))}
        />
        {postal || need("postalCode") ? (
          <em className="field-error" role="alert">{postal || need("postalCode")}</em>
        ) : null}
      </label>
    </div>
  );
}
