"use client";

import { useState } from "react";
import { CtaButton } from "@/components/cta-link";
import { house, type Address, type SavedAddress } from "@/lib/house-api";
import {
  AddressFields,
  BLANK_ADDRESS,
  addressComplete,
  addressLine,
  sameAddress,
} from "@/components/shop/address-form";
import { countryName } from "@/lib/validation";

/**
 * The addresses kept on the account.
 *
 * Ported from the Donuts checkout's saved-address cards: a card per
 * address, one marked as the default, each one editable and deletable in
 * place; a new one is typed into the same editor. What was kept is the
 * one-default-at-a-time rule (the server enforces it; the cards mirror it
 * without a reload), the duplicate check, and the promotion of the oldest
 * remaining address when the default is deleted.
 *
 * What changed: no window.confirm. A delete on this site is one press and
 * one line of consequence, the same as letting go of a held frame. A
 * dialog over an address is a dialog about nothing.
 *
 * `selected` / `onSelect` make it a picker for the checkout. The desk
 * passes neither and gets a plain address book.
 */

const TYPES: readonly { value: SavedAddress["addressType"]; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

type Panel = null | { mode: "new" } | { mode: "edit"; id: string };

export function AddressBook({
  addresses,
  onChange,
  selected,
  onSelect,
  startOpen = false,
  onEditing,
}: {
  addresses: SavedAddress[];
  onChange: (next: SavedAddress[]) => void;
  /** The address the order goes to, when this is a picker. */
  selected?: Address;
  onSelect?: (a: SavedAddress) => void;
  /** Open the editor on mount — for a checkout with nothing saved yet. */
  startOpen?: boolean;
  /**
   * Whether an address is part-written in the editor below the cards.
   *
   * The checkout's "Send it here" reads the SELECTED address, which is
   * still the old one while a new one is being typed. Without this, a
   * reader halfway through adding an address could press on and have the
   * order go somewhere they had already moved on from. The page disables
   * the way forward until this is false again.
   */
  onEditing?: (editing: boolean) => void;
}) {
  const [panelRaw, setPanelRaw] = useState<Panel>(startOpen ? { mode: "new" } : null);
  const panel = panelRaw;
  /* Reported from the events that change it, not from an effect and not
     during render: the panel only opens and closes because someone did
     something, so the moment it changes is the moment to say so. */
  const setPanel = (next: Panel) => {
    setPanelRaw(next);
    onEditing?.(next !== null);
  };
  const [draft, setDraft] = useState<Address>(BLANK_ADDRESS);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<SavedAddress["addressType"]>("home");
  const [isDefault, setIsDefault] = useState(addresses.length === 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = (item?: SavedAddress) => {
    setError("");
    if (item) {
      setPanel({ mode: "edit", id: item.id });
      setDraft({
        addressLine1: item.addressLine1,
        addressLine2: item.addressLine2,
        locality: item.locality,
        administrativeDistrictLevel1: item.administrativeDistrictLevel1,
        postalCode: item.postalCode,
        country: item.country,
      });
      setLabel(item.label);
      setType(item.addressType);
      setIsDefault(item.isDefault);
      return;
    }
    setPanel({ mode: "new" });
    setDraft(BLANK_ADDRESS);
    setLabel("");
    setType("home");
    setIsDefault(addresses.length === 0);
  };

  const save = async () => {
    if (!panel || !addressComplete(draft)) return;
    if (
      panel.mode === "new" &&
      addresses.some((a) => sameAddress(a, draft))
    ) {
      setError("This address is already saved. Choose it instead of adding it again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const id = panel.mode === "edit" ? panel.id : undefined;
      const { address: saved } = await house.saveAddress(
        { ...draft, label: label.trim() || TYPES.find((t) => t.value === type)!.label, addressType: type, isDefault },
        id,
      );
      const others = addresses
        .filter((a) => a.id !== saved.id)
        .map((a) => (saved.isDefault ? { ...a, isDefault: false } : a));
      const next = id
        ? addresses.map((a) => (a.id === saved.id ? saved : others.find((o) => o.id === a.id)!))
        : [...others, saved];
      onChange(next);
      onSelect?.(saved);
      setPanel(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The address could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await house.deleteAddress(id);
      const removed = addresses.find((a) => a.id === id);
      const remaining = addresses.filter((a) => a.id !== id);
      if (removed?.isDefault && remaining.length)
        remaining[0] = { ...remaining[0], isDefault: true };
      onChange(remaining);
      if (removed && selected && sameAddress(removed, selected) && remaining[0])
        onSelect?.(remaining[0]);
      setPanel(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The address could not be removed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <ul className="address-cards" role={onSelect ? "radiogroup" : undefined}>
        {addresses.map((a) => {
          const chosen = selected ? sameAddress(a, selected) : false;
          return (
            <li key={a.id}>
              <div
                className="address-card"
                data-chosen={chosen}
                role={onSelect ? "radio" : undefined}
                aria-checked={onSelect ? chosen : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(a) : undefined}
                onKeyDown={
                  onSelect
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(a);
                        }
                      }
                    : undefined
                }
              >
                <p className="t-eyebrow">
                  {a.label}
                  {a.isDefault ? (
                    <span className="text-[var(--fg-quiet)]"> · Default</span>
                  ) : null}
                </p>
                <p className="t-body t-body--tight mt-3">{addressLine(a)}</p>
                <p className="t-caption mt-1">{countryName(a.country)}</p>
                <div className="mt-4 flex gap-6">
                  <button
                    type="button"
                    className="link-quiet link-quiet--micro"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(a);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="link-quiet link-quiet--micro"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      void remove(a.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}

        {/* The way to one more, as a card in the same row: a dotted rule
            where the next address will stand. Ten is the service's limit,
            and at ten the slot says so rather than vanishing. */}
        {addresses.length < 10 ? (
          <li>
            <button
              type="button"
              className="address-card address-card--add"
              onClick={() => open()}
              aria-expanded={panel?.mode === "new"}
              disabled={busy}
            >
              <span className="address-card-plus" aria-hidden>
                +
              </span>
              <span className="t-eyebrow">
                {addresses.length ? "Another address" : "An address"}
              </span>
            </button>
          </li>
        ) : (
          <li>
            <div className="address-card address-card--add" aria-disabled>
              <span className="t-caption">Up to ten are kept.</span>
            </div>
          </li>
        )}
      </ul>

      {panel ? (
        <div className="hairline mt-8 pt-8">
          <p className="t-eyebrow mb-8">
            {panel.mode === "edit" ? "Edit this address" : "A new address"}
          </p>
          <AddressFields value={draft} onChange={setDraft} idPrefix={`book-${panel.mode}`} />
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            <label className="field">
              <span>
                Call it
                <em className="not-italic text-[var(--fg-quiet)]"> · optional</em>
              </span>
              <input
                value={label}
                placeholder={TYPES.find((t) => t.value === type)?.label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Kind</span>
              <select value={type} onChange={(e) => setType(e.target.value as SavedAddress["addressType"])}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="check mt-8">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span>Use this one unless I say otherwise</span>
          </label>

          {error ? (
            <p className="field-error mt-6" role="alert">{error}</p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            <CtaButton disabled={busy || !addressComplete(draft)} onClick={() => void save()}>
              {busy ? "Saving" : panel.mode === "edit" ? "Save changes" : "Save address"}
            </CtaButton>
            <CtaButton kind="secondary" onClick={() => setPanel(null)}>
              Cancel
            </CtaButton>
          </div>
        </div>
      ) : error ? (
        <p className="field-error mt-6" role="alert">{error}</p>
      ) : null}
    </div>
  );
}
