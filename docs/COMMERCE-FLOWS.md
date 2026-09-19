# Commerce flows — checkout, the desk, access, held

The checkout and the account dashboard are ported from the Amazing Donuts
build (`talkerstein-consulting/amazingdonuts`), which has a fully local
commerce stack: its own checkout API, Square payments, accounts, saved
addresses and a card on file. **What was taken is the functionality, the
sequence and the API contract. None of its interface came across** — every
surface named below is cut to `STYLE-GUIDE.md`, and the tokens, type,
fields and steps are this house's.

Everything commerce on this origin talks to one thing:

| | Donuts | Aria Noir |
|---|---|---|
| Backend | `apps/house-accounts` (Express · PostgreSQL · Square) | **the same service**, tenant `aria-noir` |
| Reached at | `/api/house/*` via the Vite proxy | `/api/house/*` via the `next.config` rewrite |
| Client | `api()` in each page | `src/lib/house-api.ts` — one client, typed |
| Cart | app state | `localStorage` (`lib/cart`) |
| Checkout | `/checkout`, nine questions | `/checkout`, four questions |
| Accounts | `/account`, four views | `/desk`, five views |
| Wishlist | server-backed | this browser (`lib/held`) — see §5 |

The Shopify permalink (`checkoutHref` in `lib/cart`) and the
`account.arianoir.com` door (`ACCOUNT_URL`) are still exported. The
checkout offers the permalink when the house API cannot be reached; nothing
else uses either.

---

## 0. The house API client — `src/lib/house-api.ts`

`api(path, options)` prefixes `/api/house`, sends the session cookie,
answers JSON, throws `HouseError` with the service's own message. `house.*`
names every route the site uses, one to one with the Donuts service:

```
auth      /auth/login  /auth/logout  /auth/forgot-password  /auth/reset-password
          /storefront/register  /storefront/session  /storefront/config
profile   PATCH /storefront/profile   DELETE /storefront/account
address   /storefront/addresses  POST · PATCH /:id · DELETE /:id
card      POST /storefront/house-card
orders    /storefront/orders
money     POST /public/storefront/promo-code
          POST /storefront/quote      POST /public/storefront/quote
          POST /storefront/checkout   POST /public/storefront/checkout
```

`useHouseSession()` fetches the session, refetches when `announceSession()`
is called (sign in, sign out, delete), and mirrors `Boolean(user)` into the
header's hint (`lib/session` → `markKnown`) so the profile glyph says the
right word without the header asking the API.

**The mock.** `scripts/mock-house-api.mjs` (`npm run dev:api:mock`) serves
every route above from memory, prices lines from `lib/catalogue`, taxes by
country, takes `ARIA10` as a code, makes accounts from any eight-character
password, and returns no Square `applicationId` — so `CardField` draws a
local stand-in and nothing can be charged. Type `DECLINE` in it to see the
failure path. It exists for the same reason Donuts' `mock-storefront.js`
does: the real service will not boot without Square and Postgres, and a
checkout that cannot be reached cannot be designed.

### What the service still owes this storefront

The client speaks the Donuts contract as it stands today. Three things on
the service side are needed before an Aria Noir order goes through it:

- [ ] **A `shipping` fulfilment type.** The checkout sends
      `fulfillment: { type: "shipping", method: "standard", recipient,
      address, estimate }`. The service's `fulfillmentSchema` knows
      `pickup` and `delivery`, and `delivery` runs a Toronto postal-prefix
      check that would refuse every address the house ships to.
- [ ] **Line resolution by variant.** Items carry `name` (`House —
      Colourway`), `variantId`, `slug`, `colorway`, `unitCents`. The
      service resolves by `name` against the Square catalogue; the
      Aria Noir location's catalogue must carry those names, or the service
      should key on `variantId`.
- [ ] **Tenant and currency.** `NEXT_PUBLIC_HOUSE_TENANT` (default
      `aria-noir`) is sent as `tenant` / `tenantSlug`; the location's
      currency is USD.

Everything else — sessions, register, profile, addresses, card on file,
promo codes, orders — is used exactly as the service already serves it.

---

## 1. Checkout — `/checkout`

**View:** `src/components/shop/checkout-view.tsx` · **Summary:**
`order-summary.tsx` · **Card:** `card-field.tsx` · **Address:**
`address-form.tsx`, `address-book.tsx` · **After:** `/checkout/confirmed`,
`confirmed-view.tsx`

### What was taken from Donuts

- The **folding accordion**: answered steps collapse to one line with a
  `Change` beside them; the open step is the one that cannot be summarised
  yet; a step that cannot be asked yet is dimmed and has no body. The fold
  has a fourth state now, `ready` — answered before, reachable, not open.
- **Guest first.** *Continue as guest* is the primary; *Sign in instead* is
  the quiet link. A signed-in reader never sees the choice.
- **Saved-address cards** for a signed-in reader, with add / edit / remove
  in place, one default at a time, the duplicate check, and the promotion
  of the oldest remaining address when the default is removed.
- **The debounced quote.** Every change to the lines, the code or the
  address re-asks the service for the total, 350ms after the last change,
  aborting the previous ask. The total on the page is never this page's
  arithmetic.
- **Promo code checked on its own** before it is applied, so a wrong code
  is answered at the field and not by a total that quietly did not move.
- **Square Web Payments**: the card iframe, Apple Pay and Google Pay where
  the device has them, the card on file as the default when there is one,
  `tokenize` with the amount and billing contact at the moment of placing.
- **The submit guard** (`submitting` ref) and the idempotency key.
- **A returning reader lands on payment**: with a phone on file and a
  default address, 01 and 02 fold on arrival and 03 is open.
- **Payment failure returns to the payment step** with every other answer
  preserved and the step scrolled into view.

### What changed, and why

Donuts asks nine questions because a bakery settles pickup, delivery
windows, house accounts and PINs. A frame is shipped, once, to an address,
and is paid by card. So:

```
01  WHO IS BUYING       guest: one name, email, telephone · signed in: telephone
                        folds to: "Rems Castro · rems@… · 416 … · as a guest"
02  WHERE IT GOES       country first (it decides the rule and the estimate),
                        then the address · saved cards when signed in
                        folds to: "12 York St, Toronto, ON M5J 0A9 · Canada · 4 to 7 working days"
03  HOW YOU PAY         wallets if present · card on file if present · the card
                        folds to: "VISA ending 4242"
04  WHAT YOU ARE BUYING the lines, to whom, arrives when, paid with what,
                        the service's total, the one press
```

- **One name field for a guest.** A parcel wants one name. It is split into
  first and last before it reaches the service, which wants both.
- **Postal codes by country**, loose where no rule is known. A Canadian
  rule applied to a London postcode is a form refusing a real address.
- **The card field mounts only on 03 and 04.** The fold hides bodies with
  CSS, and a card field that mounted behind a closed step would answer
  "ready" to a question nobody had reached.
- **No `window.confirm`.** Removing an address is one press and one line.
- **The confirmation is its own page.** The checkout writes what the page
  needs to `sessionStorage` under `aria-noir:last-order` and navigates. A
  reload still shows it; a second tab or a visit a day later gets the
  honest fallback. It carries everything the old handoff could not: number,
  lines, total, address, estimate, payment summary, returns and support
  paths — and, for a guest, the account form pre-filled from the order.
- **If the service is unreachable** the page says so and offers the
  store's permalink checkout, rather than a spinner over a form that will
  never submit.

### Sequence

```
/bag ──Continue to checkout──▶ /checkout
   01 ──▶ 02 ──▶ quote ──▶ 03 ──▶ 04 ──Place the order──▶ POST checkout
                                                              │ fail: back to 03, message, answers kept
                                                              ▼
                                        sessionStorage ◀── ok ── bag cleared
                                              │
                                              ▼
                                   /checkout/confirmed
                                      guest ─▶ make the account (pre-filled) ─▶ /desk
                                      known ─▶ /desk
```

---

## 2. The desk — `/desk`

**View:** `src/components/shop/desk-view.tsx` · **Rail:** Orders · Held ·
Profile · Addresses · Payment · **Route:** `/desk#<view>`

### What was taken from Donuts

- The **icon rail, one view at a time**, with the view in the hash so a
  link can point at one and the back button walks the rail.
- **Orders** with the service's own fulfilment and payment status, the
  lines, the money breakdown, the receipt link, and *Order it again* —
  every line back into the bag where the catalogue still carries it.
- **Profile** that saves (`PATCH /storefront/profile`), the email locked
  because it is the account itself.
- **Addresses**, the same `AddressBook` the checkout uses, so the two never
  disagree about what an address is.
- **Payment**: the card on file, added or replaced through a consented
  Square `STORE` tokenisation, with the "can no longer be charged" state.
- **Sign out in the page, not the chrome.** The header's glyph is a door.
- **Delete account** behind a typed `DELETE`.
- **A gate, not a wall.** A stranger sees the shape of each view with a line
  saying so and the door underneath.

### What changed, and why

- **Five views, not four.** Donuts folds addresses into the profile and has
  an institutional credit portal. Here addresses and payment are their own
  views — a frame is shipped and paid for, and both are things a reader
  comes back to change — and the credit portal has no equivalent.
- **Orders are rows on hairlines**, four columns on a desk, a stack on a
  phone, opening to the order itself. A table with borders is not an object
  this site has.
- **The status vocabulary is the courier's.** Tracking is the second thing
  on an open row, the day it exists.

---

## 3. Access — `/access`

**Form:** `src/components/shop/access-form.tsx`

Ported from the Donuts `AuthModal`: sign in, new here, forgotten, and the
reset form reached from the email. It is a page rather than a modal — a
door is a place, not an interruption. The password goes to the service and
nowhere else; the session is an httpOnly cookie, first-party through the
rewrite. `?next=/path` (same-origin only) is where to go afterwards;
`?mode=new` opens on the account form; `?reset=<token>` opens the reset.
All three are read on the client, so the page stays static.

This replaced the single email field that redirected to Shopify's customer
accounts. That door still exists at `ACCOUNT_URL`; nothing links to it.

---

## 4. Privacy

`policies.ts` carries the storefront's privacy policy (transcribed, with
the controller's name, address and telephone from
`arianoir.com/policies/contact-information` added under *Who to write to*)
and a `privacy-preferences` page corresponding to the storefront's
`/pages/data-sharing-opt-out`. That page's substantive positions are the
policy's; its two switches — analytics, marketing — are
`components/page/privacy-switches.tsx`, kept in `localStorage` under
`aria-noir:privacy` and readable by anything that should honour them
(`readPrivacy()`).

---

## 5. Held (the wishlist) — unchanged

**Store:** `src/lib/held.ts` · **View:** `held-view.tsx` · **Route:**
`/held`, `/desk#held`

Still this browser's. The service has a wishlist keyed on a product id
(`PUT /storefront/wishlist/:productId`); a frame is `{slug, colorway}`.
Wiring it is one adapter in `lib/held` behind `useHeld()`, whose shape does
not change.

---

## 6. What is still missing

- **The service changes in §0.** Until the `shipping` fulfilment type
  exists, a real order cannot be placed; the mock is the whole loop.
- **Reviews and ratings.** Nothing renders a rating, a count or a quote.
- **Notify-when-back.** No mechanism behind the held list's promise.
- **Service surfaces:** gift wrapping, gift message, appointment booking,
  premium delivery, aftercare.
- **The held list on the account** (§5).
- **Wallets are untested** against a real Square application; the code is
  the Donuts code with the house's request.
